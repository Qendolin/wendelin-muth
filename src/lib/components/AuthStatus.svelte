<script lang="ts">
  import { auth } from '$lib/stores.svelte';
  import SignIn from './SignIn.svelte';

  let editingName = $state(false);
  let showUpgrade = $state(false);
  let showSignIn = $state(false);
  let nameInput = $state('');
  let nameError = $state<string | null>(null);

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
  <!-- nothing — avoid layout shift -->
{:else if auth.isSignedIn}
  <div>
    <span>Signed in as <strong>{auth.displayName}</strong></span>

    {#if showUpgrade}
      <SignIn mode="link" onclose={() => (showUpgrade = false)} />
    {:else if editingName}
      <input
        type="text"
        bind:value={nameInput}
        placeholder="New display name"
        maxlength="32"
        disabled={auth.updatingName}
        onkeydown={(e) => e.key === 'Enter' && handleSaveName()}
      />
      <button onclick={handleSaveName} disabled={auth.updatingName}>
        {auth.updatingName ? 'Saving…' : 'Save'}
      </button>
      <button onclick={() => (editingName = false)} disabled={auth.updatingName}>Cancel</button>
      {#if nameError}<p role="alert">{nameError}</p>{/if}
    {:else}
      <button onclick={startEditingName}>Change name</button>
      {#if auth.isAnonymous}
        <button onclick={() => (showUpgrade = true)}>Save account</button>
      {/if}
      <button onclick={() => auth.signOut()}>Sign out</button>
    {/if}
  </div>
{:else}
  <!-- Signed out. CommentForm handles first-post account creation inline,
       but offer explicit sign-in for returning linked users. -->
  {#if showSignIn}
    <SignIn mode="signin" onclose={() => (showSignIn = false)} />
  {:else}
    <button onclick={() => (showSignIn = true)}>Sign in</button>
  {/if}
{/if}
