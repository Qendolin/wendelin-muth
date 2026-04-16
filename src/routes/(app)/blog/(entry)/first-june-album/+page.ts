import type { PageLoad } from './$types';
import type { BlogEntryMeta } from '$lib/blog-entries';
import { SimpleDate } from '$lib/date';

export const _meta: BlogEntryMeta = {
  title: 'First june Album',
  description: 'A few notes on June\'s first album, "Too Bad We Grow Up," and the sound of their debut release. Discover their music here.',
  createdDate: SimpleDate(2025, 6, 16),
  modifiedDate: SimpleDate(2025, 6, 16),
  topics: ['Music', 'Band'],
  draft: false
};

export const load: PageLoad = () => {
  return { meta: _meta };
};
