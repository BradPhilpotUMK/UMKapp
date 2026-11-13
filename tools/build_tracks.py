"""Turn data/track-geo-raw.json (OpenStreetMap) into SVG paths for the Track Guides, one per layout.
Every closed loop through the karting ways is enumerated (no reversing, no turn sharper than 100 degrees at a
junction); each layout in data/track-layouts.json gets the loop whose length is nearest its official length.
Writes data/tracks-geo.json {track:{w,h,net:[paths],layouts:[{layout,d,length_m}]}}."""
import json, math, re
RAW = json.load(open("data/track-geo-raw.json"))
LAY = json.load(open("data/track-layouts.json"))
SRC = open("tools/fetch_track_geo.py").read()
CENTRE = {k: (float(a), float(b), float(r)) for k, a, b, r in re.findall(r'"([a-z-]+)": \(([-\d.]+), ([-\d.]+), (\d+)\)', SRC)}
MUST = {("kart-silverstone", "Grand Prix"): ("Bridge", "Priory")}
def hav(a, b):
    R = 6371000; p1, p2 = math.radians(a[0]), math.radians(b[0]); dp = p2 - p1; dl = math.radians(b[1] - a[1])
    h = math.sin(dp/2)**2 + math.cos(p1)*math.cos(p2)*math.sin(dl/2)**2; return 2*R*math.asin(math.sqrt(h))
def plen(g): return sum(hav(g[i], g[i+1]) for i in range(len(g)-1))
def key(p): return (round(p[0], 6), round(p[1], 6))
def head(a, b): return math.atan2(b[0] - a[0], (b[1] - a[1]) * math.cos(math.radians(a[0])))
def ang(s1, s2):
    return abs((head(s2[0], s2[1]) - head(s1[-2], s1[-1]) + math.pi) % (2*math.pi) - math.pi)
def cycles(ways, cap=400000):
    cnt = {}
    for w in ways:
        for p in w["geom"]: cnt[key(p)] = cnt.get(key(p), 0) + 1
        for p in (w["geom"][0], w["geom"][-1]): cnt[key(p)] = cnt.get(key(p), 0) + 1
    edges = []
    for w in ways:
        g = w["geom"]; cur = [g[0]]
        for p in g[1:]:
            cur.append(p)
            if cnt[key(p)] > 1: edges.append((key(cur[0]), key(cur[-1]), cur, w)); cur = [p]
        if len(cur) > 1: edges.append((key(cur[0]), key(cur[-1]), cur, w))
    adj = {}
    for i, (a, b, g, _) in enumerate(edges):
        adj.setdefault(a, []).append((i, b)); adj.setdefault(b, []).append((i, a))
    L = [plen(e[2]) for e in edges]; found = {}; steps = [0]
    def seg(i, node): g = edges[i][2]; return g if key(g[0]) == node else g[::-1]
    def dfs(start, node, used, nodes, length, prev, first):
        steps[0] += 1
        if steps[0] > cap: return
        for i, nxt in adj.get(node, []):
            if i in used: continue
            sg = seg(i, node)
            if prev is not None and ang(prev, sg) > math.radians(100): continue
            if nxt == start:
                if (used and ang(sg, first or sg) <= math.radians(100)) or (not used and edges[i][0] == edges[i][1]):
                    found.setdefault(frozenset(used + [i]), (length + L[i], used + [i], start))
                continue
            if nxt in nodes: continue
            dfs(start, nxt, used + [i], nodes | {nxt}, length + L[i], sg, first or sg)
    for n0 in list(adj): dfs(n0, n0, [], {n0}, 0, None, None)
    out = []
    for es, (length, order, start) in found.items():
        pts = []; node = start
        for i in order:
            s = seg(i, node); pts += s if not pts else s[1:]; node = key(s[-1])
        names = {edges[i][3]["tags"].get("name", "") for i in order}
        out.append((length, pts, names))
    return out, [e[2] for e in edges], steps[0] > cap
res = {}
for k, els in RAW.items():
    lat0, lon0, r = CENTRE.get(k, (None, None, 1e9))
    near = lambda e: lat0 is None or min(hav(p, (lat0, lon0)) for p in e["geom"]) < r
    kart = [e for e in els if len(e["geom"]) > 1 and near(e) and (e["tags"].get("sport") == "karting")]
    if not kart: print(k, "NO KART WAYS"); continue
    loops, net, capped = cycles(kart)
    lays = [l for l in LAY if l["track"] == k]
    picked = []
    for l in lays:
        must = MUST.get((k, l["layout"]), ())
        cand = [c for c in loops if all(m in c[2] for m in must)]
        if not cand: continue
        if not l["m"]: continue
        taken = {id(p["pts"]) for p in picked}
        best = min(cand, key=lambda c: abs(c[0] - l["m"]))
        fresh = [c for c in cand if id(c[1]) not in taken and abs(c[0] - l["m"]) <= abs(best[0] - l["m"]) + 0.03 * l["m"]]
        c = min(fresh, key=lambda c: abs(c[0] - l["m"])) if fresh else best
        err = abs(c[0] - l["m"]) / l["m"]
        if id(c[1]) in taken or (err > 0.10 and picked): print("   no map:", k, l["layout"], round(c[0]), "vs", l["m"]); continue
        picked.append(dict(layout=l["layout"], pts=c[1], length_m=round(c[0]), target_m=l["m"], err=round(err, 2)))
    allp = [p for g in net for p in g]
    kx = math.cos(math.radians(sum(p[0] for p in allp)/len(allp)))
    xs = [p[1]*kx for p in allp]; ys = [p[0] for p in allp]
    mnx, mxx, mny, mxy = min(xs), max(xs), min(ys), max(ys)
    S = 900; pad = 40; sc = (S - 2*pad) / max(mxx - mnx, mxy - mny)
    w = (mxx - mnx)*sc + 2*pad; h = (mxy - mny)*sc + 2*pad
    P = lambda p: (round(pad + (p[1]*kx - mnx)*sc, 1), round(h - pad - (p[0] - mny)*sc, 1))
    d = lambda g: "M" + " L".join(f"{x},{y}" for x, y in map(P, g))
    res[k] = {"w": round(w), "h": round(h), "net": [d(g) for g in net],
              "layouts": [dict(layout=p["layout"], d=d(p["pts"]) + " Z", length_m=p["length_m"], target_m=p["target_m"], err=p["err"]) for p in picked]}
    print(f'{k:22} loops {len(loops):5}{" CAPPED" if capped else ""}  ' + "; ".join(f'{p["layout"]} {p["length_m"]}/{p["target_m"]} ({int(p["err"]*100)}%)' for p in picked))
json.dump(res, open("data/tracks-geo.json", "w"), separators=(",", ":"))
