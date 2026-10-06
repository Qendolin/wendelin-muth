import type { PageLoad } from './$types';
import type { BlogEntryMeta } from '$lib/blog-entries';
import { SimpleDate } from '$lib/date';

export const _meta: BlogEntryMeta = {
  title: 'Partial Hydration in SvelteKit: Capturing Build-Time Results for the Client',
  description:
    'Static regions can freeze whole components into HTML, but interactive ones still need build-time data. Here is how I added a $static() marker that captures results during prerender and replays them on the client.',
  createdDate: SimpleDate(2026, 10, 6),
  topics: ['Web', 'Tool'],
  draft: false
};

export const load: PageLoad = () => {
  return { meta: _meta };
};
