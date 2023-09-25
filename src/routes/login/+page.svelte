<script lang="ts">
  import { goto } from '$app/navigation';
  import { auth$ } from '$lib/fire-context';
  import { user } from '$lib/stores';
  import { getRedirectResult, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup, signInWithRedirect } from 'firebase/auth';
  import { onMount } from 'svelte';

  onMount(() => {
    if ($user.auth) goto('/');
    auth$.then(async (auth) => {
      if (auth.currentUser) goto('/');
      const result = await getRedirectResult(auth);
      if (result) goto('/');
    });
  });

  let passwordVisible = false;
  let email = '';
  let password = '';

  let errorMessage = null as null | string;

  async function submitEmail() {
    const auth = await auth$;
    try {
      await signInWithEmailAndPassword(auth, email, password);
      goto('/');
    } catch (error: any) {
      errorMessage = error.message;
    }
  }

  const provider = new GoogleAuthProvider();
  async function submitGoogle() {
    const auth = await auth$;
    try {
      await signInWithPopup(auth, provider);
      goto('/');
    } catch (error: any) {
      errorMessage = error.message;
    }
  }
</script>

<h1>Account Log-in</h1>
<a href="/register">Register new Account</a>
<form on:submit|preventDefault={submitEmail}>
  {#if errorMessage}
    <p style="color: red">{errorMessage}</p>
  {/if}
  <label title="Email">
    <span aria-hidden="true">Email</span> <br />
    <input type="email" autocomplete="email" placeholder="max.mustermann@mail.com" required bind:value={email} />
  </label>
  <br />
  <label title="Password">
    <span aria-hidden="true">Password</span><br />
    {#if passwordVisible}
      <input type="text" autocomplete="current-password" placeholder="·······" minlength="8" bind:value={password} />
    {:else}
      <input type="password" autocomplete="current-password" placeholder="·······" minlength="8" bind:value={password} />
    {/if}

    <button class="link-button" on:click={() => (passwordVisible = !passwordVisible)} type="button"> {passwordVisible ? 'Hide' : 'Show'}</button>
  </label>
  <br />

  <button type="submit" class="link-button">Login</button>
</form>

<h2>Sign-In with Google</h2>

<div>
  <button on:click={submitGoogle} class="link-button">Continue with Google</button>
</div>
