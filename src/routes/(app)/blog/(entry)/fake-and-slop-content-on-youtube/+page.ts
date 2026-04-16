import type { PageLoad } from './$types';
import type { BlogEntryMeta } from '$lib/blog-entries';
import { SimpleDate } from '$lib/date';

export const _meta: BlogEntryMeta = {
  title: 'Fake and Slop Content On YouTube',
  description: 'Examining the trend of mass-produced, non-genuine content on YouTube that mimics informative channels, often utilizing AI voice technology.',
  createdDate: SimpleDate(2025, 9, 17),
  modifiedDate: SimpleDate(2025, 9, 17),
  topics: ['Media', 'AI'],
  draft: false
};

export const load: PageLoad = () => {
  return { meta: _meta };
};
