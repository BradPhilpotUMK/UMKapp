let D={posts:[]},kind="all";
const MON=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const dfmt=s=>{if(!s)return"";const[y,m,d]=s.split("-").map(Number);return d+" "+MON[m-1]+" "+y};
const ago=s=>{const d=Math.floor((Date.now()-new Date(s))/864e5);return d<1?"today":d===1?"yesterday":d+" days ago"};
function draw(){
  const q=$("#q").value.trim().toLowerCase(),P=(D.posts||[]).filter(p=>(kind==="all"||p.kind===kind)&&(!q||[p.event,p.cls,p.details,p.who].join(" ").toLowerCase().includes(q)));
  if(!D.channel){$("#list").innerHTML=`<div class="card empty"><span class="tag">Coming soon</span><b style="margin-top:10px">Team Finder is nearly ready</b><p class="note">The #team-finder channel is being set up on the Use More Kerb Discord. Listings will appear here as soon as it opens.</p></div>`;return}
  if(!P.length){$("#list").innerHTML=`<div class="card empty"><b>${(D.posts||[]).length?"Nothing matches that search":"No listings yet"}</b><p class="note">${(D.posts||[]).length?"Try another event or clear the search.":"Be the first: post in #team-finder using the layout below."}</p></div>`;return}
  $("#list").innerHTML=P.map(p=>`<article class="post ${p.kind}"><div class="top"><span class="tag ${p.kind==="drivers"?"g":""}">${p.kind==="drivers"?"Team seeking drivers":"Driver seeking a team"}</span><span class="when">${esc(ago(p.posted))}</span></div>
    <b>${esc(p.event||"Any event")}</b><div class="meta">${p.date?`<span>📅 ${esc(dfmt(p.date))}</span>`:""}${p.cls?`<span>${esc(p.cls)}</span>`:""}${p.weight?`<span>${esc(p.weight)}</span>`:""}${p.seats?`<span>${esc(p.seats)} seat${p.seats==="1"?"":"s"}</span>`:""}</div>
    ${p.details?`<p>${esc(p.details)}</p>`:""}<div class="by"><span>${esc(p.who||"")}</span>${p.link?`<a class="btn" href="${esc(p.link)}" target="_blank" rel="noopener" data-msg>Reply in Discord ›</a>`:""}</div></article>`).join("");
  $$("[data-msg]").forEach(a=>a.onclick=()=>gc("teams-reply","Team Finder: reply"));
}
$$("#kind button").forEach(b=>b.onclick=()=>{kind=b.dataset.k;$$("#kind button").forEach(x=>x.classList.toggle("on",x===b));draw()});
$("#q").addEventListener("input",draw);
$("#cpTpl").onclick=()=>copy($("#tpl").textContent,"Layout copied");
(async()=>{try{const r=await fetch("../data/team-finder.json",{cache:"no-cache"});if(r.ok)D=await r.json()}catch(e){}
  const a=$("#openDc");if(D.channel&&D.guild)a.href=`https://discord.com/channels/${D.guild}/${D.channel}`;else a.href="https://discord.gg/DZDKW9fWmA";
  draw()})();
