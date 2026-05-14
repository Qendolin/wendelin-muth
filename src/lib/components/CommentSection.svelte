<script lang="ts">
  import { onMount } from 'svelte';
  import { comments } from '$lib/stores.svelte';
  import CommentForm from './CommentForm.svelte';
  import CommentItem from './CommentItem.svelte';

  type Props = {
    /**
     * Stable identifier for this page's comments.
     * Use the SvelteKit route path, e.g. $page.url.pathname.
     * Tip: pass a canonical slug from frontmatter once you have one.
     */
    routeId: string;
  };

  let { routeId }: Props = $props();

  onMount(() => {
    comments.load(routeId);
  });
</script>

<section>
  <h2>
    {#if comments.loading}
      Comments
    {:else}
      {comments.count}
      {comments.count === 1 ? 'Comment' : 'Comments'}
    {/if}
  </h2>

  {#if comments.error}
    <p role="alert">
      {comments.error}
      <button onclick={() => comments.clearError()}>Dismiss</button>
    </p>
  {/if}

  <CommentForm placeholder="Join the discussion…" action="post" onsubmit={(body, name) => comments.post(body, undefined, name)} />

  {#if comments.loading}
    <p>Loading comments…</p>
  {:else if comments.topLevel.length === 0 && !comments.posting}
    <p>No comments yet. Be the first!</p>
  {:else}
    <ol>
      {#each comments.topLevel as comment (comment._id)}
        <li>
          <CommentItem {comment} />
        </li>
      {/each}
    </ol>
  {/if}
</section>
