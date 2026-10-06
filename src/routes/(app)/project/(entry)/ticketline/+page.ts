import type { PageLoad } from './$types';
import type { ProjectMeta } from '$lib/projects';
import { SimpleDate } from '$lib/date';

export const _meta: ProjectMeta = {
  title: 'SWE Group Project: NgTickets',
  startDate: SimpleDate(2024, 5),
  endDate: SimpleDate(2024, 6),
  publishDate: SimpleDate(2026, 10, 6),
  description:
    'For the Software Engineering Project bachelor course at TU Vienna, my six-person team built NgTickets, a full ticketing platform for cultural events, over eight weeks in the summer of 2024. We covered the whole buying journey, from an interactive SVG seat-plan editor and individual seat selection to credit card checkout and PDF tickets, plus a complete admin area. We organized ourselves in two-week agile sprints with review meetings and shipped through a GitLab CI pipeline.',
  highlight: false,
  topics: ['Java', 'Angular', 'Web', 'REST API']
};

export const load: PageLoad = () => {
  return { meta: _meta };
};
