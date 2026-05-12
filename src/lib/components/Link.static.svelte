<script lang="ts">
  import { resolve } from '$app/paths';
  import type { Snippet } from 'svelte';
  import type { HTMLAnchorAttributes } from 'svelte/elements';
  let {
    href,
    children,
    class: clazz,
    ...props
  }: {
    href: string;
    children: Snippet;
    class?: string;
  } & HTMLAnchorAttributes = $props();
  let classes = $derived(['underline hover:text-blue-500', clazz]);
</script>

{#if href?.startsWith('http') ?? false}
  <a {href} class={classes} {...props} target="_blank" rel="noopener noreferrer external">{@render children?.()}</a>
{:else if href?.startsWith('mailto:') ?? false}
  <a {href} class={classes} {...props} rel="external">{@render children?.()}</a>
{:else}
  <a href={href?.startsWith('.') ? href : resolve(href as any)} class={classes} {...props}>{@render children?.()}</a>
{/if}
