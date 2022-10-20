<script lang="ts">
  import type { DocumentData, DocumentSnapshot } from 'firebase/firestore/lite';

  export let data: { entry: DocumentSnapshot<DocumentData>; test: string };

  let entry = ((doc: DocumentData, id: string) =>
    ({
      ...doc,
      _id: id,
      created_date: new Date(doc.created_date.seconds * 1000),
      modified_date: new Date(doc.modified_date.seconds * 1000)
    } as any)).call(null, data.entry.data()!, data.entry.id);

  const dateFormat = new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'UTC'
  });
</script>

{#if entry}
  <article>
    <section>
      <span class="blog-entry-heading">
        <h2>{entry.title}</h2>
      </span>
      <span class="blog-entry-time">
        <time datetime={entry.created_date.toISOString()}>
          {dateFormat.format(entry.created_date)} UTC
        </time>
        {#if entry.modified_date.getTime() - entry.created_date.getTime() > 1000 * 60 * 10}
          &mdash; Edited
          <time datetime={entry.modified_date.toISOString()}>
            {dateFormat.format(entry.modified_date)}
          </time>
        {/if}
      </span>
    </section>
    <section class="blog-entry-body">
      {@html entry.body}
    </section>
  </article>
{/if}
