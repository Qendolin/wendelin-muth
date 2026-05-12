<script lang="ts">
  import type { PageProps } from './$types';
  import type { Thing, WithContext } from 'schema-dts';
  import Link from '$lib/components/Link.static.svelte';
  import ProjectFeaturedEntry from '$lib/components/ProjectFeaturedEntry.svelte';
  import BlogFeaturedEntry from '$lib/components/BlogFeaturedEntry.svelte';
  import Anno from '$lib/components/Anno.svelte';
  import Poll from '$lib/components/Poll.svelte';

  let { data }: PageProps = $props();

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
    hasCredential: {
      '@type': 'EducationalOccupationalCredential',
      name: 'Bachelor of Science in Computer Science',
      credentialCategory: 'degree',
      educationalLevel: 'Bachelor',
      about: {
        '@type': 'Thing',
        name: 'Computer Science'
      },
      recognizedBy: {
        '@type': 'EducationalOrganization',
        name: 'Technische Universität Wien',
        address: 'Karlsplatz 13, 1040 Wien',
        url: 'https://www.tuwien.at/'
      }
    },
    nationality: {
      '@type': 'Country',
      name: 'Austria'
    },
    alumniOf: {
      '@type': 'EducationalOrganization',
      address: 'Karlsplatz 13, 1040 Wien',
      name: 'Technische Universität Wien',
      url: 'https://www.tuwien.at/'
    },
    knowsLanguage: ['de', 'en']
  });
</script>

<svelte:head>
  <title>Wendelin's Homepage</title>

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
</svelte:head>

<section class="header-row">
  <div class="mt-5 mb-2">
    <h1 class="main-title">Wendelin<br />Muth</h1>
    <div class="header-meta-text">BSc Computer Science • Graphics Dev • Vienna</div>
  </div>
  <div class="header-info-links">
    <!-- Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.-->
    <Link href="https://github.com/Qendolin/">GitHub</Link>
    <svg class="inline-block" xmlns="http://www.w3.org/2000/svg" height="16" width="18" viewBox="0 0 512 512">
      <path
        fill="currentColor"
        d="M173.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3 .3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5 .3-6.2 2.3zm44.2-1.7c-2.9 .7-4.9 2.6-4.6 4.9 .3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM252.8 8c-138.7 0-244.8 105.3-244.8 244 0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1 100-33.2 167.8-128.1 167.8-239 0-138.7-112.5-244-251.2-244zM105.2 352.9c-1.3 1-1 3.3 .7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3 .3 2.9 2.3 3.9 1.6 1 3.6 .7 4.3-.7 .7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3 .7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3 .7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9s4.3 3.3 5.6 2.3c1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"
      />
    </svg>

    <Link href="https://www.linkedin.com/in/wendelin-muth/">LinkedIn</Link>
    <svg class="inline-block" xmlns="http://www.w3.org/2000/svg" height="16" width="18" viewBox="0 0 448 512">
      <path
        fill="currentColor"
        d="M416 32L31.9 32C14.3 32 0 46.5 0 64.3L0 447.7C0 465.5 14.3 480 31.9 480L416 480c17.6 0 32-14.5 32-32.3l0-383.4C448 46.5 433.6 32 416 32zM135.4 416l-66.4 0 0-213.8 66.5 0 0 213.8-.1 0zM102.2 96a38.5 38.5 0 1 1 0 77 38.5 38.5 0 1 1 0-77zM384.3 416l-66.4 0 0-104c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9l0 105.8-66.4 0 0-213.8 63.7 0 0 29.2 .9 0c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9l0 117.2z"
      />
    </svg>

    <Link href="https://discord.com/users/404663014932086784">Discord</Link>
    <svg class="inline-block" xmlns="http://www.w3.org/2000/svg" height="16" width="18" viewBox="0 0 576 512">
      <path
        fill="currentColor"
        d="M492.5 69.8c-.2-.3-.4-.6-.8-.7-38.1-17.5-78.4-30-119.7-37.1-.4-.1-.8 0-1.1 .1s-.6 .4-.8 .8c-5.5 9.9-10.5 20.2-14.9 30.6-44.6-6.8-89.9-6.8-134.4 0-4.5-10.5-9.5-20.7-15.1-30.6-.2-.3-.5-.6-.8-.8s-.7-.2-1.1-.2c-41.3 7.1-81.6 19.6-119.7 37.1-.3 .1-.6 .4-.8 .7-76.2 113.8-97.1 224.9-86.9 334.5 0 .3 .1 .5 .2 .8s.3 .4 .5 .6c44.4 32.9 94 58 146.8 74.2 .4 .1 .8 .1 1.1 0s.7-.4 .9-.7c11.3-15.4 21.4-31.8 30-48.8 .1-.2 .2-.5 .2-.8s0-.5-.1-.8-.2-.5-.4-.6-.4-.3-.7-.4c-15.8-6.1-31.2-13.4-45.9-21.9-.3-.2-.5-.4-.7-.6s-.3-.6-.3-.9 0-.6 .2-.9 .3-.5 .6-.7c3.1-2.3 6.2-4.7 9.1-7.1 .3-.2 .6-.4 .9-.4s.7 0 1 .1c96.2 43.9 200.4 43.9 295.5 0 .3-.1 .7-.2 1-.2s.7 .2 .9 .4c2.9 2.4 6 4.9 9.1 7.2 .2 .2 .4 .4 .6 .7s.2 .6 .2 .9-.1 .6-.3 .9-.4 .5-.6 .6c-14.7 8.6-30 15.9-45.9 21.8-.2 .1-.5 .2-.7 .4s-.3 .4-.4 .7-.1 .5-.1 .8 .1 .5 .2 .8c8.8 17 18.8 33.3 30 48.8 .2 .3 .6 .6 .9 .7s.8 .1 1.1 0c52.9-16.2 102.6-41.3 147.1-74.2 .2-.2 .4-.4 .5-.6s.2-.5 .2-.8c12.3-126.8-20.5-236.9-86.9-334.5zm-302 267.7c-29 0-52.8-26.6-52.8-59.2s23.4-59.2 52.8-59.2c29.7 0 53.3 26.8 52.8 59.2 0 32.7-23.4 59.2-52.8 59.2zm195.4 0c-29 0-52.8-26.6-52.8-59.2s23.4-59.2 52.8-59.2c29.7 0 53.3 26.8 52.8 59.2 0 32.7-23.2 59.2-52.8 59.2z"
      />
    </svg>
    <Link href="mailto:wendelin.muth+website@gmail.com">Gmail</Link>
    <svg class="inline-block" xmlns="http://www.w3.org/2000/svg" height="16" width="18" viewBox="0 0 512 512">
      <path
        fill="currentColor"
        d="M61.4 64C27.5 64 0 91.5 0 125.4 0 126.3 0 127.1 .1 128L0 128 0 384c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-256-.1 0c0-.9 .1-1.7 .1-2.6 0-33.9-27.5-61.4-61.4-61.4L61.4 64zM464 192.3L464 384c0 8.8-7.2 16-16 16L64 400c-8.8 0-16-7.2-16-16l0-191.7 154.8 117.4c31.4 23.9 74.9 23.9 106.4 0L464 192.3zM48 125.4C48 118 54 112 61.4 112l389.2 0c7.4 0 13.4 6 13.4 13.4 0 4.2-2 8.2-5.3 10.7L280.2 271.5c-14.3 10.8-34.1 10.8-48.4 0L53.3 136.1c-3.3-2.5-5.3-6.5-5.3-10.7z"
      />
    </svg>
  </div>
</section>
<hr class="mt-0" />

<div class="section">
  <section>
    <h2 class="mb-5 border-b border-gray-300 pb-2 text-xs tracking-[3px] text-gray-500 uppercase">About</h2>
    Hi, I'm Wendelin, tho I usually go by <Anno hint="It's the username that I chose when I was like 11 or so.">Qendolin</Anno> online. I'm a software / graphics
    dev with a bachelor's degree from TU Vienna, and tinkering with code is really one of my greatest passions. In the past I was into WebDev but nowadays I'm tending
    more toward lower level stuff with Go and C&NoBreak;+&NoBreak;+. <br />
    This website is basically a place for me to showcase my projects and share some of my thoughts and stuff, since I don't really use any social media.
  </section>

  <section>
    <h2 class="mb-5 flex justify-between border-b border-gray-300 pb-2 text-xs">
      <span class="tracking-[3px] text-gray-500 uppercase">Featured Projects</span><Link href="/project" class="translate-y-0.5 font-thin text-gray-500"
        >more ⇢</Link
      >
    </h2>
    <ol class="list-none">
      {#each data.projectsFeatured as p}
        <li class="group cursor-pointer">
          <ProjectFeaturedEntry project={p}></ProjectFeaturedEntry>
        </li>
      {/each}
    </ol>
  </section>
</div>

<div class="section">
  <section>
    <h2 class="mb-5 flex justify-between border-b border-gray-300 pb-2 text-xs">
      <span class="tracking-[3px] text-gray-500 uppercase">Featured Blog Posts</span><Link href="/blog" class="translate-y-0.5 font-thin text-gray-500"
        >more ⇢</Link
      >
    </h2>

    <ol class="list-none">
      {#each data.blogFeatured as e}
        <li class="group cursor-pointer">
          <BlogFeaturedEntry entry={e}></BlogFeaturedEntry>
        </li>
      {/each}
    </ol>
  </section>

  <section class="md:pt-17 md:pl-20 md:text-right">
    <h3 class="m-0 text-base font-bold">I'm curious, how did you find this page?</h3>
    <Poll id="referral-source" class="mt-2 min-h-50 min-w-80 px-4 md:ml-auto md:table md:px-0" />
    <p class="entry-desc">
      I spent way too much time on this poll feature. Why isn't there a single good, free poll service? The only one I found is "Polls API" but that one didn't
      work. StrawPoll doesn't have a useful API and only offers big, ugly embeds. This is now using Cloudflare Workers and their D1 DB. So please don't spam it
      🙏.
    </p>
  </section>
</div>

<style lang="postcss">
  @reference '$app.css';

  .header-row {
    @apply grid grid-cols-[1fr_auto] items-end gap-8;
  }

  .main-title {
    @apply mt-0 mb-5 text-4xl leading-none font-bold tracking-[-0.05em] text-gray-900 dark:text-white;
  }

  .header-meta-text {
    @apply mt-2 text-sm text-gray-500;
  }

  .header-info-links {
    @apply grid grid-cols-2 items-center gap-1 self-center text-right;
    grid-template-columns: max-content max-content;
  }

  .section {
    @apply mb-10 grid grid-cols-1 gap-8 md:grid-cols-2;
  }

  /* TODO: extract style */
  .entry-desc {
    @apply text-sm leading-relaxed text-gray-600 dark:text-[#888];
  }
</style>
