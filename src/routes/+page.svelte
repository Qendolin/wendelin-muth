<script lang="ts">
  import { auth$, db } from '$lib/fire-context';
  import { wall } from '$lib/stores';
  import { collection, getDocs, query, where } from 'firebase/firestore/lite';
  import { tick } from 'svelte';

  type Entry = {
    _id: string;
    title: string;
    body: string;
    created_date: Date;
    modified_date: Date;
  };

  async function getBlogEntries(): Promise<Entry[]> {
    const blog = collection(db, 'blog');
    const documents = await getDocs(query(blog, where('draft', '==', false)));
    const entries = documents.docs
      .map((doc) => ({ ...doc.data(), _id: doc.id } as any))
      .map((doc) => ({
        ...doc,
        created_date: new Date(doc.created_date.seconds * 1000),
        modified_date: new Date(doc.modified_date.seconds * 1000)
      }))
      .sort((a, b) => b.created_date.getTime() - a.created_date.getTime());
    return entries;
  }

  const blogEntries$ = getBlogEntries();

  let isAdmin = false;
  auth$.then((auth) =>
    auth.onAuthStateChanged((user) => {
      if (!user) isAdmin = false;
      else
        user.getIdTokenResult().then((token) => {
          isAdmin = !!token.claims.admin;
        });
    })
  );

  const longDate = new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'UTC'
  });
  const shortDate = new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'UTC'
  });

  function updateOverflowShadows() {
    for (const entry of Array.from(document.querySelectorAll('.blog-entry-body')) as HTMLElement[]) {
      if (entry.scrollHeight > 400) {
        entry.dataset.overflowing = 'true';
      } else {
        entry.dataset.overflowing = 'false';
      }
    }
  }

  function updateOverflowShadowsNextTick(_: any) {
    tick().then(updateOverflowShadows);
  }

  let randomSongs$ = fetch('/music-2022-11.json', {
    priority: 'low'
  } as any).then((resp) => resp.json());
  async function pickRandomSong() {
    const data = await randomSongs$;
    const pool = [];
    for (const drop of data) {
      for (let i = 0; i < drop.weight; i++) {
        pool.push(drop.tracks);
      }
    }
    const tracks = pool[Math.trunc(Math.random() * pool.length)];
    return tracks[Math.trunc(Math.random() * tracks.length)];
  }

  let randomSong$ = pickRandomSong();

  let wallPostContent = '';
  function onWallPost() {
    if (wallPostContent.trim() == '') return;
    if (!confirm(`Post to wall as ${wall.getNickname() ?? 'Anonymous'}?`)) return;
    wall.post(wallPostContent);
    wallPostContent = '';
  }
</script>

<svelte:window on:resize={updateOverflowShadows} />

<h1>Welcome to my Website!</h1>
<hr style="width: 100%" />
<header>
  <article>
    <h2>About Me</h2>
    Hi, I'm Wendelin 👋, I have a passion for software development and am curretly studying computer science at<a
      href="http://tuwien.at"
      target="_blank"
      rel="noreferrer noopener nofollow">TU Wien</a
    >.
    <br />
    You should check out my
    <a target="_blank" rel="noreferrer noopener nofollow" href="https://github.com/Qendolin/">GitHub</a>
    and
    <a target="_blank" rel="noreferrer noopener nofollow" href="https://www.linkedin.com/in/wendelin-muth">LinkedIn</a>.
    <br />
    If you want to get in touch contact me via
    <a target="_blank" rel="noreferrer noopener nofollow" href="mailto:wendelin.muth+website@gmail.com"> wendelin.muth@gmail.com </a>
    or Discord
    <a target="_blank" rel="noreferrer noopener nofollow" href="https://discordapp.com/users/Wendelin#7330"> Wendelin#7330 </a>.
    <br />
    Here is a random song that I like:
    {#await randomSong$}
      ...
    {:then title}
      <button
        on:click={() => {
          randomSong$ = pickRandomSong();
        }}>🎲</button
      >
      <a href={`https://www.youtube.com/results?search_query=${title}`} target="_blank" rel="noopener noreferrer nofollow">{title}</a>
    {/await}
  </article>
</header>

<section>
  <h2>Wall</h2>
  <em>This is a public wall, be respectful!</em>
  <div class="wall-wrapper">
    {#if $wall.posts == null}
      <p>Loading...</p>
    {:else if $wall.posts.length == 0}
      <p>Be the first to post on my wall!</p>
    {:else}
      <ol class="wall-post-list">
        {#each $wall.posts as post}
          <li class="wall-post-item">
            <p class="wall-post">
              {post.content}
              <br />
              <span class="wall-post-footer">{post.nickname || 'Anonymous'} &mdash; {longDate.format(post.created_date)}</span>
            </p>
          </li>
        {/each}
      </ol>
    {/if}
  </div>
  <br />
  <textarea class="wall-edit-area" placeholder="Your website is really cool!" bind:value={wallPostContent} />
  <br />
  <button class="wall-post-button" on:click={onWallPost} disabled={wallPostContent.trim() == ''}>Post</button>
  as
  <input type="text" placeholder="Anonymous" value={$wall.nickname} on:change={(ev) => wall.setNickname(ev.currentTarget.value)} />
  | <em>Note: Cannot be deleted or edited</em>
</section>

<section>
  <h2>Blog</h2>
  <div class="blog-wrapper">
    {#await blogEntries$}
      <p>Loading...</p>
    {:then blogEntries}
      {#if blogEntries.length == 0}
        <p>Sorry, no entries exist.</p>
      {:else}
        <ol class="blog-entry-list" use:updateOverflowShadowsNextTick>
          {#if isAdmin}
            <li>
              <a href={`/admin/edit`} class="blog-entry-edit">Add Entry</a>
            </li>
          {/if}
          {#each blogEntries as entry}
            <li class="blog-entry-item">
              <article class="blog-entry">
                <section class="blog-entry-header">
                  <span class="blog-entry-heading">
                    <a href={`/entry?id=${entry._id}`} class="blog-entry-link">
                      <h2>{entry.title}</h2>
                    </a>
                    {#if isAdmin}
                      <a href={`/admin/edit?id=${entry._id}`} class="blog-entry-edit">Edit</a>
                    {/if}
                  </span>
                  <span class="blog-entry-time">
                    <time datetime={entry.created_date.toISOString()}>
                      {longDate.format(entry.created_date)} UTC
                    </time>
                    {#if entry.modified_date.getTime() - entry.created_date.getTime() > 1000 * 60 * 10}
                      &mdash; Edited
                      <time datetime={entry.modified_date.toISOString()}>
                        {shortDate.format(entry.modified_date)}
                      </time>
                    {/if}
                  </span>
                </section>
                <section class="blog-entry-body" data-overflowing="false">
                  <div class="blog-entry-overflow-overlay">
                    <a href={`/entry?id=${entry._id}`} class="blog-entry-overflow-link">Read Full Post</a>
                  </div>
                  <div>
                    {@html entry.body}
                  </div>
                </section>
              </article>
            </li>
          {/each}
        </ol>
      {/if}
    {:catch error}
      <p style="color: red">{error.message}</p>
    {/await}
  </div>
</section>
<br />
<section>
  <h2>See also</h2>
  <h3>The personal websites of my friends!</h3>
  <ul>
    <li>
      Eduard Beke, Software Developer - <a href="https://eduard.beke.at/" target="_blank" rel="noopener noreferrer nofollow">eduard.beke.at</a>
    </li>
  </ul>
  <h3>Websites that deserve attention</h3>
  <ul>
    <li>SS64, Command line reference - <a href="https://ss64.com/" target="_blank" rel="noopener noreferrer nofollow">ss64.com</a></li>
  </ul>
</section>

<style>
  .blog-wrapper {
    max-height: 80vh;
    overflow: auto;
    contain: content;
    border: 4px double var(--accent-background-color);
    padding: 4px;
  }
  .wall-wrapper {
    max-height: 50vh;
    overflow: auto;
    border: 4px double var(--accent-background-color);
    padding: 4px;
  }
  .blog-entry-list,
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

  .wall-edit-area {
    width: 100%;
    height: 100px;
    max-width: 400px;
    resize: none;
  }

  .blog-entry-time {
    font-size: 0.8rem;
    color: var(--accent-color);
    background: var(--accent-background-color);
    padding-block: 1px;
    padding-inline: 4px;
  }

  .blog-entry-body {
    margin-top: 1rem;
    text-align: justify;
    white-space: normal;
    max-height: 400px;
    overflow: hidden;
    position: relative;
  }

  .blog-entry-overflow-overlay {
    display: none;
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 72px;
    background-image: url('/img/dither-24-light.png');
    background-repeat: repeat-x;
    background-position: bottom 24px left;
    background-size: 8px 48px;
    image-rendering: pixelated;
  }

  @media (prefers-color-scheme: dark) {
    .blog-entry-overflow-overlay {
      background-image: url('/img/dither-24-dark.png');
    }
  }

  .blog-entry-body:is([data-overflowing='true']) .blog-entry-overflow-overlay {
    display: block;
  }

  .blog-entry-overflow-link {
    display: inline-block;
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    text-align: center;
    color: var(--accent-color);
    background: var(--accent-background-color);
  }

  .blog-entry-body::first-letter {
    font-size: 200%;
    font-style: italic;
  }

  .blog-entry-heading {
    display: flex;
    margin-top: 1rem;
  }

  .blog-entry-heading h2 {
    margin: unset;
  }

  .blog-entry-edit {
    margin-left: 1rem;
  }

  .blog-entry-item::after {
    content: '';
    display: block;
    margin-inline: 20px;
    margin-block: 1rem;
    border-bottom: 1px solid gray;
  }
</style>
