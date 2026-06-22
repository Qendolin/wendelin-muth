<script lang="ts">
  import { auth } from '$lib/stores.svelte';

  type Props = {
    onswitch?: () => void;
  };

  let { onswitch }: Props = $props();

  type Tab = 'google' | 'email';
  let tab = $state<Tab>('google');

  let email = $state('');
  let password = $state('');
  let error = $state<string | null>(null);

  async function handleGoogle() {
    error = null;
    try {
      await auth.signInWithGoogle();
    } catch (e) {
      error = String(e);
    }
  }

  async function handleEmail(ev: SubmitEvent) {
    ev.preventDefault();
    error = null;
    try {
      await auth.signInWithEmail(email, password);
    } catch (e) {
      error = String(e);
    }
  }
</script>

<div>
  <h3 class="mt-0 mb-0 text-lg font-bold">Sign in</h3>

  {#if onswitch}
    <p class="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
      Don't have an account?
      <button class="font-bold text-black underline hover:no-underline dark:text-white" onclick={onswitch}>Sign up</button>
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
        {auth.linking ? 'Opening…' : 'Sign in with Google'}
      </button>
    </div>
  {:else}
    <div role="tabpanel" class="mt-4">
      <form class="flex flex-col gap-4" onsubmit={handleEmail}>
        <label class="flex flex-col gap-1 text-sm">
          Email
          <input type="email" class="input-base" bind:value={email} autocomplete="email" required disabled={auth.linking} />
        </label>
        <label class="flex flex-col gap-1 text-sm">
          Password
          <div class="flex">
            <input type="password" class="input-base w-full" bind:value={password} autocomplete="current-password" required disabled={auth.linking} />
          </div>
        </label>
        <button class="btn-primary mt-2 w-full py-2" type="submit" disabled={auth.linking || !email.trim() || !password}>
          {auth.linking ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  {/if}

  {#if error}
    <p role="alert" class="mt-4 text-sm text-red-500">{error}</p>
  {/if}
</div>
