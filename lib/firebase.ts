import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, OAuthProvider } from "firebase/auth";

// [디버깅] 환경 변수 로드 상태 확인
if (typeof window !== "undefined") {
  console.log("🛠️ [Firebase Debug] Config Check:", {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "✅ 로드됨" : "❌ 누락됨",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? "✅ 로드됨" : "❌ 누락됨",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? "✅ 로드됨" : "❌ 누락됨",
  });
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

let db: any;
try {
  if (typeof window !== "undefined") {
    db = initializeFirestore(app, {
      experimentalForceLongPolling: true,
    });
  } else {
    db = getFirestore(app);
  }
} catch (e) {
  db = getFirestore(app);
}

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const kakaoProvider = new OAuthProvider('oidc.kakao');

export { db, auth, googleProvider, kakaoProvider };
