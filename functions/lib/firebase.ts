import { initializeApp, getApps, type App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

export function initializeFirebaseAdmin(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }
  return initializeApp();
}

export function db() {
  return getFirestore();
}