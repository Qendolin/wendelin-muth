import type { PageLoad } from './$types';
import type { BlogEntryMeta } from '$lib/blog-entries';
import { SimpleDate } from '$lib/date';

export const _meta: BlogEntryMeta = {
  title: 'Opengl Counting',
  description:
    'Exploring order independent transparency methods for rendering clouds, including performance bottlenecks with WB-OIT and optimizing the rendering pipeline.',
  createdDate: undefined,
  modifiedDate: undefined,
  topics: ['OpenGL', 'Computer Graphics', 'Path Tracing', 'Tool'],
  draft: true
};

export const load: PageLoad = () => {
  return { meta: _meta };
};
