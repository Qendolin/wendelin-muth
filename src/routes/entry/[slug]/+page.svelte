<script lang="ts">
  import './blogpost.css';
  import CommentList from '$lib/components/comment-list.svelte';
  import CommentBox from '$lib/components/comment-box.svelte';
  import { comments, page, title, user } from '$lib/stores';
  import { onDestroy, onMount } from 'svelte';
  import UsernameForm from '$lib/components/username-form.svelte';

  const longDate = new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'UTC'
  });
  const shortDate = new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'UTC'
  });

  const unsubscribe = page.subscribe((value) => {
    title.set(value?.title ?? null);
  });

  onDestroy(unsubscribe);

  onMount(() => {
    comments.clear();
    comments.reload();
  });
</script>

<svelte:head>
  {#if $page}
    <meta property="og:type" content="article" />
    <meta property="og:title" content={$page.title} />
    <meta property="og:url" content={`https://www.webindex.page/entry/${$page.slug}`} />
    <meta property="og:image" content="https://www.webindex.page/og-image.webp" />
    <meta property="og:image:type" content="image/webp" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:description" content="My personal website / blog. You should check it out!" />
    <meta name="description" content="My personal website / blog. You should check it out!" />
  {/if}
</svelte:head>

{#if $page}
  <article class="blog-entry">
    <section>
      <span class="blog-entry-heading">
        <h2>{$page.title}</h2>
      </span>
      <span class="blog-entry-time">
        <time datetime={$page.created_date.toISOString()}>
          {longDate.format($page.created_date)} UTC
        </time>
        {#if $page.modified_date.getTime() - $page.created_date.getTime() > 1000 * 60 * 10}
          &mdash; Edited
          <time datetime={$page.modified_date.toISOString()}>
            {shortDate.format($page.modified_date)}
          </time>
        {/if}
      </span>
    </section>
    <section class="blog-entry-body">
      <span />
      {@html $page.body}
    </section>
  </article>
  <section class="blog-comments">
    <h2>Comments</h2>
    {#if $user.data}
      {#if $user.data.display_name != null}
        <CommentBox hints={true} />
      {:else}
        <UsernameForm />
      {/if}
    {:else}
      <p><a href="/login">Login</a> to comment</p>
    {/if}
    <CommentList />
  </section>
{/if}

<style>
  @import '/static/fonts/KaTeX/katex_0.16.8.min.css';

  .blog-entry {
    flex-grow: 1;
  }

  .blog-entry-heading {
    display: flex;
    margin-top: 1rem;
  }

  .blog-entry-heading h2 {
    margin: unset;
  }

  .blog-entry-time {
    font-size: 0.8rem;
    color: var(--accent-color);
    background: var(--accent-background-color);
    padding-block: 1px;
    padding-inline: 4px;
  }
</style>
