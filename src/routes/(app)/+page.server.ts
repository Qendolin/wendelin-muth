import type { PageServerLoad } from './$types';
import { projects } from '$lib/projects';
import { blogEntries } from '$lib/blog-entries';

export const load: PageServerLoad = () => {
  return { projectsFeatured: projects.filter((p) => p.meta.highlight), blogFeatured: blogEntries.filter((p) => p.meta.highlight) };
};

export const prerender = true;
