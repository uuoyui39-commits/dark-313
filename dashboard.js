import {db,auth} from "./firebase-config.js";
import {signInWithEmailAndPassword,onAuthStateChanged,signOut} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {collection,getDocs,addDoc,setDoc,updateDoc,deleteDoc,doc,getDoc,serverTimestamp,query,orderBy,limit,where,getCountFromServer} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const $=s=>document.querySelector(s),esc=s=>String(s??"").replace(/[&<>"']/g,c=>"&#"+c.charCodeAt(0)+";");
const P=["title","description","stageId","subjectId","teacherName","coverUrl:file","pdfUrl:file","allowDownload:bool","published:bool","order:num"];
const C={stages:["name","order:num"],subjects:["name","stageId","order:num"],booklets:P,summaries:P,
questions:["title","stageId","subjectId","year","fileUrl:file","solutionUrl:file","published:bool"],
dailyQuestions:["question","options:list","correct:num","explanation","date","published:bool"],
announcements:["title","body","imageUrl:file","link","pinned:bool","published:bool"],quotes:["text","author"],glossary:["term","definition"],
gate:["enabled:bool","message","link","subLabel","verLabel"],site:["siteName","logoUrl:file","accent","facebook","instagram","youtube","whatsapp"]};
const L={stats:"الإحصائيات",stages:"المراحل",subjects:"المواد",booklets:"الملازم",summaries:"الملخصات",questions:"الأسئلة الوزارية",dailyQuestions:"سؤال اليوم",announcements:"الإعلانات",quotes:"الاقتباسات",glossary:"القاموس",files:"إدارة الملفات",gate:"بوابة الاشتراك",site:"الموقع والشعار والتواصل"};
const MAX=15*1024*1024,OK=["application/pdf","image/jpeg","image/png","image/webp"];

$("#col").innerHTML=Object.keys(L).map(k=>`<option value="${k}">${L[k]}</option>`).join("");
$("#go").onclick=()=>signInWithEmailAndPassword(auth,$("#em").value,$("#pw").value).catch(e=>$("#err").textContent="فشل الدخول: "+e.code);
$("#out").onclick=()=>signOut(auth);

onAuthStateChanged(auth, async u => {
  if (!u) { $("#login").classList.remove("hide"); $("#app").classList.add("hide"); return; }
  if (u.email !== "basmajed20055@gmail.com") { 
    $("#err").textContent = "هذا الحساب ليس مديراً."; 
    return signOut(auth); 
  }
  $("#login").classList.add("hide"); 
  $("#app").classList.remove("hide"); 
  show();
});

let edit=null,stages=[],subjects=[],fl=[];const say=m=>$("#msg").textContent=m;

// نظام الرفع المجاني المباشر بدون مشاكل الفايربيس ستوريج
async function up(file){
    if(!OK.includes(file.type))throw Error("نوع الملف غير مسموح");
    if(file.size>MAX)throw Error("الحجم أكبر من 15MB");
    say("جارٍ رفع الملف...");
    const formData = new FormData();
    formData.append('reqtype', 'upload-file');
    formData.append('fileToUpload', file);
    const response = await fetch('https://catbox.moe/user/api.php', {
        method: 'POST',
        body: formData
    });
    if (!response.ok) throw Error("فشل الاتصال بسيرفر الرفع");
    const url = (await response.text()).trim();
    if(!url.startsWith("http")) throw Error("فشل رفع الملف");
    await addDoc(collection(db,"files"),{name:file.name,url,size:file.size,contentType:file.type,createdAt:serverTimestamp()});
    return url;
}

const ids=async c=>(await getDocs(query(collection(db,c),limit(300)))).docs.map(d=>({id:d.id,...d.data()}));
async function refs(){[stages,subjects,fl]=await Promise.all([ids("stages"),ids("subjects"),ids("files")])}
const sel=(n,v,a)=>`<label>${n}<select name="${n}"><option value="">-</option>${a.map(x=>`<option value="${esc(x.id)}" ${x.id===v?"selected":""}>${esc(x.name)}</option>`).join("")}</select></label>`;
function form(c,d={}){$("#f").innerHTML=C[c].map(x=>{const[n,t]=x.split(":");const v=d[n]??"";
 if(n==="stageId")return sel(n,v,stages);if(n==="subjectId")return sel(n,v,subjects);
 if(t==="bool")return`<label><input type=checkbox name="${n}" ${v||(n==="enabled"&&!Object.keys(d).length)?"checked":""} style="width:auto"> ${n}</label>`;
 if(t==="file")return`<label>${n}<input name="${n}" value="${esc(v)}" list="furls" placeholder="رابط أو اختر من الملفات"><input type=file data-for="${n}"></label>`;
 if(t==="list")return`<label>${n} (سطر لكل خيار)<textarea name="${n}">${esc((v||[]).join("\n"))}</textarea></label>`;
 return`<label>${n}<input name="${n}" ${t==="num"?"type=number":""} value="${esc(v)}"></label>`}).join("")+`<datalist id="furls">${fl.map(x=>`<option value="${esc(x.url)}">${esc(x.name)}</option>`).join("")}</datalist><button>حفظ</button>`}

async function show(){const c=$("#col").value;edit=null;$("#f").classList.remove("hide");$("#list").innerHTML="";say("");
 if(c==="stats")return stats();
 if(c==="gate"||c==="site"){await refs();form(c,(await getDoc(doc(db,"settings",c))).data()||{});return}
 await refs();if(c==="files")return files();form(c);const s=await getDocs(query(collection(db,c),limit(100)));
 $("#list").innerHTML=s.docs.map(d=>`<div class="card"><b>${esc(d.data().title||d.data().name||d.data().question||d.data().term||d.data().text||d.id)}</b><div class="row"><button class="alt" data-e="${d.id}">تعديل</button><button class="alt" data-d="${d.id}">حذف</button></div></div>`).join("")||"<small>فارغ</small>"}

async function stats(){$("#f").classList.add("hide");const Q=[["booklets","ملازم منشورة",1],["summaries","ملخصات"],["subjects","مواد"],["questions","أسئلة وزارية"],["dailyQuestions","أسئلة اليوم"],["announcements","إعلانات"],["files","ملفات"]];
 try{const r=await Promise.all(Q.map(([c,,p])=>getCountFromServer(p?query(collection(db,c),where("published","==",true)):collection(db,c))));
 $("#list").innerHTML='<div class="grid">'+Q.map(([,l],i)=>`<div class="card"><b style="font-size:1.8rem">${r[i].data().count}</b>${l}</div>`).join("")+"</div>"}catch(e){say("تعذر جلب الإحصائيات: "+e.message)}}

const kb=n=>n>1048576?(n/1048576).toFixed(1)+" MB":Math.ceil(n/1024)+" KB";
function files(){$("#f").innerHTML='<label>رفع ملف (PDF/صورة حتى 15MB)<input type=file id=fu accept=".pdf,image/jpeg,image/png,image/webp"></label><button>رفع</button>';
 $("#list").innerHTML='<input id="fs" placeholder="بحث باسم الملف"><div id="fl"></div>';const draw=()=>{const q=$("#fs").value.trim();
 $("#fl").innerHTML=fl.filter(x=>!q||x.name.includes(q)).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0)).map(x=>`<div class="card"><b>${esc(x.name)}</b><small>${kb(x.size||0)} - ${x.createdAt?x.createdAt.toDate().toLocaleDateString("ar-IQ"):""}</small><div class="row"><button class="alt" data-c="${esc(x.url)}">نسخ الرابط</button><button class="alt" data-x="${x.id}">حذف</button></div></div>`).join("")||"<small>لا توجد ملفات.</small>"};
 draw();$("#fs").oninput=draw}

async function used(u){for(const[c,fs]of[["booklets",["pdfUrl","coverUrl"]],["summaries",["pdfUrl","coverUrl"]],["questions",["fileUrl","solutionUrl"]],["announcements",["imageUrl"]]])for(const f of fs)if(!(await getDocs(query(collection(db,c),where(f,"==",u),limit(1)))).empty)return L[c];return null}

$("#list").onclick=async e=>{const b=e.target.closest("button");if(!b)return;const c=$("#col").value,D=b.dataset;
 try{if(D.c){await navigator.clipboard.writeText(D.c);say("تم نسخ الرابط")}
 else if(D.x){const targetFile = fl.find(x => x.id === D.x); if(targetFile){const w=await used(targetFile.url);if(w)return say("لا يمكن الحذف: الملف مرتبط بمحتوى في «"+w+"»");}
  if(!confirm("حذف الملف نهائياً؟"))return;
  await deleteDoc(doc(db,"files",D.x));say("تم حذف الملف");show()}
 else if(D.d){if(!confirm("تأكيد الحذف؟"))return;await deleteDoc(doc(db,c,D.d));say("تم الحذف");show()}
 else if(D.e){edit=D.e;form(c,(await getDoc(doc(db,c,D.e))).data());scrollTo(0,0)}}catch(er){say("فشل: "+er.message)}};

$("#col").onchange=show;
$("#f").onsubmit=async e=>{e.preventDefault();const c=$("#col").value,f=e.target,d={};
 try{if(c==="files"){const fi=$("#fu").files[0];if(!fi)return say("اختر ملفاً أولاً");await up(fi);say("تم رفع الملف بنجاح");return show()}
  for(const x of C[c]){const[n,t]=x.split(":"),el=f.elements[n];
  if(t==="bool")d[n]=el.checked;else if(t==="num")d[n]=Number(el.value||0);else if(t==="list")d[n]=el.value.split("\n").map(s=>s.trim()).filter(Boolean);
  else{d[n]=el.value;if(t==="file"){const fi=f.querySelector(`[data-for="${n}"]`).files[0];if(fi)d[n]=await up(fi)}}}
  d.updatedAt=serverTimestamp();
  if(c==="gate"||c==="site")await setDoc(doc(db,"settings",c),d,{merge:true});
  else if(edit)await updateDoc(doc(db,c,edit),d);else{d.createdAt=serverTimestamp();await addDoc(collection(db,c),d)}
  say("تم الحفظ بنجاح");show()}catch(er){say("فشل: "+er.message)}};
