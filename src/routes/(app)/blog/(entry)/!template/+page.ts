import type { PageLoad } from './$types';
import type { BlogEntryMeta } from '$lib/blog-entries';
import { SimpleDate } from '$lib/date';

export const _meta: BlogEntryMeta = {
  title: 'TEMPLATE',
  description: '',
  createdDate: SimpleDate(9999),
  modifiedDate: SimpleDate(9999),
  topics: [],
  draft: true
};

export const load: PageLoad = () => {
  return { meta: _meta };
};
