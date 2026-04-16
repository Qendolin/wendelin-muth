import type { PageServerLoad } from './$types';
import { projects } from '$lib/projects';

export const load: PageServerLoad = () => {
  return { projects };
};

export const prerender = true;
