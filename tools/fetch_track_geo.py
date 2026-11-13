"""Fetch kart track outlines from OpenStreetMap (Overpass API) for the Track Guides.
Data (c) OpenStreetMap contributors, ODbL. Writes data/track-geo-raw.json."""
import json, urllib.request, urllib.parse, sys
TRACKS = {
  "kart-silverstone": (52.0733, -1.0147, 2500),
  "daytona-milton-keynes": (52.0446, -0.7836, 700),
  "buckmore-park": (51.3363, 0.4980, 700),
}
try: out = json.load(open("data/track-geo-raw.json"))
except Exception: out = {}
only = sys.argv[1:]
for k, (lat, lon, r) in TRACKS.items():
    if only and k not in only: continue
    q = f'[out:json][timeout:90];(way(around:{r},{lat},{lon})["highway"="raceway"]["sport"="karting"];way(around:{r},{lat},{lon})["leisure"="track"]["sport"="karting"];);out tags geom;'
    data = urllib.parse.urlencode({"data": q}).encode()
    for url in ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter"]:
        try:
            req = urllib.request.Request(url, data=data, headers={"User-Agent": "UseMoreKerb-TrackGuides/1.0 (github.com/BradPhilpotUMK/UMKapp)"})
            res = json.load(urllib.request.urlopen(req, timeout=90)); break
        except Exception as e:
            print(k, url, "failed", e, file=sys.stderr); res = {"elements": []}
    els = [{"id": e["id"], "tags": e.get("tags", {}), "geom": [[round(p["lat"], 7), round(p["lon"], 7)] for p in e.get("geometry", [])]} for e in res.get("elements", []) if e.get("type") == "way"]
    out[k] = els
    print("==", k, len(els))
    for e in els: print("  ", e["id"], len(e["geom"]), json.dumps(e["tags"])[:200])
json.dump(out, open("data/track-geo-raw.json", "w"), separators=(",", ":"))
