import * as admin from 'firebase-admin';

// Initialize Firebase Admin only if no apps exist
if (!admin.apps.length) {
  try {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    if (serviceAccountKey) {
      const serviceAccount = JSON.parse(serviceAccountKey);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id
      });
      console.log('Firebase Admin initialized with Service Account Key');
    } else {
      // For Vercel/Firebase Studio or other cloud environments
      admin.initializeApp({
        projectId: projectId
      });
      console.log('Firebase Admin initialized with Project ID:', projectId);
    }
  } catch (error) {
    console.error('Firebase Admin Initialization Error:', error);
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
