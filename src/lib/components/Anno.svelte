<script>
  const uid = $props.id();
  let { children, hint } = $props();
  const id = `anno-${uid}`;
</script>

<span class="anchor" tabindex="0" role="button" aria-haspopup="true" aria-describedby={id} style="anchor-name: --{id};">
  {@render children()}

  <span {id} class="popover" role="tooltip" aria-live="polite" style="position-anchor: --{id};">
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
    position: fixed;
    position-area: top center;
    margin-bottom: 8px;

    width: max-content;
    max-width: 250px;
    padding: 6px 10px;
    background: #222;
    color: #fff;
    border-radius: 4px;
    font-size: 13px;
    line-height: 1.4;

    visibility: hidden;
    opacity: 0;
    transition: opacity 0.15s ease-out;
    pointer-events: none;
    z-index: 100;
  }

  .anchor:hover .popover,
  .anchor:focus .popover {
    visibility: visible;
    opacity: 1;
  }

  @supports (position-try-fallbacks: flip-block) {
    .popover {
      position-try-fallbacks: flip-block, flip-inline;
    }
  }
</style>
