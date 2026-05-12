<script lang="ts">
  import Link from './Link.static.svelte';
  import ImageBase from './ImageBase.static.svelte';
  import type { SourceProps } from '@unpic/svelte';
  import { resolveUrl } from './image-resolve';

  let {
    src,
    alt,
    caption = undefined as string | undefined,
    w = undefined as number | undefined,
    h = undefined as number | undefined,
    layout = undefined,
    proxy = undefined
  }: {
    src: string;
    alt?: string;
    caption?: string;
    w?: number;
    h?: number;
    layout?: SourceProps['layout'];
    proxy?: boolean;
  } = $props();
</script>

<div class="flex max-w-full justify-center overflow-hidden text-white">
  <figure class="group relative max-w-full rounded-md bg-white/5 shadow-md">
    <ImageBase {src} {alt} {w} {h} {layout} {proxy} />

    <div class="absolute top-2 right-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
      <Link
        href={resolveUrl(src)}
        class="flex h-6 w-6 items-center justify-center rounded bg-black/50 backdrop-blur-sm hover:bg-black/70"
        title="View original"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-4">
          <path
            fill-rule="evenodd"
            d="M4.25 5.5a.75.75 0 0 0-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75v-4a.75.75 0 0 1 1.5 0v4A2.25 2.25 0 0 1 12.75 17h-8.5A2.25 2.25 0 0 1 2 14.75v-8.5A2.25 2.25 0 0 1 4.25 4h5a.75.75 0 0 1 0 1.5h-5Z"
            clip-rule="evenodd"
          />
          <path
            fill-rule="evenodd"
            d="M6.194 12.753a.75.75 0 0 0 1.06.053L16.5 4.44v2.81a.75.75 0 0 0 1.5 0v-4.5a.75.75 0 0 0-.75-.75h-4.5a.75.75 0 0 0 0 1.5h2.553l-9.056 8.194a.75.75 0 0 0-.053 1.06Z"
            clip-rule="evenodd"
          />
        </svg>
      </Link>
    </div>

    {#if caption ?? alt}
      <figcaption class="absolute bottom-0 left-0 m-2 rounded bg-black/50 px-2 py-1 text-[12px] backdrop-blur-sm">
        {caption ?? alt}
      </figcaption>
    {/if}
  </figure>
</div>
