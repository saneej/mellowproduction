import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

let firebaseConfig = {
  projectId: "gen-lang-client-0834100727",
  appId: "1:988733213593:web:dc1371cda5c8efb42be108",
  apiKey: "AIzaSyDMkBT_wCUcCtx43yr_6RSvHlqQoQqYmRA",
  authDomain: "gen-lang-client-0834100727.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-mellowproduction-1f712ecb-62f2-4ccf-a846-3797629a27a1",
  storageBucket: "gen-lang-client-0834100727.firebasestorage.app",
  messagingSenderId: "988733213593"
};

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const appletConfig = require("../../firebase-applet-config.json");
  if (appletConfig && appletConfig.projectId) {
    firebaseConfig = { ...firebaseConfig, ...appletConfig };
  }
} catch {
  // Fallback to default config above
}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Pass custom databaseId if configured in firebase-applet-config
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== "(default)"
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account"
});

export default app;
