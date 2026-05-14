<script lang="ts">
  import { auth } from '$lib/stores.svelte';

  type Props = {
    /**
     * 'link'   — upgrading an existing anonymous account (keeps uid + comments)
     * 'signin' — fresh sign-in for a returning linked user
     */
    mode: 'link' | 'signin';
    onclose?: () => void;
  };

  let { mode, onclose }: Props = $props();

  type Tab = 'google' | 'email';
  let tab = $state<Tab>('google');

  let email = $state('');
  let password = $state('');
  let error = $state<string | null>(null);

  async function handleGoogle() {
    error = null;
    try {
      if (mode === 'link') {
        await auth.linkWithGoogle();
      } else {
        await auth.signInWithGoogle();
      }
      onclose?.();
    } catch (e) {
      error = String(e);
    }
  }

  async function handleEmail() {
    error = null;
    try {
      if (mode === 'link') {
        await auth.linkWithEmail(email, password);
      } else {
        await auth.signInWithEmail(email, password);
      }
      onclose?.();
    } catch (e) {
      error = String(e);
    }
  }

  const title = mode === 'link' ? 'Save your account' : 'Sign in';
  const emailCta = mode === 'link' ? 'Link account' : 'Sign in';
  const googleCta = mode === 'link' ? 'Link Google account' : 'Sign in with Google';
</script>

<div>
  <h3>{title}</h3>

  {#if mode === 'link'}
    <p>Link a real account to keep access to your comments across devices and sessions. Your existing comments stay attributed to you.</p>
  {/if}

  <div role="tablist">
    <button
      role="tab"
      aria-selected={tab === 'google'}
      onclick={() => {
        tab = 'google';
        error = null;
      }}
    >
      Google
    </button>
    <button
      role="tab"
      aria-selected={tab === 'email'}
      onclick={() => {
        tab = 'email';
        error = null;
      }}
    >
      Email + password
    </button>
  </div>

  {#if tab === 'google'}
    <div role="tabpanel">
      <button onclick={handleGoogle} disabled={auth.linking}>
        {auth.linking ? 'Opening…' : googleCta}
      </button>
    </div>
  {:else}
    <div role="tabpanel">
      <label>
        Email
        <input type="email" bind:value={email} autocomplete={mode === 'link' ? 'new-password' : 'email'} disabled={auth.linking} />
      </label>
      <label>
        Password
        <input type="password" bind:value={password} autocomplete={mode === 'link' ? 'new-password' : 'current-password'} disabled={auth.linking} />
      </label>
      <button onclick={handleEmail} disabled={auth.linking || !email.trim() || !password}>
        {auth.linking ? 'Saving…' : emailCta}
      </button>
    </div>
  {/if}

  {#if error}
    <p role="alert">{error}</p>
  {/if}

  {#if onclose}
    <button onclick={onclose} disabled={auth.linking}>Cancel</button>
  {/if}
</div>
