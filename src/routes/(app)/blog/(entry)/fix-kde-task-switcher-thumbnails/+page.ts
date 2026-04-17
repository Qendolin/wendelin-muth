import type { PageLoad } from './$types';
import type { BlogEntryMeta } from '$lib/blog-entries';
import { SimpleDate } from '$lib/date';

export const _meta: BlogEntryMeta = {
  title: 'Fixing Pixelated Task Switcher Thumbnails in KDE Plasma',
  description: 'The KDE Task Switcher has very pixelated window previews by default. With a small modification to the style you can fix that.',
  createdDate: SimpleDate(2026, 4, 17),
  topics: ['Linux', 'KDE'],
  draft: false
};

export const load: PageLoad = () => {
  return { meta: _meta };
};
