import type { ParsedToken, User } from 'firebase/auth';
import {
	addDoc,
	collection,
	deleteDoc,
	doc,
	DocumentReference,
	getDoc,
	getDocs,
	orderBy,
	query,
	serverTimestamp,
	setDoc,
	updateDoc,
	where,
	type DocumentData
} from 'firebase/firestore/lite';
import { get, writable, type Writable } from 'svelte/store';
import { auth$, db } from './fire-context';

export type Comment = {
	_id: string;
	author: string;
	body: string;
	created_date: Date;
	modified_date: Date;
	initial_body: string;
	removed: boolean;
	comment_ref?: DocumentReference<DocumentData>;
	user_ref: DocumentReference<DocumentData>;
};

export type BlogEntry = {
	_id: string;
	title: string;
	body: string;
	created_date: Date;
	modified_date: Date;
	draft: boolean;
	slug: string;
};

export type WallPost = {
	_id: string;
	user_ref: DocumentReference<DocumentData>;
	nickname: string;
	content: string;
	created_date: Date;
	removedByAdmin: boolean | undefined;
};

export type UserData = {
	display_name: string;
};

function patch<S>(state: S, ...changes: Partial<S>[]): S {
	return Object.assign({}, state, ...changes);
}

export const user = createUserStore();

export const comments = createCommentsStore();

export const page = createBlogStore();

export const wall = createWallStore();

export const title = writable(null) as Writable<string | null>;

function createWallStore() {
	const { update, subscribe } = writable({ isLoading: true, posts: [] as WallPost[], nickname: null as string | null });

	const setNickname = (name: string | null, keep: boolean) => {
		if (name?.trim() == '') name = null;
		update((state) => patch(state, { nickname: name }));

		if (keep) {
			globalThis.localStorage?.setItem('wall-post-nickname', name ?? '');
		}
	};
	setNickname(globalThis.localStorage?.getItem('wall-post-nickname'), false);

	user.subscribe(({ auth }) => {
		if (auth?.displayName) setNickname(auth.displayName, false);
	});

	const wallCollection = collection(db, 'wall');

	const mapPost = (data: any, id: string) => ({
		...data,
		_id: id,
		created_date: new Date(data.created_date.seconds * 1000),
		nickname: (data.nickname ?? '').trim()
	});

	getDocs(query(wallCollection)).then((documents) => {
		const posts = documents.docs.map((doc) => mapPost(doc.data(), doc.id)).sort((a, b) => b.created_date.getTime() - a.created_date.getTime());
		update((state) => patch(state, { posts: posts, isLoading: false }));
	});
	return {
		subscribe,
		async post(content: string) {
			const name = get(wall).nickname;
			const verified = user.get()?.displayName == name && name != null;
			const resultRef = await addDoc(wallCollection, {
				content: content,
				nickname: name,
				created_date: serverTimestamp(),
				user_ref: verified ? user.getRef() : null
			});
			const resultDoc = await getDoc(resultRef);
			update((state) =>
				patch(state, {
					posts: [mapPost(resultDoc.data(), resultDoc.id)].concat(state.posts)
				})
			);
		},
		async delete(id: string) {
			await deleteDoc(doc(db, 'wall', id));
			update((state) =>
				patch(state, {
					posts: [...(state.posts ?? [])].filter((post) => post._id != id)
				})
			);
		},
		async removeAsAdmin(id: string) {
			await updateDoc(doc(db, 'wall', id), {
				removedByAdmin: true
			});
			update((state) =>
				patch(state, {
					posts: [...(state.posts ?? [])].map((post) => (post._id != id ? post : { ...post, removedByAdmin: true }))
				})
			);
		},
		setNickname
	};
}

function createUserStore() {
	let currentUser = null as User | null;
	let currentUserData = null as UserData | null;
	let currentUserClaims = null as ParsedToken | null;

	const { update, subscribe } = writable({ auth: currentUser, data: currentUserData, claims: null as typeof currentUserClaims });
	auth$.then((auth) => {
		auth.onAuthStateChanged((user) => {
			currentUser = user;
			currentUserData = null;
			update((state) => patch(state, { auth: user, data: currentUserData }));
			if (currentUser) {
				getDoc(doc(db, 'users', currentUser.uid))
					.then((doc) => ({
						display_name: doc.get('display_name')
					}))
					.then((userData) => {
						currentUserData = userData;
						update((state) => patch(state, { data: userData }));
					});
				currentUser.getIdTokenResult().then((token) => {
					currentUserClaims = token.claims;
					update((state) => patch(state, { claims: currentUserClaims }));
				});
			}
		});
	});
	return {
		subscribe,
		get: (): User | null => {
			return currentUser;
		},
		isAdmin: (): boolean => {
			if (currentUserClaims == null) return false;
			return !!currentUserClaims.admin;
		},
		getRef: (): DocumentReference | null => {
			if (currentUser == null) return null;
			return doc(db, 'users', currentUser.uid);
		},
		createUser: async (name: string) => {
			if (currentUser == null) throw 'No logged in user';
			await setDoc(doc(db, 'users', currentUser.uid), {
				display_name: name
			});

			currentUserData = {
				display_name: name
			};
			update((state) => patch(state, { data: { ...state.data, display_name: name } }));
		}
	};
}

function createBlogStore() {
	let currentEntry = null as BlogEntry | null;
	const { set, subscribe } = writable(currentEntry);

	return {
		subscribe,
		loadEntry: async (slug: string) => {
			const q = query(collection(db, 'blog'), where('slug', '==', slug));
			const result = await getDocs(q);

			if (result.empty) {
				currentEntry = null;
				set(null);
				return null;
			}

			const doc = result.docs[0];
			const data = doc.data();
			currentEntry = {
				_id: doc.id,
				title: data.title,
				body: data.body,
				created_date: new Date(data.created_date.seconds * 1000),
				modified_date: new Date(data.modified_date.seconds * 1000),
				draft: data.draft,
				slug: data.slug
			};
			set(currentEntry);
			return currentEntry;
		},
		get: (): BlogEntry | null => {
			return currentEntry;
		},
		getRef: (): DocumentReference | null => {
			if (currentEntry == null) return null;
			return doc(db, 'blog', currentEntry._id);
		}
	};
}

function createCommentsStore() {
	const { update, subscribe } = writable({
		isLoading: false,
		direct: [] as Comment[],
		replies: new Map<string, Comment[]>(),
		error: null as string | null
	});

	let loading = 0;

	const startLoading = () =>
		update((state) => {
			if (loading > 0) console.warn('Loading %d simultaneously', loading + 1);
			loading++;
			return patch(state, { isLoading: true });
		});
	const stopLoading = (error?: any) => {
		update((state) => {
			if (loading === 0) console.error('Stopped loading more than started');
			loading = Math.max(0, loading - 1);
			return patch(state, { isLoading: loading > 0 });
		});
		if (error != null) showError(error);
	};

	const reload = async () => {
		// TODO: add pagination
		const q = query(
			collection(db, 'comments'),
			where('blog_ref', '==', page.getRef()),
			where('removed', '==', false),
			where('comment_ref', '==', null),
			orderBy('created_date', 'desc')
		);
		const documents = await getDocs(q);
		const comments = documents.docs.map((doc) => mapComment(doc.data(), doc.id));
		update((state) => patch(state, { direct: comments, replies: new Map() }));
	};

	const showError = async (error: any) => {
		console.error(error);
		update((state) => patch(state, { error: String(error) }));
	};

	const mapComment = (data: any, id: string): Comment => ({
		...data,
		_id: id,
		created_date: new Date(data.created_date.seconds * 1000),
		modified_date: new Date(data.modified_date.seconds * 1000)
	});

	const store = {
		subscribe,
		post: async (content: string, reply?: DocumentReference) => {
			const userRef = user.getRef();
			if (userRef == null) throw new Error('Not logged in');
			try {
				startLoading();
				const userDoc = await getDoc(userRef);

				const payload = {
					author: userDoc.get('display_name'),
					body: content,
					initial_body: content,
					created_date: serverTimestamp(),
					modified_date: serverTimestamp(),
					user_ref: userRef,
					blog_ref: page.getRef(),
					comment_ref: reply ?? null,
					removed: false
				};
				const resultRef = await addDoc(collection(db, 'comments'), payload);
				const resultDoc = await getDoc(resultRef);
				update((state) =>
					patch(state, {
						direct: state.direct.concat(mapComment(resultDoc.data(), resultDoc.id))
					})
				);
				await reload();
				stopLoading();
			} catch (error) {
				stopLoading(String(error));
			}
		},
		update: async (id: string, content: string) => {
			try {
				const payload = {
					body: content,
					modified_date: serverTimestamp()
				};
				await updateDoc(doc(db, 'comments', id), payload);
			} catch (error) {
				showError(String(error));
			}
		},
		remove: async (comment: DocumentReference) => {
			try {
				await updateDoc(comment, {
					removed: true
				});
			} catch (error) {
				showError(error);
			}
		},
		unremove: async (comment: DocumentReference) => {
			try {
				await updateDoc(comment, {
					removed: false
				});
			} catch (error) {
				showError(error);
			}
		},
		clear: () => {
			update((state) =>
				patch(state, {
					direct: [],
					replies: new Map()
				})
			);
		},
		reload: async () => {
			startLoading();
			try {
				await reload();
				stopLoading();
			} catch (error) {
				stopLoading(String(error));
			}
		}
	};
	return store;
}
