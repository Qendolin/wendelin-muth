import { FirebaseApp } from 'firebase/app';
import { Analytics } from 'firebase/analytics';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';

export type Context = { app: FirebaseApp; analytics: Analytics; auth: Auth; db: Firestore };
