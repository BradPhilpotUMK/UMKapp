const KEY="umk-sponsor-v1",F=["col","name","age","town","class","season","results","ig","tt","yt","crowd","contact","type","amount","spend","co","person","why","level"],GROUPS=["c_brand","c_content","c_extra"];
const S=store.get(KEY,{});
F.forEach(k=>{const el=$("#f_"+k);if(S[k]!=null)el.value=S[k];el.addEventListener("input",save)});
GROUPS.forEach(g=>$$("#"+g+" input").forEach(c=>{c.checked=(S[g]||[]).includes(c.value);c.addEventListener("change",save)}));
const B=store.get("umk-budget-v1",null);
function save(){F.forEach(k=>S[k]=$("#f_"+k).value.trim());GROUPS.forEach(g=>S[g]=$$("#"+g+" input:checked").map(c=>c.value));store.set(KEY,S);$("#minorNote").hidden=!(+S.age&&+S.age<18);hint()}
function hint(){const h=$("#budgetHint");if(B&&B.season){h.innerHTML=`Your Budget Calculator says your season costs about <b>£${Math.round(B.season).toLocaleString("en-GB")}</b>. <a href="#" id="useB" style="color:#FF0074">Use part of it</a>`;const u=$("#useB");u.onclick=e=>{e.preventDefault();$("#f_amount").value=Math.round(B.season/4/50)*50;save();toast("Added a quarter of your season budget")}}else h.textContent="Tip: work out your real costs in the Budget Calculator first, then ask for a specific part of it."}
save();
function go(n){$$(".pane").forEach(p=>p.hidden=p.dataset.p!=String(n));$$("#steps button").forEach(b=>b.classList.toggle("on",b.dataset.s==String(n)));if(n==4)build();document.getElementById("scroller").scrollTo({top:0,behavior:"smooth"});gc("sponsor-step-"+n,"Sponsorship: step "+n)}
$$("[data-go]").forEach(b=>b.onclick=()=>go(+b.dataset.go));$$("#steps button").forEach(b=>b.onclick=()=>go(+b.dataset.s));
const num=v=>(+v||0),fmt=n=>n.toLocaleString("en-GB");
function reach(){const p=[];if(num(S.ig))p.push(fmt(num(S.ig))+" Instagram followers");if(num(S.tt))p.push(fmt(num(S.tt))+" TikTok followers");if(num(S.yt))p.push(fmt(num(S.yt))+" YouTube subscribers");return p}
let build=function(){
  const first=(S.name||"").split(" ")[0]||"I",results=(S.results||"").split("\n").map(x=>x.trim()).filter(Boolean),offer=[...(S.c_brand||[]),...(S.c_content||[]),...(S.c_extra||[])];
  const askTxt=S.type==="product"?(S.spend?`products or services for ${S.spend}`:"products or services"):(num(S.amount)?`£${fmt(num(S.amount))}${S.spend?" towards "+S.spend:""}`:(S.spend?"support towards "+S.spend:"support"))+(S.type==="both"?", or products or services instead":"");
  const r=reach(),hi=results[0];
  const email=`Subject: Meeting about ${S.co||"[Company]"} x ${S.name||"[Your name]"} karting ${new Date().getFullYear()+1}

Hi ${S.person?S.person.split(" ")[0]:"[name]"},

Thanks for speaking to me today. As promised, a quick summary: I'm ${S.name||"[your name]"}${S.age?", "+S.age+",":""} a kart racer from ${S.town||"[town]"} racing ${S.class||"[class]"}${S.season?" ("+S.season+")":""}.${hi?" Most recently: "+hi+".":""}

I'm getting in touch with ${S.co||"[company]"} because ${S.why||"[why them]"}.

I'm looking for ${askTxt}. In return ${S.co||"you"} would get ${offer.length?offer.slice(0,3).map(x=>x.charAt(0).toLowerCase()+x.slice(1)).join(", ").replace(/, ([^,]*)$/," and $1"):"[what they get]"}${offer.length>3?", plus more in the attached proposal":""}.${r.length?" My racing reaches "+r.join(", ")+".":""}

I'd love 15 minutes to come in and show you the proposal in person (and the kart, if that's useful). Would [day] at [time] work?

Thanks,
${S.name||"[Your name]"}
${S.contact||"[contact]"}`;
  const prop=`${(S.name||"[YOUR NAME]").toUpperCase()}: ${S.level||"Partner"} proposal for ${S.co||"[Company]"}

ABOUT ME
${S.name||"[Name]"}${S.age?", "+S.age:""}, from ${S.town||"[town]"}. Racing ${S.class||"[class]"}${S.season?": "+S.season:""}.
${results.length?"\nRESULTS\n"+results.map(x=>"• "+x).join("\n")+"\n":""}
AUDIENCE
${r.length?r.map(x=>"• "+x).join("\n"):"• [followers, views]"}${num(S.crowd)?"\n• About "+fmt(num(S.crowd))+" people at each race meeting":""}

WHY ${(S.co||"YOU").toUpperCase()}
${S.why||"[why this company]"}

WHAT ${(S.co||"YOU").toUpperCase()} GETS
${offer.length?offer.map(x=>"• "+x).join("\n"):"• [logo places, posts, videos, guest days]"}

THE ASK
${askTxt.charAt(0).toUpperCase()+askTxt.slice(1)}.

REPORTING
After every round you'll get results, photos and reach figures, and you'll be tagged in every race-weekend post.

CONTACT
${S.name||"[Name]"}: ${S.contact||"[email / phone]"}`;
  $("#outEmail").textContent=email;$("#outProp").textContent=prop;
  const words=email.split(/\s+/).filter(Boolean).length;
  const C=[
    [!!S.co&&!!S.person,"Named the company and a person","No company or person's name: it reads like a mass email."],
    [(S.why||"").length>15,"Said why you picked them","Say why this company: location, customers, a family link."],
    [offer.length>=3,"Offering at least three things back",`Only ${offer.length} thing${offer.length==1?"":"s"} offered: add more in step 2.`],
    [(S.c_extra||[]).length>0,"Included something money can't buy","Add a guest day, track day or appearance: sponsors love those."],
    [(S.type==="product"&&!!S.spend)||num(S.amount)>0,"A clear, specific ask","No amount or product: say exactly what you need."],
    [!!S.spend,"Said what the money pays for","Say what it pays for (tyres, entries, engine rebuild)."],
    [r.length>0||num(S.crowd)>0,"Included real numbers","No audience numbers: add followers or spectators, even small ones."],
    [results.length>0,"Listed results","Add at least one result or achievement."],
    [words<=200,`Email is short (${words} words)`,`Email is ${words} words: cut it under 200.`],
    [!!S.contact,"Easy to reply to","Add an email or phone number."],
  ];
  $("#checks").innerHTML=C.map(([ok,y,n])=>`<li class="${ok?"ok":"bad"}"><i>${ok?"✓":"!"}</i><span>${esc(ok?y:n)}</span></li>`).join("")+(+S.age&&+S.age<18?`<li class="bad"><i>!</i><span>You're under 18<small>Have a parent or guardian send it and be the contact.</small></span></li>`:"");
  $("#scoreBar").style.width=Math.round(C.filter(c=>c[0]).length/C.length*100)+"%";
}
$("#cpEmail").onclick=()=>{copy($("#outEmail").textContent,"Email copied");gc("sponsor-copy-email","Sponsorship: copied email")};
$("#cpProp").onclick=()=>{copy($("#outProp").textContent,"Proposal copied");gc("sponsor-copy-prop","Sponsorship: copied proposal")};
$("#print").onclick=()=>{gc("sponsor-print","Sponsorship: print");window.print()};

/* pictures for the proposal: downsized and kept on this phone */
const IMGK="umk-sponsor-img-v1";let IM=store.get(IMGK,{logo:"",ph:["","",""]});
function shrink(file,max){return new Promise(res=>{const r=new FileReader();r.onload=()=>{const i=new Image();i.onload=()=>{const k=Math.min(1,max/Math.max(i.width,i.height)),c=document.createElement("canvas");c.width=Math.round(i.width*k);c.height=Math.round(i.height*k);const x=c.getContext("2d");x.drawImage(i,0,0,c.width,c.height);res(c.toDataURL(file.type==="image/png"?"image/png":"image/jpeg",.82))};i.onerror=()=>res("");i.src=r.result};r.readAsDataURL(file)})}
function saveImg(){try{localStorage.setItem(IMGK,JSON.stringify(IM))}catch(e){toast("Pictures are too big to keep on this phone, but they're in your proposal for now")}}
function upTiles(){const set=(el,u)=>{el.style.backgroundImage=u?`url(${u})`:"";el.classList.toggle("has",!!u)};set($("#upLogo"),IM.logo);[0,1,2].forEach(i=>set($("#upP"+i),IM.ph[i]))}
function logoTone(u){return new Promise(res=>{const i=new Image();i.onload=()=>{const c=document.createElement("canvas");c.width=c.height=40;const x=c.getContext("2d");x.drawImage(i,0,0,40,40);const d=x.getImageData(0,0,40,40).data;let L=0,n=0;for(let k=0;k<d.length;k+=4)if(d[k+3]>128){L+=.3*d[k]+.59*d[k+1]+.11*d[k+2];n++}res(n&&L/n>150?"light":"dark")};i.onerror=()=>res("dark");i.src=u})}
$("#logoIn").onchange=async e=>{const f=e.target.files[0];if(!f)return;IM.logo=await shrink(f,600);IM.tone=await logoTone(IM.logo);saveImg();upTiles();docDraw()};
$$("[data-ph]").forEach(inp=>inp.onchange=async e=>{const f=e.target.files[0];if(!f)return;IM.ph[+inp.dataset.ph]=await shrink(f,1400);saveImg();upTiles();docDraw();gc("sponsor-photo","Sponsorship: added photo")});
$("#clearImg").onclick=()=>{IM={logo:"",ph:["","",""]};saveImg();upTiles();docDraw()};
function docDraw(){
  const results=(S.results||"").split("\n").map(x=>x.trim()).filter(Boolean),offer=[...(S.c_brand||[]),...(S.c_content||[]),...(S.c_extra||[])],num=v=>(+v||0),f=n=>n.toLocaleString("en-GB");
  const stats=[[num(S.ig),"Instagram followers"],[num(S.tt),"TikTok followers"],[num(S.yt),"YouTube subscribers"],[num(S.crowd),"spectators per meeting"]].filter(x=>x[0]);
  const ask=S.type==="product"?("Products or services"+(S.spend?" for "+S.spend:"")):(num(S.amount)?"£"+f(num(S.amount)):"Support")+(S.spend?" towards "+S.spend:"")+(S.type==="both"?" (or products instead)":"");
  const hero=IM.ph[0]||IM.ph[1]||IM.ph[2],pics=IM.ph.filter((p,i)=>p&&p!==hero);
  $("#doc").style.setProperty("--ac",S.col||"#FF0074");
  $("#doc").innerHTML=`<div class="hero" style="${hero?`background-image:url(${hero})`:""}">${IM.logo?`<img class="lg ${IM.tone==="light"?"onDark":""}" src="${IM.logo}" alt="">`:""}<small>${esc(S.level||"Partner")} proposal for ${esc(S.co||"[Company]")}</small><h3>${esc(S.name||"[Your name]")}</h3><p>${esc([S.class,S.town].filter(Boolean).join(" · "))}</p></div><div class="bar"></div>
  <div class="body"><div class="cols"><div><h4>About me</h4><p style="margin:0">${esc(S.name||"[Name]")}${S.age?", "+esc(S.age):""}, from ${esc(S.town||"[town]")}. Racing ${esc(S.class||"[class]")}${S.season?": "+esc(S.season):""}.</p>
  ${results.length?`<h4>Results</h4><ul>${results.map(r=>`<li>${esc(r)}</li>`).join("")}</ul>`:""}<h4>Why ${esc(S.co||"you")}</h4><p style="margin:0">${esc(S.why||"[why this company]")}</p></div>
  <div>${stats.length?`<h4>Audience</h4><div class="stats">${stats.map(s=>`<div class="stat"><b>${f(s[0])}</b><span>${s[1]}</span></div>`).join("")}</div>`:""}
  <h4>What you get</h4><ul class="gets">${(offer.length?offer:["[logo places, posts, videos, guest days]"]).map(o=>`<li>${esc(o)}</li>`).join("")}</ul></div></div>
  <div class="ask"><h4>The ask</h4><p>${esc(ask)}</p></div>
  ${pics.length?`<div class="pics">${pics.slice(0,2).map(p=>`<div style="background-image:url(${p})"></div>`).join("")}</div>`:""}
  <div class="foot"><span>After every round: results, photos and reach figures, and a tag in every race-weekend post.</span><span><b>${esc(S.name||"")}</b><br>${esc(S.contact||"")}</span></div></div>`;
}
const _build=build;build=function(){_build();docDraw()};
$("#f_col").addEventListener("input",docDraw);upTiles();

addEventListener("beforeprint",()=>{let pd=document.getElementById("printDoc");if(!pd){pd=document.createElement("div");pd.id="printDoc";document.body.appendChild(pd)}pd.className="doc";pd.style.cssText=$("#doc").style.cssText;pd.innerHTML=$("#doc").innerHTML});
$("#print").onclick=()=>{gc("sponsor-print","Sponsorship: print");dispatchEvent(new Event("beforeprint"));window.print()};
