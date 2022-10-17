<script lang="ts">
  import { auth$ } from '$lib/fire-context';
  import type { User } from 'firebase/auth';

  let user = null as User | null;
  auth$.then((auth) =>
    auth.onAuthStateChanged((current) => {
      user = current;
    })
  );
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
<main id="main">
  <slot />
</main>
<footer id="footer">
  {#if user}
    <p>
      <span>Logged in as {user.displayName ?? user.email}</span>
      <button on:click={() => auth$.then((auth) => auth.signOut())}>Log Out</button>
    </p>
  {:else}
    <p>
      <a href="/login">Login</a> |
      <a href="/register">Register</a>
    </p>
  {/if}
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
  #main {
    grid-area: main;
  }
  #footer {
    grid-area: footer;
  }
</style>
