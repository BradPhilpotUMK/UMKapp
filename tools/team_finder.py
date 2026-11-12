#!/usr/bin/env python3
"""Team Finder: reads the #team-finder Discord channel and writes data/team-finder.json for the app.
The channel id lives in data/team-finder.json ("channel"); leave it empty until the channel exists.
Posts use simple "Key: value" lines (Looking for, Event, Date, Class, Weight, Seats, Notes), as a
normal message or as a form/bot embed. Only display names and the message link are published.
Runs from .github/workflows/discord-entries.yml with the same DISCORD_BOT_TOKEN."""
import json, os, re, sys
from datetime import datetime, timezone, timedelta
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import discord_entries as de

OUT = os.path.join(de.ROOT, "data", "team-finder.json")
KEYS = {"looking": r"looking\s*for|type|i am|we are", "event": r"event|race", "date": r"date|when", "cls": r"class|category|kart",
        "weight": r"weight", "seats": r"seats?|drivers?\s*needed|spaces?", "details": r"notes?|details|about|experience|info"}
MON = {m: i for i, m in enumerate(["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"], 1)}

def parse_date(s):
    s = (s or "").strip()
    m = re.search(r"(\d{4})-(\d{1,2})-(\d{1,2})", s)
    if m: return f"{int(m[1]):04d}-{int(m[2]):02d}-{int(m[3]):02d}"
    m = re.search(r"(\d{1,2})[/.](\d{1,2})[/.](\d{2,4})", s)
    if m:
        y = int(m[3]); y = y + 2000 if y < 100 else y
        return f"{y:04d}-{int(m[2]):02d}-{int(m[1]):02d}"
    m = re.search(r"(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]{3})[a-z]*\.?\s+(\d{4})", s, re.I)
    if m and m[2].lower() in MON: return f"{int(m[3]):04d}-{MON[m[2].lower()]:02d}-{int(m[1]):02d}"
    return ""

def pairs(msg):
    out = []
    for line in (msg.get("content") or "").splitlines():
        if ":" in line: k, v = line.split(":", 1); out.append((k, v))
    for e in msg.get("embeds") or []:
        for f in e.get("fields") or []: out.append((f.get("name") or "", f.get("value") or ""))
        for line in (e.get("description") or "").splitlines():
            if ":" in line: k, v = line.split(":", 1); out.append((k, v))
    return out

def clean(s, n): return re.sub(r"[*_`~<>]|\|\|", "", re.sub(r"<@!?\d+>", "", s or "")).strip()[:n]

def main():
    try: cfg = json.load(open(OUT))
    except Exception: cfg = {}
    ch, guild = (cfg.get("channel") or "").strip(), cfg.get("guild") or de.GUILD
    if not ch or not de.TOKEN: print("Team Finder: no channel or token yet"); return
    msgs = de.messages(ch, 300)
    today = datetime.now(timezone.utc).date().isoformat()
    cutoff = (datetime.now(timezone.utc) - timedelta(days=90)).isoformat()
    posts = []
    for m in msgs:
        if (m.get("author") or {}).get("bot") and not m.get("embeds"): continue
        f = {}
        for k, v in pairs(m):
            key = next((name for name, rx in KEYS.items() if re.search(rx, k.strip(), re.I)), None)
            if key and key not in f: f[key] = v.strip()
        if "looking" not in f and "event" not in f: continue
        date = parse_date(f.get("date", ""))
        if date and date < today: continue
        if not date and m["timestamp"] < cutoff: continue
        kind = "drivers" if re.search(r"driver|teammate|seat", f.get("looking", ""), re.I) else "team"
        a = m.get("author") or {}
        who = a.get("global_name") or a.get("username") or ""
        mention = de.MENTION.search(json.dumps(m.get("embeds") or []))
        if a.get("bot") and mention: who = de.display_name(mention.group(1))
        posts.append({"kind": kind, "event": clean(f.get("event"), 80), "date": date, "cls": clean(f.get("cls"), 40),
                      "weight": clean(f.get("weight"), 20), "seats": clean(re.sub(r"\D", "", f.get("seats", "")), 2),
                      "details": clean(f.get("details"), 400), "who": clean(who, 40), "posted": m["timestamp"],
                      "link": f"https://discord.com/channels/{guild}/{ch}/{m['id']}"})
    posts = posts[:80]
    if cfg.get("posts") == posts: print("Team Finder: no change"); return
    cfg.update({"updated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"), "guild": guild, "channel": ch, "posts": posts})
    json.dump(cfg, open(OUT, "w"), indent=1, ensure_ascii=False); open(OUT, "a").write("\n")
    print("Team Finder:", len(posts), "listings")

if __name__ == "__main__":
    main()
