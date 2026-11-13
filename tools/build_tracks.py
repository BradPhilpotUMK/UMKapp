"""Turn data/track-geo-raw.json (OpenStreetMap) into SVG paths for the Track Guides.
Picks the longest closed loop of karting raceway per track as the main layout; other
karting raceway pieces are kept as faint alternative links. Writes data/tracks-geo.json."""
import json, math, itertools
RAW = json.load(open("data/track-geo-raw.json"))
MAIN_IDS = {"daytona-milton-keynes": [160481719], "buckmore-park": [92128535]}
def hav(a, b):
    R = 6371000; p1, p2 = math.radians(a[0]), math.radians(b[0]); dp = p2 - p1; dl = math.radians(b[1] - a[1])
    h = math.sin(dp/2)**2 + math.cos(p1)*math.cos(p2)*math.sin(dl/2)**2; return 2*R*math.asin(math.sqrt(h))
def plen(g): return sum(hav(g[i], g[i+1]) for i in range(len(g)-1))
def key(p): return (round(p[0], 6), round(p[1], 6))
def longest_loop(ways, target=None, must=()):
    """Split every way at nodes shared with other ways, then search for the longest simple cycle."""
    cnt = {}
    for w in ways:
        for p in w["geom"]: cnt[key(p)] = cnt.get(key(p), 0) + 1
    for w in ways:  # way ends are always junction candidates
        cnt[key(w["geom"][0])] = cnt.get(key(w["geom"][0]), 0) + 1; cnt[key(w["geom"][-1])] = cnt.get(key(w["geom"][-1]), 0) + 1
    edges = []  # (a, b, geom, wayid)
    for w in ways:
        g = w["geom"]; cur = [g[0]]
        for p in g[1:]:
            cur.append(p)
            if cnt[key(p)] > 1 and len(cur) > 1:
                edges.append((key(cur[0]), key(cur[-1]), cur, w["id"])); cur = [p]
        if len(cur) > 1: edges.append((key(cur[0]), key(cur[-1]), cur, w["id"]))
    adj = {}
    for i, (a, b, g, _) in enumerate(edges):
        adj.setdefault(a, []).append((i, b)); adj.setdefault(b, []).append((i, a))
    L = [plen(e[2]) for e in edges]
    best = [0, None]; wid = {w["id"]: w["tags"].get("name", "") for w in ways}
    def score(es, length):
        names = {wid[edges[i][3]] for i in es}
        if any(m not in names for m in must): return -1
        return -abs(length - target) if target else length
    bestsc = [None]
    def seg_from(i, node):
        g = edges[i][2]; return g if key(g[0]) == node else g[::-1]
    def head(a, b):
        return math.atan2(b[0] - a[0], (b[1] - a[1]) * math.cos(math.radians(a[0])))
    def turn_ok(prev_seg, nxt_seg):
        if prev_seg is None: return True
        h1 = head(prev_seg[-2], prev_seg[-1]); h2 = head(nxt_seg[0], nxt_seg[1])
        d = abs((h2 - h1 + math.pi) % (2*math.pi) - math.pi)
        return d < math.radians(100)
    def dfs(start, node, used_e, used_n, length, prev_seg=None, first_seg=None):
        for i, nxt in adj.get(node, []):
            if i in used_e: continue
            sg = seg_from(i, node)
            if not turn_ok(prev_seg, sg): continue
            if nxt == start and used_e and not turn_ok(sg, first_seg): continue
            if nxt == start and len(used_e) >= 1:
                sc_ = score(used_e + [i], length + L[i])
                if sc_ != -1 and (bestsc[0] is None or sc_ > bestsc[0]): bestsc[0] = sc_; best[0] = length + L[i]; best[1] = used_e + [i]
                continue
            if nxt in used_n: continue
            dfs(start, nxt, used_e + [i], used_n | {nxt}, length + L[i], sg, first_seg or sg)
    for n0 in list(adj):
        dfs(n0, n0, [], {n0}, 0)
    if not best[1]: return None
    # stitch the chosen edges in order
    order = []; node = edges[best[1][0]][0]
    for i in best[1]:
        a, b, g, _ = edges[i]
        seg = g if key(g[0]) == node else g[::-1]
        order += seg if not order else seg[1:]; node = key(seg[-1])
    used = {edges[i][3] for i in best[1]}
    global LAST_ALTS
    LAST_ALTS = [edges[i][2] for i in range(len(edges)) if i not in best[1]]
    return best[0], order, used

def chain(ws):
    ws = [list(w["geom"]) for w in ws]; out = ws.pop(0)
    while ws:
        end = key(out[-1]); hit = False
        for i, g in enumerate(ws):
            if key(g[0]) == end: out += g[1:]; ws.pop(i); hit = True; break
            if key(g[-1]) == end: out += g[::-1][1:]; ws.pop(i); hit = True; break
        if not hit: return None
    return out if key(out[0]) == key(out[-1]) else None
res = {}
for k, els in RAW.items():
    kart = [e for e in els if e["tags"].get("highway") == "raceway" and e["tags"].get("sport") == "karting" and len(e["geom"]) > 1]
    if k in MAIN_IDS:
        main_ws = [e for e in kart if e["id"] in MAIN_IDS[k]]
        loop = chain(main_ws) or main_ws[0]["geom"]; used = set(MAIN_IDS[k]); alts = []
    else:
        L, loop, used = longest_loop(kart, target=1377, must=("Bridge", "Priory"))
        alts = LAST_ALTS
    lat0 = sum(p[0] for p in loop)/len(loop); kx = math.cos(math.radians(lat0))
    allp = loop + [p for a in alts for p in a]
    xs = [p[1]*kx for p in allp]; ys = [p[0] for p in allp]
    mnx, mxx, mny, mxy = min(xs), max(xs), min(ys), max(ys)
    S = 900; pad = 40; sc = (S - 2*pad) / max(mxx - mnx, mxy - mny)
    w = (mxx - mnx)*sc + 2*pad; h = (mxy - mny)*sc + 2*pad
    P = lambda p: (round(pad + (p[1]*kx - mnx)*sc, 1), round(h - pad - (p[0] - mny)*sc, 1))
    d = lambda g: "M" + " L".join(f"{x},{y}" for x, y in map(P, g))
    res[k] = {"w": round(w), "h": round(h), "main": d(loop) + " Z", "alts": [d(a) for a in alts], "length_m": round(plen(loop)),
              "names": sorted({e["tags"]["name"] for e in kart if "name" in e["tags"] and e["id"] in used}),
              "oneway": any(e["tags"].get("oneway") == "yes" for e in kart if e["id"] in used)}
    print(k, res[k]["length_m"], "m", res[k]["w"], "x", res[k]["h"], "alts", len(alts), res[k]["names"])
json.dump(res, open("data/tracks-geo.json", "w"), separators=(",", ":"))
