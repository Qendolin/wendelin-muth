import type { PageLoad } from './$types';
import type { BlogEntryMeta } from '$lib/blog-entries';
import { SimpleDate } from '$lib/date';

export const _meta: BlogEntryMeta = {
  title: 'Unsafe BBCode',
  description: 'Examining BBCode renderers on npm. Many available parsers rely on risky regex or introduce vulnerabilities like JavaScript injection risks.',
  createdDate: SimpleDate(2022, 10, 22),
  modifiedDate: SimpleDate(2022, 10, 22),
  topics: ['JavaScript', 'Web', 'Tool', 'Security'],
  draft: false
};

export const load: PageLoad = () => {
  return { meta: _meta };
};
