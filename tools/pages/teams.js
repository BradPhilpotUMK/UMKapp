let D={posts:[]},kind="all";
const MON=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const dfmt=s=>{if(!s)return"";const[y,m,d]=s.split("-").map(Number);return d+" "+MON[m-1]+" "+y};
const ago=s=>{const d=Math.floor((Date.now()-new Date(s))/864e5);return d<1?"today":d===1?"yesterday":d+" days ago"};
function draw(){
  const q=$("#q").value.trim().toLowerCase(),P=(D.posts||[]).filter(p=>(kind==="all"||p.kind===kind)&&(!q||[p.event,p.cls,p.details,p.who].join(" ").toLowerCase().includes(q)));
  if(!D.channel){$("#list").innerHTML=`<div class="card empty"><span class="tag">Coming soon</span><b style="margin-top:10px">Team Finder is nearly ready</b><p class="note">The #team-finder channel is being set up on the Use More Kerb Discord. Listings will appear here as soon as it opens.</p></div>`;return}
  if(!P.length){$("#list").innerHTML=`<div class="card empty"><b>${(D.posts||[]).length?"Nothing matches that search":"No listings yet"}</b><p class="note">${(D.posts||[]).length?"Try another event or clear the search.":"Be the first: fill in the form below and post it in #team-finder."}</p></div>`;return}
  $("#list").innerHTML=P.map(p=>`<article class="post ${p.kind}"><div class="top"><span class="tag ${p.kind==="drivers"?"g":""}">${p.kind==="drivers"?"Team seeking drivers":"Driver seeking a team"}</span><span class="when">${esc(ago(p.posted))}</span></div>
    <b>${esc(p.event||"Any event")}</b><div class="meta">${p.date?`<span>📅 ${esc(dfmt(p.date))}</span>`:""}${p.cls?`<span>${esc(p.cls)}</span>`:""}${p.weight?`<span>${esc(p.weight)}</span>`:""}${p.seats?`<span>${esc(p.seats)} seat${p.seats==="1"?"":"s"}</span>`:""}</div>
    ${p.details?`<p>${esc(p.details)}</p>`:""}<div class="by"><span>${esc(p.who||"")}</span>${p.link?`<a class="btn" href="${esc(p.link)}" target="_blank" rel="noopener" data-msg>Reply in Discord ›</a>`:""}</div></article>`).join("");
  $$("[data-msg]").forEach(a=>a.onclick=()=>gc("teams-reply","Team Finder: reply"));
}
$$("#kind button").forEach(b=>b.onclick=()=>{kind=b.dataset.k;$$("#kind button").forEach(x=>x.classList.toggle("on",x===b));draw()});
$("#q").addEventListener("input",draw);
/* listing form -> text in the format the Discord reader understands */
const PK="umk-teams-post-v1",PF=["event","date","cls","weight","seats","where","notes"];let pkind=(store.get(PK,{}).kind)||"team";const PV=store.get(PK,{});
PF.forEach(k=>{const el=$("#p_"+k);if(PV[k])el.value=PV[k];el.addEventListener("input",tpl)});
$$("#pk button").forEach(b=>{b.classList.toggle("on",b.dataset.k===pkind);b.onclick=()=>{pkind=b.dataset.k;$$("#pk button").forEach(x=>x.classList.toggle("on",x===b));tpl()}});
function tpl(){const v={kind:pkind};PF.forEach(k=>v[k]=$("#p_"+k).value.trim());store.set(PK,v);
  $("#wWrap").hidden=pkind!=="team";$("#sWrap").hidden=pkind!=="drivers";
  const d=v.date?v.date.split("-").reverse().join("/"):"";
  const notes=[v.notes,v.where?"Based near "+v.where:""].filter(Boolean).join(". ");
  $("#tpl").textContent=["Looking for: "+(pkind==="team"?"team":"drivers"),"Event: "+(v.event||"[event]"),"Date: "+(d||"[dd/mm/yyyy]"),v.cls&&"Class: "+v.cls,pkind==="team"&&v.weight&&"Weight: "+v.weight+"kg",pkind==="drivers"&&v.seats&&"Seats: "+v.seats,notes&&"Notes: "+notes].filter(Boolean).join("\n")}
tpl();
$("#postGo").onclick=async()=>{if(!$("#p_event").value.trim()){toast("Add the event first");$("#p_event").focus();return}
  try{await navigator.clipboard.writeText($("#tpl").textContent);toast("Copied: paste it in #team-finder")}catch(e){toast("Select and copy the text, then paste it in Discord")}
  gc("teams-post","Team Finder: post copied");setTimeout(()=>{location.href=$("#openDc").href},700)};
(async()=>{try{const r=await fetch("../data/team-finder.json",{cache:"no-cache"});if(r.ok)D=await r.json()}catch(e){}
  const a=$("#openDc")||Object.assign(document.createElement("a"),{id:"openDc",hidden:true});if(!a.isConnected)document.body.appendChild(a);a.href=D.channel&&D.guild?`https://discord.com/channels/${D.guild}/${D.channel}`:"https://discord.gg/DZDKW9fWmA";
  draw()})();
