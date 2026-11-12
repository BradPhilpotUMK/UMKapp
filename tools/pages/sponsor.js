const KEY="umk-sponsor-v1",F=["name","age","town","class","season","results","ig","tt","yt","crowd","contact","type","amount","spend","co","person","why","level"],GROUPS=["c_brand","c_content","c_extra"];
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
function build(){
  const first=(S.name||"").split(" ")[0]||"I",results=(S.results||"").split("\n").map(x=>x.trim()).filter(Boolean),offer=[...(S.c_brand||[]),...(S.c_content||[]),...(S.c_extra||[])];
  const askTxt=S.type==="product"?(S.spend?`products or services for ${S.spend}`:"products or services"):(num(S.amount)?`£${fmt(num(S.amount))}${S.spend?" towards "+S.spend:""}`:(S.spend?"support towards "+S.spend:"support"))+(S.type==="both"?", or products or services instead":"");
  const r=reach(),hi=results[0];
  const email=`Subject: ${S.level||"Partner"} opportunity: ${S.co||"[Company]"} x ${S.name||"[Your name]"} karting ${new Date().getFullYear()+1}

Hi ${S.person?S.person.split(" ")[0]:"[name]"},

I'm ${S.name||"[your name]"}${S.age?", "+S.age+",":""} a kart racer from ${S.town||"[town]"} racing ${S.class||"[class]"}${S.season?" ("+S.season+")":""}.${hi?" Most recently: "+hi+".":""}

I'm getting in touch with ${S.co||"[company]"} because ${S.why||"[why them]"}.

I'm looking for ${askTxt}. In return ${S.co||"you"} would get ${offer.length?offer.slice(0,3).map(x=>x.charAt(0).toLowerCase()+x.slice(1)).join(", ").replace(/, ([^,]*)$/," and $1"):"[what they get]"}${offer.length>3?", plus more in the attached proposal":""}.${r.length?" My racing reaches "+r.join(", ")+".":""}

I've attached a one-page proposal. Could I have 10 minutes on a call next week to talk it through?

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
