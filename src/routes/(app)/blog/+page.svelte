<script lang="ts">
  import TopicsList from '$lib/components/TopicsList.svelte';
  import { formatDate } from '$lib/format';
  import type { PageProps } from './$types';
  import { resolve } from '$app/paths';
  let { data }: PageProps = $props();
</script>

<svelte:head>
  <title>Blog &ndash; Wendelin Muth</title>
  <meta name="description" content="A list of all my blog entries." />
</svelte:head>

<h1 class="flex justify-between border-b border-border-strong pb-2 tracking-[-0.05em]">
  Blog Entries<span class="self-center text-lg text-content-muted">{data.blogEntries.length}</span>
</h1>

<ol class="list-none">
  {#each data.blogEntries as e (e.path)}
    <li class="group entry-row cursor-pointer">
      <!-- eslint-disable-next-line @typescript-eslint/no-explicit-any -->
      <a href={resolve(e.path as any)} class="select-auto" draggable="false">
        <div class="entry-header">
          <span class="entry-title">{e.meta.title}</span>
          <span class="entry-meta">{e.meta.createdDate ? formatDate(e.meta.createdDate) : ''}</span>
        </div>
        <div class="entry-desc">{e.meta.description}</div>
        <TopicsList topics={e.meta.topics}></TopicsList>
      </a>
    </li>
  {/each}
</ol>
