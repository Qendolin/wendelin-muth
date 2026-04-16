import type { PageLoad } from './$types';
import { SimpleDate } from '$lib/date';
import type { ProjectMeta } from '$lib/projects';

export const _meta: ProjectMeta = {
  title: 'Fabric Mod Bisect Tool',
  startDate: SimpleDate(2025, 5, 26),
  endDate: SimpleDate(2025, 7, 10),
  publishDate: SimpleDate(2026, 4, 4),
  description: 'A Go-based CLI tool that uses bisection search and dependency resolution to automate the identification of conflicting Minecraft mods.',
  highlight: false,
  topics: ['Go', 'CLI', 'Tool', 'Minecraft', 'Modding']
};

export const load: PageLoad = () => {
  return { meta: _meta };
};
