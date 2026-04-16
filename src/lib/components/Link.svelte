<script lang="ts">
  import { resolve } from '$app/paths';
  let { href, children, ...props } = $props();
</script>

{#if href?.startsWith('http') ?? false}
  <a {href} {...props} target="_blank" rel="noopener noreferrer external">{@render children?.()}</a>
{:else if href?.startsWith('mailto:') ?? false}
  <a {href} {...props} rel="external">{@render children?.()}</a>
{:else}
  <a href={href?.startsWith('.') ? href : resolve(href)} {...props}>{@render children?.()}</a>
{/if}

<style lang="postcss">
  @reference '$app.css';

  a {
    @apply underline;
  }

  a:hover {
    @apply text-blue-500;
  }
</style>
