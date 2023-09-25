<script lang="ts">
  import { comments, user, page, type Comment } from '$lib/stores';
  import { createEventDispatcher, onDestroy, onMount } from 'svelte';

  export let comment: Comment | null = null;
  export let hints: boolean = false;

  let content = comment ? comment.body : '';

  const getKey = () => `comment-temp_${page.get()!._id}`;

  function persistContent() {
    if (comment) return;
    sessionStorage.setItem(getKey(), content);
  }

  let autoSaveInterval: NodeJS.Timer;
  onMount(() => {
    const persisted = sessionStorage.getItem(getKey());
    if (persisted) {
      content = persisted;
    }

    autoSaveInterval = globalThis.setInterval(persistContent, 1000);
  });
  onDestroy(() => {
    globalThis.clearInterval(autoSaveInterval);
  });

  const bbcode$ = (async () => {
    const [{ default: render }, { preset: preset }] = await Promise.all([import('$lib/bbcode/bbcode-renderer'), import('$lib/bbcode/bbcode-builder')]);
    return (bbcode: string) => render(bbcode, preset(), {});
  })();

  let preview = false;
  let previewContainer: HTMLElement;
  async function togglePreview() {
    const bbcode = await bbcode$;
    preview = !preview;
    if (preview) {
      globalThis.requestAnimationFrame(() => {
        previewContainer.innerHTML = '';
        try {
          const html = bbcode(content);
          previewContainer.append(html);
        } catch (error) {
          showPreviewError(error);
        }
      });
    }
  }

  function showPreviewError(error: any) {
    preview = true;
    requestAnimationFrame(() => {
      previewContainer.innerHTML = `<span style="color: red">${error}</span>`;
    });
  }

  let saving = false;
  const dispatch = createEventDispatcher();
  async function postComment() {
    if (!$user?.auth?.uid) return;
    saving = true;

    const bbcode = await bbcode$;
    try {
      bbcode(content);
    } catch (error) {
      showPreviewError(error);
      saving = false;
      return;
    }

    if (comment) {
      await comments.update(comment._id, content);
      comment.body = content;
      dispatch('close');
    } else {
      await comments.post(content);
      content = '';
    }

    saving = false;
  }

  function cancel() {
    dispatch('close');
  }
</script>

<div class="comment-box">
  <div class="comment-box-container">
    {#if preview}
      <div class="comment-box-preview-area" bind:this={previewContainer} />
    {:else}
      <textarea class="comment-box-edit-area" placeholder="Write a comment..." bind:value={content} readonly={saving} />
    {/if}
    <button class="link-button" style="float: left" on:click={togglePreview}>
      {preview ? 'Edit' : 'Preview'}
    </button>

    <button class="link-button" style="float: right" disabled={content.trim() == '' || saving} on:click={postComment}>
      {comment ? 'Update Comment' : 'Post Comment'}
    </button>
    {#if comment}
      <button class="link-button" style="float: right" disabled={content.trim() == '' || saving} on:click={cancel}> Cancel </button>
    {/if}
  </div>
  {#if hints}
    <details>
      <summary> You can use BBCode in comments. </summary>
      <table class="comment-box-reference">
        <tbody>
          <tr><td> <b>Bold</b> </td> <td> <code>[b]text[/b]</code> </td></tr>
          <tr><td> <i>Italic</i> </td> <td> <code>[i]text[/i]</code> </td></tr>
          <tr>
            <td> <span style="text-decoration: underline;">Underline</span> </td>
            <td> <code>[u]text[/u]</code> </td>
          </tr>
          <tr><td> <s>Strikethrough</s> </td> <td> <code>[s]text[/s]</code> </td></tr>
          <tr><td> Color </td> <td> <code>[color=&lt;color&gt;]text[/color]</code> </td></tr>
          <tr><td> Quote </td> <td> <code>[quote]text[/quote]</code> </td></tr>
          <tr><td> Spoiler </td> <td> <code>[spoiler]text[/spoiler]</code> </td></tr>
          <tr><td> Url </td> <td> <code>[url=&lt;url&gt;]text[/url]</code> </td></tr>
          <tr
            ><td> Image </td>
            <td> <code>[img width=&lt;px&gt; height=&lt;px&gt;]&lt;url&gt;[/img]</code> </td></tr
          >
          <tr><td> Code </td> <td> <code>[code]text[/code]</code> </td></tr>
          <tr><td> Line Break </td> <td> <code>[br][/br]</code> </td></tr>
        </tbody>
      </table>
    </details>
  {/if}
</div>

<style>
  .comment-box-container {
    max-width: 600px;
    width: 100%;
  }

  .comment-box-edit-area {
    resize: vertical;
    min-height: 100px;
    max-height: 300px;
    width: 100%;
    display: block;
    font: inherit;
    font-size: 0.75em;
  }

  .comment-box-preview-area {
    min-height: 100px;
    border: 1px solid;
    border-radius: 3px;
    width: 100%;
    padding: 2px;
  }

  .comment-box {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .comment-box-reference {
    display: grid;
    grid-template-columns: 1fr 1fr;

    position: absolute;
    z-index: 1;

    padding: 1rem;
    background-color: var(--background-color);
  }
  .comment-box-reference tbody {
    display: contents;
  }
  .comment-box-reference tr {
    display: contents;
  }
</style>
