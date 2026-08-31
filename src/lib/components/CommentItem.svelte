<script lang="ts">
  import { auth, comments, isAdminUid, type Comment } from '$lib/stores.svelte';
  import CommentForm from './CommentForm.svelte';
  import CommentItem from './CommentItem.svelte';

  type Props = {
    comment: Comment;
    /** Replies stop being nestable at depth 2+. */
    depth?: number;
  };

  let { comment, depth = 0 }: Props = $props();

  let editing = $state(false);
  let replying = $state(false);

  const isOwn = $derived(auth.uid === comment.user_id);
  const replies = $derived(comments.repliesTo(comment._id));

  const dateFormat = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  function formatDate(date: Date): string {
    const delta = (Date.now() - date.getTime()) / 1000;
    if (delta < 60) return 'just now';
    if (delta < 3600) return dateFormat.format(-Math.round(delta / 60), 'minute');
    if (delta < 86400) return dateFormat.format(-Math.round(delta / 3600), 'hour');
    if (delta < 86400 * 365) return dateFormat.format(-Math.round(delta / 86400), 'day');
    return dateFormat.format(-Math.round(delta / (86400 * 365)), 'year');
  }

  async function handleEdit(body: string) {
    await comments.edit(comment._id, body);
    editing = false;
  }

  async function handleReply(body: string, name?: string) {
    await comments.post(body, comment._id, name);
    replying = false;
  }
</script>

<article id="comment-{comment._id}" class="flex flex-col">
  <header class="flex items-baseline gap-3 text-content-muted">
    <span class="text-md text-content"><strong title={comment.user_id}>{comment.author}</strong></span>

    {#if isAdminUid(comment.user_id)}
      <svg
        class="size-4 shrink-0 self-center text-emerald-500"
        aria-label="Verified site owner"
        role="img"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z"
        />
      </svg>
    {/if}

    <time class="text-xs" datetime={comment.created_date.toISOString()} title={comment.created_date.toLocaleString()}>
      {formatDate(comment.created_date)}
    </time>
    {#if comment.modified_date.getTime() !== comment.created_date.getTime()}
      <span class="text-xs">(edited)</span>
    {/if}
  </header>

  {#if editing}
    <CommentForm initialBody={comment.body} action="edit" onsubmit={handleEdit} oncancel={() => (editing = false)} />
  {:else}
    <p class="my-0 whitespace-pre-wrap text-content">{comment.body}</p>

    <menu class="mt-1 flex gap-4 ps-2 text-xs">
      {#if isOwn}
        <li><button class="btn-link" onclick={() => (editing = true)}>Edit</button></li>
        <li><button class="btn-link" onclick={() => comments.remove(comment._id)}>Delete</button></li>
      {/if}
      {#if depth < 2}
        <li><button class="btn-link" onclick={() => (replying = !replying)}>Reply</button></li>
      {/if}
    </menu>
  {/if}

  {#if replying}
    <div class="mt-4 border-l border-border-base pl-4">
      <CommentForm placeholder="Reply to {comment.author}…" action="reply" onsubmit={handleReply} oncancel={() => (replying = false)} />
    </div>
  {/if}

  {#if replies.length > 0}
    <ol class="mt-4 flex list-none flex-col gap-2 border-l border-border-base pl-4">
      {#each replies as reply (reply._id)}
        <li><CommentItem comment={reply} depth={depth + 1} /></li>
      {/each}
    </ol>
  {/if}
</article>
