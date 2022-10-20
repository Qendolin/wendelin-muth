import { db } from '$lib/fire-context';
import { error, type LoadEvent } from '@sveltejs/kit';
import { doc, getDoc } from 'firebase/firestore/lite';

export const prerender = false;

export async function load(event: LoadEvent) {
	const params = new URLSearchParams(event.url.search);
	const id = params.get('id');
	if (id == null || id == '') throw error(404);
	const entry = await getDoc(doc(db, 'blog', id));
	if (!entry.exists) throw error(404);
	return {
		entry
	};
}
