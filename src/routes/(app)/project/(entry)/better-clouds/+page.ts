import type { PageLoad } from './$types';
import type { ProjectMeta } from '$lib/projects';
import { SimpleDate } from '$lib/date';

export const _meta: ProjectMeta = {
  title: 'Better Clouds',
  startDate: SimpleDate(2022, 1, 1),
  endDate: SimpleDate(2026, 1, 1),
  publishDate: SimpleDate(2026, 4, 4),
  description:
    'A Minecraft mod in Java that renders stylized, blocky clouds using a stencil-based transparency approach to efficiently handle overlapping geometry.',
  topics: ['Minecraft', 'Modding', 'OpenGL', 'Java'],
  highlight: false
};

export const load: PageLoad = () => {
  return { meta: _meta };
};
