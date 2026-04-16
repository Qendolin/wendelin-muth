import type { PageLoad } from './$types';
import type { BlogEntryMeta } from '$lib/blog-entries';
import { SimpleDate } from '$lib/date';

export const _meta: BlogEntryMeta = {
  title: 'Comments / Disqus',
  description:
    'Investigating third-party comment systems like Disqus revealed privacy concerns regarding embedded trackers. This prompted building a custom commenting solution using Firebase Firestore.',
  createdDate: SimpleDate(2022, 10, 18),
  modifiedDate: SimpleDate(2022, 10, 19),
  topics: ['Web', 'Tool', 'Security'],
  draft: false
};

export const load: PageLoad = () => {
  return { meta: _meta };
};
