<script lang="ts">
  import { comments } from '$lib/stores';
  import CommentTree from './comment-tree.svelte';

  const bbcode$ = (async () => {
    const [{ default: render }, { preset: preset }] = await Promise.all([
      import('$lib/bbcode/bbcode-renderer') as Promise<any>,
      import('$lib/bbcode/bbcode-builder') as Promise<any>
    ]);
    return (bbcode: string) => render(bbcode, preset());
  })();
</script>

<ol class="comment-tree-root">
  {#each $comments.direct as comment}
    <li class="comment-tree-node">
      {#await bbcode$ then bbcode}
        <CommentTree root={comment} depth={0} open={true} {bbcode} />
      {/await}
    </li>
  {/each}
</ol>

<style>
  .comment-tree-root {
    list-style: none;
    padding: 0;
    position: relative;
  }
</style>
