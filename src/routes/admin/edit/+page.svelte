<script lang="ts">
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
    const [, w, h] = text.match(/\s*\|\s*=(\d*)x(\d*)\s*$/) ?? [];
    text = text.replace(/\s*\|\s*=(\d*)x(\d*)\s*$/, '');
    let html = imageRenderer.call(renderer, href, title, text);
    html = html.replace(/^<img /, `<img loading="lazy" `);
    if (h) {
      html = html.replace(/^<img /, `<img height="${h}" `);
    }
    if (w) {
      html = html.replace(/^<img /, `<img width="${w}" `);
    }
    return html;
  };

  let defaultEntry = {
    created_date: null as Timestamp | FieldValue | null,
    modified_date: null as Timestamp | FieldValue | null,
    body: '',
    body_raw: '',
    title: '',
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

  function load() {
    const params = getParams();
    if (params == null) return;
    const docId = params.get('id');
    if (docId != null) {
      docRef = doc(db, 'blog', params.get('id') as string);
      getDoc(docRef).then((doc) => {
        const data = doc.data();
        if (data) entry = data as any;
        loading = false;
      });
    } else {
      docRef = null;
      entry = { ...defaultEntry };
      loading = false;
    }
  }

  let drafts$ = getDocs(query(blog, where('draft', '==', true))).then((snapshot) => snapshot.docs.map((doc) => ({ ...doc.data(), _id: doc.id } as any)));

  let saving = false;
  async function saveEntry(updateDate: boolean) {
    saving = true;
    renderEntry();
    if (updateDate) {
      if (!confirm('Are you sure?')) {
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
    saving = false;
  }

  function renderEntry() {
    entry.body = marked.parse(entry.body_raw, { renderer });
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
</script>

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
      <section class="preview-area">{@html entry.body}</section>
    {:else}
      <section class="edit-area">
        <textarea class="edit-area" name="body_raw" placeholder="Content" bind:value={entry.body_raw} />
      </section>
    {/if}
  </form>
{/if}

<style>
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
    outline: 1px solid black;
    overflow: hidden;
    white-space: normal;
    text-align: justify;
  }
  .preview-area::first-letter {
    font-size: 200%;
    font-style: italic;
  }
</style>
