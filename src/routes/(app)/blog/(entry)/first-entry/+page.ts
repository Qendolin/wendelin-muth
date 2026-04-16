import type { PageLoad } from './$types';
import type { BlogEntryMeta } from '$lib/blog-entries';
import { SimpleDate } from '$lib/date';

export const _meta: BlogEntryMeta = {
  title: 'First Entry',
  description: 'Hello World!',
  createdDate: SimpleDate(2022, 10, 15),
  modifiedDate: SimpleDate(2022, 10, 15),
  topics: [],
  draft: false
};

export const load: PageLoad = () => {
  return { meta: _meta };
};
