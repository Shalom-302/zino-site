import { getApps, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD-I9QHhc4yMUjyh9c6tUT4yuctJVg7es8",
  authDomain: "zino-2a974.firebaseapp.com",
  projectId: "zino-2a974",
  storageBucket: "zino-2a974.firebasestorage.app",
  messagingSenderId: "904342055951",
  appId: "1:904342055951:web:e8ca98edba000f596b477a",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const db = getFirestore(app);
