const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://ai-interview-f6e0b.firebaseio.com" // Update if needed
  });
}

const db = admin.firestore();

async function syncDummyData(targetEmail) {
  try {
    const userSnapshot = await admin.auth().getUserByEmail(targetEmail);
    const targetUid = userSnapshot.uid;
    console.log(`Found target UID: ${targetUid} for email: ${targetEmail}`);

    // Sync Interviews
    const interviewsSnapshot = await db.collection("interviews").get();
    console.log(`Found ${interviewsSnapshot.size} interviews. Syncing...`);
    for (const doc of interviewsSnapshot.docs) {
       await doc.ref.update({ userId: targetUid });
    }

    // Sync Quizzes
    const quizzesSnapshot = await db.collection("quizResults").get();
    console.log(`Found ${quizzesSnapshot.size} quizzes. Syncing...`);
    for (const doc of quizzesSnapshot.docs) {
       await doc.ref.update({ userId: targetUid });
    }
    
    // Sync Resumes
    const resumesSnapshot = await db.collection("resumes").get();
    console.log(`Found ${resumesSnapshot.size} resumes. Syncing...`);
    for (const doc of resumesSnapshot.docs) {
       await doc.ref.update({ userId: targetUid });
    }

    console.log("Sync complete!");
  } catch (error) {
    console.error("Error syncing data:", error);
  }
}

syncDummyData("ansh2shweta@gmail.com");
