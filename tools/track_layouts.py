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
("daytona-milton-keynes","International",1360,None,None,"",R,{"rental":77.5,"owner":60.5},["daytona.co.uk (1,360m)","Brad KZ lap 55.784"],"DMAX target ~1:06 to check"),
("daytona-milton-keynes","National",None,None,None,"",R,{},["Wikipedia (Daytona Motorsport)"],"length missing"),
("daytona-milton-keynes","North",375,None,None,"",R,{},["Wikipedia (Daytona Motorsport)"],"juniors"),
("buckmore-park","International (full)",1200,12,48.0,"all-time, weak source",R,{},["Club100","yumping"],"kartdirectory says 1,000m: check"),
("buckmore-park","National",600,6,None,"",R,{},["kartdirectory"],""),
("buckmore-park","Club",400,6,None,"",R,{},["kartdirectory"],""),
("whilton-mill","International",1200,None,59.277,"",R,{},["whiltonmill.co.uk","totalkarting"],"59.3 record looks slow for 1,200m: check class"),
("whilton-mill","National",960,None,None,"",R,{},["whiltonmill.co.uk"],""),
("whilton-mill","Mill",450,None,None,"",R,{},["whiltonmill.co.uk"],""),
("pf-international","International",1382,15,56.49,"BKC record",R,{},["BKC","Wikipedia"],""),
("pf-international","National",None,None,None,"",R,{},["Wikipedia"],"length missing"),
("shenington","Direct drive",1018,11,39.94,"BKC record",False,{},["BKC","motorsport-timing"],""),
("shenington","Gearbox",1211,None,None,"",False,{},["motorsport-timing"],""),
("rowrah","Full circuit",1030,12,None,"",False,{},["51gt3 (weak)"],"length weak"),
("clay-pigeon","Full circuit",815,12,34.00,"BKC record",R,{},["BKC","Alpha"],""),
("rye-house","Full circuit",900,8,41.23,"",R,{},["totalkarting","Alpha says 950m"],"900 vs 950m"),
("lydd","International",1040,10,35.61,"",R,{},["lyddkartcircuit.com","totalkarting"],"35.6 record too fast for 1,040m: check (maybe 1,240m?)"),
("lydd","Junior",500,None,None,"",R,{},["geronigo"],"juniors"),
("llandow","Full circuit",1050,9,None,"",R,{},["llandow.com"],""),
("fulbeck","Full circuit",930,10,None,"",False,{},["BKC","Brad GX-UK 56.99 P1 Jan 2024"],"TKZ 54.90 listed: check"),
("kimbolton","Circuit 1",990,None,None,"",False,{},["motorsport-timing"],""),
("kimbolton","Circuit 2",1050,None,None,"",False,{},["motorsport-timing"],""),
("kimbolton","Circuit 3",1083,None,None,"",False,{},["motorsport-timing"],""),
("kimbolton","BKC",999,7,46.06,"BKC record",False,{},["BKC"],""),
("kimbolton","Gearbox",958,None,None,"",False,{},["motorsport-timing"],""),
("warden-law","National",1200,14,None,"",R,{},["BKC","motorsport-timing"],""),
("warden-law","Junior",350,None,None,"",R,{},["motorsport-timing"],"juniors"),
("larkhall","Full (extended)",1140,12,None,"",R,{},["BKC"],"BKC record 29.19 is from old 852m layout"),
("larkhall","Short (original)",852,None,29.19,"BKC (old layout)",R,{},["motorsport-timing"],""),
("glan-y-gors","Full circuit",1100,11,53.84,"BKC record",R,{},["BKC","totalkarting says 40.62"],"record conflict"),
("teesside","International",2100,19,89.0,"weak source",R,{},["teessidekarting.co.uk"],""),
("teesside","National",None,None,None,"",R,{},["teessidekarting.co.uk"],"length missing; 2 more layouts"),
("three-sisters","Full circuit",1500,None,50.0,"weak source",R,{},["yumping"],"50s for 1,500m looks wrong"),
("daytona-sandown-park","Grand Prix",900,9,None,"",R,{},["daytona.co.uk","Racing Dean DMAX 47.1"],""),
("daytona-sandown-park","Alternate",None,None,None,"",R,{},["daytona.co.uk SuperChamps"],"length missing"),
("daytona-sandown-park","Indy",None,5,None,"",R,{},["Wikipedia"],"length missing"),
("daytona-tamworth","International",1000,12,None,"",R,{},["daytona.co.uk (new Feb 2026)"],""),
]
out=[]
for tid,name,m,c,rec,rn,rent,ov,src,flag in L:
    owner=rec*1.03 if rec and "weak" not in rn and "old" not in rn else (m/20.5 if m else None)
    rental=(m/17.0 if m else None) if rent else None
    owner=ov.get("owner",owner); rental=ov.get("rental",rental)
    out.append(dict(track=tid,layout=name,m=m,corners=c,record=fmt(rec),record_note=rn,
      owner=fmt(owner),rental=fmt(rental) if rent else "no public rental",sources=src,check=flag))
json.dump(out,open("data/track-layouts.json","w"),indent=1)
for o in out: print(f'{o["track"]:22} {o["layout"]:20} {str(o["m"] or "?"):>5}  rec {o["record"] or "-":>6}  own {o["owner"] or "-":>6}  rent {o["rental"] or "-":>8}  {o["check"]}')
