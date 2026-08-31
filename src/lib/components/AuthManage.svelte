<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { auth, notifications, type Notification } from '$lib/stores.svelte';
  import SignIn3 from './SignIn.svelte';
  import SignUp from './SignUp.svelte';
  import Input from './Input.svelte';

  let editingName = $state(false);
  let showUpgrade = $state(false);
  let nameInput = $state('');
  let nameError = $state<string | null>(null);

  // State to manage Signed out visual flow
  let authMode = $state<'signin' | 'signup'>('signup');

  const dateFormat = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  function formatDate(date: Date): string {
    const delta = (Date.now() - date.getTime()) / 1000;
    if (delta < 60) return 'just now';
    if (delta < 3600) return dateFormat.format(-Math.round(delta / 60), 'minute');
    if (delta < 86400) return dateFormat.format(-Math.round(delta / 3600), 'hour');
    if (delta < 86400 * 365) return dateFormat.format(-Math.round(delta / 86400), 'day');
    return dateFormat.format(-Math.round(delta / (86400 * 365)), 'year');
  }

  function openNotification(n: Notification) {
    void notifications.markRead(n._id);
    const path = resolve(n.route as any);
    void goto(`${path}#comment-${n.comment_id}`);
  }

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

    <div class="flex items-center justify-between">
      <h3 class="m-0 text-sm font-semibold text-content">Notifications</h3>
      {#if notifications.unread.length > 0}
        <button class="btn-link text-xs" onclick={() => notifications.markAllRead()}>Mark all read</button>
      {/if}
    </div>

    <div class="max-h-48 overflow-y-auto">
      {#if notifications.loading}
        <p class="py-1 text-content-muted">Loading...</p>
      {:else if notifications.unread.length === 0}
        <p class="py-1 text-content-muted">No unread messages</p>
      {:else}
        <ul class="flex list-none flex-col">
          {#each notifications.unread as n (n._id)}
            <li>
              <button
                class="flex w-full flex-col items-start gap-0.5 rounded px-2 py-2 text-left hover:bg-neutral-600/20 dark:hover:bg-neutral-400/10"
                onclick={() => openNotification(n)}
              >
                <span class="flex w-full items-baseline justify-between gap-2">
                  <span class="truncate text-content"><strong>{n.from_name}</strong></span>
                  <time class="shrink-0 text-xs text-content-muted" datetime={n.created_date.toISOString()}>
                    {formatDate(n.created_date)}
                  </time>
                </span>
                <span class="line-clamp-2 w-full text-xs text-content-muted">{n.body}</span>
              </button>
            </li>
          {/each}
        </ul>
      {/if}
    </div>

    <hr class="border-border-base" />

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
