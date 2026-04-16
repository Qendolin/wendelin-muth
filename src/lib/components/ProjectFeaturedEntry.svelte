<script lang="ts">
  import type { BlogEntry } from '$lib/blog-entry';
  import { formatDateRange } from '$lib/format';
  import type { Project } from '$lib/project';
  import TopicsList from './TopicsList.svelte';

  const {
    project: p
  }: {
    project: Project;
  } = $props();
</script>

<a href={p.path} class="select-auto" draggable="false">
  <div class="project-card">
    <div class="card-header">
      <span class="card-title group-hover:underline">{p.meta.title}</span>
      <span class="card-date">{formatDateRange(p.meta)}</span>
    </div>
    <div class="card-desc">
      {p.meta.description}
    </div>
    <TopicsList topics={p.meta.topics}></TopicsList>
  </div>
</a>

<style lang="postcss">
  @reference '$app.css';

  .project-card {
    @apply mb-2 border border-gray-200 bg-white p-4 transition-colors duration-300 hover:border-gray-400 dark:border-[#222] dark:bg-[#1a1a1a] dark:hover:border-[#444];
  }

  .card-header {
    @apply flex items-baseline;
  }

  .card-title {
    @apply mb-1 grow text-xl font-bold text-gray-900 dark:text-white;
  }

  .card-desc {
    @apply text-sm leading-relaxed text-gray-600 dark:text-[#888];
  }

  .card-date {
    @apply shrink-0 pl-4 text-sm text-gray-600 dark:text-[#666];
  }
</style>
