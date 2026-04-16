import type { PageLoad } from './$types';
import type { BlogEntryMeta } from '$lib/blog-entries';
import { SimpleDate } from '$lib/date';

export const _meta: BlogEntryMeta = {
  title: 'Graphics Development Resources',
  description:
    'Curating valuable resources for real-time rendering, this collection provides documentation and learning materials related to OpenGL graphics development.',
  createdDate: SimpleDate(2023, 9, 25),
  modifiedDate: SimpleDate(2024, 8, 8),
  topics: ['OpenGL', 'Computer Graphics', 'Tool'],
  draft: false,
  highlight: true
};

export const load: PageLoad = () => {
  return { meta: _meta };
};
