import type { PageLoad } from './$types';
import type { ProjectMeta } from '$lib/projects';
import { SimpleDate } from '$lib/date';

export const _meta: ProjectMeta = {
  title: 'First Steps with OpenGL',
  startDate: SimpleDate(2016, 9),
  endDate: SimpleDate(2018, 2),
  publishDate: SimpleDate(2026, 4, 4),
  description:
    "Early 3D graphics projects in Java, inspired by ThinMatrix's tutorials, featuring custom implementations of chess and snake with basic shading and object loading.",
  highlight: false,
  topics: ['OpenGL', 'Java', 'Learning']
};

export const load: PageLoad = () => {
  return { meta: _meta };
};
