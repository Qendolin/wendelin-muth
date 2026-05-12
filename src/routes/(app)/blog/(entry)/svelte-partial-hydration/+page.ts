import type { PageLoad } from './$types';
import type { BlogEntryMeta } from '$lib/blog-entries';
import { SimpleDate } from '$lib/date';

export const _meta: BlogEntryMeta = {
  title: 'Partial Hydration in SvelteKit: Building a Static Regions Plugin',
  description:
    "SvelteKit doesn't support partial hydration out of the box. Here is how I built a Vite plugin to freeze components into static HTML to save client bundle size and avoid wasteful processing.",
  createdDate: SimpleDate(2026, 5, 7),
  topics: ['Web', 'Tool'],
  draft: false
};

export const load: PageLoad = () => {
  return { meta: _meta };
};
