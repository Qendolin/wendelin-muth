<script lang="ts">
  import { goto } from '$app/navigation';
  import { auth$ } from '$lib/fire-context';
  import {
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup
  } from 'firebase/auth';

  let passwordVisible = false;
  let email = '';
  let password = '';

  let errorMessage = null as null | string;

  async function submitEmail() {
    const auth = await auth$;
    try {
      await createUserWithEmailAndPassword(auth, email, password);
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

<h1>Account Registration</h1>

<p>Registering currently doesn't do anything, but I've planned support for comments.</p>

<h2>Register with Email</h2>

<form on:submit|preventDefault={submitEmail}>
  {#if errorMessage}
    <p style="color: red">{errorMessage}</p>
  {/if}
  <label title="Email">
    <span aria-hidden="true">Email</span> <br />
    <input
      type="email"
      autocomplete="email"
      placeholder="max.mustermann@mail.com"
      required
      bind:value={email}
    />
  </label>
  <br />
  <label title="Password">
    <span aria-hidden="true">Password</span><br />
    {#if passwordVisible}
      <input
        type="text"
        autocomplete="new-password"
        placeholder="·······"
        minlength="8"
        bind:value={password}
      />
    {:else}
      <input
        type="password"
        autocomplete="new-password"
        placeholder="·······"
        minlength="8"
        bind:value={password}
      />
    {/if}

    <button on:click={() => (passwordVisible = !passwordVisible)} type="button">
      {passwordVisible ? 'Hide' : 'Show'}</button
    >
  </label>
  <br />

  <button type="submit">Register</button>
</form>

<h2>Sign-In with Google</h2>

<button on:click={submitGoogle}>Sign-In</button>
