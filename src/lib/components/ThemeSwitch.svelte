<script lang="ts">
  import { onMount } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';

  type Theme = 'light' | 'dark' | 'system';

  const STORAGE_KEY = 'theme';
  const VALID: Theme[] = ['light', 'dark', 'system'];

  function readStorage(): Theme {
    if (typeof localStorage === 'undefined') return 'system';
    const v = localStorage.getItem(STORAGE_KEY);
    return VALID.includes(v as Theme) ? (v as Theme) : 'system';
  }

  function readSystem(): 'light' | 'dark' {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  let preference = $state<Theme>(readStorage());
  let systemTheme = $state<'light' | 'dark'>(readSystem());

  let effectiveTheme = $derived<'light' | 'dark'>(preference === 'system' ? systemTheme : preference);

  $effect(() => {
    localStorage.setItem(STORAGE_KEY, preference);
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY, storageArea: localStorage }));
  });

  $effect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== STORAGE_KEY || !e.newValue) return;
      if (VALID.includes(e.newValue as Theme)) preference = e.newValue as Theme;
    }

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    function onMediaChange(e: MediaQueryListEvent) {
      systemTheme = e.matches ? 'dark' : 'light';
    }

    window.addEventListener('storage', onStorage);
    mq.addEventListener('change', onMediaChange);
    return () => {
      window.removeEventListener('storage', onStorage);
      mq.removeEventListener('change', onMediaChange);
    };
  });

  let mounted = $state(false);
  onMount(() => {
    mounted = true;
  });

  const options = [
    { value: 'system' as Theme, label: 'System' },
    { value: 'light' as Theme, label: 'Light' },
    { value: 'dark' as Theme, label: 'Dark' }
  ];

  const { class: classes, ...rest }: HTMLButtonAttributes = $props();

  export const prerender = false;
</script>

{#snippet sunIcon()}
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
    />
  </svg>
{/snippet}

{#snippet moonIcon()}
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
    />
  </svg>
{/snippet}

<!-- Anchor element -->
<button
  id="theme-toggle-btn"
  popovertarget="theme-popover"
  type="button"
  aria-label="Change color theme"
  class={['theme-toggle-btn flex size-9 items-center justify-center opacity-0', classes]}
  class:opacity-100={mounted}
  {...rest}
>
  {#if effectiveTheme === 'dark'}
    {@render moonIcon()}
  {:else}
    {@render sunIcon()}
  {/if}
</button>

<!-- Popover -->
<div
  id="theme-popover"
  popover
  class="theme-popover m-0 border
         border-black/10 bg-white p-1
         shadow-sm dark:border-white/10
         dark:bg-gray-900"
>
  {#each options as opt}
    <label
      class="flex cursor-pointer items-center gap-2.5 px-3
             py-2 text-sm text-gray-700 select-none
             hover:bg-gray-100 has-checked:bg-gray-100
             dark:text-gray-300 dark:hover:bg-white/10
             dark:has-checked:bg-white/10"
    >
      <input
        type="radio"
        name="theme-preference"
        value={opt.value}
        checked={preference === opt.value}
        onchange={() => (preference = opt.value)}
        class="sr-only"
      />

      <span class="flex size-4 shrink-0 items-center justify-center">
        {#if opt.value === 'system'}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25"
            />
          </svg>
        {:else if opt.value === 'light'}
          {@render sunIcon()}
        {:else}
          {@render moonIcon()}
        {/if}
      </span>

      {opt.label}
    </label>
  {/each}
</div>

<style>
  /* ── Anchor positioning ─────────────────────────────────────────────── */
  .theme-toggle-btn {
    anchor-name: --theme-toggle;
  }

  .theme-popover {
    /*
      Reset the popover top-layer defaults so anchor positioning takes over.
      `inset: unset` clears the UA-set inset values; `margin: 0` removes
      any centring margin the browser adds for popover elements.
    */
    position: absolute;
    inset: unset;
    margin: 0;

    position-anchor: --theme-toggle;
    position-area: bottom span-right;

    /* Push the popover slightly away from the button */
    margin-block-start: 0.375rem;

    /* Prevent it from overflowing the viewport */
    position-try-fallbacks:
      flip-block,
      flip-inline,
      flip-block flip-inline;
  }

  /* Keep default popover transition intact but allow custom overrides */
  .theme-popover:not(:popover-open) {
    display: none;
  }
</style>
