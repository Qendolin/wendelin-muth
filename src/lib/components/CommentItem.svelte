<script lang="ts">
  import { auth, comments, type Comment } from '$lib/stores.svelte';
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
    if (delta < 60) return dateFormat.format(-Math.round(delta), 'second');
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

  function getShortId(str: string) {
    let hash = 0x811c9dc5; // FNV offset basis
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      // Multiply by FNV prime (0x01000193)
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    return (hash >>> 0).toString(16).padStart(8, '0');
  }
</script>

<article>
  <header>
    <span><strong>{comment.author}</strong> {getShortId(comment.user_id)}</span>
    <time datetime={comment.created_date.toISOString()} title={comment.created_date.toLocaleString()}>
      {formatDate(comment.created_date)}
    </time>
    {#if comment.modified_date.getTime() !== comment.created_date.getTime()}
      <small>(edited)</small>
    {/if}
  </header>

  {#if editing}
    <CommentForm initialBody={comment.body} action="edit" onsubmit={handleEdit} oncancel={() => (editing = false)} />
  {:else}
    <p>{comment.body}</p>

    <menu class="flex gap-2">
      {#if isOwn}
        <li><button class="action-button" onclick={() => (editing = true)}>Edit</button></li>
        <li><button class="action-button" onclick={() => comments.remove(comment._id)}>Delete</button></li>
      {/if}
      {#if depth < 2}
        <li><button class="action-button" onclick={() => (replying = !replying)}>Reply</button></li>
      {/if}
    </menu>
  {/if}

  {#if replying}
    <div class="pl-12">
      <CommentForm placeholder="Reply to {comment.author}…" action="reply" onsubmit={handleReply} oncancel={() => (replying = false)} />
    </div>
  {/if}

  {#if replies.length > 0}
    <ol class="list-none pl-12">
      {#each replies as reply (reply._id)}
        <li>
          <CommentItem comment={reply} depth={depth + 1} />
        </li>
      {/each}
    </ol>
  {/if}
</article>
