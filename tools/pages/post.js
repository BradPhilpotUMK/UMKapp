const cv=$("#cv"),g=cv.getContext("2d"),KEY="umk-post-v1";
const S=Object.assign({fmt:"story",style:"splat",pos:"1",start:"",event:"",track:"",cls:"",extra:"",name:"",handle:"",hideTag:false,pcol:"#ffffff",stroke:7,scol:"#000000"},store.get(KEY,{}));
let photo=null,zoom=1,ox=0,oy=0;
const IMG=src=>new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.onerror=()=>r(null);i.src=src});
const A={};
(async()=>{[A.pink,A.green,A.wm,A.camo]=await Promise.all(["../img/splat-pink.png","../img/splat-green.png","../team/wm.png","../img/camo.png"].map(IMG));
  try{const f=new FontFace("F1","url(../fonts/f1.ttf)");await f.load();document.fonts.add(f)}catch(e){}
  try{await Promise.all(["600 40px Barlow","800 36px Barlow"].map(f=>document.fonts.load(f)))}catch(e){}
  draw()})();
/* form */
const posSel=$("#pos"),stSel=$("#start");
posSel.innerHTML=[...Array(40)].map((_,i)=>`<option value="${i+1}">P${i+1}</option>`).join("")+'<option value="DNF">DNF</option><option value="POLE">Pole position</option>';
stSel.innerHTML+=[...Array(40)].map((_,i)=>`<option value="${i+1}">P${i+1}</option>`).join("");
["pos","start","event","track","cls","extra","name","handle"].forEach(k=>{const el=$("#"+k);el.value=S[k];el.addEventListener("input",()=>{S[k]=el.value.trim();save();draw()})});
$("#hideTag").checked=!!S.hideTag;$("#hideTag").onchange=e=>{S.hideTag=e.target.checked;save();draw()};
if(window.UMK&&window.UMK.member)$("#tagRow").hidden=false;
function swatch(id,key,pick){const set=()=>{let hit=false;$$("#"+id+" button").forEach(b=>{const on=b.dataset.c.toLowerCase()===S[key].toLowerCase();b.classList.toggle("on",on);hit=hit||on});if(pick){$("#"+id+" .cust").classList.toggle("on",!hit);$("#"+pick).value=S[key]}};
  $$("#"+id+" button").forEach(b=>b.onclick=()=>{S[key]=b.dataset.c;set();save();draw()});
  if(pick)$("#"+pick).addEventListener("input",e=>{S[key]=e.target.value;set();save();draw()});set()}
swatch("pcol","pcol","pcolPick");swatch("scol","scol");
const strokeTxt=()=>$("#strokeVal").textContent=S.stroke==0?"(none)":"";
$("#stroke").value=S.stroke;strokeTxt();$("#stroke").oninput=e=>{S.stroke=+e.target.value;strokeTxt();save();draw()};
function save(){const c={...S};store.set(KEY,c)}
$$("#fmt button").forEach(b=>{b.classList.toggle("on",b.dataset.f===S.fmt);b.onclick=()=>{S.fmt=b.dataset.f;$$("#fmt button").forEach(x=>x.classList.toggle("on",x===b));save();draw()}});
$$("#style button").forEach(b=>{b.classList.toggle("on",b.dataset.s===S.style);b.onclick=()=>{S.style=b.dataset.s;$$("#style button").forEach(x=>x.classList.toggle("on",x===b));save();draw()}});
$("#photo").onchange=e=>{const f=e.target.files[0];if(!f)return;const u=URL.createObjectURL(f);IMG(u).then(i=>{if(!i){toast("Couldn't open that photo, try another");return}photo=i;zoom=1;ox=oy=0;$("#zoom").value=1;$("#pickTxt").textContent="📷 Change photo";gc("post-photo","Post maker: photo added");draw()})};
$("#zoom").oninput=e=>{zoom=+e.target.value;draw()};
/* drag to move */
let drag=null;
const OFF=store.get("umk-post-off-v1",{});const off=k=>{const f=OFF[S.fmt]||(OFF[S.fmt]={});return f[k]||(f[k]={x:0,y:0})};const BOX={};
function canvasPt(e){const r=cv.getBoundingClientRect(),k=cv.width/r.width;return{x:(e.clientX-r.left)*k,y:(e.clientY-r.top)*k}}
function hitGroup(p){for(const k of ["tag","name","res"]){const b=BOX[k];if(b&&p.x>=b.x&&p.x<=b.x+b.w&&p.y>=b.y&&p.y<=b.y+b.h)return k}return null}
cv.addEventListener("pointerdown",e=>{const pt=canvasPt(e),grp=hitGroup(pt);if(!grp&&!photo)return;const o=grp?off(grp):null;drag={grp,x:pt.x,y:pt.y,ox:grp?o.x:ox,oy:grp?o.y:oy};cv.setPointerCapture(e.pointerId);$("#dragHint").hidden=true});
cv.addEventListener("pointermove",e=>{const pt=canvasPt(e);if(!drag){const h=hitGroup(pt);cv.style.cursor=h?"move":(photo?"grab":"default");return}
  const dx=pt.x-drag.x,dy=pt.y-drag.y;if(drag.grp){const o=off(drag.grp),b=BOX[drag.grp],bx=b.x-o.x,by=b.y-o.y;o.x=Math.min(Math.max(drag.ox+dx,-bx),cv.width-b.w-bx);o.y=Math.min(Math.max(drag.oy+dy,-by),cv.height-b.h-by)}else{ox=drag.ox+dx;oy=drag.oy+dy}draw()});
const endDrag=()=>{if(drag&&drag.grp){store.set("umk-post-off-v1",OFF);gc("post-move","Post maker: moved "+drag.grp)}drag=null};
cv.addEventListener("pointerup",endDrag);cv.addEventListener("pointercancel",endDrag);
$("#resetPos").onclick=()=>{OFF[S.fmt]={};store.set("umk-post-off-v1",OFF);draw()};
/* drawing */
const PINK="#FF0074",GREEN="#00BE00";
function posText(){return S.pos==="DNF"?"DNF":S.pos==="POLE"?"POLE":"P"+S.pos}
function gained(){if(!S.start||S.pos==="DNF"||S.pos==="POLE")return"";const d=+S.start-+S.pos;return d>0?`▲ ${d} place${d>1?"s":""} from P${S.start}`:d<0?`from P${S.start}`:`started P${S.start}`}
function fit(txt,max,size,font){g.font=`${font.replace("SZ",size)}`;let s=size;while(g.measureText(txt).width>max&&s>20){s-=4;g.font=font.replace("SZ",s)}return s}
function splat(img,x,y,w,rot,a){if(!img)return;g.save();g.globalAlpha=a;g.translate(x,y);g.rotate(rot*Math.PI/180);const h=w*img.height/img.width;g.drawImage(img,-w/2,-h/2,w,h);g.restore()}
function draw(){
  const W=1080,H=S.fmt==="story"?1920:1350;cv.width=W;cv.height=H;
  g.fillStyle="#0b0b0d";g.fillRect(0,0,W,H);
  if(A.camo){const k=Math.max(W/A.camo.width,H/A.camo.height);g.drawImage(A.camo,(W-A.camo.width*k)/2,(H-A.camo.height*k)/2,A.camo.width*k,A.camo.height*k)}
  if(photo){const k=Math.max(W/photo.width,H/photo.height)*zoom,pw=photo.width*k,ph=photo.height*k;
    ox=Math.min(Math.max(ox,-(pw-W)/2),(pw-W)/2);oy=Math.min(Math.max(oy,-(ph-H)/2),(ph-H)/2);g.drawImage(photo,(W-pw)/2+ox,(H-ph)/2+oy,pw,ph)}
  else{g.fillStyle="rgba(255,255,255,.55)";g.font="600 44px Barlow, sans-serif";g.textAlign="center";g.fillText("Your race photo goes here",W/2,H*.42)}
  const st=S.style,P=posText(),big=S.pos==="1"||S.pos==="POLE"?GREEN:PINK,pad=70;
  // darken bottom for text
  let gr=g.createLinearGradient(0,H*.45,0,H);gr.addColorStop(0,"rgba(0,0,0,0)");gr.addColorStop(1,"rgba(0,0,0,.88)");g.fillStyle=gr;g.fillRect(0,H*.45,W,H*.55);
  gr=g.createLinearGradient(0,0,0,H*.18);gr.addColorStop(0,"rgba(0,0,0,.55)");gr.addColorStop(1,"rgba(0,0,0,0)");g.fillStyle=gr;g.fillRect(0,0,W,H*.18);
  g.textAlign="left";g.textBaseline="alphabetic";
  // lay out from the bottom up so nothing falls into Instagram/TikTok's caption area
  const gn=gained(),hl=[gn,S.extra].filter(Boolean),sub=[S.track,S.cls].filter(Boolean).join("  ·  ");
  const below=(S.event?92:0)+(sub?58:0)+hl.length*72;
  const safeB=S.fmt==="story"?330:70,baseY=H-safeB-below-(S.event?0:10);
  {const o=off("res");g.save();g.translate(o.x,o.y);
  if(st==="splat"){splat(A.pink,W*.24,baseY-170,820,-14,.95);splat(A.green,W*.82,baseY-40,520,22,.9)}
  if(st==="bold"){g.save();g.translate(0,baseY-330);g.rotate(-6*Math.PI/180);g.fillStyle=big;g.fillRect(-40,0,W+80,300);g.restore()}
  const fs=st==="clean"?260:340;g.font=`italic 900 ${fs}px F1, 'Arial Black', sans-serif`;
  g.save();g.translate(pad,baseY-20);if(st!=="clean")g.rotate(-6*Math.PI/180);
  if(S.stroke>0){g.lineJoin="round";g.lineWidth=S.stroke*2;g.strokeStyle=S.scol;g.globalAlpha=S.scol==="#000000"?.7:1;g.strokeText(P,0,0);g.globalAlpha=1}g.fillStyle=S.pcol;g.fillText(P,0,0);g.restore();
  let y=baseY+70;g.fillStyle="#fff";
  if(S.event){fit(S.event.toUpperCase(),W-pad*2,64,"italic 900 SZpx F1, 'Arial Black', sans-serif");g.fillText(S.event.toUpperCase(),pad,y);y+=66}
  if(sub){g.font="600 40px Barlow, sans-serif";g.fillStyle="#e6e6ea";g.fillText(sub,pad,y);y+=58}
  hl.forEach((t,i)=>{g.font="800 36px Barlow, sans-serif";const w=g.measureText(t).width+44;g.fillStyle=i===0&&gn?GREEN:PINK;rr(pad,y-40,w,56,28);g.fill();g.fillStyle=i===0&&gn?"#04150a":"#fff";g.fillText(t,pad+22,y);y+=72});
  g.restore();const fsz=st==="clean"?260:340;BOX.res={x:o.x,y:baseY-fsz-40+o.y,w:W,h:y-(baseY-fsz-40)};}
  // name top-left
  if(S.name||S.handle){const o=off("name"),ny=S.fmt==="story"?290:110;g.save();g.translate(o.x,o.y);  g.font="italic 900 50px F1, 'Arial Black', sans-serif";g.fillStyle="#fff";g.fillText((S.name||"").toUpperCase(),pad,(S.fmt==="story"?290:110));if(S.handle){g.font="600 34px Barlow, sans-serif";g.fillStyle="#e6e6ea";g.fillText(S.handle.startsWith("@")?S.handle:"@"+S.handle,pad,(S.fmt==="story"?340:156))};g.restore();BOX.name={x:pad-10+o.x,y:ny-60+o.y,w:640,h:(S.handle?120:80)}}else BOX.name=null
  // tag: top right, below the Story progress bar and profile row
  if(!(S.hideTag&&window.UMK&&window.UMK.member)&&A.wm){const o=off("tag"),tw=260,th=tw*A.wm.height/A.wm.width,ty=S.fmt==="story"?260:70;g.save();g.translate(o.x,o.y);g.textAlign="right";g.font="600 24px Barlow, sans-serif";g.fillStyle="rgba(255,255,255,.8)";g.fillText("Made with the",W-pad,ty);g.drawImage(A.wm,W-pad-tw,ty+12,tw,th);g.font="italic 900 24px F1, sans-serif";g.fillStyle="#fff";g.fillText("APP",W-pad,ty+th+42);g.textAlign="left";g.restore();BOX.tag={x:W-pad-tw-10+o.x,y:ty-30+o.y,w:tw+20,h:th+80}}else BOX.tag=null
}
function rr(x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()}
function blob(){return new Promise(r=>cv.toBlob(r,"image/jpeg",.92))}
const fname=()=>("umk-"+posText()+"-"+(S.event||"race")).toLowerCase().replace(/[^a-z0-9]+/g,"-").slice(0,40)+".jpg";
$("#save").onclick=async()=>{if(!photo){toast("Add a photo first");return}const b=await blob(),a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=fname();document.body.appendChild(a);a.click();a.remove();gc("post-save","Post maker: saved")};
$("#share").onclick=async()=>{if(!photo){toast("Add a photo first");return}const b=await blob(),f=new File([b],fname(),{type:"image/jpeg"});
  if(navigator.canShare&&navigator.canShare({files:[f]})){try{await navigator.share({files:[f]});gc("post-share","Post maker: shared")}catch(e){}}else $("#save").click()};
