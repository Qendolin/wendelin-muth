import { page } from '$lib/stores';
import { error, type LoadEvent } from '@sveltejs/kit';

export const prerender = false;
export const csr = true;

export async function load(event: LoadEvent) {
	const slug = event.params.slug;
	if (slug == null || slug == '') throw error(404);
	const entry = await page.loadEntry(slug);
	if (entry == null) throw error(404);
	return {};
}
