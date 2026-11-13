// يُشغَّل محلياً مرة واحدة: npm i firebase-admin ; node setup-admin.js EMAIL
// يحتاج ملف serviceAccount.json (لا ترفعه إلى GitHub أو Vercel أبداً)
const a=require("firebase-admin");a.initializeApp({credential:a.credential.cert(require("./serviceAccount.json"))});
a.auth().getUserByEmail(process.argv[2]).then(u=>a.auth().setCustomUserClaims(u.uid,{admin:true})).then(()=>{console.log("تم");process.exit()});
