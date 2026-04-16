import type { PageLoad } from './$types';
import type { BlogEntryMeta } from '$lib/blog-entries';
import { SimpleDate } from '$lib/date';

export const _meta: BlogEntryMeta = {
  title: 'Nothings aka Sean Barrett',
  description:
    "Discovering old resources like nothings' 1999 article on software patents. Exploring the influence of developers like Sean Barrett, creator of stb_image for OpenGL rendering.",
  createdDate: SimpleDate(2022, 10, 16),
  modifiedDate: SimpleDate(2022, 10, 17),
  topics: ['OpenGL', 'Java', 'Tool', 'Computer Graphics'],
  draft: false
};

export const load: PageLoad = () => {
  return { meta: _meta };
};
