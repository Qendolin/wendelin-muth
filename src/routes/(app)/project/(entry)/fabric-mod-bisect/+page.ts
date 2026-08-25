import type { PageLoad } from './$types';
import { SimpleDate } from '$lib/date';
import type { ProjectMeta } from '$lib/projects';

export const _meta: ProjectMeta = {
  title: 'Mod Bisect Tool',
  startDate: SimpleDate(2025, 5, 26),
  endDate: SimpleDate(2026, 9, 1),
  publishDate: SimpleDate(2026, 4, 4),
  description:
    'A Go-based tool (GUI and TUI) that uses bisection search and dependency resolution to automate the identification of conflicting Minecraft mods across Fabric, Quilt, and (Neo)Forge.',
  highlight: false,
  topics: ['Go', 'GUI', 'CLI', 'Tool', 'Minecraft', 'Modding']
};

export const load: PageLoad = () => {
  return { meta: _meta };
};
