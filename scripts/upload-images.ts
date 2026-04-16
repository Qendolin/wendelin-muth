import { initializeApp, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { expandGlobSync } from '@std/fs/expand-glob';
import { fromFileUrl } from '@std/path';
import { readFile, writeFile } from 'node:fs/promises';
import { basename, relative } from 'node:path';
import { createHash } from 'node:crypto';
import { encode as blurhashEncode } from 'blurhash';
import sharp from 'sharp';
import type { Buffer } from 'node:buffer';

const MANIFEST_PATH = 'src/lib/assets/storage-manifest.json';
const BUCKET_PREFIX = 'public/content/';
const IMAGE_GLOB = 'img/**/*.{jpg,jpeg,png,webp,gif,avif,svg}';
const SERVICE_ACCOUNT = fromFileUrl(new URL('./wendelin-muth-firebase-adminsdk-xgzgx-94a4cd13ae-creds.json', import.meta.url));

type ManifestEntry = {
  url: string;
  hash: string;
  bucketFilename: string;
  width: number;
  height: number;
  blurhash: string;
};

initializeApp({ credential: cert(SERVICE_ACCOUNT), storageBucket: 'wendelin-muth.appspot.com' });
const bucket = getStorage().bucket();

type ImageMeta = { data: Buffer; width: number; height: number };

async function decodeImage(buffer: Buffer): Promise<ImageMeta> {
  // animated: false  → first frame only for animated WebP
  // removeAlpha()    → blurhash expects 3-channel RGB, not RGBA
  const instance = sharp(buffer, { animated: false }).ensureAlpha();
  const { data, info } = await instance.raw().toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

async function patchMissingMetadata(entry: ManifestEntry, buffer: Buffer): Promise<ManifestEntry> {
  if (entry.width && entry.height && entry.blurhash) return entry;
  const { data, width, height } = await decodeImage(buffer);
  const blurhash = blurhashEncode(new Uint8ClampedArray(data.buffer, data.byteOffset, data.byteLength), width, height, 4, 4);
  return { ...entry, width, height, blurhash };
}

let manifest: Record<string, ManifestEntry> = {};
try {
  manifest = JSON.parse(await readFile(MANIFEST_PATH, 'utf8'));
} catch {
  // start with empty manifest
}

let changedCount = 0;

for (const entry of expandGlobSync(IMAGE_GLOB, { root: Deno.cwd() })) {
  if (!entry.isFile) continue;

  const buffer = await readFile(entry.path);
  const localPath = '/' + relative('', entry.path).replace(/\\/g, '/');
  const currentHash = createHash('sha256').update(buffer).digest('hex').slice(0, 16);
  const existing = manifest[localPath];

  if (existing?.hash === currentHash) {
    manifest[localPath] = await patchMissingMetadata(existing, buffer);
    continue;
  }

  const originalName = basename(entry.path);
  const bucketFilename = existing?.bucketFilename ?? `${crypto.randomUUID()}_${originalName}`;
  const destination = `${BUCKET_PREFIX}${bucketFilename}`;

  const { data, width, height } = await decodeImage(buffer);
  const blurhash = blurhashEncode(new Uint8ClampedArray(data.buffer, data.byteOffset, data.byteLength), width, height, 4, 4);

  console.log('Uploading "%s" to "%s"', localPath, bucketFilename);
  await bucket.upload(entry.path, {
    destination,
    metadata: {
      cacheControl: 'public, max-age=31536000',
      contentDisposition: `inline; filename="${originalName}"`
    }
  });

  manifest[localPath] = {
    url: `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(destination)}?alt=media`,
    hash: currentHash,
    bucketFilename,
    width,
    height,
    blurhash
  };

  changedCount++;
}

await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2));

console.log(`Synced ${changedCount} changed image(s) to Firebase Storage (at ${BUCKET_PREFIX})`);
if (changedCount === 0) console.log('All images were already up-to-date.');
