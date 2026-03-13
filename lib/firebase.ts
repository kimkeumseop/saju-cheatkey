import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, OAuthProvider } from "firebase/auth";

if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
  const missingKeys = [
    ["NEXT_PUBLIC_FIREBASE_API_KEY", process.env.NEXT_PUBLIC_FIREBASE_API_KEY],
    ["NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN],
    ["NEXT_PUBLIC_FIREBASE_PROJECT_ID", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID],
  ]
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingKeys.length > 0) {
    console.warn("Firebase public env missing:", missingKeys.join(", "));
  }
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const hasFirebasePublicConfig = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId
);

const app = hasFirebasePublicConfig
  ? getApps().length > 0
    ? getApp()
    : initializeApp(firebaseConfig)
  : null;

let db: any;
try {
  if (!app) {
    db = null;
  } else if (typeof window !== "undefined") {
    db = initializeFirestore(app, {
      experimentalForceLongPolling: true,
    });
  } else {
    db = getFirestore(app);
  }
} catch (e) {
  db = app ? getFirestore(app) : null;
}

const auth = typeof window !== "undefined" && app ? getAuth(app) : null;
const googleProvider = new GoogleAuthProvider();
const kakaoProvider = new OAuthProvider('oidc.kakao');

export { db, auth, googleProvider, kakaoProvider, hasFirebasePublicConfig };
