import type { PageLoad } from './$types';
import type { BlogEntryMeta } from '$lib/blog-entries';
import { SimpleDate } from '$lib/date';

export const _meta: BlogEntryMeta = {
  title: 'Binary Tree Labeling',
  description:
    'Suggesting renaming pointers in binary trees from positional terms like "left" and "right" to names conveying actual relationships, like lessThan or greaterOrEqual.',
  createdDate: SimpleDate(2023, 11, 26),
  modifiedDate: SimpleDate(2023, 11, 26),
  topics: ['C', 'Data Structures'],
  draft: false
};

export const load: PageLoad = () => {
  return { meta: _meta };
};
