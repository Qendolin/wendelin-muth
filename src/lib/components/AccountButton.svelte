<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import { auth, notifications } from '$lib/stores.svelte';
  import AuthManage from './AuthManage.svelte';

  const { class: classes, ...rest }: HTMLButtonAttributes = $props();

  const hasUnread = $derived(auth.isSignedIn && notifications.unreadCount > 0);

  function handleToggle(event: ToggleEvent) {
    if (event.newState === 'open' && auth.uid) {
      void notifications.refresh();
    }
  }

  $effect(() => {
    if (auth.isSignedIn && auth.uid) {
      notifications.start();
    } else {
      notifications.stop();
    }
  });
</script>

<div class="relative inline-flex">
  <button id="account-btn" popovertarget="account-popover" type="button" aria-label="Open profile management" class={['account-btn btn-icon', classes]} {...rest}>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
      />
    </svg>
  </button>

  {#if hasUnread}
    <span class="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-red-500" aria-label="Unread notifications"></span>
  {/if}
</div>

<div id="account-popover" popover class="account-popover surface-popover m-0 w-100 p-6" ontoggle={handleToggle}>
  <AuthManage></AuthManage>
</div>

<style>
  .account-btn {
    anchor-name: --account-management;
  }
  .account-popover {
    position: absolute;
    inset: unset;
    margin: 0;

    position-anchor: --account-management;
    position-area: bottom span-right;

    /* Push the popover slightly away from the button */
    margin-block-start: 0.375rem;

    /* Prevent it from overflowing the viewport */
    position-try-fallbacks:
      flip-block,
      flip-inline,
      flip-block flip-inline;
  }

  .account-popover:not(:popover-open) {
    display: none;
  }
</style>
