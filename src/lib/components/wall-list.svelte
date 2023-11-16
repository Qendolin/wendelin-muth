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

  function removeWallPostAdmin(post: WallPost) {
    let trimmedContent = post.content;
    if (trimmedContent.length > 25) {
      trimmedContent = trimmedContent.slice(0, 22) + '...';
    }
    if (!confirm(`Remove "${trimmedContent}" from wall as admin?`)) return;
    wall.removeAsAdmin(post._id);
  }

  const longDate = new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'UTC'
  });

  function renderContent(raw: string) {
    if (globalThis.document == null) return '';
    const regexp = /(https?:\/\/[A-Za-z0-9-._~:/?#[\]@!$&'()*+,;%=]+)/g;
    let match: RegExpExecArray | null;
    let root = document.createElement('span');
    let advance = 0;
    while ((match = regexp.exec(raw)) != null) {
      let before = raw.substring(advance, match.index);
      if (before.length > 0) {
        root.append(before);
      }
      let link = document.createElement('a');
      link.href = match[0];
      link.textContent = match[0];
      root.append(link);

      advance = regexp.lastIndex;
    }
    let after = raw.substring(advance);
    if (after.length > 0) {
      root.append(after);
    }
    return root.innerHTML;
  }
</script>

<ol class="wall-post-list">
  {#each $wall.posts as post}
    <li class="wall-post-item">
      <p class="wall-post">
        {#if post.removedByAdmin}
          <i class="wall-post-rba-text">[Removed by admin]</i>
        {:else}
          {@html renderContent(post.content)}
        {/if}
        <br />
        <span class="wall-post-footer">
          {post.nickname || 'Anonymous'}
          {#if post.user_ref != null}
            <span class="wall-post-verification" title="Verified">&#x2714;</span>
          {/if} &mdash; {longDate.format(post.created_date)}
          {#if post.user_ref != null && post.user_ref.id == $user?.auth?.uid}
            <button class="link-button" on:click={() => deleteWallPost(post)}>Delete</button>
          {/if}
          {#if $user.claims?.admin && post.user_ref?.id != $user?.auth?.uid}
            <button class="link-button" on:click={() => removeWallPostAdmin(post)}>Remove</button>
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

  .wall-post-rba-text {
    opacity: 0.5;
  }
</style>
