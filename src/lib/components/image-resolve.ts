import { dev } from '$app/environment';

type ManifestEntry = {
  url: string;
  hash: string;
  bucketFilename: string;
  width?: number;
  height?: number;
  blurhash?: string;
};

import manifestJson from '../assets/storage-manifest.json' with { type: 'json' };
const manifest = manifestJson as Record<string, ManifestEntry>;

export function resolveUrl(src: string): string {
  if (dev) return src;

  // external or other urls
  if (!src.startsWith('/') && !src.startsWith('.')) {
    return src;
  }

  const manifestUrl = manifest[src]?.url;
  if (!manifestUrl) throw new Error(`Local image ${src} does not have manifest entry.`);
  return manifestUrl;
}

export function resolveSize(src: string, w: number | undefined, h: number | undefined): [number | undefined, number | undefined] {
  if (dev) return [w, h];

  // external or other urls
  if (!src.startsWith('/') && !src.startsWith('.')) {
    return [w, h];
  }

  const entry = manifest[src];

  if ((w && h) || !entry || !entry.width || !entry.height) return [w, h];

  let calcW: number, calcH: number;
  if (w) {
    calcW = w;
    calcH = entry.height * (w / entry.width);
  } else if (h) {
    calcH = h;
    calcW = entry.width * (h / entry.height);
  } else {
    calcW = entry.width;
    calcH = entry.height;
  }

  return [calcW, calcH];
}

export function resolveBlurhash(src: string): string {
  if (dev) return '';

  // external or other urls
  if (!src.startsWith('/') && !src.startsWith('.')) {
    return '';
  }

  return manifest[src]?.blurhash ?? '';
}
