<script lang="typescript">
  import { wall } from '$lib/stores';
  import WallList from './wall-list.svelte';

  let wallPostContent = '';
  function onWallPost() {
    if (wallPostContent.trim() == '') return;
    if (!confirm(`Post to wall as ${$wall.nickname ?? 'Anonymous'}?`)) return;
    wall.post(wallPostContent);
    wallPostContent = '';
  }
</script>

<section>
  <h2>Wall</h2>
  <em>This is a public wall, post something funny or random but be respectful!</em>
  <div class="wall-wrapper">
    {#if $wall.isLoading}
      <p>Loading...</p>
    {:else if $wall.posts.length == 0}
      <p>Be the first to post on my wall!</p>
    {:else}
      <WallList />
    {/if}
  </div>
  <br />
  <textarea class="wall-edit-area" placeholder="Your website is really cool!" bind:value={wallPostContent} />
  <br />
  <button class="wall-post-button" on:click={onWallPost} disabled={wallPostContent.trim() == ''}>Post</button>
  as
  <input type="text" placeholder="Anonymous" value={$wall.nickname ?? ''} on:change={(ev) => wall.setNickname(ev.currentTarget.value, true)} />
  | <em>Note: Only verified posts can be deleted, none can be edited.</em>
</section>

<style>
  .wall-wrapper {
    height: 50vh;
    overflow: auto;
    border: 4px double var(--accent-background-color);
    padding: 4px;
  }

  .wall-edit-area {
    width: 100%;
    height: 100px;
    max-width: 400px;
    resize: none;
  }
</style>
