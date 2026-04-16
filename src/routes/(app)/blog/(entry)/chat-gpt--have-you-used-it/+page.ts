import type { PageLoad } from './$types';
import type { BlogEntryMeta } from '$lib/blog-entries';
import { SimpleDate } from '$lib/date';

export const _meta: BlogEntryMeta = {
  title: 'ChatGPT: Have you used it?',
  description:
    'Exploring the utility of AI assistants like ChatGPT. See how this technology helps with coding, understanding math concepts, brainstorming ideas, and providing quick reference.',
  createdDate: SimpleDate(2022, 12, 21),
  modifiedDate: SimpleDate(2022, 12, 21),
  topics: ['AI', 'Tool', 'Learning'],
  draft: false
};

export const load: PageLoad = () => {
  return { meta: _meta };
};
