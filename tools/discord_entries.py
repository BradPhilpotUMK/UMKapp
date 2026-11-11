#!/usr/bin/env python3
"""Members' Championship: copy the Discord sign-ups into the app.

Reads the race event posts in #race-entry (the "Signed up" list, and a waiting list if the post has one)
and the driver details forms in #race-form-logs (racing names), then writes data/members-entries.json,
which the Members' Championship page shows as "On the grid" and "Waiting list".

Only racing names go into the file: no Discord IDs, weights or roles (the file is public).
Runs from .github/workflows/discord-entries.yml every 10 minutes. Needs the DISCORD_BOT_TOKEN secret.
"""
import json, os, re, sys, time, urllib.request, urllib.error
from datetime import datetime, timezone
from zoneinfo import ZoneInfo

API = "https://discord.com/api/v10"
TOKEN = os.environ.get("DISCORD_BOT_TOKEN", "").strip()
GUILD = os.environ.get("DISCORD_GUILD_ID", "1074762004067262596")
ENTRY_CH = os.environ.get("RACE_ENTRY_CHANNEL", "1569818508253204520")
LOGS_CH = os.environ.get("RACE_LOGS_CHANNEL", "1569821327940919356")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MEMBERS = os.path.join(ROOT, "data", "members.json")
OUT = os.path.join(ROOT, "data", "members-entries.json")
UK = ZoneInfo("Europe/London")
MENTION = re.compile(r"<@!?(\d+)>")


def get(path):
    for attempt in range(5):
        req = urllib.request.Request(API + path, headers={"Authorization": "Bot " + TOKEN, "User-Agent": "UMK-app (github.com/BradPhilpotUMK/season-planner, 1.0)"})
        try:
            with urllib.request.urlopen(req, timeout=20) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            if e.code == 429:
                time.sleep(float(json.load(e).get("retry_after", 2)) + 0.5); continue
            if e.code == 404:
                return None
            raise
    raise RuntimeError("Discord kept rate limiting " + path)


def messages(channel, most):
    out, before = [], ""
    while len(out) < most:
        page = get(f"/channels/{channel}/messages?limit=100{before}") or []
        out += page
        if len(page) < 100: break
        before = "&before=" + page[-1]["id"]
    return out  # newest first


def event_date(emb):
    """The race date: a Discord timestamp in the post if there is one, otherwise a dd/mm/yyyy date."""
    text = " ".join([emb.get("description") or ""] + [(f.get("name") or "") + " " + (f.get("value") or "") for f in emb.get("fields") or []])
    m = re.search(r"<t:(\d{9,11})(?::\w)?>", text)
    if m: return datetime.fromtimestamp(int(m.group(1)), timezone.utc).astimezone(UK).strftime("%Y-%m-%d")
    for t in (text, (emb.get("footer") or {}).get("text") or ""):
        m = re.search(r"\b(\d{1,2})/(\d{1,2})/(20\d\d)\b", t)
        if m: return f"{m.group(3)}-{int(m.group(2)):02d}-{int(m.group(1)):02d}"
    return ""


def events(msgs):
    """Race event posts: {date: {"title", "signed": [user ids], "waiting": [user ids] or None}}."""
    found = {}
    for msg in msgs:
        for emb in msg.get("embeds") or []:
            fields = emb.get("fields") or []
            signed = next((f for f in fields if re.search(r"signed\s*up", f.get("name") or "", re.I)), None)
            if not signed: continue
            date = event_date(emb)
            if not date or date in found: continue  # newest post for a date wins
            wait = next((f for f in fields if re.search(r"wait", f.get("name") or "", re.I)), None)
            found[date] = {"title": re.sub(r"^\W+", "", emb.get("title") or "").strip(),
                           "signed": MENTION.findall(signed.get("value") or ""),
                           "waiting": MENTION.findall(wait.get("value") or "") if wait else None}
    return found


def racing_names(msgs):
    """Latest racing name each driver gave on the driver details form: {user id: name}."""
    names = {}
    for msg in msgs:
        for emb in msg.get("embeds") or []:
            text = (emb.get("description") or "")
            fields = emb.get("fields") or []
            who = MENTION.search(text) or next((MENTION.search(f.get("value") or "") for f in fields if re.search(r"^from", f.get("name") or "", re.I)), None)
            if not who: continue
            name = next(((f.get("value") or "").strip() for f in fields if re.search(r"name.*racing", f.get("name") or "", re.I)), "")
            if not name:
                m = re.search(r"racing under\?\**\s*\n+\s*([^\n]+)", text, re.I)
                name = m.group(1).strip() if m else ""
            name = re.sub(r"[*_`<>]", "", name).strip()[:40]
            if name and who.group(1) not in names: names[who.group(1)] = name  # newest first, so the latest form wins
    return names


def display_name(uid, cache={}):
    if uid not in cache:
        m = get(f"/guilds/{GUILD}/members/{uid}") or {}
        u = m.get("user") or {}
        cache[uid] = (m.get("nick") or u.get("global_name") or u.get("username") or "Driver")[:40]
    return cache[uid]


def main():
    if not TOKEN:
        print("DISCORD_BOT_TOKEN is not set yet: nothing to do"); return
    rounds = [r for r in json.load(open(MEMBERS)).get("rounds", []) if r.get("date")]
    evs = events(messages(ENTRY_CH, 300))
    names = racing_names(messages(LOGS_CH, 1000))
    out = {}
    for r in rounds:
        ev = evs.get(r["date"])
        if not ev: continue
        cap = int(r.get("capacity") or 30)
        signed = list(dict.fromkeys(ev["signed"]))
        if ev["waiting"] is None: grid, waiting = signed[:cap], signed[cap:]
        else: grid, waiting = signed, [u for u in dict.fromkeys(ev["waiting"]) if u not in signed]
        nm = lambda u: names.get(u) or display_name(u)
        out[r["date"]] = {"title": ev["title"], "capacity": cap, "grid": [nm(u) for u in grid], "waitlist": [nm(u) for u in waiting]}
    old = {}
    try: old = json.load(open(OUT))
    except Exception: pass
    if old.get("rounds") == out:
        print("No change"); return
    json.dump({"updated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"), "rounds": out}, open(OUT, "w"), indent=1, ensure_ascii=False)
    open(OUT, "a").write("\n")
    for d, v in out.items(): print(d, v["title"], f"{len(v['grid'])} on the grid, {len(v['waitlist'])} waiting")


if __name__ == "__main__":
    main()
