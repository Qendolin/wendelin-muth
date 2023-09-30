<script lang="ts">
  import { page } from '$app/stores';
  import { auth$ } from '$lib/fire-context';
  import { user } from '$lib/stores';
  import { onMount } from 'svelte';

  import { addBackgroundEffect } from '$lib/background-effect';

  type Theme = 'system' | 'light' | 'dark';

  const themes: Theme[] = ['system', 'light', 'dark'];
  let theme = (globalThis.localStorage?.getItem('theme') ?? 'system') as Theme;
  const themeQuery = globalThis.matchMedia?.('(prefers-color-scheme: dark)');
  themeQuery?.addEventListener('change', applyTheme);

  function applyTheme() {
    let preferredTheme = theme;
    if (theme == 'system') {
      preferredTheme = themeQuery.matches ? 'dark' : 'light';
    }
    document.documentElement.dataset.theme = preferredTheme;
  }

  function cycleTheme() {
    theme = themes[(themes.indexOf(theme) + 1) % themes.length];
    globalThis.localStorage?.setItem('theme', theme);
    applyTheme();
  }

  onMount(() => {
    addBackgroundEffect();
  });
</script>

<svelte:head>
  <title>Wendelin's Homepage</title>
</svelte:head>
<noscript>
  <dialog open class="js-disabled-dialog">
    <form method="dialog">
      <strong><h2>This Website requires JavaScript to be enabled!</h2></strong>
      <p>Thank you for your understanding.</p>
      <button type="submit">Close</button>
    </form>
  </dialog>
</noscript>
<header id="header">
  {#if $page?.route?.id != '/'}
    <a href="/">Go to Home</a>
  {/if}
</header>
<main id="main">
  <slot />
</main>
<footer id="footer">
  <hr style="width: 100%" />
  <div class="footer-wrapper">
    {#if $user?.auth}
      <p>
        <span>Logged in as {$user.auth.displayName ?? $user.auth.email}</span>
        <button class="link-button" on:click={() => auth$.then((auth) => auth.signOut())}> Log Out </button>
      </p>
    {:else}
      <p>
        <a href="/login">Login</a> |
        <a href="/register">Register</a>
      </p>
    {/if}
    <p>
      <button class="link-button" on:click={cycleTheme}>Theme: {theme}</button>
    </p>
    <p>
      <a href="https://github.com/Qendolin/wendelin-muth" target="_blank" rel="noopener noreferrer">Source code on GitHub</a>
    </p>
  </div>
</footer>

<style>
  @import '../global.css';
  @import '/static/fonts/CourierPrime/courier_prime.css';

  .js-disabled-dialog {
    position: fixed;
    inset: 0;
  }
  .js-disabled-dialog button[type='submit'] {
    float: right;
  }
  noscript:has([open].js-disabled-dialog) {
    position: fixed;
    inset: 0;
    background: #00000080;
  }
  #header {
    grid-area: header;
    width: 100%;
  }
  #main {
    grid-area: main;
    width: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  #footer {
    grid-area: footer;
  }

  .footer-wrapper {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
  }

  .footer-wrapper > * {
    flex-basis: 300px;
    flex-shrink: 0;
    flex-grow: 1;
    text-align: center;
    min-width: 300px;
    margin-block: 6px;
  }
</style>
