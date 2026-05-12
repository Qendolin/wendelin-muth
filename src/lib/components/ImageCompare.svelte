<script lang="ts">
  // svelte-static:ignore
  import Link from './Link.static.svelte';
  // svelte-static:ignore
  import ImageBase from './ImageBase.static.svelte';
  import { resolveUrl } from './image-resolve';

  let {
    before,
    after,
    altBefore = 'Before',
    altAfter = 'After',
    captionBefore = altBefore,
    captionAfter = altAfter,
    w = undefined as number | undefined,
    h = undefined as number | undefined
  }: {
    before: string;
    after: string;
    altBefore?: string;
    altAfter?: string;
    captionBefore?: string;
    captionAfter?: string;
    w?: number;
    h?: number;
  } = $props();

  let sliderPos = $state(50);
  let container: HTMLElement;

  // Handle dragging logic without an input overlay
  function handlePointer(e: PointerEvent) {
    if (e.buttons !== 1) return; // Only trigger if primary button is held
    const rect = container.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    sliderPos = (x / rect.width) * 100;
  }
</script>

<figure
  bind:this={container}
  onpointermove={handlePointer}
  onpointerdown={handlePointer}
  class="group relative mx-auto table max-w-full touch-none overflow-hidden rounded-md bg-black/5 shadow-md select-none"
  style:width={w ? `${w}px` : '100%'}
  style:aspect-ratio={w && h ? `${w}/${h}` : 'auto'}
>
  <ImageBase src={after} alt={altAfter} class="pointer-events-none block h-auto w-full" loading="lazy" />
  <div class="pointer-events-none absolute inset-0" style:clip-path="inset(0 {100 - sliderPos}% 0 0)">
    <ImageBase src={before} alt={altBefore} class="block h-full w-full object-cover" />
  </div>

  <div class="absolute top-2 left-2 z-30 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
    <Link
      href={resolveUrl(before)}
      target="_blank"
      class="flex h-6 w-6 items-center justify-center rounded bg-black/50 text-white backdrop-blur-sm hover:bg-black/70"
      title="View original before"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"><path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></svg
      >
    </Link>
  </div>
  <div class="absolute top-2 right-2 z-30 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
    <Link
      href={resolveUrl(after)}
      target="_blank"
      class="flex h-6 w-6 items-center justify-center rounded bg-black/50 text-white backdrop-blur-sm hover:bg-black/70"
      title="View original after"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"><path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></svg
      >
    </Link>
  </div>

  <div class="pointer-events-none absolute top-0 bottom-0 z-20 w-1 bg-white shadow-lg" style:left="{sliderPos}%">
    <div
      class="absolute top-1/2 left-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full bg-white shadow-md"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="text-gray-600"
      >
        <path d="m8 18-5-6 5-6" /><path d="m16 6 5 6-5 6" />
      </svg>
    </div>
  </div>

  <figcaption>
    <div
      class="absolute bottom-2 left-2 z-10 max-w-2/5 rounded bg-black/50 px-2 py-1 text-[9px] text-white backdrop-blur-sm select-text md:text-[12px]"
      aria-label="before caption"
    >
      {captionBefore}
    </div>
    <div
      class="absolute right-2 bottom-2 z-10 max-w-2/5 rounded bg-black/50 px-2 py-1 text-[9px] text-white backdrop-blur-sm select-text md:text-[12px]"
      aria-label="after caption"
    >
      {captionAfter}
    </div>
  </figcaption>
</figure>
