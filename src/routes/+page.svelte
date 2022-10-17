<script lang="ts">
  import { auth$, db } from '$lib/fire-context';
  import { collection, getDocs } from 'firebase/firestore/lite';

  type Entry = {
    _id: string;
    title: string;
    body: string;
    created_date: Date;
    modified_date: Date;
  };

  async function getBlogEntries(): Promise<Entry[]> {
    const blog = collection(db, 'blog');
    const documents = await getDocs(blog);
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

  const dateFormat = new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'UTC'
  });
</script>

<header>
  <h1>Welcome to my Blog!</h1>
  Check out my
  <a target="_blank" rel="noreferrer" href="https://github.com/Qendolin/">GitHub</a> and
  <a target="_blank" rel="noreferrer" href="https://www.linkedin.com/in/wendelin-muth">LinkedIn</a>.
  Get in touch via my Email
  <a target="_blank" rel="noreferrer" href="mailto:wendelin.muth@gmail.com"
    >wendelin.muth@gmail.com</a
  >
  or Discord
  <a target="_blank" rel="noreferrer" href="https://discordapp.com/users/Wendelin#7330">
    Wendelin#7330
  </a>
  <hr />
</header>

{#await blogEntries$}
  <p>Loading...</p>
{:then blogEntries}
  {#if blogEntries.length == 0}
    <p>Sorry, no entries exist.</p>
  {:else}
    <ol class="blog-entry-list">
      {#if isAdmin}
        <li>
          <a href={`/edit`} class="blog-entry-edit">Add Entry</a>
        </li>
      {/if}
      {#each blogEntries as entry}
        <li class="blog-entry-item">
          <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
          <article class="blog-entry" tabindex="0">
            <section class="blog-entry-header">
              <span class="blog-entry-heading">
                <a href={`#${entry._id}`} id={entry._id} class="blog-entry-anchor">#</a>
                <h2>{entry.title}</h2>
                {#if isAdmin}
                  <a href={`/edit?id=${entry._id}`} class="blog-entry-edit">Edit</a>
                {/if}
              </span>
              <span class="blog-entry-time">
                <time datetime={entry.created_date.toISOString()}>
                  {dateFormat.format(entry.created_date)} UTC
                </time>
                {#if entry.modified_date.getTime() - entry.created_date.getTime() > 1000 * 60 * 10}
                  &mdash; Edited
                  <time datetime={entry.modified_date.toISOString()}>
                    {dateFormat.format(entry.modified_date)}
                  </time>
                {/if}
              </span>
            </section>
            <section class="blog-entry-body">
              {@html entry.body}
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
    color: #888;
  }

  .blog-entry-body {
    margin-top: 1rem;
  }

  .blog-entry-heading {
    display: flex;
    margin-top: 1rem;
  }

  .blog-entry-heading h2 {
    margin: unset;
  }

  .blog-entry-anchor {
    display: none;
    opacity: 0;
    color: black;
    display: inline-block;
    width: 1rem;
    margin-left: -1rem;
  }

  .blog-entry-heading:is(:hover, :focus) .blog-entry-anchor,
  .blog-entry-anchor:is(:hover, :focus) {
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
