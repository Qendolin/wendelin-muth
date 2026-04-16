<script lang="ts">
  import type { SvelteHTMLElements } from 'svelte/elements';

  let { id: pollId, class: classes, ...rest }: { id: string } & SvelteHTMLElements['div'] = $props();

  const SERVER_URL = 'https://wendelin-muth.wendelin-muth.workers.dev';

  type Option = {
    id: number;
    text: string;
    votes: number;
  };

  let options = $state<Option[]>([]);
  let selectedOptions = $state<number[]>([]);
  let userId = $state<string>('');
  let loading = $state(true);
  let submitting = $state(false);
  let hasSubmitted = $state(false);

  // Derived state for totals and percentages
  let totalSubmissions = $derived(options.reduce((acc, opt) => acc + opt.votes, 0));

  $effect(() => {
    let storedId = localStorage.getItem('poll_user_id');
    if (!storedId) {
      storedId = crypto.randomUUID();
      localStorage.setItem('poll_user_id', storedId);
    }
    userId = storedId;

    const savedChoices = localStorage.getItem(`poll_choices_${pollId}`);
    if (savedChoices) {
      selectedOptions = JSON.parse(savedChoices);
      hasSubmitted = true;
    }

    fetchPoll();
  });

  async function fetchPoll() {
    loading = true;
    try {
      const res = await fetch(`${SERVER_URL}/polls/${pollId}`);
      if (res.ok) {
        const data = await res.json();
        options = data.results;
      }
    } catch (e) {
      console.error('Error fetching poll:', e);
    } finally {
      loading = false;
    }
  }

  async function submitData() {
    if (selectedOptions.length === 0) return;
    submitting = true;
    try {
      const res = await fetch(`${SERVER_URL}/polls/${pollId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, optionIds: selectedOptions })
      });
      if (res.ok) {
        localStorage.setItem(`poll_choices_${pollId}`, JSON.stringify(selectedOptions));
        hasSubmitted = true;
        await fetchPoll();
      }
    } catch (e) {
      console.error('Error submitting:', e);
    } finally {
      submitting = false;
    }
  }

  function getPercentage(votes: number) {
    if (totalSubmissions === 0) return '0%';
    return Math.round((votes / totalSubmissions) * 100) + '%';
  }
</script>

<div class={['text-sm', classes]} {...rest}>
  {#if loading && options.length === 0}
    <p class="animate-pulse opacity-50">Loading poll...</p>
  {:else}
    <fieldset class="mb-2 grid grid-cols-3 gap-2" style="grid-template-columns: 1fr auto auto;">
      {#each options as option (option.id)}
        <label class="col-span-full grid grid-cols-subgrid items-center">
          <span class="">
            {option.text}
          </span>
          <span class="text-[10px] opacity-50">[{getPercentage(option.votes)}]</span>
          <div class="flex items-center justify-center">
            <input
              type="checkbox"
              value={option.id}
              bind:group={selectedOptions}
              class="peer h-4 w-4 cursor-pointer appearance-none rounded-none border border-black dark:border-white"
            />
            <div class="pointer-events-none absolute h-2.5 w-2.5 bg-black opacity-0 transition-opacity peer-checked:opacity-100 dark:bg-white"></div>
          </div>
        </label>
      {/each}
    </fieldset>
    <hr class="m-0" />
    <span class="mt-2 text-[10px] opacity-40">
      User-ID: {userId} &centerdot; Total: {totalSubmissions}
    </span>
    <div class="flex flex-col items-end gap-1">
      <button
        onclick={submitData}
        disabled={submitting || selectedOptions.length === 0}
        class="border-b border-black pb-0.5 transition-colors hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-20 dark:border-white dark:hover:bg-white dark:hover:text-black"
      >
        {submitting ? 'Submitting...' : hasSubmitted ? 'Re-Submit' : 'Submit'}
      </button>
    </div>
  {/if}
</div>
