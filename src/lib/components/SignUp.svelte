<script lang="ts">
  import { auth } from '$lib/stores.svelte';
  import Input from './Input.svelte';
  import Tabs from './Tabs.svelte';

  type Props = {
    /**
     * 'link'   upgrading an existing anonymous account (keeps uid + comments)
     * 'signup' fresh sign-up for a new user
     */
    mode: 'link' | 'signup';
    onclose?: () => void;
    onswitch?: () => void;
  };

  let { mode, onclose, onswitch }: Props = $props();

  type Tab = 'google' | 'email';
  let tab = $state<Tab>('google');

  let name = $state('');
  let email = $state('');
  let password = $state('');
  let confirmPassword = $state('');
  let error = $state<string | null>(null);

  async function handleGoogle() {
    error = null;
    try {
      if (mode === 'link') {
        await auth.linkWithGoogle();
      } else {
        await auth.signInWithGoogle(); // Firebase handles sign in/up combined via Google popup
      }
      onclose?.();
    } catch (e) {
      error = String(e);
    }
  }

  async function handleEmail(ev: SubmitEvent) {
    ev.preventDefault();
    error = null;

    if (password !== confirmPassword) {
      error = 'Passwords do not match.';
      return;
    }

    try {
      if (mode === 'link') {
        await auth.linkWithEmail(email, password);
      } else {
        await auth.signUpWithEmail(email, password, name);
      }
      onclose?.();
    } catch (e) {
      error = String(e);
    }
  }

  const title = $derived(mode === 'link' ? 'Secure your account' : 'Sign up');
  const googleCta = $derived(mode === 'link' ? 'Link Google account' : 'Sign up with Google');
  const emailCta = $derived(mode === 'link' ? 'Link account' : 'Sign up');
</script>

<div>
  <h3 class="mt-0 mb-0 text-lg font-bold">{title}</h3>

  {#if mode === 'link'}
    <p class="mb-6 text-sm text-content-muted">
      Link a real account to keep access to your comments across devices and sessions. Your existing comments stay attributed to you.
    </p>
  {:else if onswitch}
    <p class="mb-4 text-sm text-content-muted">
      Already have an account?
      <button class="font-bold text-content underline hover:no-underline" onclick={onswitch}>Sign in</button>
    </p>
  {/if}

  <Tabs
    class="mt-4"
    options={[
      { value: 'google', label: 'Google' },
      { value: 'email', label: 'Email' }
    ]}
    bind:selected={tab}
    onchange={() => (error = null)}
  />

  {#if tab === 'google'}
    <div role="tabpanel" class="mt-4 flex flex-col gap-4">
      <button class="btn-primary w-full py-2" onclick={handleGoogle} disabled={auth.linking}>
        {auth.linking ? 'Opening…' : googleCta}
      </button>
    </div>
  {:else}
    <div role="tabpanel" class="mt-4">
      <form class="flex flex-col gap-4" onsubmit={handleEmail}>
        {#if mode === 'signup'}
          <Input label="Display Name" bind:value={name} required disabled={auth.linking} maxlength={32} />
        {/if}
        <Input label="Email" type="email" bind:value={email} autocomplete={mode === 'link' ? 'new-password' : 'email'} required disabled={auth.linking} />
        <Input label="Password" type="password" bind:value={password} autocomplete="new-password" required disabled={auth.linking} minlength={6} />
        <Input
          label="Confirm Password"
          type="password"
          bind:value={confirmPassword}
          autocomplete="new-password"
          required
          disabled={auth.linking}
          minlength={6}
        />
        <button class="btn-primary mt-2 w-full py-2" type="submit" disabled={auth.linking || !email.trim() || !password || (mode === 'signup' && !name.trim())}>
          {auth.linking ? 'Saving…' : emailCta}
        </button>
      </form>
    </div>
  {/if}

  {#if error}
    <p role="alert" class="text-error mt-4">{error}</p>
  {/if}

  {#if onclose}
    <div class="mt-4 border-t border-border-base pt-4">
      <button class="btn-link w-full" type="button" onclick={onclose} disabled={auth.linking}>Cancel</button>
    </div>
  {/if}
</div>
