<script lang="ts">
  import type { BlogEntry } from '$lib/blog-entry';
  import { formatDate } from '$lib/format';
  import TopicsList from './TopicsList.svelte';

  const { entry: e }: { entry: BlogEntry } = $props();
</script>

<a href={e.path} class="select-auto" draggable="false">
  <div class="entry-card group grid gap-x-4" style="grid-template-areas: 'd h' '. b';">
    <div class="entry-meta self-center" style="grid-area: d;">{e.meta.createdDate ? formatDate(e.meta.createdDate) : ''}</div>
    <div>
      <div class="entry-header" style="grid-area: h;">
        <span class="entry-title">{e.meta.title}</span>
      </div>
    </div>
    <div style="grid-area: b;">
      <div class="entry-desc">{e.meta.description}</div>
      <TopicsList topics={e.meta.topics}></TopicsList>
    </div>
  </div>
</a>
