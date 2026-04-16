<script lang="ts">
  import type { BlogEntry } from '$lib/blog-entry';
  import { formatDate, formatDateRange } from '$lib/format';
  import type { Project } from '$lib/project';
  import TopicsList from './TopicsList.svelte';

  const {
    entry: e
  }: {
    entry: BlogEntry;
  } = $props();
</script>

<a href={e.path} class="select-auto" draggable="false">
  <div class="project-card">
    <div class="card-date" style="grid-area: d;">{e.meta.createdDate ? formatDate(e.meta.createdDate) : ''}</div>
    <div>
      <div class="card-header" style="grid-area: h;">
        <span class="card-title group-hover:underline">{e.meta.title}</span>
      </div>
    </div>
    <div style="grid-area: b;">
      <div class="card-desc">
        {e.meta.description}
      </div>
      <TopicsList topics={e.meta.topics}></TopicsList>
    </div>
  </div>
</a>

<style lang="postcss">
  @reference '$app.css';

  .project-card {
    @apply mb-2 grid gap-x-4 gap-y-1;
    grid-template-areas: 'd h' '. b';
  }

  .card-header {
    @apply flex items-baseline;
  }

  .card-title {
    @apply grow text-xl font-bold text-gray-900 dark:text-white;
  }

  .card-desc {
    @apply text-sm leading-relaxed text-gray-600 dark:text-[#888];
  }

  .card-date {
    @apply self-center text-sm text-gray-600 dark:text-[#666];
  }
</style>
