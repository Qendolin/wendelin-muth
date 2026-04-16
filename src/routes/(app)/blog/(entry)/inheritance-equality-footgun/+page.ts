import type { PageLoad } from './$types';
import type { BlogEntryMeta } from '$lib/blog-entries';
import { SimpleDate } from '$lib/date';

export const _meta: BlogEntryMeta = {
  title: 'Inheritance Equality Footgun',
  description:
    'Investigating a common pitfall when manually implementing the equals method in Java inheritance structures. See how dynamic type checking resolves unexpected equality behaviors.',
  createdDate: SimpleDate(2023, 11, 26),
  modifiedDate: SimpleDate(2023, 11, 26),
  topics: ['Java', 'Learning', 'Object-Oriented Programming'],
  draft: false
};

export const load: PageLoad = () => {
  return { meta: _meta };
};
