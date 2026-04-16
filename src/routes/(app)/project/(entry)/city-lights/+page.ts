import type { PageLoad } from './$types';
import { SimpleDate } from '$lib/date';
import type { ProjectMeta } from '$lib/projects';

export const _meta: ProjectMeta = {
  title: 'City Lights',
  startDate: SimpleDate(2025, 10, 9),
  endDate: SimpleDate(2026, 2, 24),
  publishDate: SimpleDate(2026, 4, 4),
  description:
    "A Vulkan-based real-time rendering demo built for the TU Vienna CG master's course, where it received 2nd place. It features Forward+ tiled shading, clustered volumetric lighting, and cascaded shadow maps.",
  highlight: true,
  topics: ['Vulkan', 'C++', 'Computer Graphics']
};

export const load: PageLoad = () => {
  return { meta: _meta };
};
