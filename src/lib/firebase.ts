import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore/lite';

const firebaseConfig = {
  apiKey: 'AIzaSyDJ8atqjyu3jXNoCgj8Zi8iAwTUqvWTljk',
  authDomain: 'wendelin-muth.firebaseapp.com',
  projectId: 'wendelin-muth',
  storageBucket: 'wendelin-muth.appspot.com',
  messagingSenderId: '982220326248',
  appId: '1:982220326248:web:1d17c23b5c8e35a76b02dd',
  measurementId: 'G-X73GPRXRWM'
} as const;

export const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
