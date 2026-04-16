import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    if (serviceAccountKey) {
      // 서비스 계정 키가 있는 경우 (프로덕션 권장)
      const serviceAccount = JSON.parse(serviceAccountKey);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id
      });
      console.log('✅ Firebase Admin: Initialized with Service Account');
    } else if (projectId) {
      // 키가 없지만 프로젝트 ID는 있는 경우 (제한적 기능)
      // 이 경우 createCustomToken 등 서명이 필요한 기능은 작동하지 않을 수 있음
      admin.initializeApp({
        projectId: projectId
      });
      console.warn('⚠️ Firebase Admin: Initialized with Project ID only. Custom Token generation may fail.');
    } else {
      // 아무것도 없는 경우 (로컬 기본값)
      admin.initializeApp();
      console.log('ℹ️ Firebase Admin: Initialized with default credentials');
    }
  } catch (error) {
    console.error('❌ Firebase Admin Initialization Error:', error);
  }
}

// Firebase 초기화 실패 시 빌드 에러 방지 — 런타임에서만 실제 사용됨
export const adminAuth = admin.apps.length ? admin.auth() : null as unknown as admin.auth.Auth;
export const adminDb = admin.apps.length ? admin.firestore() : null as unknown as admin.firestore.Firestore;
