import { SimpleDate } from './date.ts';

export const TopicsOrder = [
  'C++',
  'C',
  'Java',
  'Go',
  'Node.js',
  'PHP',
  'OpenGL',
  'Vulkan',
  'WebGPU',
  'Path Tracing',
  'Minecraft',
  'Modding',
  'Tool',
  'CLI',
  'GUI',
  'Web',
  'Computer Graphics',
  'Game',
  'Learning',
  'Volumetrics',
  'Robotics'
] as const;

export type Topic = (typeof TopicsOrder)[number];

export interface ProjectMeta {
  title: string;
  startDate: SimpleDate;
  endDate?: SimpleDate;
  publishDate: SimpleDate;
  description: string;
  highlight?: boolean;
  topics: Topic[];
}

export interface Project {
  path: string;
  meta: ProjectMeta;
}
