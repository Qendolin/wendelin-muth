// convert-meta-to-page.ts
import fs from 'node:fs/promises';
import path from 'node:path';

const BASE_DIR = 'src/routes/(app)/project';

async function main() {
  console.log('🔍 Looking for meta.ts files in:', BASE_DIR);

  const entries = await fs.readdir(BASE_DIR, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const metaPath = path.join(BASE_DIR, entry.name, 'meta.ts');
    const newPath = path.join(BASE_DIR, entry.name, '+page.ts');

    try {
      let content = await fs.readFile(metaPath, 'utf-8');

      content = content.replaceAll(/export const meta([\s:=])/g, 'export const _meta$1');

      // Build the new file content
      const newContent = `import type { PageLoad } from './$types';
${content.trim()}

export const load: PageLoad = () => {
  return { meta: _meta };
};
`;

      // Write the new file
      await fs.writeFile(newPath, newContent, 'utf-8');

      // Delete the old meta.ts
      await fs.unlink(metaPath);

      console.log(`✅ Converted: ${entry.name}/meta.ts → +page.ts`);
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        // No meta.ts in this folder — skip silently
      } else {
        console.error(`❌ Failed on ${entry.name}:`, err.message);
      }
    }
  }

  console.log('\n🎉 Done! All meta.ts files have been converted.');
}

main();
