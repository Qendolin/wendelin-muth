import type { PageLoad } from './$types';
import type { BlogEntryMeta } from '$lib/blog-entries';
import { SimpleDate } from '$lib/date';

export const _meta: BlogEntryMeta = {
  title: 'Rewriting my website for Svelte and other improvements',
  description:
    'Re-building this website from scratch with Svelte and SvelteKit, focusing on static generation and custom asset pipelines. It explores using Tailwind CSS and Deno.',
  createdDate: SimpleDate(2026, 4, 9),
  modifiedDate: SimpleDate(2026, 4, 9),
  topics: ['Web', 'Tool'],
  draft: false,
  highlight: true
};

export const load: PageLoad = () => {
  return { meta: _meta };
};
