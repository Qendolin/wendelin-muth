import type { PageLoad } from './$types';
import type { BlogEntryMeta } from '$lib/blog-entries';
import { SimpleDate } from '$lib/date';

export const _meta: BlogEntryMeta = {
  title: 'SvelteKit: Run Script after Build',
  description: 'Using a Vite plugin to modify the SvelteKit 200.html fallback file, ensuring proper title and description tags for improved SEO.',
  createdDate: SimpleDate(2023, 10, 6),
  modifiedDate: SimpleDate(2023, 10, 6),
  topics: ['Web', 'Tool', 'Node.js'],
  draft: false
};

export const load: PageLoad = () => {
  return { meta: _meta };
};
