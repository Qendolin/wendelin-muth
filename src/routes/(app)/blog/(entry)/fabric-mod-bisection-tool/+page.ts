import type { PageLoad } from './$types';
import type { BlogEntryMeta } from '$lib/blog-entries';
import { SimpleDate } from '$lib/date';

export const _meta: BlogEntryMeta = {
  title: 'Fabric Mod Bisection Tool',
  description:
    'Building a fabric mod bisection tool helps developers efficiently pinpoint specific bugs within a modding environment, offering a focused approach to debugging.',
  createdDate: SimpleDate(2025, 7, 2),
  modifiedDate: SimpleDate(2025, 7, 2),
  topics: ['Minecraft', 'Modding', 'Tool'],
  draft: false
};

export const load: PageLoad = () => {
  return { meta: _meta };
};
