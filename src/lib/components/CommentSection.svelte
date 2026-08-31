<script lang="ts">
  import { page } from '$app/state';
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

  let soughtToHash = $state<string | null>(null);

  // Deep-link from a notification (#comment-<id>) once the comments for this
  // route have loaded and rendered.
  $effect(() => {
    if (comments.routeId !== routeId || comments.loading) return;
    const hash = page.url.hash;
    if (!hash || hash === soughtToHash) return;
    soughtToHash = hash;
    const el = document.getElementById(hash.slice(1));
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('comment-flash');
      setTimeout(() => el.classList.remove('comment-flash'), 2000);
    }
  });

  onMount(() => {
    comments.load(routeId);
  });
</script>

<section>
  <h2 class="mb-2 text-xl text-content">
    {#if comments.loading || comments.count == 0}
      Comments
    {:else}
      {comments.count} {comments.count === 1 ? 'Comment' : 'Comments'}
    {/if}
  </h2>

  {#if comments.error}
    <p role="alert" class="mb-4 flex items-center justify-between rounded bg-content-error/20 p-3 text-content-error">
      {comments.error}
      <button class="btn-link hover:text-content-error" onclick={() => comments.clearError()}>Dismiss</button>
    </p>
  {/if}

  <CommentForm placeholder="Join the discussion…" action="post" onsubmit={(body, name) => comments.post(body, undefined, name)} />

  <div class="mt-8">
    {#if comments.loading}
      <p class="text-content-muted">Loading comments…</p>
    {:else if comments.topLevel.length === 0 && !comments.posting}
      <p class="text-content-muted">No comments yet. Be the first!</p>
    {:else}
      <ol class="flex list-none flex-col gap-4">
        {#each comments.topLevel as comment (comment._id)}
          <li class="border-b border-border-base pb-4 last:border-0">
            <CommentItem {comment} />
          </li>
        {/each}
      </ol>
    {/if}
  </div>
</section>

<style>
  :global(.comment-flash) {
    outline: 2px solid var(--color-border-strong);
    outline-offset: 4px;
  }
</style>
