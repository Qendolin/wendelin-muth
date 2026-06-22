<script lang="ts">
  import TopicsList from '$lib/components/TopicsList.svelte';
  import { formatDateRange } from '$lib/format';
  import type { PageProps } from './$types';
  let { data }: PageProps = $props();
</script>

<svelte:head>
  <title>Projects &ndash; Wendelin Muth</title>
  <meta name="description" content="A list of all my projects." />
</svelte:head>

<h1 class="flex justify-between border-b border-border-strong pb-2 tracking-[-0.05em]">
  Projects<span class="self-center text-lg text-content-muted">{data.projects.length}</span>
</h1>
<p class="text-sm text-content-muted italic">Of course I have many more projects, but I can't make a page for every single one.</p>

<ol class="list-none">
  {#each data.projects as p}
    <li class="group entry-row cursor-pointer">
      <a href={p.path} class="select-auto" draggable="false">
        <div class="entry-header">
          <span class="entry-title">{p.meta.title}</span>
          <span class="entry-meta">{formatDateRange(p.meta)}</span>
        </div>
        <div class="entry-desc">{p.meta.description}</div>
        <TopicsList topics={p.meta.topics}></TopicsList>
      </a>
    </li>
  {/each}
</ol>
