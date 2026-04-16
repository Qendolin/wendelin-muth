<script lang="ts">
  import TopicsList from '$lib/components/TopicsList.svelte';
  import { formatDate } from '$lib/format';
  import type { PageProps } from './$types';
  let { data }: PageProps = $props();
</script>

<svelte:head>
  <title>Blog &ndash; Wendelin Muth</title>
  <meta name="description" content="A list of all my blog entries." />
</svelte:head>

<h1 class="flex justify-between border-b tracking-[-0.05em]">
  Blog Entries<span class="self-center text-lg text-neutral-500">{data.blogEntries.length}</span>
</h1>

<ol class="list-none">
  {#each data.blogEntries as e}
    <li class="entry group cursor-pointer">
      <a href={e.path} class="select-auto" draggable="false">
        <div class="entry-header">
          <span class="entry-title group-hover:underline">{e.meta.title}</span>
          <span class="entry-date">{e.meta.createdDate ? formatDate(e.meta.createdDate) : ''}</span>
        </div>
        <div class="entry-desc">
          {e.meta.description}
        </div>
        <TopicsList topics={e.meta.topics}></TopicsList>
      </a>
    </li>
  {/each}
</ol>

<style lang="postcss">
  @reference '$app.css';

  /* TODO: extract style */

  .entry-header {
    @apply flex items-baseline;
  }

  .entry-title {
    @apply w-full text-lg font-semibold text-gray-800 dark:text-white;
  }

  .entry {
    @apply border-b border-gray-200 py-4 dark:border-neutral-800;
  }

  .entry-desc {
    @apply text-sm leading-relaxed text-gray-600 dark:text-[#888];
  }

  .entry-date {
    @apply shrink-0 pl-4 text-sm text-gray-600 dark:text-[#666];
  }
</style>
