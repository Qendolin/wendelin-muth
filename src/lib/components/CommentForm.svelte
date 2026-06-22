<script lang="ts">
  import { browser } from '$app/environment';
  import { auth } from '$lib/stores.svelte';
  import Input from './Input.svelte';

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

<div class="my-2 flex flex-col gap-2">
  {#if action == 'edit'}
    <p class="m-0 text-content-muted">Edit your comment</p>
  {:else if action == 'post' || action == 'reply'}
    {#if auth.loading || !browser}
      <p class="m-0 text-content-muted">Loading...</p>
    {:else if auth.isSignedIn}
      <p class="m-0 text-content-muted">{lang.ing} as <strong class="text-content">{auth.displayName}</strong></p>
    {:else}
      <Input bind:value={nameInput} placeholder="Your name" maxlength={32} disabled={busy} class="max-w-90" />
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
    <p role="alert" class="text-error mt-2">{error}</p>
  {/if}
</div>
