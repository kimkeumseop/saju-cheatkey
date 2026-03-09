import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, OAuthProvider } from "firebase/auth";

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
    db = initializeFirestore(app, {
      experimentalForceLongPolling: true,
    });
  } else {
    db = getFirestore(app);
  }
} catch (e) {
  db = getFirestore(app);
}

// Auth 초기화
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// 네이버/카카오는 OAuthProvider를 사용하여 커스텀 설정 가능 (설정 필요)
const kakaoProvider = new OAuthProvider('oidc.kakao');
const naverProvider = new OAuthProvider('oidc.naver');

export { db, auth, googleProvider, kakaoProvider, naverProvider };
