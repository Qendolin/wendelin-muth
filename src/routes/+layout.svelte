<script lang="ts">
  import { page } from '$app/stores';
  import { auth$ } from '$lib/fire-context';
  import { user } from '$lib/stores';

  import '../global.css';
</script>

<svelte:head>
  <title>Wendelin's Homepage</title>
</svelte:head>
<noscript>
  <dialog open class="js-disabled-dialog">
    <form method="dialog">
      <strong><h2>This Website requires JavaScript to be enabled!</h2></strong>
      <p>Thank you for your understanding.</p>
      <button type="submit" autofocus>Ok</button>
    </form>
  </dialog>
</noscript>
<header id="header">
  {#if $page.routeId != ''}
    <a href="/">Go to Home</a>
  {/if}
</header>
<main id="main">
  <slot />
</main>
<footer id="footer">
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
    <a href="https://github.com/Qendolin/wendelin-muth" target="_blank" rel="noopener noreferrer">Source code on GitHub</a>
  </p>
</footer>

<style>
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
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
  }
</style>
