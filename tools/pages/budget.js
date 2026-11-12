/* each item: [id, label, note, how it scales, owner example £, rental example £]
   scale: race = per race weekend, test = per test day, rt = per race+test day, year = once a season */
const G=[
 ["Entering","#FF0074",[["entry","Race entry fee","per race weekend","race",120,95],["lic","Licence & club membership","per year","year",180,40]]],
 ["Tyres & fuel","#00BE00",[["tyre","Tyres","per race and test day","rt",170,0],["fuel","Fuel & oil","per race and test day","rt",45,0],["test","Test / practice fee","per test day","test",45,60]]],
 ["Engine & kart","#FF0074",[["rebuild","Engine rebuilds","per year","year",900,0],["spares","Spares & breakages","per race weekend","race",80,0],["kart","Kart / engine purchase","one-off, this year","year",0,0]]],
 ["Travel","#00BE00",[["travel","Fuel / train to the track","per race and test day","rt",70,50],["hotel","Hotel","per race weekend","race",90,60],["food","Food","per race and test day","rt",30,25]]],
 ["Kit","#FF0074",[["kit","Suit, helmet, gloves, boots","per year","year",450,150],["coach","Coaching or team support","per race weekend","race",0,0]]],
];
const KEY="umk-budget-v1";
let S=store.get(KEY,null);
function defaults(m){const v={mode:m,races:m==="owner"?8:6,tests:m==="owner"?4:2};G.forEach(g=>g[2].forEach(i=>v[i[0]]=m==="owner"?i[4]:i[5]));return v}
if(!S)S=defaults("owner");
const fmt=n=>"£"+Math.round(n).toLocaleString("en-GB");
function draw(){
  $$("#mode button").forEach(b=>b.classList.toggle("on",b.dataset.m===S.mode));
  $("#races").value=S.races;$("#tests").value=S.tests;
  $("#groups").innerHTML=G.map(([t,c,items],gi)=>`<div class="grp"><h3>${t}<em id="g${gi}"></em></h3>${items.map(i=>`<div class="it"><span>${i[1]}<small>${i[2]}</small></span><input type="number" inputmode="decimal" min="0" step="any" data-k="${i[0]}" value="${S[i[0]]??0}" aria-label="${i[1]} in pounds"></div>`).join("")}</div>`).join("");
  $$("#groups input").forEach(el=>el.addEventListener("input",()=>{S[el.dataset.k]=+el.value||0;calc()}));
  calc();
}
function calc(){
  const r=+S.races||0,t=+S.tests||0,mult={race:r,test:t,rt:r+t,year:1};let total=0;const per=[];
  G.forEach(([name,c,items],gi)=>{let s=0;items.forEach(i=>s+=(+S[i[0]]||0)*mult[i[3]]);per.push([name,s]);total+=s;const e=$("#g"+gi);if(e)e.textContent=fmt(s)});
  $("#tSeason").textContent=fmt(total);$("#tRace").textContent=r?fmt(total/r):"–";$("#tMonth").textContent=fmt(total/12);
  const mx=Math.max(1,...per.map(p=>p[1]));
  $("#bars").innerHTML=per.map(([n,v])=>`<div><span>${n}</span><i style="width:${Math.max(2,v/mx*100)}%"></i><em>${fmt(v)}</em></div>`).join("");
  S.season=total;store.set(KEY,S);
}
$("#races").addEventListener("input",e=>{S.races=+e.target.value||0;calc()});
$("#tests").addEventListener("input",e=>{S.tests=+e.target.value||0;calc()});
$$("#mode button").forEach(b=>b.onclick=()=>{if(S.mode===b.dataset.m)return;if(confirm("Switch to "+b.textContent+" example figures? Your current numbers will be replaced.")){S=defaults(b.dataset.m);draw();gc("budget-mode-"+S.mode,"Budget: "+S.mode)}});
$("#reset").onclick=()=>{if(confirm("Reset all figures to the examples?")){S=defaults(S.mode);draw()}};
$("#copy").onclick=()=>{const r=+S.races||0,lines=[`My ${new Date().getFullYear()+1} karting budget`,`${r} race weekends, ${S.tests} test days`,""];G.forEach(([n,c,items])=>{lines.push(n.toUpperCase());items.forEach(i=>{if(+S[i[0]])lines.push(`  ${i[1]}: £${S[i[0]]} ${i[2]}`)})});lines.push("",`Season total: ${$("#tSeason").textContent} (${$("#tRace").textContent} per race weekend)`);copy(lines.join("\n"),"Breakdown copied");gc("budget-copy","Budget: copied")};
draw();
