import admin from "firebase-admin";

const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY
  ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
  : undefined;

let adminApp;

export function getAdminApp() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  if (projectId && clientEmail && privateKey) {
    adminApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  } else {
    // Graceful fallback for local development or demo runs
    try {
      adminApp = admin.initializeApp({
        projectId: projectId || "demo-hcm-lite",
      });
    } catch (e) {
      console.warn("[Firebase Admin] Running in mock/unauthenticated local mode:", e.message);
    }
  }

  return adminApp;
}

export const getAdminAuth = () => {
  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }
  const app = getAdminApp();
  return app ? admin.auth(app) : null;
};

export const getAdminFirestore = () => {
  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }
  const app = getAdminApp();
  return app ? admin.firestore(app) : null;
};
