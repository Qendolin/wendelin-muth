<script lang="ts">
  import './entry/[slug]/blogpost.css';
  import type { Thing, WithContext } from 'schema-dts';
  import { auth$, db } from '$lib/fire-context';
  import { collection, getDocs, query, where } from 'firebase/firestore/lite';
  import { onMount, tick } from 'svelte';
  import WallSection from '$lib/components/wall-section.svelte';
  import { browser } from '$app/environment';
  import LufiaSecret from '$lib/components/lufia-secret.svelte';
  import { title, user } from '$lib/stores';

  type Entry = {
    _id: string;
    slug: string;
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

  let randomSongs$ = browser
    ? fetch('/music-2022-11.json', {
        priority: 'low'
      } as any).then((resp) => resp.json())
    : null;
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

  function serializeSchema(thing: Thing | WithContext<Thing>) {
    return `<${'script'} type="application/ld+json" >${JSON.stringify(thing, null, 2)}</${'script'}>`;
  }
  const microdata = serializeSchema({
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': 'https://www.webindex.page/#myself',
    name: 'Wendelin Muth',
    givenName: 'Wendelin',
    familyName: 'Muth',
    email: 'wendelin.muth+website@gmail.com',
    url: 'https://www.webindex.page/',
    nationality: {
      '@type': 'Country',
      name: 'Austria'
    },
    affiliation: {
      '@type': 'EducationalOrganization',
      address: 'Karlsplatz 13, 1040 Wien',
      name: 'Technische Universität Wien',
      url: 'https://www.tuwien.at/'
    },
    jobTitle: 'Student',
    knowsLanguage: ['de', 'en']
  });

  function openLufiaSecret() {
    const lufia = new LufiaSecret({
      target: document.body
    });
    lufia.$on('close', () => lufia.$destroy());
  }

  onMount(() => {
    title.set(null);
  });
</script>

<svelte:window on:resize={updateOverflowShadows} />

<svelte:head>
  {@html microdata}
  <meta property="og:type" content="profile" />
  <meta property="og:title" content="Wendelin Muth - Homepage" />
  <meta property="og:url" content="https://www.webindex.page/" />
  <meta property="og:image" content="https://www.webindex.page/og-image.webp" />
  <meta property="og:image:type" content="image/webp" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:description" content="My personal website / blog. You should check it out!" />
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:url" content="https://www.webindex.page/" />
  <meta property="twitter:title" content="Wendelin Muth - Homepage" />
  <meta property="twitter:description" content="My personal website / blog. You should check it out!" />
  <meta property="twitter:image" content="https://www.webindex.page/og-image.webp" />
  <meta property="profile:first_name" content="Wendelin" />
  <meta property="profile:last_name" content="Muth" />
  <meta name="description" content="My personal website / blog. You should check it out!" />
  <meta name="abstract" content="Hi, I'm Wendelin, I have a passion for software development and am curretly studying computer science at TU Wien." />
</svelte:head>

<h1>Welcome to my Website!</h1>
<hr style="width: 100%" />
<header>
  <article id="myself" itemscope itemtype="http://schema.org/Person" itemid="https://www.webindex.page/#myself">
    <h2>About Me</h2>
    <meta itemprop="name" content="Wendelin Muth" />
    <meta itemprop="url" content="https://www.webindex.page/" />
    Hi, I'm Wendelin<span class="waving-hand">👋</span>, I have a passion for software development and am curretly studying computer science at
    <a href="http://tuwien.at" target="_blank" rel="noreferrer noopener nofollow">TU Wien</a>.
    <br />
    You should check out my
    <a target="_blank" rel="noreferrer noopener nofollow" href="https://github.com/Qendolin/">GitHub</a>
    and
    <a target="_blank" rel="noreferrer noopener nofollow" href="https://www.linkedin.com/in/wendelin-muth">LinkedIn</a>.
    <br />
    If you want to get in touch, contact me via
    <a target="_blank" rel="noreferrer noopener nofollow" href="mailto:wendelin.muth+website@gmail.com">wendelin.muth+website@gmail.com</a>
    or Discord
    <a target="_blank" rel="noreferrer noopener nofollow" href="https://discord.com/users/qendolin_">@qendolin_</a>.
    <br />
    Here is a random song that I like:
    <button
      on:click={() => {
        randomSong$ = pickRandomSong();
      }}><span>🎲</span></button
    >
    {#await randomSong$}
      ...
    {:then title}
      <a href={`https://www.youtube.com/results?search_query=${title}`} target="_blank" rel="noopener noreferrer nofollow">{title}</a>
    {/await}
  </article>
</header>

<WallSection />

<section itemscope itemtype="https://schema.org/Blog">
  <h2>Blog</h2>
  <div class="blog-wrapper">
    {#await blogEntries$}
      <p>Loading...</p>
    {:then blogEntries}
      {#if blogEntries.length == 0}
        <p>Sorry, no entries exist.</p>
      {:else}
        <ol class="blog-entry-list" use:updateOverflowShadowsNextTick>
          {#if $user.claims?.admin}
            <li>
              <a href={`/admin/edit`} class="blog-entry-edit">Add Entry</a>
            </li>
          {/if}
          {#each blogEntries as entry}
            <li class="blog-entry-item">
              <article class="blog-entry" itemprop="blogPost" itemscope itemtype="https://schema.org/BlogPosting">
                <meta itemprop="author" itemtype="http://schema.org/Person" itemscope itemref="myself" />
                <section class="blog-entry-header">
                  <span class="blog-entry-heading" itemprop="headline">
                    <a href={`/entry/${entry.slug}`} class="blog-entry-link">
                      <h2>{entry.title}</h2>
                    </a>
                    {#if $user.claims?.admin}
                      <a href={`/admin/edit?id=${entry._id}`} class="blog-entry-edit">Edit</a>
                    {/if}
                  </span>
                  <span class="blog-entry-time">
                    <time datetime={entry.created_date.toISOString()} itemprop="datePublished">
                      {longDate.format(entry.created_date)} UTC
                    </time>
                    {#if entry.modified_date.getTime() - entry.created_date.getTime() > 1000 * 60 * 10}
                      &mdash; Edited
                      <time datetime={entry.modified_date.toISOString()} itemprop="dateModified">
                        {shortDate.format(entry.modified_date)}
                      </time>
                    {/if}
                  </span>
                </section>
                <section class="blog-entry-body" data-overflowing="false">
                  <div class="blog-entry-overflow-overlay">
                    <a itemprop="url" href={`/entry/${entry.slug}`} class="blog-entry-overflow-link">Read Full Post</a>
                  </div>
                  <div itemprop="articleBody">
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
  <h2>See also <button class="lufia-secret-button" on:click={openLufiaSecret}>Click Me!</button></h2>
  <h3>My other stuff</h3>
  <ul>
    <li>
      Shadertoy: Pixel shader sandbox - <a href="https://www.shadertoy.com/user/Qendolin" target="_blank" rel="noopener noreferrer">
        www.shadertoy.com/user/Qendolin
      </a>
    </li>
    <li>GitHub: Open source projects - <a href="https://github.com/Qendolin/" target="_blank" rel="noopener noreferrer">github.com/Qendolin</a></li>
    <li>Modrinth: Minecraft mods - <a href="https://modrinth.com/user/qendolin" target="_blank" rel="noopener noreferrer">modrinth.com/user/qendolin</a></li>
  </ul>
  <h3>The personal websites of my friends!</h3>
  <ul>
    <li>
      Eduard Beke, Software Developer - <a href="https://eduard.beke.at/" target="_blank" rel="noopener noreferrer">eduard.beke.at</a>
    </li>
    <li>
      Maximilian Mayrhofer, Software Developer - <a href="https://theblueone.dev/" target="_blank" rel="noopener noreferrer">theblueone.dev</a>
    </li>
  </ul>
  <h3>Websites that deserve attention</h3>
  <ul>
    <li>SS64, Command line reference - <a href="https://ss64.com/" target="_blank" rel="noopener noreferrer">ss64.com</a></li>
  </ul>
</section>

<style>
  .blog-wrapper {
    max-height: 80vh;
    overflow: auto;
    contain: content;
    border: 4px double var(--accent-background-color);
    padding: 4px;
    scrollbar-width: thin;
    overflow: overlay;
  }

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
    background-position: bottom 22px left;
    background-size: 8px 48px;
    image-rendering: pixelated;
    z-index: 1;
  }

  :is(:root[data-theme='dark'] .blog-entry-overflow-overlay) {
    background-image: url('/img/dither-24-dark.png');
  }

  .blog-entry-body:is([data-overflowing='true']) .blog-entry-overflow-overlay {
    display: block;
  }

  .blog-wrapper::-webkit-scrollbar {
    width: 0.75rem;
  }
  .blog-wrapper::-webkit-scrollbar-thumb {
    background-clip: padding-box;
    background-color: #7f7f7fa0;
    border: 3px solid rgba(0, 0, 0, 0);
    border-radius: 10rem;
  }
  .blog-wrapper::-webkit-scrollbar-track {
    position: absolute;
    background: transparent;
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

  .waving-hand:hover {
    display: inline-block;
    animation-name: wave-hand;
    animation-duration: 0.4s;
    animation-timing-function: ease-in-out;
    animation-iteration-count: infinite;
    animation-direction: alternate;
    transform: rotate(0);
    transform-origin: 50% 90%;
    animation-fill-mode: both;
  }

  @keyframes wave-hand {
    from {
      transform: rotate(-10deg);
    }
    to {
      transform: rotate(10deg);
    }
  }

  .lufia-secret-button {
    background-color: transparent;
    border: none;
    color: var(--background-color);
    cursor: unset;
  }
</style>
