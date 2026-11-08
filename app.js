// 1. 引入 Firebase 必要模組
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 2. 你的 Firebase 專案設定（已帶入你的專案鑰匙）
const firebaseConfig = {
  apiKey: "AIzaSyDIoej4_PA6muS6Cn27stC_zpR0mN8qBOI",
  authDomain: "interpsychic.firebaseapp.com",
  databaseURL: "https://interpsychic-default-rtdb.firebaseio.com",
  projectId: "interpsychic",
  storageBucket: "interpsychic.firebasestorage.app",
  messagingSenderId: "53123480852",
  appId: "1:53123480852:web:cd3f6b31c29e32ece31601"
};

// 3. 初始化 Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ==========================================
// A. 註冊功能（自動寫入 Firestore 待審核狀態）
// ==========================================
window.registerUser = async function(email, password, name) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 將使用者資料寫入 Firestore 的 users 集合中
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: email,
      name: name,
      status: "pending", // 預設狀態為：待審核
      createdAt: new Date().toISOString()
    });

    alert("註冊成功！請等待管理員審核。");
  } catch (error) {
    console.error("註冊失敗：", error.message);
    alert("註冊失敗：" + error.message);
  }
};

// ==========================================
// B. 登入功能
// ==========================================
window.loginUser = async function(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 檢查該使用者的審核狀態
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const userData = docSnap.data();
      if (userData.status === "pending") {
        alert("您的帳號正在審核中，請耐心等候管理員審核。");
      } else if (userData.status === "approved") {
        alert("登入成功！歡迎回來。");
        // 這裡可以導向到你的主要功能頁面
      }
    } else {
      alert("找不到此使用者的資料紀錄。");
    }
  } catch (error) {
    console.error("登入失敗：", error.message);
    alert("登入失敗：" + error.message);
  }
};

// ==========================================
// C. 管理員功能：讀取所有使用者清單
// ==========================================
window.loadPendingUsers = async function() {
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    let usersList = [];
    querySnapshot.forEach((doc) => {
      usersList.push(doc.data());
    });
    console.log("所有用戶清單：", usersList);
    return usersList;
  } catch (error) {
    console.error("讀取清單失敗：", error.message);
  }
};

// ==========================================
// D. 管理員功能：核准用戶審核
// ==========================================
window.approveUser = async function(targetUid) {
  try {
    const userRef = doc(db, "users", targetUid);
    await updateDoc(userRef, {
      status: "approved" // 將狀態改為已核准
    });
    alert("已成功核准該用戶！");
  } catch (error) {
    console.error("核准失敗：", error.message);
  }
};
