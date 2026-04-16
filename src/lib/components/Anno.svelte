<script>
  let { children, hint } = $props();
  const id = `anno-${Math.random().toString(36).slice(2, 9)}`;
</script>

<span class="anchor" tabindex="0" role="button" aria-haspopup="true" aria-describedby={id}>
  {@render children()}

  <span {id} class="popover" role="tooltip" aria-live="polite">
    {hint}
  </span>
</span>

<style>
  .anchor {
    position: relative;
    display: inline-block;
    text-decoration: underline dotted;
    cursor: help;
    outline-offset: 2px;
  }

  .popover {
    position: absolute;
    bottom: 120%;
    left: 50%;
    transform: translateX(-50%);
    width: max-content;
    max-width: 250px;
    padding: 6px 10px;
    background: #222;
    color: #fff;
    border-radius: 4px;
    font-size: 13px;
    line-height: 1.4;

    /* Logic */
    visibility: hidden;
    opacity: 0;
    transition: opacity 0.15s ease-out;
    pointer-events: none;
    z-index: 100;
  }

  /* CSS Toggle */
  .anchor:hover .popover,
  .anchor:focus .popover {
    visibility: visible;
    opacity: 1;
  }
</style>
