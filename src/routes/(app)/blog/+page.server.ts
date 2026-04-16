import type { PageServerLoad } from './$types';
import { blogEntries } from '$lib/blog-entries';

export const load: PageServerLoad = () => {
  return { blogEntries };
};

export const prerender = true;
