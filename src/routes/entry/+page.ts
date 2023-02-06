import { page } from '$lib/stores';
import { error, type LoadEvent } from '@sveltejs/kit';

export const prerender = false;
export const csr = true;

export async function load(event: LoadEvent) {
	const params = new URLSearchParams(event.url.search);
	const id = params.get('id');
	if (id == null || id == '') throw error(404);
	const entry = await page.loadEntry(id);
	if (entry == null) throw error(404);
	return {};
}
