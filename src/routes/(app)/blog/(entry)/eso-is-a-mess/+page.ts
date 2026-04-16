import type { PageLoad } from './$types';
import type { BlogEntryMeta } from '$lib/blog-entries';
import { SimpleDate } from '$lib/date';

export const _meta: BlogEntryMeta = {
  title: 'ESO is a mess',
  description:
    'Investigating the onboarding process in ESO. This looks at how the game presents itself to newcomers, highlighting confusing direction and monotonous early gameplay experiences.',
  createdDate: SimpleDate(2023, 10, 2),
  modifiedDate: SimpleDate(2023, 10, 2),
  topics: ['Game'],
  draft: false,
  highlight: true
};

export const load: PageLoad = () => {
  return { meta: _meta };
};
