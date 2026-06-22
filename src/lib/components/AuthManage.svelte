<script lang="ts">
  import { auth } from '$lib/stores.svelte';
  import SignIn3 from './SignIn.svelte';
  import SignUp from './SignUp.svelte';
  import Input from './Input.svelte';

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
  <div class="text-content-muted">Loading...</div>
{:else if auth.isSignedIn}
  <div class="space-y-4">
    <div class="flex min-h-8 items-center justify-between gap-4">
      {#if editingName}
        <div class="flex w-full items-center gap-3">
          <Input
            class="grow"
            bind:value={nameInput}
            placeholder="New name"
            maxlength={32}
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
          <span class="pr-1 text-content-muted">Signed in as</span>
          <span class="truncate font-bold text-content">{auth.displayName}</span>
        </div>
        <button class="btn-link shrink-0" onclick={startEditingName}>Edit</button>
      {/if}
    </div>

    {#if nameError}
      <p role="alert" class="text-error">{nameError}</p>
    {/if}

    <div class="border-t border-border-base"></div>

    {#if auth.isAnonymous}
      {#if !showUpgrade}
        <div class="space-y-2 text-xs leading-relaxed text-content-muted">
          <p>You are using a temporary guest account. It will be lost if you sign out, clear browser cookies or switch devices.</p>
          <button class="block pt-0.5 font-bold text-content underline hover:no-underline" onclick={() => (showUpgrade = true)}> Secure this account </button>
        </div>
      {:else}
        <div class="py-1">
          <SignUp mode="link" onclose={() => (showUpgrade = false)} />
        </div>
      {/if}
      <hr class="border-border-base" />
    {/if}

    <div class="flex items-center justify-between text-content-muted">
      <span class="text-[10px] tracking-tight text-content-disabled select-all">
        id: {auth.uid}
      </span>
      <button class="btn-link" onclick={() => auth.signOut()}>Sign out</button>
    </div>
  </div>
{:else if authMode === 'signin'}
  <SignIn3 onswitch={() => (authMode = 'signup')} />
{:else}
  <SignUp mode="signup" onswitch={() => (authMode = 'signin')} />
{/if}
