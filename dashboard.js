import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import firebaseConfig from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('auth-modal').classList.add('hidden');
        document.getElementById('dashboard-content').classList.remove('hidden');
    } else {
        document.getElementById('auth-modal').classList.remove('hidden');
        document.getElementById('dashboard-content').classList.add('hidden');
    }
});

window.handleLogin = async function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
        alert('خطأ في تسجيل الدخول: ' + err.message);
    }
};

window.logout = function() {
    signOut(auth);
};

window.addBooklet = async function(e) {
    e.preventDefault();
    const title = document.getElementById('b-title').value;
    const teacher = document.getElementById('b-teacher').value;
    const subject = document.getElementById('b-subject').value;
    const stage = document.getElementById('b-stage').value;
    const description = document.getElementById('b-desc').value;
    const pdfUrl = document.getElementById('b-pdf').value;
    const coverUrl = document.getElementById('b-cover').value;

    try {
        await addDoc(collection(db, "booklets"), {
            title, teacher, subject, stage, description, pdfUrl, coverUrl,
            createdAt: serverTimestamp()
        });
        alert('تمت إضافة الملزمة بنجاح!');
        document.getElementById('booklet-form').reset();
    } catch (err) {
        alert('حدث خطأ: ' + err.message);
    }
};