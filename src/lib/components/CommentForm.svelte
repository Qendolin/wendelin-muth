<script lang="ts">
  import { browser } from '$app/environment';
  import { auth } from '$lib/stores.svelte';

  type Action = 'post' | 'reply' | 'edit';

  type Props = {
    initialBody?: string;
    placeholder?: string;
    action: Action;
    onsubmit: (body: string, name?: string) => Promise<void>;
    oncancel?: () => void;
  };

  let { initialBody = '', placeholder = 'Write a comment…', action, onsubmit, oncancel }: Props = $props();

  // svelte-ignore state_referenced_locally
  let body = $state(initialBody);
  let nameInput = $state('');
  let busy = $state(false);
  let error = $state<string | null>(null);

  let lang = $derived(
    {
      post: {
        ing: 'Posting',
        action: 'Post Comment'
      },
      reply: {
        ing: 'Replying',
        action: 'Reply'
      },
      edit: {
        ing: 'Saving',
        action: 'Save'
      }
    }[action]
  );

  // True when the user isn't signed in yet and we need to collect a name
  const needsName = $derived(!auth.loading && !auth.isSignedIn);

  async function handleSubmit() {
    if (!body.trim()) return;
    if (needsName && !nameInput.trim()) return;

    busy = true;
    error = null;
    try {
      await onsubmit(body, needsName ? nameInput : undefined);
      body = '';
      nameInput = '';
    } catch (e) {
      error = String(e);
    } finally {
      busy = false;
    }
  }
</script>

<div class="my-2 flex flex-col">
  {#if action == 'edit'}
    <p class="text-muted mb-1">Edit your comment</p>
  {:else if action == 'post' || action == 'reply'}
    {#if auth.loading || !browser}
      <p class="text-muted mb-1">Loading...</p>
    {:else if auth.isSignedIn}
      <p class="text-muted mb-1">{lang.ing} as <strong class="text-black dark:text-white">{auth.displayName}</strong></p>
    {:else}
      <input type="text" class="input-base mb-1 max-w-90" bind:value={nameInput} placeholder="Your name" maxlength="32" disabled={busy} />
    {/if}
  {/if}

  <textarea bind:value={body} {placeholder} rows="4" disabled={busy} class="input-base min-h-24 resize-y"></textarea>

  <div class="mt-1 flex items-center gap-4">
    <button class="btn-primary" onclick={handleSubmit} disabled={busy || !body.trim() || (needsName && !nameInput.trim())}>
      {busy ? `${lang.ing}…` : lang.action}
    </button>

    {#if oncancel}
      <button class="btn-link" onclick={oncancel} disabled={busy}>Cancel</button>
    {/if}
  </div>

  {#if error}
    <p role="alert" class="mt-2 text-red-500">{error}</p>
  {/if}
</div>
