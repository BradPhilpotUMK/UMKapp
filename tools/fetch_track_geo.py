"""Fetch kart track outlines from OpenStreetMap (Overpass API) for the Track Guides.
Data (c) OpenStreetMap contributors, ODbL. Writes data/track-geo-raw.json."""
import json, urllib.request, urllib.parse, sys
TRACKS = {
  "kart-silverstone": (52.0733, -1.0147, 2500),
  "daytona-milton-keynes": (52.0446, -0.7836, 700),
  "buckmore-park": (51.3363, 0.4980, 700),
  "whilton-mill": (52.2810, -1.0790, 3000),
  "pf-international": (53.0020, -0.6800, 4000),
  "shenington": (52.0800, -1.4680, 3000),
  "rowrah": (54.5480, -3.4500, 3000),
  "clay-pigeon": (50.7950, -2.5750, 3000),
  "rye-house": (51.7690, 0.0090, 2000),
  "lydd": (50.9580, 0.9200, 4000),
  "llandow": (51.4340, -3.4930, 3000),
  "fulbeck": (53.0440, -0.6250, 4000),
  "kimbolton": (52.3080, -0.3880, 3000),
  "warden-law": (54.8450, -1.4530, 3000),
  "larkhall": (55.7350, -3.9580, 3000),
  "glan-y-gors": (53.0300, -3.5600, 6000),
  "teesside": (54.5750, -1.1800, 4000),
  "three-sisters": (53.5230, -2.6720, 3000),
  "daytona-sandown-park": (51.3720, -0.3580, 2500),
  "daytona-tamworth": (52.6300, -1.6900, 5000),
}
try: out = json.load(open("data/track-geo-raw.json"))
except Exception: out = {}
only = sys.argv[1:]
for k, (lat, lon, r) in TRACKS.items():
    if only and k not in only: continue
    import time; time.sleep(4)
    q = f'[out:json][timeout:90];(way(around:{r},{lat},{lon})["highway"="raceway"]["sport"="karting"];way(around:{r},{lat},{lon})["leisure"="track"]["sport"="karting"];);out tags geom;'
    data = urllib.parse.urlencode({"data": q}).encode()
    for url in ["https://overpass.private.coffee/api/interpreter", "https://overpass-api.de/api/interpreter", "https://maps.mail.ru/osm/tools/overpass/api/interpreter", "https://overpass.kumi.systems/api/interpreter"]:
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
