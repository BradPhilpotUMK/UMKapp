#!/usr/bin/env python3
"""Latest long-form video on Brad's channel (no Shorts) for the home page YouTube section.
Reads the channel's long-form uploads feed (playlist UULF + channel id) and writes data/youtube.json.
Runs from .github/workflows/youtube.yml every hour. No API key needed."""
import json, os, re, urllib.request
from datetime import datetime, timezone
import xml.etree.ElementTree as ET

CHANNEL = "UCDSFeEF0BpGdjyMCr1LcZvg"
FEED = "https://www.youtube.com/feeds/videos.xml?playlist_id=UULF" + CHANNEL[2:]
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "youtube.json")
NS = {"a": "http://www.w3.org/2005/Atom", "yt": "http://www.youtube.com/xml/schemas/2015"}

req = urllib.request.Request(FEED, headers={"User-Agent": "UMK-app (github.com/BradPhilpotUMK/season-planner)"})
root = ET.fromstring(urllib.request.urlopen(req, timeout=20).read())
videos = []
for e in root.findall("a:entry", NS)[:6]:
    videos.append({"id": e.findtext("yt:videoId", namespaces=NS), "title": e.findtext("a:title", namespaces=NS),
                   "published": e.findtext("a:published", namespaces=NS)})
if not videos: raise SystemExit("feed had no videos")
old = {}
try: old = json.load(open(OUT))
except Exception: pass
if old.get("videos") == videos:
    print("No change"); raise SystemExit(0)
json.dump({"updated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"), "channel": CHANNEL, "videos": videos},
          open(OUT, "w"), indent=1, ensure_ascii=False)
open(OUT, "a").write("\n")
print("Latest:", videos[0]["title"])
