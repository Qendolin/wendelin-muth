<script lang="ts">
  import { db } from '$lib/fire-context';
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
      .sort((doc) => doc.created_date.getTime());
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
  const dateFormat = new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'UTC'
  });
</script>

<header>
  <h1>Welcome to my Blog!</h1>

  <hr />
</header>

<main>
  {#await blogEntries$}
    <p>Loading...</p>
  {:then blogEntries}
    {#if blogEntries.length == 0}
      <p>Sorry, no entries exist.</p>
    {:else}
      <ol class="blog-entry-list">
        {#each blogEntries as entry}
          <li class="blog-entry-item">
            <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
            <article class="blog-entry" tabindex="0">
              <section class="blog-entry-header">
                <span class="blog-entry-heading">
                  <a href={`#${entry._id}`} id={entry._id}>#</a>
                  <h2>{entry.title}</h2>
                </span>
                <span class="blog-entry-time">
                  <time datetime={entry.created_date.toISOString()}>
                    {dateFormat.format(entry.created_date)}
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
                {entry.body}
              </section>
            </article>
          </li>
        {/each}
      </ol>
    {/if}
  {:catch error}
    <p style="color: red">{error.message}</p>
  {/await}
</main>

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

  .blog-entry-heading a {
    display: none;
    opacity: 0;
    color: black;
    display: inline-block;
    width: 1rem;
    margin-left: -1rem;
  }

  .blog-entry-heading:is(:hover, :focus) a,
  .blog-entry-heading a:is(:hover, :focus) {
    opacity: 0.5;
    display: block;
  }

  .blog-entry-item::after {
    content: '';
    display: block;
    margin-inline: 20px;
    margin-block: 1rem;
    border-bottom: 1px solid gray;
  }
</style>
