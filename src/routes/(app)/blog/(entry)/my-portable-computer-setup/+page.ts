import type { PageLoad } from './$types';
import type { BlogEntryMeta } from '$lib/blog-entries';
import { SimpleDate } from '$lib/date';

export const _meta: BlogEntryMeta = {
  title: 'My Portable Computer Setup',
  description:
    'Building a portable computing setup under 500 euros. This explores options including Chromebooks, notebooks, and tablets, detailing the final configuration.',
  createdDate: SimpleDate(2023, 9, 24),
  modifiedDate: SimpleDate(2023, 9, 24),
  topics: ['Hardware', 'Web', 'Media'],
  draft: false
};

export const load: PageLoad = () => {
  return { meta: _meta };
};
