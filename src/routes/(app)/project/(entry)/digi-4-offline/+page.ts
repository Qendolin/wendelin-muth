import type { PageLoad } from './$types';
import { SimpleDate } from '$lib/date';
import type { ProjectMeta } from '$lib/projects';

export const _meta: ProjectMeta = {
  title: 'digi4offline',
  startDate: SimpleDate(2021, 3, 1),
  endDate: SimpleDate(2023, 11, 28),
  publishDate: SimpleDate(2026, 4, 4),
  description: 'A Node.js command-line tool that fetches activated digi4school textbooks and assembles them into PDFs for offline use.',
  highlight: false,
  topics: ['Node.js', 'Tool', 'CLI']
};

export const load: PageLoad = () => {
  return { meta: _meta };
};
