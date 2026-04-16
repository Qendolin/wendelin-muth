import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, type Timestamp } from 'firebase/firestore/lite';

export type BlogEntryDoc = {
  _id: string;
  title: string;
  body: string;
  body_raw: string;
  created_date: Date;
  modified_date: Date;
  draft: boolean;
  slug: string;
};

// --- Configuration ---

const app = initializeApp({
  apiKey: 'AIzaSyDJ8atqjyu3jXNoCgj8Zi8iAwTUqvWTljk',
  authDomain: 'wendelin-muth.firebaseapp.com',
  projectId: 'wendelin-muth',
  storageBucket: 'wendelin-muth.appspot.com',
  messagingSenderId: '982220326248',
  appId: '1:982220326248:web:1d17c23b5c8e35a76b02dd',
  measurementId: 'G-X73GPRXRWM'
});

async function main() {
  const db = getFirestore(app);
  const coll = collection(db, 'blog');

  console.log('Fetching blog entries...');
  const snapshot = await getDocs(coll);
  const entries = snapshot.docs
    .map((doc) => doc.data())
    .map((e) => ({
      ...e,
      created_date: e.created_date ? new Date(e.created_date.toMillis()) : undefined,
      modified_date: e.modified_date ? new Date(e.modified_date.toMillis()) : undefined
    })) as BlogEntryDoc[];

  const baseDir = 'src/routes/(app)/blog/(entry)';

  for (const entry of entries) {
    const slug = entry.slug;
    const targetDir = `${baseDir}/${slug}`;

    console.log(`Processing ${slug}...`);

    // 1. Construct Meta Content using Function Syntax
    const createdDateStr = entry.created_date
      ? `SimpleDate(${entry.created_date.getUTCFullYear()}, ${entry.created_date.getUTCMonth() + 1}, ${entry.created_date.getUTCDate()})`
      : 'undefined';

    const modifiedStr = entry.modified_date
      ? `SimpleDate(${entry.modified_date.getUTCFullYear()}, ${entry.modified_date.getUTCMonth() + 1}, ${entry.modified_date.getUTCDate()})`
      : 'undefined';

    const metaContent = `import type { PageLoad } from './$types';
import type { BlogEntryMeta } from '$lib/blog-entries';
import { SimpleDate } from '$lib/date';

export const _meta: BlogEntryMeta = {
  title: "${entry.title}",
  createdDate: ${createdDateStr},
  ${entry.modified_date ? `modifiedDate: ${modifiedStr},` : `modifiedDate: undefined,`}
  topics: [],
  ${entry.draft !== undefined ? `draft: ${entry.draft},` : ''}
};

export const load: PageLoad = () => {
  return { meta: _meta };
};`;

    const content = entry.body_raw.replaceAll('{', '\{').replaceAll('}', '\}');

    await Deno.mkdir(targetDir, { recursive: true });
    await Deno.writeTextFile(`${targetDir}/+page.ts`, metaContent, { create: true });
    await Deno.writeTextFile(`${targetDir}/+page.sveltex`, content, { create: true });
  }

  console.log('Done.');
}

main();
