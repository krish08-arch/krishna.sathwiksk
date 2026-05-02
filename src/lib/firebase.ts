import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Use initializeFirestore with experimentalAutoDetectLongPolling to improve connectivity in iframe/sandboxed environments
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
}, (firebaseConfig as any).firestoreDatabaseId);

export const auth = getAuth(app);

/**
 * Validates connection to Firestore on initialization
 */
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'system', 'connection-test'));
  } catch (error: any) {
    if (error?.message?.includes('offline')) {
      console.warn("Firestore appears offline. Check your Firebase configuration.");
    }
  }
}

testConnection();
