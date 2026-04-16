import type { PageLoad } from './$types';
import { SimpleDate } from '$lib/date';
import type { ProjectMeta } from '$lib/projects';

export const _meta: ProjectMeta = {
  title: 'Botball',
  startDate: SimpleDate(2018, 11),
  endDate: SimpleDate(2019, 4, 12),
  publishDate: SimpleDate(2026, 4, 4),
  description:
    'Competing in ECER Botball as a four-person high school team, programming two autonomous robots to collect and deliver props in a fire rescue scenario.',
  highlight: false,
  topics: ['C', 'Go', 'Robotics']
};

export const load: PageLoad = () => {
  return { meta: _meta };
};
