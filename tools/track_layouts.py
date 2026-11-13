"""Layouts + target lap times for Track Guides. Targets are ESTIMATES until Brad signs them off.
owner = good lap for a competitive club senior (Rotax/X30) driver; rental = quick lap in the venue's adult rental kart.
Rule where no better data: owner = record x 1.03 (record class often KZ2/open), else length / 20.5 m/s;
rental = length / 17 m/s (calibrated on Kart Silverstone EKS and Daytona MK SODI times)."""
import json
def fmt(s):
    if s is None: return None
    m,x=divmod(round(s,1),60); return f"{int(m)}:{x:04.1f}" if m else f"{x:.1f}"
R=True  # public rental available (to check)
L=[ # track id, layout, metres, corners, record(s), record note, rental?, overrides, sources, flags
("kart-silverstone","Grand Prix",1377,18,76.103,"EKS rental record",R,{"rental":78.0,"owner":None},["kart.silverstone.co.uk","EKS lap records"],""),
("kart-silverstone","International",932,12,None,"",R,{"rental":56.5,"owner":None},["kart.silverstone.co.uk","EKS hotlap 55.416"],""),
("kart-silverstone","Indy",950,14,None,"",R,{"owner":None},["kart.silverstone.co.uk"],""),
("kart-silverstone","National",520,8,None,"",R,{"owner":None},["kart.silverstone.co.uk"],""),
("kart-silverstone","Village",447,6,None,"",R,{"owner":None},["kart.silverstone.co.uk"],""),
("daytona-milton-keynes","International",1360,None,None,"",R,{"rental":77.5,"owner":60.5},["daytona.co.uk (1,360m)","Brad KZ lap 55.784"],""),
("daytona-milton-keynes","National",None,None,None,"",R,{},["Wikipedia (Daytona Motorsport)"],"length missing"),
("daytona-milton-keynes","North",375,None,None,"",R,{},["Wikipedia (Daytona Motorsport)"],"juniors"),
("buckmore-park","International (full)",1200,12,48.0,"all-time, weak source",R,{},["Club100","yumping"],"kartdirectory says 1,000m: check"),
("buckmore-park","National",600,6,None,"",R,{},["kartdirectory"],""),
("buckmore-park","Club",400,6,None,"",R,{},["kartdirectory"],""),
("whilton-mill","International",1200,None,None,"",R,{},["whiltonmill.co.uk","totalkarting"],"Club 100 and Rotax times disagree: check which layout"),
("whilton-mill","National",960,None,None,"",R,{},["whiltonmill.co.uk"],""),
("whilton-mill","Mill",450,None,None,"",R,{},["whiltonmill.co.uk"],""),
("pf-international","International",1382,15,56.49,"BKC record",R,{},["BKC","Wikipedia"],""),
("pf-international","National",1040,None,None,"",R,{},["BKC (1,040m)","Wikipedia"],""),
("shenington","Direct drive",1018,11,39.94,"BKC record",False,{},["BKC","motorsport-timing"],""),
("shenington","Gearbox",1211,None,None,"",False,{},["motorsport-timing"],""),
("rowrah","Full circuit",1030,12,None,"",R,{},["51gt3 (weak)"],"length weak"),
("clay-pigeon","Full circuit",815,12,34.00,"BKC record",R,{},["BKC","Alpha"],""),
("rye-house","Full circuit",900,8,41.23,"rental lap record",R,{},["totalkarting","Alpha says 950m"],"900 vs 950m"),
("lydd","International",1040,10,35.61,"",R,{},["lyddkartcircuit.com","totalkarting"],""),
("lydd","Junior",500,None,None,"",R,{},["geronigo"],"juniors"),
("llandow","Full circuit",1050,9,None,"",R,{},["llandow.com"],""),
("fulbeck","Full circuit",930,10,None,"",False,{},["BKC","Brad GX-UK 56.99 P1 Jan 2024"],"TKZ 54.90 listed: check"),
("kimbolton","Circuit 1 (BKC)",990,7,None,"",False,{},["motorsport-timing","BKC lists 999m"],""),
("kimbolton","Circuit 2",1050,None,None,"",False,{},["motorsport-timing"],""),
("kimbolton","Circuit 3",1083,None,None,"",False,{},["motorsport-timing"],""),
("kimbolton","Gearbox",958,None,None,"",False,{},["motorsport-timing"],""),
("warden-law","National",1200,14,None,"",R,{},["BKC","motorsport-timing"],""),
("warden-law","Junior",350,None,None,"",R,{},["motorsport-timing"],"juniors"),
("larkhall","Full (extended)",1140,12,None,"",R,{},["BKC"],"Boot and no-boot configurations exist: check which is which"),
("larkhall","Short (original)",852,None,29.19,"BKC listing, weak: too fast for this length",R,{},["motorsport-timing"],""),
("glan-y-gors","Full circuit",1100,11,53.84,"BKC listing, weak: conflicts with 40.62",R,{},["BKC","totalkarting says 40.62"],"record conflict"),
("teesside","International",2100,19,89.0,"weak source",R,{},["teessidekarting.co.uk"],""),
("teesside","National",1300,None,None,"",R,{},["teessidekarting.co.uk","motorsportnetwork (1,300m)"],"length weak"),
("teesside","Clubman",None,None,None,"",R,{},["teessidekarting.co.uk"],"length missing"),
("three-sisters","Full circuit",1500,None,None,"",R,{},["yumping"],"1.5km length looks wrong for 50s laps: check"),
("daytona-sandown-park","Grand Prix",900,9,44.664,"DMAX record",R,{},["daytona.co.uk","Racing Dean DMAX 47.1"],""),
("daytona-sandown-park","Alternate",None,None,None,"",R,{},["daytona.co.uk SuperChamps"],"length missing"),
("daytona-sandown-park","Indy",None,5,None,"",R,{},["Wikipedia"],"length missing"),
("daytona-tamworth","International",1000,12,53.845,"DMAX, new layout Feb 2026",R,{},["daytona.co.uk (new Feb 2026)"],""),
]
out=[]
good=lambda rec,rn: rec and not any(w in rn for w in ("weak","old","rental","DMAX"))
ANCH={}  # track -> metres per second of a good owner lap, from its best-sourced record
for tid,name,m,c,rec,rn,*_ in L:
    if good(rec,rn) and m and tid not in ANCH: ANCH[tid]=m/(rec*1.03)
for tid,name,m,c,rec,rn,rent,ov,src,flag in L:
    owner=rec*1.03 if good(rec,rn) else None  # no guesses: TBC until there is real evidence
    rental=None
    owner=ov.get("owner",owner); rental=ov.get("rental",rental)
    out.append(dict(track=tid,layout=name,m=m,corners=c,record=fmt(rec),record_note=rn,
      owner=fmt(owner),rental=fmt(rental) if rent else "no public rental", rent=rent,sources=src,check=flag))
# Targets anchored on real onboard lap times found on YouTube (Nov 2026). (rental, owner, note)
EV={("kart-silverstone","Grand Prix"):(77.0,None,"rental 1:15.4 near-fastest in 8h race"),
("kart-silverstone","International"):(54.5,None,"rental record 53.007"),
("daytona-milton-keynes","International"):(66.0,60.5,"DMAX laps 1:04.4-1:05.6"),
("buckmore-park","International (full)"):(49.5,44.0,"Sodi RT10 48.56 (near record), Club 100 45.6"),
("whilton-mill","International"):(60.0,47.0,"Club 100 57.4-59.8 in races; Rotax laps ~46-47: layout to check"),
("rowrah","Full circuit"):(54.0,47.0,"Super One Senior Rotax pole 46.3; rental time unknown"),
("clay-pigeon","Full circuit"):(44.5,35.0,"rental 43.7, Rotax 34.5"),
("rye-house","Full circuit"):(42.5,39.5,"rental record 41.23; owner time unknown; new 2026 chicane layout"),
("llandow","Full circuit"):(52.5,49.5,"Club 100 Junior 51.5"),
("kimbolton","Circuit 1 (BKC)"):(None,41.0,"X30 40.75-40.95"),
("warden-law","National"):(None,52.0,"Prokart 55.7; new layout in 2026"),
("larkhall","Full (extended)"):(54.0,49.5,"rental 52.9 (no boot) / 59.6 (boot config); Senior Rotax 49.7 test"),
("glan-y-gors","Full circuit"):(56.5,49.0,"rental 55.3 month record; owner time unknown"),
("three-sisters","Full circuit"):(51.0,None,"hot laps 49.9-50.3"),
("daytona-sandown-park","Grand Prix"):(47.5,None,"DMAX 46.2-46.4, record 44.664"),
("daytona-tamworth","International"):(55.5,None,"DMAX 53.845 new layout"),}
for o in out:
    e=EV.get((o["track"],o["layout"]))
    if not e: continue
    r,w,n=e
    if r is not None and o["rent"]: o["rental"]=fmt(r)
    if w is not None: o["owner"]=fmt(w)
    o["sources"]=o["sources"]+["YouTube onboards: "+n]
# Kimbolton other circuits scale off Circuit 1
for o in out:
    pass
json.dump(out,open("data/track-layouts.json","w"),indent=1)
for o in out: print(f'{o["track"]:22} {o["layout"]:20} {str(o["m"] or "?"):>5}  rec {o["record"] or "-":>6}  own {o["owner"] or "-":>6}  rent {o["rental"] or "-":>8}  {o["check"]}')
