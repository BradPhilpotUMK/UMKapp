"""Fetch kart track outlines from OpenStreetMap (Overpass API) for the Track Guides.
Data (c) OpenStreetMap contributors, ODbL. Writes data/track-geo-raw.json."""
import json, urllib.request, urllib.parse, sys
TRACKS = {
  "kart-silverstone": (52.0786, -1.0170, 1800),
  "daytona-milton-keynes": (52.0446, -0.7836, 700),
  "buckmore-park": (51.3363, 0.4980, 700),
}
out = {}
for k, (lat, lon, r) in TRACKS.items():
    q = f'[out:json][timeout:60];(way(around:{r},{lat},{lon})["highway"="raceway"];way(around:{r},{lat},{lon})["sport"="karting"];way(around:{r},{lat},{lon})["leisure"="track"];);out tags geom;'
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
