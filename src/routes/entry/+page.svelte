<script lang="ts">
  import CommentList from '$lib/components/comment-list.svelte';
  import CommentBox from '$lib/components/comment-box.svelte';
  import { comments, page, user } from '$lib/stores';
  import { onMount } from 'svelte';

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

  onMount(() => {
    comments.clear();
    comments.reload();
  });
</script>

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
      {@html $page.body}
    </section>
  </article>
  <section class="blog-comments">
    <h2>Comments</h2>
    {#if $user}
      <CommentBox hints={true} />
    {:else}
      <p><a href="/login">Login</a> to comment</p>
    {/if}
    <CommentList />
  </section>
{/if}

<style>
  .blog-entry {
    flex-grow: 1;
  }

  .blog-entry-body {
    margin-top: 1rem;
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
