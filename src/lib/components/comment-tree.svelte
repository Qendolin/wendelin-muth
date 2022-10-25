<script lang="ts">
  import { db } from '$lib/fire-context';
  import { comments, user, type Comment } from '$lib/stores';
  import { doc } from 'firebase/firestore/lite';
  import { onMount } from 'svelte';
  import CommentBox from './comment-box.svelte';

  export let root: Comment;
  export let depth: number;
  export let open: boolean = false;
  export let bbcode: (code: string) => string;

  const dateFormat = new Intl.RelativeTimeFormat('en-GB');

  function formatDate(date: Date) {
    let unit: Intl.RelativeTimeFormatUnit = 'day';
    let value = 1;
    // I know the math is off for special occasions but it doesn't really matter
    const delta = (Date.now() - date.getTime()) / 1000;
    if (delta < 120) {
      unit = 'second';
      value = delta;
    } else if (delta < 60 * 60) {
      unit = 'minute';
      value = delta / 60;
    } else if (delta < 60 * 60 * 24) {
      unit = 'hour';
      value = delta / 60 / 60;
    } else if (delta < 60 * 60 * 24 * 365) {
      unit = 'day';
      value = delta / 60 / 60 / 24;
    } else {
      unit = 'year';
      value = delta / 60 / 60 / 24 / 365;
    }

    return dateFormat.format(-Math.floor(value), unit);
  }

  let busy = false;
  let commentContainer: HTMLElement;
  onMount(() => {
    commentContainer.innerHTML = '';
    commentContainer.append(bbcode(root.body));
  });

  async function removeComment() {
    busy = true;
    await comments.remove(doc(db, 'comments', root._id));
    root.removed = true;
    busy = false;
  }

  async function unremoveComment() {
    busy = true;
    await comments.unremove(doc(db, 'comments', root._id));
    root.removed = false;
    busy = false;
  }

  let editing = false;
  function stopEditing() {
    editing = false;
    requestAnimationFrame(() => {
      commentContainer.innerHTML = '';
      commentContainer.append(bbcode(root.body));
    });
  }
</script>

<details {open} class="comment-tree-node">
  <summary>
    <span>{root.author}</span> &ndash;
    <time datetime={root.created_date.toISOString()}>{formatDate(root.created_date)}</time>
  </summary>
  {#if !editing}
    <p class="comment-tree-body" bind:this={commentContainer} />
    {#if root.user_ref.id == $user?.uid}
      <menu class="comment-tree-actions">
        <li>
          <button class="link-button" on:click={() => (editing = true)} disabled={busy}>Edit</button
          >
        </li>
        {#if root.removed}
          <li>
            <button class="link-button" on:click={unremoveComment} disabled={busy}>Restore</button>
          </li>
        {:else}
          <li>
            <button class="link-button" on:click={removeComment} disabled={busy}>Delete</button>
          </li>
        {/if}
      </menu>
    {/if}
  {:else}
    <p class="comment-tree-body">
      <CommentBox comment={root} on:close={stopEditing} />
    </p>
  {/if}
  {#if $comments.replies.has(root._id)}
    <ol class="comment-tree-list">
      {#each $comments.replies.get(root._id) ?? [] as reply}
        <li>
          <svelte:self root={reply} {bbcode} depth={depth + 1} />
        </li>
      {/each}
    </ol>
  {/if}
</details>

<style>
  .comment-tree-node {
    position: relative;
  }

  .comment-tree-node[open]::before {
    content: '';
    display: inline-block;
    width: 1px;
    position: absolute;
    height: calc(100% - 1.5rem);
    background: var(--text-color);
    left: 5px;
    top: 1.5rem;
  }

  .comment-tree-node > summary {
    clip-path: inset(0);
  }

  .comment-tree-actions {
    display: flex;
    list-style: none;
    padding: 0;
    padding-left: 1rem;
    margin: 0;
    margin-block: 0.25rem;
    gap: 0.75rem;
    font-size: 0.75em;
  }

  .comment-tree-list {
    list-style: none;
  }

  .comment-tree-body {
    margin: 0;
    padding-left: 1rem;
    clip-path: inset(0);
  }
</style>
