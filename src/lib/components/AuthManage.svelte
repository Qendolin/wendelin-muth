<script lang="ts">
  import { auth } from '$lib/stores.svelte';
  import SignIn3 from './SignIn.svelte';
  import SignUp from './SignUp.svelte';

  let editingName = $state(false);
  let showUpgrade = $state(false);
  let nameInput = $state('');
  let nameError = $state<string | null>(null);

  // State to manage Signed out visual flow
  let authMode = $state<'signin' | 'signup'>('signup');

  function startEditingName() {
    nameInput = auth.displayName ?? '';
    editingName = true;
    nameError = null;
  }

  async function handleSaveName() {
    nameError = null;
    try {
      await auth.setDisplayName(nameInput);
      editingName = false;
    } catch (e) {
      nameError = String(e);
    }
  }
</script>

{#if auth.loading}
  <div class="text-zinc-600">Loading...</div>
{:else if auth.isSignedIn}
  <div class="space-y-4">
    <!-- User / Profile Edit Row -->
    <div class="flex min-h-8 items-center justify-between gap-4">
      {#if editingName}
        <div class="flex w-full items-center gap-3">
          <input
            type="text"
            class="input-base"
            bind:value={nameInput}
            placeholder="New name"
            maxlength="32"
            disabled={auth.updatingName}
            onkeydown={(e) => e.key === 'Enter' && handleSaveName()}
          />
          <button class="btn-link" onclick={handleSaveName} disabled={auth.updatingName}>
            {auth.updatingName ? '...' : 'Save'}
          </button>
          <button class="btn-link" onclick={() => (editingName = false)} disabled={auth.updatingName}> Cancel </button>
        </div>
      {:else}
        <div class="truncate">
          <span>Signed in as</span>
          <span class="truncate font-bold">{auth.displayName}</span>
        </div>
        <button class="shrink-0 text-zinc-500 underline hover:text-black dark:text-white" onclick={startEditingName}>Edit</button>
      {/if}
    </div>

    {#if nameError}
      <p role="alert" class="text-xs text-red-600 dark:text-red-400">{nameError}</p>
    {/if}

    <div class="border-t border-zinc-200 dark:border-zinc-800"></div>

    <!-- Anonymous Account Warning Statement -->
    {#if auth.isAnonymous}
      {#if !showUpgrade}
        <div class="space-y-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
          <p>You are using a temporary guest account. It will be lost if you sign out, clear browser cookies or switch devices.</p>
          <button class="block pt-0.5 font-bold text-black underline hover:no-underline dark:text-white" onclick={() => (showUpgrade = true)}>
            Secure this account
          </button>
        </div>
      {:else}
        <div class="py-1">
          <SignUp mode="link" onclose={() => (showUpgrade = false)} />
        </div>
      {/if}
      <hr class="border-zinc-200 dark:border-zinc-800" />
    {/if}

    <!-- Bottom Actions Matrix (De-prioritized ID string) -->
    <div class="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
      <span class="text-[10px] tracking-tight text-zinc-400 select-all dark:text-zinc-600">
        id: {auth.uid}
      </span>

      <button class="underline hover:text-black dark:hover:text-white" onclick={() => auth.signOut()}>Sign out</button>
    </div>
  </div>
{:else if authMode === 'signin'}
  <SignIn3 onswitch={() => (authMode = 'signup')} />
{:else}
  <SignUp mode="signup" onswitch={() => (authMode = 'signin')} />
{/if}
