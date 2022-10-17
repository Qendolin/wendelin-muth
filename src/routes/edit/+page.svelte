<script lang="ts">
  import { db } from '$lib/fire-context';
  import {
    addDoc,
    collection,
    doc,
    DocumentReference,
    getDoc,
    setDoc,
    Timestamp
  } from 'firebase/firestore/lite';
  import { onMount } from 'svelte';
  import { marked } from 'marked';
  import { goto } from '$app/navigation';

  const blog = collection(db, 'blog');

  marked.setOptions({
    gfm: true
  });

  let entry = {
    created_date: null as Timestamp | null,
    modified_date: null as Timestamp | null,
    body: '',
    body_raw: '',
    title: ''
  };
  let docRef = null as DocumentReference | null;
  let loading = true;
  let preview = false;

  onMount(() => {
    const urlParams = new URLSearchParams(globalThis.location.search);

    const docId = urlParams.get('id');
    if (docId != null) {
      docRef = doc(db, 'blog', urlParams.get('id') as string);
      getDoc(docRef).then((doc) => {
        const data = doc.data();
        if (data) entry = data as any;
        loading = false;
      });
    } else {
      loading = false;
    }
  });

  async function submit() {
    render();
    const now = Timestamp.fromDate(new Date());
    entry.created_date ??= now;
    entry.modified_date = now;
    if (docRef) {
      setDoc(docRef, entry);
    } else {
      const ref = await addDoc(blog, entry);
      goto(`$id=${ref.id}`);
    }
  }

  function render() {
    entry.body = marked.parse(entry.body_raw);
  }
</script>

{#if loading}
  <p>Loading....</p>
{:else}
  <form on:submit|preventDefault={submit}>
    <span>
      <input type="text" name="title" placeholder="Title" required bind:value={entry.title} />
      <button
        type="button"
        on:click={() => {
          render();
          preview = !preview;
        }}
      >
        {preview ? 'Edit' : 'Preview'}
      </button>
      <button type="submit" style="margin-left: 2rem;">Save</button>
    </span>
    {#if preview}
      <section class="preview-area">{@html entry.body}</section>
    {:else}
      <section class="edit-area">
        <textarea
          class="edit-area"
          name="body_raw"
          placeholder="Content"
          bind:value={entry.body_raw}
        />
      </section>
    {/if}
  </form>
{/if}

<style>
  form {
    display: grid;
    grid-auto-rows: max-content 1fr;
    height: 50rem;
    gap: 1rem;
  }
  .edit-area textarea {
    resize: none;
    height: 100%;
    width: 100%;
  }
  .preview-area {
    padding: 1rem;
    outline: 1px solid black;
  }
</style>
