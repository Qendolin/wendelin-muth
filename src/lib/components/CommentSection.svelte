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
  <h2 class="mb-2 text-xl">
    {#if comments.loading || comments.count == 0}
      Comments
    {:else}
      {comments.count} {comments.count === 1 ? 'Comment' : 'Comments'}
    {/if}
  </h2>

  {#if comments.error}
    <p role="alert" class="mb-4 flex items-center justify-between bg-red-900 p-3 text-white">
      {comments.error}
      <button class="btn-link text-white hover:text-gray-200" onclick={() => comments.clearError()}>Dismiss</button>
    </p>
  {/if}

  <CommentForm placeholder="Join the discussion…" action="post" onsubmit={(body, name) => comments.post(body, undefined, name)} />

  <div class="mt-8">
    {#if comments.loading}
      <p class="text-muted">Loading comments…</p>
    {:else if comments.topLevel.length === 0 && !comments.posting}
      <p class="text-muted">No comments yet. Be the first!</p>
    {:else}
      <ol class="flex list-none flex-col gap-4">
        {#each comments.topLevel as comment (comment._id)}
          <li class="border-b border-gray-800 pb-4 last:border-0 dark:border-gray-200">
            <CommentItem {comment} />
          </li>
        {/each}
      </ol>
    {/if}
  </div>
</section>
