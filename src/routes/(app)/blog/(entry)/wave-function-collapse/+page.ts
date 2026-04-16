import type { PageLoad } from './$types';
import type { BlogEntryMeta } from '$lib/blog-entries';
import { SimpleDate } from '$lib/date';

export const _meta: BlogEntryMeta = {
  title: 'Wave Function Collapse',
  description:
    'Experimenting with Wave Function Collapse for terrain generation, exploring methods like weighting tiles with noise maps and layered approaches.',
  createdDate: SimpleDate(2022, 10, 30),
  modifiedDate: SimpleDate(2022, 11, 1),
  topics: ['Procedural Generation', 'Computer Graphics', 'Go'],
  draft: false
};

export const load: PageLoad = () => {
  return { meta: _meta };
};
