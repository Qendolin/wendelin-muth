<script lang="ts">
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

<div>
  {#if action == 'edit'}
    <p>Edit your comment</p>
  {:else if auth.isSignedIn}
    <p>{lang.ing} as <strong>{auth.displayName}</strong></p>
  {:else if !auth.loading}
    <input type="text" bind:value={nameInput} placeholder="Your name" maxlength="32" disabled={busy} />
  {/if}

  <textarea bind:value={body} {placeholder} rows="4" disabled={busy} class="min-h-20 w-full resize-y"></textarea>

  <div>
    <button class="action-button" onclick={handleSubmit} disabled={busy || !body.trim() || (needsName && !nameInput.trim())}>
      {busy ? `${lang.ing}…` : lang.action}
    </button>
    {#if oncancel}
      <button class="action-button" onclick={oncancel} disabled={busy}>Cancel</button>
    {/if}
  </div>

  {#if error}
    <p role="alert">{error}</p>
  {/if}
</div>
