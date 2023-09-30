<script lang="ts">
  import '../../entry/[slug]/blogpost.css';
  import { db } from '$lib/fire-context';
  import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    DocumentReference,
    FieldValue,
    getDoc,
    getDocs,
    query,
    serverTimestamp,
    setDoc,
    Timestamp,
    where
  } from 'firebase/firestore/lite';
  import { onMount } from 'svelte';
  import { marked } from 'marked';
  import { afterNavigate, goto } from '$app/navigation';
  import { stripStorageToken, uploadStaticPublicFile } from '$lib/storage';
  import { getDownloadURL } from 'firebase/storage';
  import katex from 'katex';

  const blog = collection(db, 'blog');

  marked.setOptions({
    gfm: true
  });
  const renderer = new marked.Renderer();
  const linkRenderer = renderer.link;
  renderer.link = (href: string, title: string, text: string) => {
    const localLink = href.startsWith(`${location.protocol}//${location.hostname}`);
    const html = linkRenderer.call(renderer, href, title, text);
    return localLink ? html : html.replace(/^<a /, `<a target="_blank" rel="noreferrer noopener nofollow" `);
  };
  const imageRenderer = renderer.image;
  renderer.image = (href: string, title: string, text: string) => {
    const attribs = ' ' + (text.match(/\s*\|([^\|]*)$/)?.[1] ?? '') + ' ';
    const [, w, h] = attribs.match(/=(\d*)x(\d*)/) ?? [];
    const raw = attribs.match(/\sraw\s/) != null;
    const org = href;
    text = text.replace(/\s*\|[^\|]*$/, '');
    if (!raw) {
      href = `https://wsrv.nl/?url=${encodeURIComponent(href)}&output=webp&q=80&maxage=3M`;
      if (w || h) {
        if (w) href += `&w=${w}`;
        if (h) href += `&h=${h}`;
      }
    }
    let html = imageRenderer.call(renderer, href, title, text);
    html = html.replace(/^<img /, `<img loading="lazy" `);
    if (h) {
      html = html.replace(/^<img /, `<img height="${h}" `);
    }
    if (w) {
      html = html.replace(/^<img /, `<img width="${w}" `);
    }
    html = `<figure>${html}<figcaption><a target="_blank" rel="noreferrer noopener nofollow" href="${escape(org)}">${escape(text)}</a></figcaption></figure>`;
    return html;
  };

  function escape(text: string): string {
    return text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
  }

  let defaultEntry = {
    created_date: null as Timestamp | FieldValue | null,
    modified_date: null as Timestamp | FieldValue | null,
    body: '',
    body_raw: '',
    title: '',
    slug: '',
    draft: true
  };
  let entry: typeof defaultEntry;
  let docRef = null as DocumentReference | null;
  let loading = true;
  let preview = false;

  onMount(() => {
    load();
  });

  afterNavigate(() => {
    load();
  });

  const getParams = () => (globalThis.location ? new URLSearchParams(globalThis.location.search) : null);

  $: autoSlug = generateSlug(entry?.title);

  function load() {
    const params = getParams();
    if (params == null) return;
    const docId = params.get('id');
    if (docId != null) {
      docRef = doc(db, 'blog', params.get('id') as string);
      getDoc(docRef).then((doc) => {
        const data = doc.data();
        if (data) {
          entry = {
            ...(data as any)
          };
        }
        loading = false;
      });
    } else {
      docRef = null;
      entry = { ...defaultEntry };
      loading = false;
    }
  }

  function generateSlug(title: string) {
    return (title ?? '')
      .toLocaleLowerCase()
      .replaceAll(' ', '-')
      .replace(/\?\.\,/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/\-+$/g, '');
  }

  let drafts$ = getDocs(query(blog, where('draft', '==', true))).then((snapshot) => snapshot.docs.map((doc) => ({ ...doc.data(), _id: doc.id } as any)));

  let saving = false;
  async function saveEntry(updateDate: boolean) {
    saving = true;
    try {
      renderEntry();
      if (!entry.slug) {
        entry.slug = autoSlug;
      }
      if (updateDate) {
        if (!confirm('Are you sure to republish?')) {
          saving = false;
          return;
        }
        entry.modified_date = serverTimestamp();
      }
      if (docRef) {
        await setDoc(docRef, entry);
      } else {
        const ref = await addDoc(blog, entry);
        goto(`/admin/edit?id=${ref.id}`);
      }
    } catch (error) {
      alert('Error: ' + error);
    }
    saving = false;
  }

  function renderEntry() {
    let content = marked.parse(entry.body_raw, { renderer });
    content = content.replace(/\$\$([^$]+)\$\$/g, (_match, group) => {
      return katex.renderToString(group, { displayMode: true, output: 'html', fleqn: true });
    });
    content = content.replace(/\$([^$]+)\$/g, (_match, group) => {
      return katex.renderToString(group, { displayMode: false, output: 'html' });
    });
    entry.body = content;
  }

  function publishEntry() {
    entry.draft = false;
    entry.created_date = serverTimestamp();
    saveEntry(true);
  }

  function deleteEntry() {
    if (docRef != null) {
      deleteDoc(docRef);
      goto('/admin/edit');
    }
  }

  function onDraftSelect(ev: Event) {
    const id = (ev.currentTarget as HTMLSelectElement).value;
    if (!id) return;
    goto(`/admin/edit?id=${id}`);
  }

  function beforeUnload(event: Event) {
    event.preventDefault();
    event.returnValue = true;
    return true;
  }

  let textarea: HTMLTextAreaElement;

  async function handleFileUpload(ev: DragEvent) {
    ev.preventDefault();

    if (!ev?.dataTransfer?.files) return;

    let insertIndex = textarea.selectionEnd;
    if (document.activeElement != textarea) {
      insertIndex = entry.body_raw.length;
    }

    for (const file of ev.dataTransfer.files) {
      const ref = await uploadStaticPublicFile(file);
      const url = stripStorageToken(await getDownloadURL(ref));
      console.log("Uploaded '%s' to '%s'", file.name, url);
      const isMedia = file.type.startsWith('image/') || file.type.startsWith('video/') || file.type.startsWith('audio/');
      const text = ` ${isMedia ? '!' : ''}[${file.name}](${url})`;
      entry.body_raw = entry.body_raw.slice(0, insertIndex) + text + entry.body_raw.slice(insertIndex);
      insertIndex += text.length;
    }
  }
</script>

<svelte:window on:beforeunload={beforeUnload} />

{#if loading}
  <p>Loading....</p>
{:else}
  <label>
    Drafts
    <select name="docId" on:change={onDraftSelect}>
      <option value="">-- Select Draft --</option>
      {#await drafts$ then drafts}
        {#each drafts as draft}
          <option value={draft._id} selected={draft._id == getParams()?.get('id')}>{draft.title}</option>
        {/each}
      {/await}
    </select>
  </label>

  <form on:submit|preventDefault>
    <span class="edit-toolbar">
      <input type="text" name="title" placeholder="Title" required bind:value={entry.title} />
      <input type="text" name="slug" placeholder={autoSlug} bind:value={entry.slug} />
      <button
        type="button"
        on:click={() => {
          renderEntry();
          preview = !preview;
        }}
      >
        {preview ? 'Edit' : 'Preview'}
      </button>
      <button type="button" disabled={saving} on:click={() => saveEntry(false)}>Save</button>
      <button type="button" disabled={saving} on:click={() => saveEntry(true)}>Republish</button>
      <button type="button" disabled={saving || !entry.draft} on:click={publishEntry}>Publish</button>
      <button type="button" disabled={saving} on:click={deleteEntry}>Delete</button>
    </span>
    {#if preview}
      <section class="preview-area blog-entry-body">{@html entry.body}</section>
    {:else}
      <div style="display: contents" on:dragover|preventDefault on:drop={handleFileUpload} role="region">
        <section class="edit-area">
          <textarea class="edit-area" name="body_raw" placeholder="Content" bind:this={textarea} bind:value={entry.body_raw} />
        </section>
      </div>
    {/if}
  </form>
{/if}

<style>
  @import '/static/fonts/KaTeX/katex_0.16.8.min.css';

  form {
    display: grid;
    grid-auto-rows: max-content 1fr;
    min-height: 50rem;
    gap: 1rem;
  }
  .edit-toolbar button {
    padding: 0.5rem;
    margin: 0.5rem;
  }
  .edit-area textarea {
    resize: none;
    height: 100%;
    width: 100%;
  }
  .preview-area {
    padding: 1rem;
    border: 1px solid black;
    overflow: hidden;
  }
</style>
