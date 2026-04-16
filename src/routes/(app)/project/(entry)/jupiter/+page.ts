import type { PageLoad } from './$types';
import type { ProjectMeta } from '$lib/projects';
import { SimpleDate } from '$lib/date';

export const _meta: ProjectMeta = {
  title: 'Jupiter',
  startDate: SimpleDate(2018, 9, 3), // Release version 1.0.0
  endDate: SimpleDate(2020, 11, 10),
  publishDate: SimpleDate(2026, 4, 4),
  description: 'A PWA frontend for WebUntis built during HTL, with a cleaner timetable view, full offline support, and other QoL improvements.',
  highlight: false,
  topics: ['PHP', 'Web', 'Tool']
};

export const load: PageLoad = () => {
  return { meta: _meta };
};
