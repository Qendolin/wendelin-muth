<script lang="ts">
  import TopicsList from '$lib/components/TopicsList.svelte';
  import { formatDateRange } from '$lib/format';
  import type { PageProps } from './$types';
  let { data }: PageProps = $props();
</script>

<svelte:head>
  <title>Projects &ndash; Wendelin Muth</title>
</svelte:head>

<h1 class="flex justify-between border-b tracking-[-0.05em]">All Projects<span class="self-center text-lg text-neutral-500">{data.projects.length}</span></h1>

<ol class="list-none">
  {#each data.projects as p}
    <li class="group cursor-pointer">
      <a href={p.path} class="select-auto" draggable="false">
        <div class="entry">
          <div class="entry-header">
            <span class="entry-title group-hover:underline">{p.meta.title}</span>
            <span class="entry-date">{formatDateRange(p.meta)}</span>
          </div>
          <div class="entry-desc">
            {p.meta.description}
          </div>
          <TopicsList topics={p.meta.topics}></TopicsList>
        </div>
      </a>
    </li>
  {/each}
</ol>

<style lang="postcss">
  @reference '$app.css';

  .entry-header {
    @apply flex items-baseline;
  }

  .entry-title {
    @apply w-full font-semibold text-gray-800 dark:text-white;
  }

  .entry {
    @apply border-b border-gray-200 py-4 dark:border-neutral-800;
  }

  .entry-desc {
    @apply text-sm leading-relaxed text-gray-600 dark:text-[#888];
  }

  .entry-date {
    @apply shrink-0 pl-4 text-xs text-gray-600 dark:text-[#666];
  }
</style>
