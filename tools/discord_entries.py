#!/usr/bin/env python3
"""Members' Championship: copy the Discord sign-ups into the app.

Reads #race-form-logs only (the bot has no access to #race-entry): each driver details form puts that driver
on the list for the next race, in the order the forms were sent; denied forms and cancellation/withdrawal
logs take them off. Writes data/members-entries.json, which the Members' Championship page shows as
"On the grid" (first 30) and "Waiting list".

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


DENIED = re.compile(r"\b(denied|declined|rejected)\b|❌", re.I)
WITHDRAWN = re.compile(r"\b(cancel+ed|cancel+ation|withdr[ae]w\w*|left the event|removed)\b", re.I)


def from_logs(msgs, rounds):
    """Entries per round from #race-form-logs only, in the order drivers sent their details.
    Each driver details form counts for the next race on or after the day it was sent.
    A denied form, or a cancellation/withdrawal/removal log for that driver, takes them off the list."""
    lists = {r["date"]: [] for r in rounds}   # date -> [user ids] in order
    names = {}
    upcoming = sorted(r["date"] for r in rounds if r.get("id"))
    for msg in sorted(msgs, key=lambda m: m["timestamp"]):  # oldest first
        day = datetime.fromisoformat(msg["timestamp"]).astimezone(UK).strftime("%Y-%m-%d")
        race = next((d for d in upcoming if d >= day), None)
        if not race: continue
        for emb in msg.get("embeds") or []:
            fields = emb.get("fields") or []
            text = " ".join([emb.get("title") or "", emb.get("description") or "", (emb.get("footer") or {}).get("text") or ""] + [(f.get("name") or "") + " " + (f.get("value") or "") for f in fields])
            who = MENTION.search(emb.get("description") or "") or MENTION.search(text)
            if not who: continue
            uid, lst = who.group(1), lists[race]
            if re.search(r"application", emb.get("title") or "", re.I):
                if DENIED.search((emb.get("footer") or {}).get("text") or ""):
                    if uid in lst: lst.remove(uid)
                    continue
                name = next(((f.get("value") or "").strip() for f in fields if re.search(r"name.*racing", f.get("name") or "", re.I)), "")
                name = re.sub(r"[*_`<>]", "", name).strip()[:40]
                if name: names[uid] = name
                if uid not in lst: lst.append(uid)
            elif WITHDRAWN.search(text) and uid in lst:
                lst.remove(uid)
    return lists, names


def main():
    if not TOKEN:
        print("DISCORD_BOT_TOKEN is not set yet: nothing to do"); return
    rounds = [r for r in json.load(open(MEMBERS)).get("rounds", []) if r.get("date")]
    lists, names = from_logs(messages(LOGS_CH, 2000), rounds)
    out = {}
    for r in rounds:
        ids = lists.get(r["date"]) or []
        if not ids: continue
        cap = int(r.get("capacity") or 30)
        nm = lambda u: names.get(u) or display_name(u)
        out[r["date"]] = {"title": r.get("title") or "", "capacity": cap, "grid": [nm(u) for u in ids[:cap]], "waitlist": [nm(u) for u in ids[cap:]]}
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
