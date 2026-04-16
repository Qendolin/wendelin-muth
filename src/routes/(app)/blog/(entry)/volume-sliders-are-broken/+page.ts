import type { PageLoad } from './$types';
import type { BlogEntryMeta } from '$lib/blog-entries';
import { SimpleDate } from '$lib/date';

export const _meta: BlogEntryMeta = {
  title: 'Volume Sliders are Broken',
  description: 'Examining how volume sliders operate and understanding the relationship between volume changes and decibel levels in audio systems.',
  createdDate: undefined,
  modifiedDate: undefined,
  topics: ['Hardware', 'Tool'],
  draft: true
};

export const load: PageLoad = () => {
  return { meta: _meta };
};
