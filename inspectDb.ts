import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  projectId: "gen-lang-client-0834100727",
  apiKey: "AIzaSyDMkBT_wCUcCtx43yr_6RSvHlqQoQqYmRA",
  firestoreDatabaseId: "ai-studio-mellowproduction-1f712ecb-62f2-4ccf-a846-3797629a27a1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function main() {
  const projSnap = await getDocs(collection(db, "projects"));
  console.log("PROJECTS:");
  projSnap.forEach(doc => {
    console.log(doc.id, "=>", doc.data());
  });

  const evtSnap = await getDocs(collection(db, "events"));
  console.log("EVENTS:");
  evtSnap.forEach(doc => {
    console.log(doc.id, "=>", doc.data());
  });
}

main().catch(console.error);
