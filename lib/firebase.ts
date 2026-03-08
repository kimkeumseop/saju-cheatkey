import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, initializeFirestore } from "firebase/firestore";

// Firebase 설정값
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// 필수 설정값 확인
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  if (typeof window !== "undefined") {
    console.warn("⚠️ Firebase 환경 변수가 설정되지 않았습니다. 개발 환경인지 확인하세요.");
  }
}

// 앱 초기화
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Firestore 초기화
let db: any;
try {
  if (typeof window !== "undefined") {
    // 브라우저 환경: 연결 안정성을 위해 Long Polling 사용
    db = initializeFirestore(app, {
      experimentalForceLongPolling: true,
    });
    console.log("🔥 Firestore 초기화 완료 (Long Polling)");
  } else {
    // 서버 환경
    db = getFirestore(app);
  }
} catch (e) {
  console.warn("ℹ️ 기존 Firestore 인스턴스를 사용합니다.");
  db = getFirestore(app);
}

export { db };
