import type { BlogEntry, BlogEntryMeta } from './blog-entry.ts';

export * from './blog-entry.ts';

const modules = import.meta.glob<{ _meta: BlogEntryMeta }>('/src/routes/\\(app\\)/blog/\\(entry\\)/*/+page.ts', { eager: true });

export const blogEntries: BlogEntry[] = Object.entries(modules)
  .map(([path, mod]: [string, { _meta: BlogEntryMeta }]) => {
    const slug = path.replace('/src/routes/(app)/blog/(entry)/', '').replace('/+page.ts', '');

    const meta = mod._meta as BlogEntryMeta;

    meta.topics.sort();

    return {
      path: `/blog/${slug}`,
      meta: meta
    };
  })
  .filter((e) => e.meta.draft !== true)
  .sort((a, b) => {
    if (!a.meta.createdDate && !b.meta.createdDate) {
      return 0;
    }

    if (!a.meta.createdDate) return 1;
    if (!b.meta.createdDate) return -1;

    if (a.meta.createdDate.year !== b.meta.createdDate.year) {
      return b.meta.createdDate.year - a.meta.createdDate.year;
    }

    const aMonth = a.meta.createdDate.month ?? 0;
    const bMonth = b.meta.createdDate.month ?? 0;
    if (aMonth !== bMonth) {
      return bMonth - aMonth;
    }

    const aDay = a.meta.createdDate.day ?? 0;
    const bDay = b.meta.createdDate.day ?? 0;
    if (aDay !== bDay) {
      return bDay - aDay;
    }

    return 0;
  });
