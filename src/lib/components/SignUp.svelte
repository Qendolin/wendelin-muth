<script lang="ts">
  import { auth } from '$lib/stores.svelte';

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
    <p class="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
      Link a real account to keep access to your comments across devices and sessions. Your existing comments stay attributed to you.
    </p>
  {:else if onswitch}
    <p class="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
      Already have an account?
      <button class="font-bold text-black underline hover:no-underline dark:text-white" onclick={onswitch}>Sign in</button>
    </p>
  {/if}

  <div role="tablist" class="tab-list mt-4">
    <button
      class="tab-btn"
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
      class="tab-btn"
      role="tab"
      aria-selected={tab === 'email'}
      onclick={() => {
        tab = 'email';
        error = null;
      }}
    >
      Email
    </button>
  </div>

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
          <label class="flex flex-col gap-1 text-sm">
            Display Name
            <input type="text" class="input-base" bind:value={name} required disabled={auth.linking} maxlength="32" />
          </label>
        {/if}
        <label class="flex flex-col gap-1 text-sm">
          Email
          <input
            type="email"
            class="input-base"
            bind:value={email}
            autocomplete={mode === 'link' ? 'new-password' : 'email'}
            required
            disabled={auth.linking}
          />
        </label>
        <label class="flex flex-col gap-1 text-sm">
          Password
          <div class="flex">
            <input type="password" class="input-base w-full" bind:value={password} autocomplete="new-password" required disabled={auth.linking} minlength="6" />
          </div>
        </label>
        <label class="flex flex-col gap-1 text-sm">
          Confirm Password
          <div class="flex">
            <input
              type="password"
              class="input-base w-full"
              bind:value={confirmPassword}
              autocomplete="new-password"
              required
              disabled={auth.linking}
              minlength="6"
            />
          </div>
        </label>
        <button class="btn-primary mt-2 w-full py-2" type="submit" disabled={auth.linking || !email.trim() || !password || (mode === 'signup' && !name.trim())}>
          {auth.linking ? 'Saving…' : emailCta}
        </button>
      </form>
    </div>
  {/if}

  {#if error}
    <p role="alert" class="mt-4 text-sm text-red-500">{error}</p>
  {/if}

  {#if onclose}
    <div class="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
      <button class="btn-link w-full" type="button" onclick={onclose} disabled={auth.linking}>Cancel</button>
    </div>
  {/if}
</div>
