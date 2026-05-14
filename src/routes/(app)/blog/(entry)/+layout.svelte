<script lang="ts">
  import { page } from '$app/state';
  import { PUBLIC_BASE_URL } from '$env/static/public';
  import type { BlogEntryMeta } from '$lib/blog-entry';
  import CommentSection from '$lib/components/CommentSection.svelte';
  import { toJsDate } from '$lib/date';

  const meta: BlogEntryMeta = $derived(page.data.meta);

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

  {#if meta.draft}
    <meta name="robots" content="noindex, nofollow" />
  {/if}
</svelte:head>

<article class="flex w-full flex-col">
  <header>
    <h1>{meta.title}</h1>
    <span class="bg-neutral-800 px-2 py-0.5 text-xs text-white dark:bg-neutral-200 dark:text-black">
      {#if meta.createdDate}
        <time datetime={toJsDate(meta.createdDate).toISOString()}>
          {longDate.format(toJsDate(meta.createdDate))}
        </time>
      {/if}
      {#if meta.modifiedDate}
        &mdash; Edited
        <time datetime={toJsDate(meta.modifiedDate).toISOString()}>
          {shortDate.format(toJsDate(meta.modifiedDate))}
        </time>
      {/if}
    </span>
  </header>
  {@render children()}
</article>

<hr />

<CommentSection routeId={page.route.id!} />

<style>
  :global(blockquote) {
    background: var(--box-background-color);
    position: relative;
    padding-inline: 2px;
    margin-inline-start: 1rem;
    padding-inline-start: 1rem;
    padding-inline-start: max(min(calc(5vw - 1rem), 1rem), 0.5rem);
    margin-inline-end: 0;
    background-color: rgba(0, 0, 0, 0.1);
  }

  :global(blockquote::before) {
    content: '';
    position: absolute;
    left: -1rem;
    top: 0;
    bottom: 0;
    width: 3px;
    background-color: black;
  }
</style>
