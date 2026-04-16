import type { PageLoad } from './$types';
import type { ProjectMeta } from '$lib/projects';
import { SimpleDate } from '$lib/date';

export const _meta: ProjectMeta = {
  title: 'Ascent',
  startDate: SimpleDate(2024, 3, 6),
  endDate: SimpleDate(2024, 7, 16),
  publishDate: SimpleDate(2026, 4, 4),
  description:
    "A C++/OpenGL wingsuit racing game built for the TU Vienna CG bachelor's course. It received first place in the course Hall of Fame, implementing material batching via indirect drawing, GTAO, and cascaded shadow maps.",
  highlight: true,
  topics: ['OpenGL', 'C++', 'Game', 'Computer Graphics']
};

export const load: PageLoad = () => {
  return { meta: _meta };
};
