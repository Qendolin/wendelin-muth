import type { PageLoad } from './$types';
import type { ProjectMeta } from '$lib/projects';
import { SimpleDate } from '$lib/date';

export const _meta: ProjectMeta = {
  title: 'Path Tracing',
  startDate: SimpleDate(2025, 3, 19),
  endDate: SimpleDate(2025, 9, 3),
  publishDate: SimpleDate(2026, 4, 4),
  description:
    "A CPU-based unbiased path tracer built for the TU Vienna Rendering master's course, where it received 2nd place in final renders. It implements MIS, BVH acceleration, and path guiding.",
  highlight: false,
  topics: ['C++', 'Path Tracing', 'Computer Graphics']
};

export const load: PageLoad = () => {
  return { meta: _meta };
};
