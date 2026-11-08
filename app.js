// 1. 引入 Firebase 必要模組
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, onSnapshot, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 2. 你的 Firebase 專案設定
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
      status: "pending",
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

    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const userData = docSnap.data();
      if (userData.status === "pending") {
        alert("您的帳號正在審核中，請耐心等候。");
      } else if (userData.status === "approved") {
        alert("登入成功！");
      }
    }
  } catch (error) {
    console.error("登入失敗：", error.message);
    alert("登入失敗：" + error.message);
  }
};

// ==========================================
// C. 管理員功能：即時監聽所有用戶（永遠不會漏掉資料）
// ==========================================
window.listenToUsers = function(callback) {
  // onSnapshot 會即時盯著資料庫，有任何人註冊、修改，這裡就會立刻收到通知！
  onSnapshot(collection(db, "users"), (snapshot) => {
    let usersList = [];
    snapshot.forEach((doc) => {
      usersList.push(doc.data());
    });
    console.log("資料庫最新用戶名單：", usersList);
    
    // 如果你在前端網頁有寫渲染函數，可以把資料傳給它
    if (typeof callback === "function") {
      callback(usersList);
    }
  }, (error) => {
    console.error("監聽失敗：", error);
  });
};

// ==========================================
// D. 管理員功能：核准用戶審核
// ==========================================
window.approveUser = async function(targetUid) {
  try {
    const userRef = doc(db, "users", targetUid);
    await updateDoc(userRef, {
      status: "approved"
    });
    alert("已成功核准該用戶！");
  } catch (error) {
    console.error("核准失敗：", error.message);
  }
};

import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const auth = getAuth();

// 監聽登入狀態：只要一重新整理，它就會自動幫你檢查是不是還登入著
onAuthStateChanged(auth, (user) => {
  if (user) {
    // 使用者是登入狀態！
    console.log("目前已登入的用戶 UID：", user.uid);
    
    // 💡 可以在這裡寫：如果已經登入，就自動切換到管理後台或主畫面
    // 例如：showAdminDashboard();
  } else {
    // 使用者確實是登出狀態
    console.log("目前未登入");
    
    // 💡 可以在這裡寫：如果沒登入，就留在登入頁面
    // 例如：showLoginPage();
  }
});
