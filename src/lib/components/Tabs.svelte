<script lang="ts" generics="T extends string">
  type TabOption = {
    value: T;
    label: string;
  };

  let { 
    options, 
    selected = $bindable(),
    onchange,
    class: classes
  }: { 
    options: TabOption[]; 
    selected: T;
    onchange?: (val: T) => void;
    class?: string;
  } = $props();

  function select(val: T) {
    selected = val;
    onchange?.(val);
  }
</script>

<div role="tablist" class={['tab-list', classes]}>
  {#each options as opt}
    <button
      class="tab-btn"
      role="tab"
      aria-selected={selected === opt.value}
      onclick={() => select(opt.value)}
    >
      {opt.label}
    </button>
  {/each}
</div>
