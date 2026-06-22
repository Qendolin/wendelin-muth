<script lang="ts">
  const { topics }: { topics: string[] } = $props();
</script>

<div class="topics-list">
  {#each topics ?? [] as t}
    <span class="topic-tag">{t}</span>
  {/each}
</div>

<style lang="postcss">
  @reference "$app.css";

  .topics-list {
    @apply my-2 flex flex-wrap gap-1 text-[10px];
  }

  .topic-tag {
    @apply border border-gray-200 px-1 text-gray-600 dark:border-[#333] dark:text-[#666];
  }
</style>
