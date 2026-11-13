import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const cfg = {
  apiKey: "AIzaSyD4n_FKDPF5it3qEydhThqsKiXvXLoOCsY",
  authDomain: "iraqi-student-platform-2bfe8.firebaseapp.com",
  projectId: "iraqi-student-platform-2bfe8",
  storageBucket: "iraqi-student-platform-2bfe8.firebasestorage.app",
  messagingSenderId: "898457167800",
  appId: "1:898457167800:web:4a34d4e8e8c14a065f514d"
};

export const app = initializeApp(cfg);
export const db = getFirestore(app), auth = getAuth(app), storage = getStorage(app);
