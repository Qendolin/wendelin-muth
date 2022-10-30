<script lang="ts">
  import { auth$, db } from '$lib/fire-context';
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
  blogEntries$.then(() => {
    globalThis?.requestAnimationFrame?.(() => {
      const hash = globalThis?.location?.hash;
      if (hash?.length > 1) {
        const target = globalThis?.document?.getElementById(hash.substring(1));
        if (target != null) target.scrollIntoView();
      }
    });
  });

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
</script>

<header>
  <h1>Welcome to my Blog!</h1>
  Check out my
  <a target="_blank" rel="noreferrer noopener nofollow" href="https://github.com/Qendolin/">GitHub</a>
  and
  <a target="_blank" rel="noreferrer noopener nofollow" href="https://www.linkedin.com/in/wendelin-muth">LinkedIn</a>.
  Get in touch via my Email
  <a target="_blank" rel="noreferrer noopener nofollow" href="mailto:wendelin.muth+website@gmail.com"
    >wendelin.muth@gmail.com</a
  >
  or Discord
  <a target="_blank" rel="noreferrer noopener nofollow" href="https://discordapp.com/users/Wendelin#7330">
    Wendelin#7330
  </a>
  <hr />
</header>

<svelte:window on:resize={updateOverflowShadows} />

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
          <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
          <article class="blog-entry" tabindex="0">
            <section class="blog-entry-header">
              <span class="blog-entry-heading">
                <a href={`#${entry._id}`} id={entry._id} class="blog-entry-anchor">#</a>
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

<style>
  .blog-entry-list {
    list-style: none;
    padding: unset;
    margin: unset;
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

  .blog-entry-anchor {
    font-family: 'Times New Roman', Times, serif;
    display: none;
    opacity: 0;
    color: white;
    mix-blend-mode: difference;
    display: inline-block;
    width: 1rem;
    margin-left: -1rem;
    text-decoration: none;
    font-size: 1.5rem;
    position: absolute;
  }

  .blog-entry:is(:focus-within, :focus) .blog-entry-anchor,
  .blog-entry-heading:is(:hover) .blog-entry-anchor,
  .blog-entry-anchor:is(:hover) {
    opacity: 0.5;
    display: block;
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
