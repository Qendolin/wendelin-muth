<script lang="ts">
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import { crossfade } from 'svelte/transition';
  import type { SvelteHTMLElements } from 'svelte/elements';

  const { class: classes, ...rest }: SvelteHTMLElements['nav'] = $props();

  const [send, receive] = crossfade({
    duration: 300
  });

  const routes = {
    '/(app)': 'Home',
    '/(app)/project': 'Projects',
    '/(app)/blog': 'Blog',
    '/(app)/cv': 'CV'
  } as const;

  const paths = Object.keys(routes) as Array<keyof typeof routes>;

  function isActive(route: string) {
    return route === '/(app)' ? page.route.id === route : page.route.id?.startsWith(route);
  }
</script>

<nav class={['relative flex gap-4', classes ?? '']} {...rest}>
  {#each paths as path}
    {@const active = isActive(path)}
    <a href={resolve(path)} class="relative" aria-current={active ? 'page' : undefined}>
      {routes[path]}
      {#if active}
        <div in:receive={{ key: 'indicator' }} out:send={{ key: 'indicator' }} class="absolute bottom-0 left-0 h-0.5 w-full bg-current"></div>
      {/if}
    </a>
  {/each}
</nav>
