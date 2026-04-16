import { type ProjectMeta, type Project, TopicsOrder } from './project.ts';
export * from './project';

const modules = import.meta.glob<{ _meta: ProjectMeta }>('/src/routes/\\(app\\)/project/\\(entry\\)/*/+page.ts', { eager: true });

export const projects: Project[] = Object.entries(modules)
  .map(([path, mod]: [string, { _meta: ProjectMeta }]) => {
    const slug = path.replace('/src/routes/(app)/project/(entry)/', '').replace('/+page.ts', '');

    const meta = mod._meta as ProjectMeta;

    meta.topics.sort((a, b) => {
      const i = TopicsOrder.indexOf(a);
      const j = TopicsOrder.indexOf(b);
      return i - j;
    });

    return {
      path: `/project/${slug}`,
      meta: meta
    };
  })
  .sort((a, b) => {
    if (a.meta.startDate.year !== b.meta.startDate.year) {
      return b.meta.startDate.year - a.meta.startDate.year;
    }

    const aMonth = a.meta.startDate.month ?? 0;
    const bMonth = b.meta.startDate.month ?? 0;
    if (aMonth !== bMonth) {
      return bMonth - aMonth;
    }

    const aDay = a.meta.startDate.day ?? 0;
    const bDay = b.meta.startDate.day ?? 0;
    if (aDay !== bDay) {
      return bDay - aDay;
    }

    return 0;
  });
