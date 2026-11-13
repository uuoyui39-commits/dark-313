import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import firebaseConfig from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let isVerified = false;
window.enableVerify = function() {
    const btn = document.getElementById('verify-btn');
    btn.disabled = false;
    btn.classList.remove('bg-slate-800', 'text-slate-500', 'cursor-not-allowed', 'border', 'border-slate-700');
    btn.classList.add('bg-emerald-600', 'hover:bg-emerald-500', 'text-white', 'shadow-lg', 'shadow-emerald-600/30');
};

window.verifyTg = function() {
    document.getElementById('tg-modal').style.display = 'none';
};

let allBooklets = [];

async function loadBooklets() {
    const grid = document.getElementById('booklets-grid');
    try {
        const q = query(collection(db, "booklets"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        allBooklets = [];
        snapshot.forEach(doc => {
            allBooklets.push({ id: doc.id, ...doc.data() });
        });
        displayBooklets(allBooklets);
    } catch (e) {
        console.error(e);
        grid.innerHTML = '<div class="text-center py-8 text-red-400 col-span-full">خطأ في تحميل الملازم. تأكد من إعدادات قاعدة البيانات.</div>';
    }
}

function displayBooklets(list) {
    const grid = document.getElementById('booklets-grid');
    if (list.length === 0) {
        grid.innerHTML = '<div class="text-center py-12 text-slate-500 col-span-full">لا توجد ملازم منشورة حالياً. أضف بعض الملازم من لوحة الإدارة!</div>';
        return;
    }
    grid.innerHTML = list.map(b => `
        <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-cyan-500/40 transition flex flex-col">
            ${b.coverUrl ? `<img src="${b.coverUrl}" alt="${b.title}" class="w-full h-48 object-cover">` : '<div class="w-full h-48 bg-slate-800 flex items-center justify-center text-3xl">📚</div>'}
            <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                    <span class="px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold">${b.subject || 'مادة عامة'}</span>
                    <h4 class="font-bold text-lg mt-2 text-slate-100">${b.title}</h4>
                    <p class="text-xs text-slate-400 mt-1">الأستاذ: ${b.teacher || 'غير محدد'} | ${b.stage || ''}</p>
                    <p class="text-xs text-slate-400 mt-2 line-clamp-2">${b.description || ''}</p>
                </div>
                <div class="flex items-center gap-2 pt-2 border-t border-slate-800">
                    <a href="${b.pdfUrl}" target="_blank" class="flex-1 text-center bg-cyan-600 hover:bg-cyan-500 text-white py-2.5 rounded-xl text-xs font-bold transition shadow-lg shadow-cyan-600/20">فتح الملزمة 📖</a>
                    ${b.allowDownload !== false ? `<a href="${b.pdfUrl}" download class="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition">📥</a>` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

window.searchContent = function() {
    const term = document.getElementById('searchInput').value.toLowerCase();
    const filtered = allBooklets.filter(b => 
        (b.title && b.title.toLowerCase().includes(term)) ||
        (b.subject && b.subject.toLowerCase().includes(term)) ||
        (b.teacher && b.teacher.toLowerCase().includes(term))
    );
    displayBooklets(filtered);
};

window.filterStage = function(stage) {
    if (stage === 'الكل') {
        displayBooklets(allBooklets);
    } else {
        const filtered = allBooklets.filter(b => b.stage === stage);
        displayBooklets(filtered);
    }
};

window.toggleTheme = function() {
    document.documentElement.classList.toggle('dark');
};

loadBooklets();