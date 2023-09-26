<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';

  let visible = false;
  let playing = false;
  let timeOffset = 0;
  let duration = 0;
  let progress = 0;
  let volume = 25;
  let ctx: AudioContext | null = null;
  let srcNode: AudioBufferSourceNode, gainNode: GainNode, audio: AudioBuffer;
  let rafHandle: number;
  function show() {
    visible = true;
    if (!dialogElem.open) {
      dialogElem.showModal();
    }
  }

  let dialogElem: HTMLDialogElement;
  let imgElement: HTMLImageElement;
  onMount(() => {
    if (imgElement.complete) show();

    setTimeout(init, 1500);

    window.history.pushState({ closeLufiaSecret: true }, '');

    return () => {
      visible = false;
      ctx?.close();
      ctx = null;
      cancelAnimationFrame(rafHandle);
    };
  });

  async function init() {
    if (ctx != null) return;
    ctx = new AudioContext();
    ctx.resume();
    playing = ctx.state == 'running';
    ctx.addEventListener('statechange', () => {
      playing = ctx?.state == 'running';
    });
    gainNode = ctx.createGain();
    gainNode.connect(ctx.destination);
    setVolume(volume);

    audio = await fetch('/audio/lufia2-lastduel-start+loop.m4a')
      .then((resp) => resp.arrayBuffer())
      .then((buffer) => ctx!.decodeAudioData(buffer));

    if (ctx == null) return;
    duration = audio.duration;
    seek(ctx.currentTime);
    update();
  }

  function seek(time: number) {
    if (!ctx) return;
    srcNode?.stop();
    srcNode = ctx!.createBufferSource();
    srcNode.buffer = audio;
    srcNode.connect(gainNode);
    srcNode.loop = true;
    srcNode.loopStart = audio.duration * (3067813 / 6135626);
    srcNode.loopEnd = audio.duration;
    srcNode.start(ctx!.currentTime, time);
    timeOffset = ctx!.currentTime - time;
  }

  function pause() {
    ctx?.suspend();
    playing = false;
  }

  function resume() {
    if (ctx == null) {
      init();
      return;
    }
    ctx!.resume();
    playing = ctx != null && true;
  }

  function update() {
    progress = ctx!.currentTime - timeOffset;
    if (progress > srcNode.loopEnd) {
      progress -= srcNode.loopStart;
      progress %= srcNode.loopEnd - srcNode.loopStart;
      progress += srcNode.loopStart;
    }
    rafHandle = requestAnimationFrame(update);
  }

  const dispatch = createEventDispatcher();
  function onClose() {
    dispatch('close');
  }

  function onBack(ev: PopStateEvent) {
    if (ev.state.closeLufiaSecret) {
      window.history.replaceState(null, '');
      dialogElem.close();
    }
  }

  function setVolume(vol: number) {
    volume = vol;
    gainNode?.gain?.setValueAtTime(Math.pow(volume / 100, 2), ctx!.currentTime);
  }
</script>

<svelte:window on:popstate={onBack} />

<dialog class="lufia-secret-container" hidden={!visible} inert={!visible} bind:this={dialogElem} on:close={onClose}>
  <div class="lufia-secret-center">
    <div class="lufia-secret-title">
      <h1>Lufia II &ndash; Final Battle</h1>
      <h2>Arrangement by bisqwit</h2>
    </div>
    <picture class="lufia-secret-image">
      <source media="(max-width: 256px)" srcset="/img/lufia_2_title.png" />
      <source media="(max-width: 512px)" srcset="/img/lufia_2_title_2xBRZ.png" />
      <source media="(max-width: 1024px)" srcset="/img/lufia_2_title_4xBRZ.png" />
      <source media="(min-width: 1025px)" srcset="/img/lufia_2_title_6xBRZ.png" />
      <img src="/img/lufia_2_title_2xBRZ.png" on:load={() => show()} alt="Lufia 2 Title Screen" bind:this={imgElement} />
    </picture>
    <section class="lufia-secret-controls">
      <button class="lufia-secret-playpause" on:click={() => (playing ? pause() : resume())}>
        {#if playing}
          ❚❚
        {:else}
          ▶
        {/if}
      </button>

      <input
        type="range"
        class="lufia-secret-time"
        min="0"
        step="1"
        max={duration * 60}
        value={progress * 60}
        title="Time"
        on:input={(ev) => seek(ev.currentTarget.valueAsNumber / 60)}
      />
      <input
        type="range"
        class="lufia-secret-volume"
        min="0"
        max="100"
        step="1"
        title="Volume"
        value={volume}
        on:input={(ev) => setVolume(ev.currentTarget.valueAsNumber)}
      />
    </section>
  </div>
</dialog>

<style>
  .lufia-secret-container {
    position: fixed;
    inset: 0;
    z-index: 10;
    display: grid;
    grid-template-areas: 'stack';
    justify-content: center;
    background: transparent;
    border: none;
    padding: 0;
    overflow: visible;
  }

  .lufia-secret-container::backdrop {
    transition: background-color 1s ease-out;
    background-color: transparent;
  }

  .lufia-secret-container:not([hidden])::backdrop {
    background-color: rgba(0, 0, 0, 0.8);
  }

  .lufia-secret-center {
    width: 90vmin;
    height: 90vmin;
    grid-area: stack;
    display: grid;
    grid-template-areas: 'stack';
    margin-block: auto;
    transition: translate 1s ease-out 0.5s;
    translate: 0 100vh;
  }

  .lufia-secret-container:not([hidden]) .lufia-secret-center {
    translate: 0 0;
  }

  .lufia-secret-image {
    grid-area: stack;
    z-index: -1;
    display: flex;
    justify-content: center;
  }

  .lufia-secret-image img {
    max-width: 100%;
    max-height: 100%;
    object-fit: cover;
  }

  .lufia-secret-controls {
    height: 100%;
    width: 100%;
    grid-area: stack;
    margin-top: auto;
    display: grid;
    grid-template-areas:
      'playpause playpause'
      'time volume';
    grid-template-rows: auto 50px;
    grid-template-columns: auto minmax(80px, max-content);
    column-gap: 10px;
  }

  .lufia-secret-playpause {
    grid-area: playpause;
    color: white;
    background-color: transparent;
    border: none;
    margin: auto;
    width: 50vmin;
    height: 50vmin;
    border-radius: 100vmax;
    font-size: 20vmin;
    text-align: center;
    text-shadow: 0 0 20vmin black, 0 0 20vmin black, 0 0 20vmin black, 0 0 20px black;
    user-select: none;
    line-height: 20vmin;
    vertical-align: middle;
  }

  .lufia-secret-time {
    grid-area: time;
  }

  .lufia-secret-volume {
    grid-area: volume;
  }

  .lufia-secret-title {
    grid-area: stack;
    text-align: center;
    z-index: 1;
    padding-inline: 1rem;
    pointer-events: none;
    color: white;
  }

  .lufia-secret-title h1 {
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
    pointer-events: auto;
  }

  .lufia-secret-title h2 {
    font-size: 0.8rem;
    margin: 0;
    pointer-events: auto;
  }

  input[type='range'] {
    appearance: none;
    background: transparent;
    cursor: pointer;
  }

  input[type='range']::-webkit-slider-thumb {
    box-sizing: border-box;
    -webkit-appearance: none;
    border: 3px outset hsl(0, 0%, 60%);
    background: hsl(0, 0%, 60%);
    height: 25px;
    margin-top: -12.5px;
    width: 8px;
    border-radius: 0;
  }

  input[type='range']::-moz-range-thumb {
    box-sizing: border-box;
    border: 3px outset hsl(0, 0%, 60%);
    background: hsl(0, 0%, 60%);
    height: 25px;
    margin-top: -12.5px;
    width: 8px;
    border-radius: 0;
  }

  input[type='range']::-webkit-slider-runnable-track {
    box-sizing: border-box;
    height: 2px;
    border: 2px outset hsl(0, 0%, 42%);
  }

  input[type='range']::-moz-range-track {
    box-sizing: border-box;
    height: 2px;
    border: 2px outset hsl(0, 0%, 42%);
  }
</style>
