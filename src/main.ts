import './style.css';

// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore/lite';
import { create } from './blog';
import { $ } from './html';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: 'AIzaSyDJ8atqjyu3jXNoCgj8Zi8iAwTUqvWTljk',
	authDomain: 'wendelin-muth.firebaseapp.com',
	projectId: 'wendelin-muth',
	storageBucket: 'wendelin-muth.appspot.com',
	messagingSenderId: '982220326248',
	appId: '1:982220326248:web:1d17c23b5c8e35a76b02dd',
	measurementId: 'G-X73GPRXRWM',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

const context = { app, analytics, auth, db };

create(context, $('#content')!);
