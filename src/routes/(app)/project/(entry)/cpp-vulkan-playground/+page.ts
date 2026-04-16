import type { PageLoad } from './$types';
import { SimpleDate } from '$lib/date';
import type { ProjectMeta } from '$lib/projects';

export const _meta: ProjectMeta = {
  title: 'Learning Vulkan 1.3+',
  startDate: SimpleDate(2024, 8, 27),
  publishDate: SimpleDate(2026, 4, 4),
  description: 'A C++/Vulkan exploration of modern API patterns, including HZB culling, bindless descriptors, and automated pipeline barrier tracking.',
  highlight: false,
  topics: ['Vulkan', 'C++', 'Learning']
};

export const load: PageLoad = () => {
  return { meta: _meta };
};
