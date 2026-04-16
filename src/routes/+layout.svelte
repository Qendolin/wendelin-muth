<script lang="ts">
  import './app.css';
  import Link from '$lib/components/Link.svelte';
  import { onMount } from 'svelte';
  import { addBackgroundEffect } from '$lib/background-effect';
  import ThemeSwitch from '$lib/components/ThemeSwitch.svelte';
  import CurrentDate from '$lib/components/CurrentDate.svelte';
  import NavBar from '$lib/components/NavBar.svelte';
  import { page } from '$app/state';
  import { PUBLIC_BASE_URL, PUBLIC_BUILD_TIMESTAMP } from '$env/static/public';
  import BuildDate from '$lib/components/BuildDate.svelte';

  let { children } = $props();

  const canonicalUrl = new URL(page.url.pathname, PUBLIC_BASE_URL).href;

  onMount(() => {
    addBackgroundEffect();
  });
</script>

<svelte:head>
  <link rel="canonical" href={canonicalUrl} />
</svelte:head>

<div class="root mx-2 md:mx-12">
  <div style="grid-area: header;">
    <header class="flex h-14 items-center justify-between text-sm tracking-widest md:grid md:h-16 md:grid-cols-3 md:items-center">
      <span class="hidden text-gray-500 uppercase md:block md:justify-self-start">
        <CurrentDate />
      </span>

      <NavBar class="md:justify-self-center" />

      <ThemeSwitch class="md:justify-self-end" />
    </header>
    <hr class="m-0" />
    <hr class="mt-0.5 mb-0" />
  </div>

  <main style="grid-area: main;">
    {@render children()}
  </main>

  <!-- <footer style="grid-area: footer;" class="mt-8">
    <hr class="m-0" />
    <hr class="mt-0.5 mb-8" />
    <p>
      &copy; 2026 Wendelin Muth. Content: <Link href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0.</Link> Code: <Link
        href="https://www.mozilla.org/media/MPL/2.0/index.txt">MPL-2.0</Link
      >.
    </p>
    <p>
      Source code on <Link href="https://github.com/Qendolin/wendelin-muth">GitHub</Link>.
    </p>
    <p>
      Looking for the old page? I've archived it at <Link href="https://old.webindex.page">old.webindex.page</Link>.
    </p>
  </footer> -->
  <footer style="grid-area: footer;" class="mt-8 pb-4 text-sm">
    <hr class="m-0" />
    <hr class="mt-0.5 mb-4" />

    <div class="flex flex-col gap-6 text-sm opacity-70 md:flex-row md:items-end md:justify-between">
      <div class="space-y-2">
        <p>&copy; 2026 Wendelin Muth</p>
        <p>
          Content: <Link href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</Link>
        </p>
        <p>
          Code: <Link href="https://www.mozilla.org/media/MPL/2.0/index.txt">MPL-2.0</Link>
        </p>
      </div>

      <div class="space-y-2 md:text-right">
        <p>
          Built <BuildDate />
        </p>
        <p>
          Source code on <Link href="https://github.com/Qendolin/wendelin-muth">GitHub</Link>
        </p>
        <p>
          Looking for the old page? <Link href="https://old.webindex.page">old.webindex.page</Link>
        </p>
      </div>
    </div>
  </footer>
</div>

<style>
  .root {
    display: grid;
    grid-template:
      'left header right' auto
      'left main right' 1fr
      'left footer right' auto / 1fr minmax(0, 1280px) 1fr;
    min-height: 100lvh;
  }
</style>
