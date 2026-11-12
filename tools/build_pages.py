#!/usr/bin/env python3
"""Builds the shared <head> + page shell for the newer member apps (sponsor, budget, teams).
Each app's body lives in tools/pages/<name>.html (markup), <name>.css and <name>.js.
Run: python3 tools/build_pages.py   (writes <name>/index.html)"""
import os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "tools", "pages")
PAGES = {
    "sponsor": ("Sponsorship Builder", "Build a sponsorship proposal that gets read: who to ask, what to offer, and the mistakes to avoid."),
    "budget": ("Budget Calculator", "Work out what a karting season really costs, per race and per year."),
    "teams": ("Team Finder", "Find a team for an endurance or team race, or find drivers for your team."),
    "post": ("Race Post Maker", "Turn your race photo and result into a shareable post for Instagram Stories and TikTok."),
}
OPEN_TO_ALL = {"post"}  # signed in via Discord is enough; everything else is members only

store = open(os.path.join(ROOT, "store", "index.html"), encoding="utf-8").read()
head = store[:store.index('<link rel="stylesheet" href="../hub.css">') + len('<link rel="stylesheet" href="../hub.css">')]
head = re.sub(r"^<!doctype html>\n<html lang=\"en-GB\">\n<head>\n<style>.*?</style>\n", "<!doctype html>\n<html lang=\"en-GB\">\n<head>\n<style>html,body{background:#000}</style>\n", head, flags=re.S)
head = head.replace('<script src="../gate.js" data-need="any"></script>', '<script src="../gate.js"></script>')

COMMON_CSS = """
:root{--accent:#FF0074;--go:#00BE00}
body{background:#000 url(../img/camo.png) center/cover no-repeat}
header.top{position:relative;background:none;-webkit-backdrop-filter:none;backdrop-filter:none}
header.top .brand{text-align:center}
header.top .brand .r{position:relative;justify-content:center;min-height:30px;margin-bottom:8px}
header.top .brand .r .homechip{position:absolute;left:0;top:50%;transform:translateY(-50%);margin:0}
header.top .brand .r img{height:16px}
header.top .brand h1{font-size:clamp(24px,7.4vw,36px);white-space:nowrap;overflow:visible;text-shadow:0 4px 18px rgba(0,0,0,.8)}
.lead{text-align:center;max-width:36ch;margin:2px auto 18px;color:#c9cad0;font-size:14.5px;line-height:1.5}
.card{background:rgba(22,22,26,.92);border-color:rgba(255,255,255,.1);box-shadow:inset 0 1px 0 rgba(255,255,255,.06),0 8px 20px rgba(0,0,0,.4)}
.card h2{font-family:var(--display);font-size:19px;margin:0 0 4px}
.card .sub{color:var(--muted);font-size:13.5px;margin:0 0 12px}
label{display:block;font-size:13px;font-weight:600;color:#cfd0d6;margin:10px 0 4px}
input,select,textarea{width:100%;background:#0d0d10;border:1px solid #34353c;border-radius:10px;padding:10px 11px;font-size:16px;color:var(--text)}
textarea{min-height:76px;resize:vertical;line-height:1.4}
input:focus,select:focus,textarea:focus{outline:none;border-color:var(--accent)}
.row2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:4px}
.chips label{display:inline-flex;align-items:center;gap:6px;margin:0;padding:8px 11px;border-radius:999px;border:1px solid #3a3b42;background:#121216;font-weight:600;font-size:13.5px;cursor:pointer}
.chips input{width:auto;margin:0;accent-color:#FF0074}
.chips label:has(input:checked){border-color:#FF0074;background:rgba(255,0,116,.14)}
.btn.primary{background:#FF0074;border-color:#FF0074}
.btns{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
.tag{display:inline-block;font-size:10.5px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#fff;background:#FF0074;border-radius:999px;padding:3px 9px}
.tag.g{background:#00BE00;color:#04150a}
.note{font-size:13px;color:var(--muted);line-height:1.45}
"""

for name, (title, desc) in PAGES.items():
    body = open(os.path.join(SRC, name + ".html"), encoding="utf-8").read()
    css = open(os.path.join(SRC, name + ".css"), encoding="utf-8").read()
    js = open(os.path.join(SRC, name + ".js"), encoding="utf-8").read()
    h = head if name not in OPEN_TO_ALL else head.replace('<script src="../gate.js"></script>', '<script src="../gate.js" data-need="any"></script>')
    h = h.replace("<title>Use More Kerb Store</title>", f"<title>Use More Kerb {title}</title>")
    h = re.sub(r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{desc}">', h)
    page = (h + "\n<style>" + COMMON_CSS + css + "</style>\n"
            '<script data-goatcounter="https://usemorekerb.goatcounter.com/count" async src="https://gc.zgo.at/count.js"></script>\n'
            "</head>\n<body>\n<div id=\"scroller\"><div class=\"wrap\">\n"
            '  <header class="top"><div class="brand"><div class="r"><a class="homechip" href="../" aria-label="Use More Kerb home"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>Home</a><img src="../team/wm.png" alt="Use More Kerb"></div>'
            f"<h1>{title}</h1></div></header>\n"
            + body +
            '\n  <a class="back" href="../">‹ Use More Kerb home</a>\n</div></div>\n<div class="toast" id="toast"></div>\n<script>\n'
            'const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];\n'
            'const esc=s=>String(s??"").replace(/[&<>"\']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",\'"\':"&quot;","\'":"&#39;"}[c]));\n'
            'function toast(t){const el=$("#toast");el.textContent=t;el.classList.add("on");clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove("on"),2200)}\n'
            'function gc(path,title){try{window.goatcounter&&window.goatcounter.count&&window.goatcounter.count({path,title:title||path,event:true})}catch(e){}}\n'
            'const store={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};\n'
            'async function copy(t,ok){let done=false;try{await navigator.clipboard.writeText(t);done=true}catch(e){}toast(done?ok:"Couldn\'t copy, select the text instead")}\n'
            'if("serviceWorker" in navigator&&(location.protocol==="https:"||location.hostname==="localhost"))addEventListener("load",()=>navigator.serviceWorker.register("../sw.js").catch(()=>{}));\n'
            + js + "\n</script>\n</body>\n</html>\n")
    os.makedirs(os.path.join(ROOT, name), exist_ok=True)
    open(os.path.join(ROOT, name, "index.html"), "w", encoding="utf-8").write(page)
    print("wrote", name)
