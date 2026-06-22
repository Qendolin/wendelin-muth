<script lang="ts">
  const { topics }: { topics: string[] } = $props();
</script>

<div class="my-2 flex flex-wrap gap-1">
  {#each topics ?? [] as t}
    <span class="tag">{t}</span>
  {/each}
</div>
