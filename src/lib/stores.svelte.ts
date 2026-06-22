/**
 * stores.svelte.ts
 *
 * Svelte 5 runes — requires the .svelte.ts extension for the compiler.
 * Firebase loads lazily via getFirebase() and is never imported at the top level.
 *
 * Auth invariant: a user is either signed out (user === null) or has a display
 * name. There is no anonymous-without-name state.
 */

import { getFirebase } from './firebase';
import type { User } from 'firebase/auth';

// ─── Types ────────────────────────────────────────────────────────────────────

export type Comment = {
  _id: string;
  route_id: string;
  user_id: string;
  author: string;
  body: string;
  parent_id: string | null;
  created_date: Date;
  modified_date: Date;
};

// ─── Auth Store ───────────────────────────────────────────────────────────────

const ADMIN_UID = 'YOUR_UID_HERE';

class AuthStore {
  // The User object reference never changes after sign-in (Firebase mutates it
  // in place), so we track displayName and isAnonymous as separate $state
  // primitives that we can update independently without relying on object
  // identity comparison.
  user = $state<User | null>(null);
  displayName = $state<string | null>(null);
  isAnonymous = $state(false);
  loading = $state(true);
  updatingName = $state(false);
  linking = $state(false);
  error = $state<string | null>(null);

  readonly #ready: Promise<import('firebase/auth').Auth>;
  #resolveReady!: (auth: import('firebase/auth').Auth) => void;

  constructor() {
    this.#ready = new Promise((resolve) => (this.#resolveReady = resolve));
    this.#initListener();
  }

  async #initListener(): Promise<void> {
    const { auth } = await getFirebase();
    const { onAuthStateChanged } = await import('firebase/auth');
    onAuthStateChanged(auth, (u) => {
      this.user = u;
      this.displayName = u?.displayName ?? null;
      this.isAnonymous = u?.isAnonymous ?? false;
      this.loading = false;
      this.#resolveReady(auth);
    });
  }

  #syncFromUser(user: User): void {
    this.user = user;
    this.displayName = user.displayName;
    this.isAnonymous = user.isAnonymous;
  }

  // ── Derived ──────────────────────────────────────────────────────────────

  get uid(): string | null {
    return this.user?.uid ?? null;
  }

  get isSignedIn(): boolean {
    return this.user !== null && this.displayName !== null;
  }

  get isAdmin(): boolean {
    return this.user?.uid === ADMIN_UID;
  }

  // ── Actions ──────────────────────────────────────────────────────────────

  async ensureSignedIn(name?: string): Promise<User> {
    const fbAuth = await this.#ready;
    if (this.user && this.displayName) return this.user;

    const trimmed = name?.trim();
    if (!trimmed) throw new Error('A display name is required to post.');
    if (trimmed.length > 32) throw new Error('Max 32 characters.');

    const { db } = await getFirebase();
    const { signInAnonymously, updateProfile } = await import('firebase/auth');
    const { doc, setDoc } = await import('firebase/firestore/lite');

    const { user } = await signInAnonymously(fbAuth);
    await updateProfile(user, { displayName: trimmed });
    await setDoc(doc(db, 'users', user.uid), { display_name: trimmed, is_anonymous: true }, { merge: true });

    // updateProfile mutates user in place without firing onAuthStateChanged,
    // so we sync the primitive $state values directly.
    this.#syncFromUser(user);

    return user;
  }

  async setDisplayName(name: string): Promise<void> {
    const trimmed = name.trim();
    if (!trimmed) throw new Error('Display name cannot be empty.');
    if (trimmed.length > 32) throw new Error('Max 32 characters.');
    if (!this.user) throw new Error('Not signed in.');

    this.updatingName = true;
    this.error = null;
    try {
      const { db } = await getFirebase();
      const { updateProfile } = await import('firebase/auth');
      const { doc, setDoc } = await import('firebase/firestore/lite');

      await updateProfile(this.user, { displayName: trimmed });
      await setDoc(doc(db, 'users', this.user.uid), { display_name: trimmed, is_anonymous: this.user.isAnonymous }, { merge: true });
      this.#syncFromUser(this.user);
    } catch (e) {
      this.error = String(e);
      throw e;
    } finally {
      this.updatingName = false;
    }
  }

  async signUpWithEmail(email: string, password: string, name: string): Promise<void> {
    this.linking = true;
    this.error = null;
    try {
      const fbAuth = await this.#ready;
      const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');

      const trimmed = name.trim();
      if (!trimmed) throw new Error('A display name is required.');
      if (trimmed.length > 32) throw new Error('Max 32 characters.');

      const result = await createUserWithEmailAndPassword(fbAuth, email, password);
      await updateProfile(result.user, { displayName: trimmed });

      const { db } = await getFirebase();
      const { doc, setDoc } = await import('firebase/firestore/lite');
      await setDoc(doc(db, 'users', result.user.uid), { display_name: trimmed, is_anonymous: false }, { merge: true });

      this.#syncFromUser(result.user);
    } catch (e) {
      this.error = String(e);
      throw e;
    } finally {
      this.linking = false;
    }
  }

  async linkWithGoogle(): Promise<void> {
    if (!this.user) throw new Error('Not signed in.');
    this.linking = true;
    this.error = null;
    try {
      const { db } = await getFirebase();
      const { GoogleAuthProvider, linkWithPopup, updateProfile } = await import('firebase/auth');
      const { doc, setDoc } = await import('firebase/firestore/lite');

      const existingName = this.displayName;
      const result = await linkWithPopup(this.user, new GoogleAuthProvider());

      // Preserve the user's chosen name over whatever Google provides.
      const nameToKeep = existingName ?? result.user.displayName;
      if (nameToKeep) {
        await updateProfile(result.user, { displayName: nameToKeep });
        await setDoc(doc(db, 'users', result.user.uid), { display_name: nameToKeep, is_anonymous: false }, { merge: true });
        this.#syncFromUser(result.user);
      }
    } catch (e: any) {
      if (e?.code !== 'auth/popup-closed-by-user') {
        this.error = String(e);
        throw e;
      }
    } finally {
      this.linking = false;
    }
  }

  async linkWithEmail(email: string, password: string): Promise<void> {
    if (!this.user) throw new Error('Not signed in.');
    this.linking = true;
    this.error = null;
    try {
      const { db } = await getFirebase();
      const { EmailAuthProvider, linkWithCredential } = await import('firebase/auth');
      const { doc, setDoc } = await import('firebase/firestore/lite');

      const credential = EmailAuthProvider.credential(email, password);
      const result = await linkWithCredential(this.user, credential);
      // linkWithCredential fires onAuthStateChanged, listener handles the update.
      await setDoc(doc(db, 'users', result.user.uid), { is_anonymous: false }, { merge: true });
    } catch (e) {
      this.error = String(e);
      throw e;
    } finally {
      this.linking = false;
    }
  }

  async signInWithGoogle(): Promise<void> {
    this.linking = true;
    this.error = null;
    try {
      const fbAuth = await this.#ready;
      const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
      await signInWithPopup(fbAuth, new GoogleAuthProvider());
      // onAuthStateChanged handles the update.
    } catch (e: any) {
      if (e?.code !== 'auth/popup-closed-by-user') {
        this.error = String(e);
        throw e;
      }
    } finally {
      this.linking = false;
    }
  }

  async signInWithEmail(email: string, password: string): Promise<void> {
    this.linking = true;
    this.error = null;
    try {
      const fbAuth = await this.#ready;
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      await signInWithEmailAndPassword(fbAuth, email, password);
      // onAuthStateChanged handles the update.
    } catch (e) {
      this.error = String(e);
      throw e;
    } finally {
      this.linking = false;
    }
  }

  async signOut(): Promise<void> {
    const fbAuth = await this.#ready;
    const { signOut } = await import('firebase/auth');
    await signOut(fbAuth);
    // onAuthStateChanged handles the update.
  }
}

// ─── Comments Store ───────────────────────────────────────────────────────────

class CommentsStore {
  all = $state<Comment[]>([]);
  /** True only during the initial fetch for a route. Gates the list render. */
  loading = $state(false);
  /** True during post/edit/remove operations. Does not affect the list render. */
  posting = $state(false);
  error = $state<string | null>(null);
  routeId = $state<string | null>(null);

  get topLevel(): Comment[] {
    return this.all.filter((c) => c.parent_id === null).sort((a, b) => b.created_date.getTime() - a.created_date.getTime());
  }

  repliesTo(parentId: string): Comment[] {
    return this.all.filter((c) => c.parent_id === parentId).sort((a, b) => a.created_date.getTime() - b.created_date.getTime());
  }

  get count(): number {
    return this.all.length;
  }

  async load(routeId: string): Promise<void> {
    this.routeId = routeId;
    this.all = [];
    this.loading = true;
    this.error = null;

    try {
      const { db } = await getFirebase();
      const { collection, query, where, orderBy, getDocs } = await import('firebase/firestore/lite');
      const q = query(collection(db, 'comments'), where('route_id', '==', routeId), orderBy('created_date', 'asc'));
      const snap = await getDocs(q);
      if (this.routeId === routeId) {
        this.all = snap.docs.map((d) => mapComment(d.data(), d.id));
      }
    } catch (e) {
      this.error = String(e);
    } finally {
      if (this.routeId === routeId) this.loading = false;
    }
  }

  async post(body: string, parentId?: string, name?: string): Promise<void> {
    const trimmedBody = body.trim();
    if (!trimmedBody) throw new Error('Comment cannot be empty.');
    if (!this.routeId) throw new Error('No page loaded.');

    this.posting = true;
    this.error = null;
    try {
      const user = await auth.ensureSignedIn(name);
      const { db } = await getFirebase();
      const { collection, addDoc, getDoc, serverTimestamp } = await import('firebase/firestore/lite');
      const ref = await addDoc(collection(db, 'comments'), {
        route_id: this.routeId,
        user_id: user.uid,
        author: user.displayName!,
        body: trimmedBody,
        parent_id: parentId ?? null,
        created_date: serverTimestamp(),
        modified_date: serverTimestamp()
      });
      const snap = await getDoc(ref);
      this.all = [...this.all, mapComment(snap.data()!, ref.id)];
    } catch (e) {
      this.error = String(e);
      throw e;
    } finally {
      this.posting = false;
    }
  }

  async edit(id: string, body: string): Promise<void> {
    const trimmedBody = body.trim();
    if (!trimmedBody) throw new Error('Comment cannot be empty.');

    this.error = null;
    try {
      const { db } = await getFirebase();
      const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore/lite');
      await updateDoc(doc(db, 'comments', id), {
        body: trimmedBody,
        modified_date: serverTimestamp()
      });
      this.all = this.all.map((c) => (c._id === id ? { ...c, body: trimmedBody, modified_date: new Date() } : c));
    } catch (e) {
      this.error = String(e);
      throw e;
    }
  }

  async remove(id: string): Promise<void> {
    this.error = null;
    try {
      const { db } = await getFirebase();
      const { doc, deleteDoc } = await import('firebase/firestore/lite');
      await deleteDoc(doc(db, 'comments', id));
      this.all = this.all.filter((c) => c._id !== id);
    } catch (e) {
      this.error = String(e);
      throw e;
    }
  }

  clearError(): void {
    this.error = null;
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapComment(data: Record<string, any>, id: string): Comment {
  return {
    ...(data as Omit<Comment, '_id' | 'created_date' | 'modified_date'>),
    _id: id,
    created_date: new Date(data['created_date'].seconds * 1000),
    modified_date: new Date(data['modified_date'].seconds * 1000)
  };
}

// ─── Singletons ───────────────────────────────────────────────────────────────

export const auth = new AuthStore();
export const comments = new CommentsStore();
