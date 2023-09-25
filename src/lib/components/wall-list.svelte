<script lang="typescript">
  import { wall, user, type WallPost } from '$lib/stores';

  function deleteWallPost(post: WallPost) {
    let trimmedContent = post.content;
    if (trimmedContent.length > 25) {
      trimmedContent = trimmedContent.slice(0, 22) + '...';
    }
    if (!confirm(`Delete "${trimmedContent}" from wall?`)) return;
    wall.delete(post._id);
  }

  const longDate = new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'UTC'
  });
</script>

<ol class="wall-post-list">
  {#each $wall.posts as post}
    <li class="wall-post-item">
      <p class="wall-post">
        {post.content}
        <br />
        <span class="wall-post-footer">
          {post.nickname || 'Anonymous'}
          {#if post.user_ref != null}
            <span class="wall-post-verification" title="Verified">&#x2714;</span>
          {/if} &mdash; {longDate.format(post.created_date)}
          {#if post.user_ref != null && post.user_ref.id == $user?.auth?.uid}
            <button class="link-button" on:click={() => deleteWallPost(post)}>Delete</button>
          {/if}
        </span>
      </p>
    </li>
  {/each}
</ol>

<style>
  .wall-post-list {
    list-style: none;
    padding: unset;
    margin: unset;
  }

  .wall-post-footer {
    inset: 1rem;
    font-style: italic;
    font-size: 0.8em;
    padding-inline-start: 1em;
    opacity: 0.8;
  }

  .wall-post-verification {
    display: inline-block;
    text-align: center;
    vertical-align: middle;
    animation-name: rainbow-color;
    animation-duration: 5s;
    animation-iteration-count: infinite;
    animation-timing-function: linear;
    font-weight: bold;
  }

  @keyframes rainbow-color {
    0% {
      color: hsl(0, 100%, 50%);
    }
    50% {
      color: hsl(180, 100%, 50%);
    }
    100% {
      color: hsl(360, 100%, 50%);
    }
  }
</style>