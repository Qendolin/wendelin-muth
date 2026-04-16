import type { PageLoad } from './$types';
import type { BlogEntryMeta } from '$lib/blog-entries';
import { SimpleDate } from '$lib/date';

export const _meta: BlogEntryMeta = {
  title: 'Markdown Support',
  description:
    'The edit page now includes markdown support, completing a major feature. Next steps involve adding comments, improving design, and implementing pagination.',
  createdDate: SimpleDate(2022, 10, 16),
  modifiedDate: SimpleDate(2022, 10, 27),
  topics: ['Tool', 'Web', 'Markdown'],
  draft: false
};

export const load: PageLoad = () => {
  return { meta: _meta };
};
