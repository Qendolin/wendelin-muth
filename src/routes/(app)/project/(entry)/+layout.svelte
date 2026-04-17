<script lang="ts">
  import { page } from '$app/state';
  import { PUBLIC_BASE_URL } from '$env/static/public';
  import { toJsDate } from '$lib/date';
  import type { ProjectMeta } from '$lib/project';

  const meta: ProjectMeta = $derived(page.data.meta);

  const absoluteUrl = $derived(`${PUBLIC_BASE_URL}${page.url.pathname}`);

  const longDate = new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'full'
  });
  const shortDate = new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'short'
  });

  let { children } = $props();
</script>

<svelte:head>
  <title>{meta.title} &ndash; Wendelin Muth</title>
  <meta name="description" content={meta.description} />

  <meta property="og:type" content="article" />
  <meta property="og:url" content={absoluteUrl} />
  <meta property="og:title" content={meta.title} />
  <meta property="og:description" content={meta.description} />
  {#if meta.topics.length > 0}
    <meta property="article:tag" content={meta.topics.join(', ')} />
  {/if}

  <meta name="twitter:card" content="summary" />
  <meta name="twitter:url" content={absoluteUrl} />
  <meta name="twitter:title" content={meta.title} />
  <meta name="twitter:description" content={meta.description} />
</svelte:head>

<article class="flex w-full flex-col">
  <header>
    <h1>{meta.title}</h1>
    <span class="bg-neutral-800 px-2 py-0.5 text-xs text-white dark:bg-neutral-200 dark:text-black">
      {#if meta.startDate}
        <time datetime={toJsDate(meta.startDate).toISOString()}>
          {longDate.format(toJsDate(meta.startDate))}
        </time>
      {/if}
      {#if meta.endDate}
        &mdash;
        <time datetime={toJsDate(meta.endDate).toISOString()}>
          {shortDate.format(toJsDate(meta.endDate))}
        </time>
      {/if}
    </span>
  </header>
  {@render children()}
</article>
