import { db } from '$lib/fire-context';
import { error, redirect, type LoadEvent } from '@sveltejs/kit';
import { doc, getDoc } from 'firebase/firestore/lite';

export const prerender = false;
export const csr = true;

export async function load(event: LoadEvent) {
	const params = new URLSearchParams(event.url.search);
	const id = params.get('id');
	if (id == null || id == '') throw error(404);
	const entry = await getDoc(doc(db, 'blog', id));
	if (!entry.exists()) throw error(404);
	const slug = entry.data().slug;
	if (!slug) throw error(404);
	throw redirect(302, `/entry/${slug}`);
}
