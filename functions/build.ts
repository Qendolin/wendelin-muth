import * as esbuild from 'esbuild';
import * as path from 'node:path';

const root = import.meta.dirname!;

await esbuild.build({
  entryPoints: [path.join(root, 'index.ts')],
  bundle: true,
  platform: 'node',
  target: 'node22',
  outfile: path.join(root, 'index.js'),
  format: 'cjs',
  external: [
    'firebase-admin',
    'firebase-admin/app',
    'firebase-admin/auth',
    'firebase-admin/firestore',
    'firebase-functions',
    'firebase-functions/v2',
    'firebase-functions/v2/firestore',
    'firebase-functions/v2/https',
    'node:fs'
  ],
  sourcemap: true,
  logLevel: 'info'
});

esbuild.stop();