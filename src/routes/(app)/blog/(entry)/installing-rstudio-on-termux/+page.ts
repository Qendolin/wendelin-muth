import type { PageLoad } from './$types';
import type { BlogEntryMeta } from '$lib/blog-entries';
import { SimpleDate } from '$lib/date';

export const _meta: BlogEntryMeta = {
  title: 'Installing RStudio on Termux',
  description: 'Building an RStudio environment on Android using Termux. Follow steps to install necessary components within Ubuntu and run the R server.',
  createdDate: SimpleDate(2023, 10, 3),
  modifiedDate: SimpleDate(2023, 10, 3),
  topics: ['Linux', 'CLI', 'Tool', 'R'],
  draft: false
};

export const load: PageLoad = () => {
  return { meta: _meta };
};
