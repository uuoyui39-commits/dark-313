import {db} from "./firebase-config.js";
import {collection,query,where,orderBy,limit,startAfter,getDocs,doc,getDoc} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],K="telegram_subscribe_clicked";
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const safe=u=>/^https?:\/\//.test(u||"")?u:"#",ok=u=>/^https?:/.test(u||"");
// ---- بوابة Telegram: حالة الضغط في sessionStorage فقط، والتجاوز في الذاكرة فقط
let link="https://t.me/DF_155BOT";
const sync=()=>{$("#gVer").disabled=sessionStorage.getItem(K)!=="true"};
sync();addEventListener("pageshow",sync);document.addEventListener("visibilitychange",()=>{if(!document.hidden)sync()});
$("#gSub").onclick=()=>{sessionStorage.setItem(K,"true");sync();window.open(link,"_blank","noopener")};
$("#gVer").onclick=()=>{if(sessionStorage.getItem(K)==="true")$("#gate").classList.add("hide")};
try{const g=(await getDoc(doc(db,"settings","gate"))).data();if(g){if(g.enabled===false)$("#gate").classList.add("hide");
 if(g.message)$("#gMsg").textContent=g.message;if(/^https:\/\/t\.me\//.test(g.link||""))link=g.link;
 if(g.subLabel)$("#gSub").textContent=g.subLabel;if(g.verLabel)$("#gVer").textContent=g.verLabel}}catch(e){console.warn(e)}
// ---- هوية الموقع والتواصل
try{const s=(await getDoc(doc(db,"settings","site"))).data();if(s){if(s.siteName){$("#name").textContent=s.siteName;document.title=s.siteName}
 if(/^#[0-9a-f]{6}$/i.test(s.accent||""))document.documentElement.style.setProperty("--ac",s.accent);
 if(ok(s.logoUrl)){$("#logo").src=s.logoUrl;$("#logo").classList.remove("hide")}
 $("#soc").innerHTML=[["facebook","فيسبوك"],["instagram","إنستغرام"],["youtube","يوتيوب"],["whatsapp","واتساب"]].filter(([k])=>ok(s[k])).map(([k,l])=>`<a href="${esc(s[k])}" target="_blank" rel="noopener">${l}</a>`).join("")}}catch(e){console.warn(e)}
// ---- الوضع الليلي + آخر قسم
const th=localStorage.getItem("theme");if(th)document.documentElement.dataset.theme=th;
$("#theme").onclick=()=>{const t=document.documentElement.dataset.theme==="dark"?"light":"dark";document.documentElement.dataset.theme=t;localStorage.setItem("theme",t)};
$("#nav").onclick=e=>{const a=e.target.closest("a");if(a)localStorage.setItem("lastSec",a.getAttribute("href").slice(1))};
const ls=localStorage.getItem("lastSec");if(ls)setTimeout(()=>document.getElementById(ls)?.scrollIntoView(),700);
// ---- بيانات المراحل والمواد
const nm={},J=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))||d}catch{return d}};
for(const[c,sel]of[["stages","#fSt"],["subjects","#fSb"]])try{const s=await getDocs(query(collection(db,c),limit(200)));
 const a=s.docs.map(x=>({id:x.id,...x.data()})).sort((x,y)=>(x.order||0)-(y.order||0));a.forEach(x=>{nm[x.id]=x.name});
 $(sel).insertAdjacentHTML("beforeend",a.map(x=>`<option value="${esc(x.id)}">${esc(x.name)}</option>`).join(""))}catch(e){console.warn(e)}
// ---- المفضلة والمفتوحة مؤخراً
const favs=new Set(J("favs",[])),reg={},teachers=new Set();
function showRec(){$("#recent").innerHTML=J("recent",[]).map(r=>`<button class="alt" data-r="${esc(r.u)}" data-t="${esc(r.t)}">${esc(r.t)}</button>`).join("")||"<small>لا شيء بعد.</small>"}showRec();
function openPdf(u,t){if(!ok(u))return;const r=[{u,t},...J("recent",[]).filter(x=>x.u!==u)].slice(0,8);localStorage.setItem("recent",JSON.stringify(r));showRec();
 $("#pdfA").href=u;$("#pdfF").src=u;$("#pdf").classList.remove("hide")}
$("#pdfX").onclick=()=>{$("#pdf").classList.add("hide");$("#pdfF").src="about:blank"};
const card=(c,d)=>{const k=c+d.id,u=d.pdfUrl||d.fileUrl;return`<div class="card" data-k="${esc(k)}" data-st="${esc(d.stageId||"")}" data-sb="${esc(d.subjectId||"")}" data-tc="${esc(d.teacherName||"")}" data-t="${esc((d.title||"")+(d.teacherName||"")+(d.description||""))}">
${d.coverUrl&&ok(d.coverUrl)?`<img loading="lazy" src="${esc(d.coverUrl)}" alt="">`:""}<b>${esc(d.title)}</b><small>${esc([nm[d.stageId],nm[d.subjectId],d.teacherName,d.year].filter(Boolean).join(" - "))}</small><p>${esc(d.description||"")}</p>
<div class="row"><button data-o="${esc(k)}">فتح</button>${d.allowDownload&&ok(u)?`<a href="${esc(u)}" download target="_blank" rel="noopener"><button class="alt">تحميل</button></a>`:""}
<button class="alt" data-f="${esc(k)}">${favs.has(k)?"★":"☆"}</button><button class="alt" data-s="${esc(safe(u))}">مشاركة</button><button class="alt" data-cp="${esc(safe(u))}">نسخ الرابط</button></div></div>`};
const cur={};
async function load(c){const el="#"+c;try{const q=[where("published","==",true),orderBy("createdAt","desc")];if(cur[c])q.push(startAfter(cur[c]));q.push(limit(9));
 const s=await getDocs(query(collection(db,c),...q));if(s.docs.length)cur[c]=s.docs.at(-1);
 s.docs.forEach(x=>{reg[c+x.id]={...x.data(),id:x.id,_c:c};if(x.data().teacherName)teachers.add(x.data().teacherName)});
 $(el).insertAdjacentHTML("beforeend",s.docs.map(x=>card(c,reg[c+x.id])).join(""));
 $(el+"M").classList.toggle("hide",s.docs.length<9);if(!$(el).children.length)$(el).innerHTML="<small>لا يوجد محتوى بعد.</small>";
 const v=$("#fTc").value;$("#fTc").innerHTML='<option value="">كل المدرسين</option>'+[...teachers].map(t=>`<option>${esc(t)}</option>`).join("");$("#fTc").value=v;filter()}
 catch(e){$(el).innerHTML="<small>تعذر التحميل.</small>";console.warn(e)}}
document.addEventListener("click",async e=>{const b=e.target.closest("button");if(!b)return;const D=b.dataset;
 if(D.m)load(D.m);if(D.o){const d=reg[D.o];openPdf(d.pdfUrl||d.fileUrl,d.title);if(d.solutionUrl&&ok(d.solutionUrl))b.insertAdjacentHTML("afterend",`<a href="${esc(d.solutionUrl)}" target="_blank" rel="noopener"><button class="alt">الحل النموذجي</button></a>`)}
 if(D.r)openPdf(D.r,D.t);
 if(D.f){const k=D.f;favs.has(k)?favs.delete(k):favs.add(k);localStorage.setItem("favs",JSON.stringify([...favs]));b.textContent=favs.has(k)?"★":"☆";filter()}
 if(D.s){try{navigator.share?await navigator.share({title:document.title,url:D.s}):await navigator.clipboard.writeText(D.s)}catch{}}
 if(D.cp){try{await navigator.clipboard.writeText(D.cp);b.textContent="تم النسخ"}catch{}}});
function filter(){const q=$("#q").value.trim(),f=$("#fav").value,st=$("#fSt").value,sb=$("#fSb").value,tc=$("#fTc").value;
 $$(".card[data-k]").forEach(c=>c.classList.toggle("hide",!!((q&&!c.dataset.t.includes(q))||(f&&!favs.has(c.dataset.k))||(st&&c.dataset.st!==st)||(sb&&c.dataset.sb!==sb)||(tc&&c.dataset.tc!==tc))))}
["#q","#fav","#fSt","#fSb","#fTc"].forEach(s=>$(s).addEventListener("input",filter));
["booklets","summaries","questions"].forEach(load);
// ---- الإعلانات، الاقتباس، سؤال اليوم
try{const s=await getDocs(query(collection(db,"announcements"),where("published","==",true),limit(10)));
 const a=s.docs.map(d=>d.data()).sort((x,y)=>(y.pinned?1:0)-(x.pinned?1:0));
 $("#ann").innerHTML=a.map(d=>`<div class="card">${ok(d.imageUrl)?`<img loading="lazy" src="${esc(d.imageUrl)}" alt="">`:""}<b>${d.pinned?"📌 ":""}${esc(d.title)}</b><p>${esc(d.body)}</p>${ok(d.link)?`<a href="${esc(d.link)}" target="_blank" rel="noopener">المزيد</a>`:""}</div>`).join("")||"<small>لا توجد إعلانات.</small>"}catch(e){console.warn(e)}
try{const s=await getDocs(query(collection(db,"quotes"),limit(30)));if(!s.empty){const d=s.docs[new Date().getDate()%s.size].data();$("#quote").textContent=`«${d.text}» ${d.author?"- "+d.author:""}`}}catch(e){console.warn(e)}
try{const t=new Date().toISOString().slice(0,10),s=await getDocs(query(collection(db,"dailyQuestions"),where("published","==",true),limit(30)));
 const d=s.docs.map(x=>x.data()).filter(x=>!x.date||x.date<=t).sort((a,b)=>(b.date||"").localeCompare(a.date||""))[0];
 if(d){const q=$("#qod");q.innerHTML=`<b>${esc(d.question)}</b>`+(d.options||[]).map((o,i)=>`<button class="opt" data-i="${i}">${esc(o)}</button>`).join("")+`<p id="ex" class="hide">${esc(d.explanation||"")}</p>`;
  q.onclick=e=>{const b=e.target.closest(".opt");if(!b)return;q.querySelectorAll(".opt").forEach(x=>{x.disabled=true;if(+x.dataset.i===+d.correct)x.classList.add("ok")});if(+b.dataset.i!==+d.correct)b.classList.add("no");$("#ex").classList.remove("hide")}}}catch(e){console.warn(e)}
// ---- المؤقت
let tm,left=0;const pad=n=>String(n).padStart(2,"0"),tick=()=>$("#tOut").textContent=pad(Math.floor(left/60))+":"+pad(left%60);
$("#tStart").onclick=()=>{clearInterval(tm);left=Math.max(1,+$("#tMin").value||25)*60;tick();tm=setInterval(()=>{left--;tick();if(left<=0){clearInterval(tm);navigator.vibrate?.(500);alert("انتهى وقت الدراسة")}},1000)};
$("#tStop").onclick=()=>clearInterval(tm);
// ---- الحاسبة (بدون eval على نص خام: قائمة بيضاء فقط)
const FN=["sin","cos","tan","sqrt","log","ln","abs","pi","e"];
$("#cGo").onclick=()=>{let x=$("#cIn").value.toLowerCase();try{if(!/^[0-9a-z+\-*/().,^\s%]*$/.test(x)||(x.match(/[a-z]+/g)||[]).some(w=>!FN.includes(w)))throw 0;
 x=x.replace(/\^/g,"**").replace(/\blog\b/g,"Math.log10").replace(/\bln\b/g,"Math.log").replace(/\b(sin|cos|tan|sqrt|abs)\b/g,"Math.$1").replace(/\bpi\b/g,"Math.PI").replace(/\be\b/g,"Math.E");
 const r=Function('"use strict";return('+x+')')();$("#cOut").textContent=Number.isFinite(r)?+r.toPrecision(12):"خطأ"}catch{$("#cOut").textContent="خطأ"}};
// ---- القاموس (يُحمّل عند أول استخدام لتقليل القراءات)
let gl=null;$("#gq").onfocus=async()=>{if(gl)return;try{gl=(await getDocs(query(collection(db,"glossary"),limit(300)))).docs.map(d=>d.data());draw()}catch(e){gl=[];console.warn(e)}};
const draw=()=>{const q=$("#gq").value.trim();$("#gl").innerHTML=(gl||[]).filter(g=>!q||(g.term+g.definition).includes(q)).slice(0,30).map(g=>`<div class="card"><b>${esc(g.term)}</b><p>${esc(g.definition)}</p></div>`).join("")};
$("#gq").oninput=draw;
