import type { Firestore } from 'firebase/firestore/lite';
import type { Auth } from 'firebase/auth';

const config = {
  apiKey: 'AIzaSyDJ8atqjyu3jXNoCgj8Zi8iAwTUqvWTljk',
  authDomain: 'wendelin-muth.firebaseapp.com',
  projectId: 'wendelin-muth',
  storageBucket: 'wendelin-muth.appspot.com',
  messagingSenderId: '982220326248',
  appId: '1:982220326248:web:1d17c23b5c8e35a76b02dd',
  measurementId: 'G-X73GPRXRWM'
} as const;

type Firebase = { db: Firestore; auth: Auth };

let cached: Firebase | null = null;

export async function getFirebase(): Promise<Firebase> {
  if (cached) return cached;

  const [{ initializeApp }, { getFirestore }, { getAuth }] = await Promise.all([
    import('firebase/app'),
    import('firebase/firestore/lite'),
    import('firebase/auth')
  ]);

  const app = initializeApp(config);
  cached = { db: getFirestore(app), auth: getAuth(app) };
  return cached;
}
