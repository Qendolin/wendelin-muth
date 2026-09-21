<script lang="ts">
  import { resolve } from '$app/paths';
  import type { Snippet } from 'svelte';
  import type { HTMLAnchorAttributes } from 'svelte/elements';
  let {
    href,
    children,
    class: clazz,
    rel,
    ...props
  }: {
    href: string;
    children: Snippet;
    class?: string;
  } & HTMLAnchorAttributes = $props();
  rel ??= '';
  let classes = $derived(['underline hover:text-blue-500', clazz]);
</script>

{#if href?.startsWith('http') ?? false}
  <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
  <a {href} class={classes} {...props} target="_blank" rel={'noopener noreferrer external ' + rel}>{@render children?.()}</a>
{:else if href?.startsWith('mailto:') ?? false}
  <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
  <a {href} class={classes} {...props} rel={'external ' + rel}>{@render children?.()}</a>
{:else}
  <!-- eslint-disable-next-line svelte/no-navigation-without-resolve @typescript-eslint/no-explicit-any -->
  <a href={href?.startsWith('.') ? href : resolve(href as any)} class={classes} {rel} {...props}>{@render children?.()}</a>
{/if}
