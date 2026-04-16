import type { PageLoad } from './$types';
import type { BlogEntryMeta } from '$lib/blog-entries';
import { SimpleDate } from '$lib/date';

export const _meta: BlogEntryMeta = {
  title: 'Learning a bit of Lua',
  description:
    'Exploring Lua scripting within ComputerCraft, detailing scripts for mining contiguous resources and navigating paths within the simulation environment.',
  createdDate: SimpleDate(2023, 10, 4),
  modifiedDate: SimpleDate(2023, 10, 4),
  topics: ['Lua', 'Tool', 'Computer Graphics'],
  draft: false
};

export const load: PageLoad = () => {
  return { meta: _meta };
};
