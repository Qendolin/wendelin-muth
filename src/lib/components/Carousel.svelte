<script lang="ts">
  import { onMount, type Snippet } from 'svelte';
  import type { SvelteHTMLElements } from 'svelte/elements';

  let {
    children,
    count,
    ...rest
  }: {
    children: Snippet;
    count: number;
  } & SvelteHTMLElements['section'] = $props();

  let trackEl = $state<HTMLElement | null>(null);
  let current = $state(0);
  let proximity = $state(false);

  $effect(() => {
    if (!trackEl) return;
    for (let i = 0; i < trackEl.childElementCount; i++) {
      const element = trackEl.children[i];
      (element as HTMLElement).inert = i !== current;
    }
  });

  function goTo(index: number) {
    if (!trackEl || count === 0) return;
    const clamped = Math.max(0, Math.min(index, count - 1));
    (trackEl.children[clamped] as HTMLElement)?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    current = clamped;
  }

  function onScroll() {
    if (!trackEl) return;
    current = Math.round(trackEl.scrollLeft / trackEl.offsetWidth);
  }

  onMount(() => {
    if (!trackEl) return;
    trackEl.scrollLeft = 0;
    current = 0;
  });

  function onMouseMove(e: MouseEvent) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const relX = e.clientX - rect.left;
    proximity = relX < 120 || relX > rect.width - 120;
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goTo(current - 1);
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      goTo(current + 1);
    }
    if (e.key === 'Home') {
      e.preventDefault();
      goTo(0);
    }
    if (e.key === 'End') {
      e.preventDefault();
      goTo(count - 1);
    }
  }
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<section
  class="carousel"
  aria-label="Image carousel"
  aria-roledescription="carousel"
  onmousemove={onMouseMove}
  onmouseleave={() => (proximity = false)}
  onkeydown={onKeydown}
  {...rest}
>
  <div bind:this={trackEl} class="track" tabindex="0" role="group" onscroll={onScroll}>
    {@render children()}
  </div>

  {#if count > 1}
    <button class="nav nav-prev" class:visible={proximity && current > 0} aria-label="Previous slide" tabindex="-1" onclick={() => goTo(current - 1)}>
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>

    <button class="nav nav-next" class:visible={proximity && current < count - 1} aria-label="Next slide" tabindex="-1" onclick={() => goTo(current + 1)}>
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>

    <div class="dots" role="tablist" aria-label="Slides">
      {#each { length: count } as _, i}
        <button
          class="dot"
          class:active={i === current}
          role="tab"
          aria-selected={i === current}
          aria-label="Slide {i + 1}"
          tabindex={i === current ? 0 : -1}
          onclick={() => goTo(i)}
        ></button>
      {/each}
    </div>
  {/if}
</section>

<style lang="postcss">
  @reference '$app.css';

  .carousel {
    @apply relative w-full overflow-hidden;
  }

  .carousel:has(> .track:focus-visible) {
    @apply outline-2;
  }

  .track {
    @apply flex aspect-auto max-h-full max-w-full snap-x snap-mandatory overflow-x-scroll;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .track::-webkit-scrollbar {
    display: none;
  }

  /* Each slide: fixed 16/9 canvas, image centred and contained */
  .track > :global(*) {
    @apply flex aspect-auto w-full flex-none snap-start items-center justify-center overflow-hidden bg-black;
  }

  .nav {
    @apply pointer-events-none absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-0 bg-white/80 text-black opacity-0 backdrop-blur-md transition-[opacity,background-color,transform] duration-200 dark:bg-black/80 dark:text-white;
  }

  .nav svg {
    @apply h-5 w-5;
  }

  .nav-prev {
    @apply left-3;
  }
  .nav-next {
    @apply right-3;
  }

  .nav.visible {
    @apply pointer-events-auto opacity-100;
  }

  .nav:hover {
    @apply bg-white/95 dark:bg-black/95;
    transform: scale(1.08);
  }

  /* Always show on touch devices */
  @media (hover: none) {
    .nav {
      @apply pointer-events-auto opacity-70;
    }
    .dots {
      @apply opacity-70;
    }
  }

  .dots {
    @apply absolute bottom-3.5 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/30 px-2.5 py-1.5 opacity-0 backdrop-blur-sm transition-opacity duration-200 focus-within:opacity-100;
  }

  .carousel:hover {
    .dots {
      opacity: 100;
    }
  }

  .dot {
    @apply h-2 w-2 cursor-pointer rounded-full border-0 bg-white/45 p-0 transition-[background-color,transform,width] duration-200;
  }

  .dot.active {
    @apply w-5 rounded-sm bg-white;
  }

  .dot:not(.active):hover {
    @apply scale-125 bg-white/75;
  }
</style>
