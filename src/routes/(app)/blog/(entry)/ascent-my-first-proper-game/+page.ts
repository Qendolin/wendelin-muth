import type { PageLoad } from './$types';
import type { BlogEntryMeta } from '$lib/blog-entries';
import { SimpleDate } from '$lib/date';

export const _meta: BlogEntryMeta = {
  title: 'Ascent: My first proper game',
  description:
    'Ascent is my first complete game, developed for a Computer Graphics course. Explore the project details and see how the visual systems were implemented.',
  createdDate: SimpleDate(2024, 6, 16),
  modifiedDate: SimpleDate(2024, 6, 16),
  topics: ['Computer Graphics', 'Game'],
  draft: false
};

export const load: PageLoad = () => {
  return { meta: _meta };
};
