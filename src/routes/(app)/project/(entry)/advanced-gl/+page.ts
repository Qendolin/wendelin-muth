import type { PageLoad } from './$types';
import type { ProjectMeta } from '$lib/projects';
import { SimpleDate } from '$lib/date';

export const _meta: ProjectMeta = {
  title: 'Learning OpenGL 4+',
  startDate: SimpleDate(2020, 1, 28), // gogl-engine start date is 2019-07-17
  endDate: SimpleDate(2022, 5, 1),
  publishDate: SimpleDate(2026, 4, 4),
  description: 'A series of small projects in Go and OpenGL exploring modern techniques such as deferred rendering, PBR, and image-based lighting.',
  highlight: false,
  topics: ['OpenGL', 'Go', 'Computer Graphics']
};

export const load: PageLoad = () => {
  return { meta: _meta };
};
