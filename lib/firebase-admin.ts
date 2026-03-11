import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
      : null;

    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        // databaseURL: `https://${serviceAccount.project_id}.firebaseio.com` // 필요 시 추가
      });
    } else {
      // 환경변수가 없는 경우 기본 앱 초기화 (GCP 환경 등)
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
      });
    }
  } catch (error) {
    console.error('Firebase Admin Error:', error);
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
