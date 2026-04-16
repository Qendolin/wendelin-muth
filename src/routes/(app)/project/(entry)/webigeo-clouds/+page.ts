import type { PageLoad } from './$types';
import type { ProjectMeta } from '$lib/projects';
import { SimpleDate } from '$lib/date';

export const _meta: ProjectMeta = {
  title: 'weBIGeo Clouds: Real-Time Volumetric Cloud Rendering',
  startDate: SimpleDate(2025, 10, 10),
  endDate: SimpleDate(2026, 3, 23),
  publishDate: SimpleDate(2026, 4, 4),
  description:
    "My bachelor's thesis at TU Wien, implementing volumetric cloud rendering from meteorological forecast data using WebGPU, ray-marching, and temporal accumulation.",
  highlight: true,
  topics: ['WebGPU', 'C++', 'Volumetrics', 'Computer Graphics']
};

export const load: PageLoad = () => {
  return { meta: _meta };
};
