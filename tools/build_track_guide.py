"""Merge content + layouts/targets + OSM geometry into data/tracks.json for tracks/index.html."""
import json
C = json.load(open("data/track-content.json"))
LAY = json.load(open("data/track-layouts.json"))
G = json.load(open("data/tracks-geo.json"))
out = []
for t in C:
    g = G.get(t["id"], {}); gl = {l["layout"]: l for l in g.get("layouts", [])}
    lays = []
    for l in (x for x in LAY if x["track"] == t["id"]):
        m = gl.get(l["layout"])
        lays.append(dict(n=l["layout"], m=l["m"], c=l["corners"], rec=None if "weak" in l["record_note"] else l["record"], recn=l["record_note"],
                         own=l["owner"], ren=l["rental"], d=m["d"] if m else None, chk=bool(l["check"])))
    out.append(dict(t, w=g.get("w"), h=g.get("h"), net=g.get("net", []), layouts=lays))
json.dump(out, open("data/tracks.json", "w"), separators=(",", ":"))
print(len(out), "tracks;", sum(len(t["layouts"]) for t in out), "layouts;", sum(1 for t in out for l in t["layouts"] if l["d"]), "drawn")
