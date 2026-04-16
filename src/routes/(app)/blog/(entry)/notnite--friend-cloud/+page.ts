import type { PageLoad } from './$types';
import type { BlogEntryMeta } from '$lib/blog-entries';
import { SimpleDate } from '$lib/date';

export const _meta: BlogEntryMeta = {
  title: 'NotNite / Friend Cloud',
  description:
    'Exploring the concept of Friend Cloud, a hybrid friend network that mixes public and private cloud functionality. This discusses simple, aesthetic web experiences.',
  createdDate: SimpleDate(2022, 11, 8),
  modifiedDate: SimpleDate(2022, 11, 8),
  topics: ['Web', 'Tool', 'Media'],
  draft: false
};

export const load: PageLoad = () => {
  return { meta: _meta };
};
