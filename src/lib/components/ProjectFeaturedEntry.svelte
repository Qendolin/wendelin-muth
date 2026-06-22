<script lang="ts">
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
  <div class="entry-card group">
    <div class="entry-header">
      <span class="entry-title">{p.meta.title}</span>
      <span class="entry-meta">{formatDateRange(p.meta)}</span>
    </div>
    <div class="entry-desc">{p.meta.description}</div>
    <TopicsList topics={p.meta.topics}></TopicsList>
  </div>
</a>
