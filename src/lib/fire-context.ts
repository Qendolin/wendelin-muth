// Import the functions you need from the SDKs you need
import { browser } from '$app/environment';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore/lite';
import { getStorage } from 'firebase/storage';
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
	measurementId: 'G-X73GPRXRWM'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const storage = getStorage(app);

const auth$ = import('firebase/auth').then(({ getAuth }) => {
	return getAuth(app);
});

const analytics$ = new Promise((resolve) => {
	if (!browser) return resolve(null);
	const next = () => {
		if (globalThis.requestIdleCallback != null) {
			globalThis.setTimeout(() => globalThis.requestIdleCallback(resolve), 1000);
		} else {
			globalThis.setTimeout(resolve, 5000);
		}
	};

	if (globalThis.document.readyState == 'complete') next();
	else globalThis.addEventListener('load', next);
}).then(() =>
	import('firebase/analytics').then(async ({ getAnalytics, isSupported }) => {
		if (await isSupported()) {
			return getAnalytics(app);
		}
		return null;
	})
);

export { app, analytics$, auth$, db, storage };
