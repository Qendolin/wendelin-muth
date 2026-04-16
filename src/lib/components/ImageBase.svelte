<script lang="ts">
  import { building, dev } from '$app/environment';
  import { transform as wsrvTransform } from '$lib/misc/wsrv-transform';
  import type { SourceProps } from '@unpic/svelte';
  import { Image } from '@unpic/svelte/base';
  import type { HTMLImgAttributes } from 'svelte/elements';
  import { resolveBlurhash, resolveSize, resolveUrl } from './image-resolve';
  import { blurhashToCssGradientString } from '@unpic/placeholder';

  let {
    src: orgSrc,
    alt = orgSrc,
    w: orgW = undefined as number | undefined,
    h: orgH = undefined as number | undefined,
    layout = undefined,
    proxy = true,
    ...props
  }: {
    src: string;
    alt?: string;
    w?: number;
    h?: number;
    layout?: SourceProps['layout'];
    proxy?: boolean;
  } & HTMLImgAttributes = $props();

  // svelte-ignore state_referenced_locally
  if (building && orgSrc.startsWith('http') && !orgW && !orgH) {
    console.warn('Remote image "%s" without specified size!', orgSrc);
  }

  const src = $derived(resolveUrl(orgSrc));
  const useWsrv = $derived(!dev && proxy && src.startsWith('https://'));
  const [w, h] = $derived(resolveSize(orgSrc, orgW, orgH));
  const blurhash = $derived(resolveBlurhash(orgSrc));

  type ProviderOperations = NonNullable<SourceProps['operations']>;
  const operations: ProviderOperations['wsrv'] = {
    output: 'webp',
    q: 85
  };
</script>

<Image
  {src}
  {alt}
  {layout}
  width={w}
  height={h}
  background={blurhash ? blurhashToCssGradientString(blurhash) : '#00000020'}
  style={w ? `width: ${w}px; max-width: 100%` : ''}
  {...props}
  {operations}
  transformer={useWsrv ? wsrvTransform : undefined}
/>
