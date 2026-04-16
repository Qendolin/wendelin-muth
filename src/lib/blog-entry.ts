import { SimpleDate } from './date.ts';

export const CommonTopics = [
  'C++',
  'C',
  'Java',
  'Go',
  'Node.js',
  'OpenGL',
  'Vulkan',
  'WebGPU',
  'Path Tracing',
  'Minecraft',
  'Modding',
  'Tool',
  'CLI',
  'Computer Graphics',
  'Game',
  'Learning',
  'Volumetrics',
  'Robotics',
  'Music',
  'AI',
  'Media',
  'Hardware',
  'Windows',
  'Linux',
  'Web',
  'Procedural Generation',
  'Security'
] as const;

// deno-lint-ignore ban-types
export type Topic = (typeof CommonTopics)[number] | (string & {});

export interface BlogEntryMeta {
  title: string;
  description: string;
  createdDate?: SimpleDate;
  modifiedDate?: SimpleDate;
  topics: Topic[];
  draft?: boolean;
  highlight?: boolean;
}

export interface BlogEntry {
  path: string;
  meta: BlogEntryMeta;
}
