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

def latest_post():
    """Newest public community post from the channel's Posts tab (best effort: keeps the last one if YouTube changes its page)."""
    try:
        r = urllib.request.Request("https://www.youtube.com/channel/" + CHANNEL + "/posts?hl=en&gl=GB",
            headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
                     "Accept-Language": "en-GB,en;q=0.9", "Cookie": "CONSENT=YES+1; SOCS=CAI"})
        html = urllib.request.urlopen(r, timeout=20).read().decode("utf-8", "replace")
        m = re.search(r"var ytInitialData = (\{.*?\});</script>", html, re.S) or re.search(r'ytInitialData"\] = (\{.*?\});', html, re.S)
        data = json.loads(m.group(1))
        found = []
        def walk(o):
            if isinstance(o, dict):
                if "backstagePostRenderer" in o: found.append(o["backstagePostRenderer"]); return
                for v in o.values(): walk(v)
            elif isinstance(o, list):
                for v in o: walk(v)
        walk(data)
        if not found: return None
        p = found[0]
        text = "".join(x.get("text", "") for x in (p.get("contentText") or {}).get("runs", []))
        when = "".join(x.get("text", "") for x in (p.get("publishedTimeText") or {}).get("runs", []))
        img = ""
        att = p.get("backstageAttachment") or {}
        imgs = ((att.get("backstageImageRenderer") or {}).get("image") or {}).get("thumbnails") or []
        if not imgs:
            ms = (att.get("postMultiImageRenderer") or {}).get("images") or []
            if ms: imgs = ((ms[0].get("backstageImageRenderer") or {}).get("image") or {}).get("thumbnails") or []
        if imgs: img = imgs[-1].get("url", "")
        vid = ((att.get("videoRenderer") or {}).get("videoId")) or ""
        return {"id": p.get("postId", ""), "text": text[:1200], "when": when, "image": img, "video": vid}
    except Exception as e:
        print("Post not read:", e); return None

post = latest_post() or old.get("post")
if old.get("videos") == videos and old.get("post") == post:
    print("No change"); raise SystemExit(0)
json.dump({"updated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"), "channel": CHANNEL, "videos": videos, "post": post},
          open(OUT, "w"), indent=1, ensure_ascii=False)
open(OUT, "a").write("\n")
print("Latest:", videos[0]["title"], "| post:", (post or {}).get("text", "")[:60])
