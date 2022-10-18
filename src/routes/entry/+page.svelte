<script lang="ts">
  import { db } from '$lib/fire-context';
  import { error, type LoadEvent } from '@sveltejs/kit';
  import { doc } from 'firebase/firestore/lite';
  import { onMount } from 'svelte';

  onMount(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.has('id')) void 0;
  });

  export function load(event: LoadEvent) {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id == null || id == '') throw error(404);
    const docRef = doc(db, 'blog', id);
    return {
      docRef
    };
  }
</script>
