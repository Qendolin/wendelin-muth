import devtoolsJson from 'vite-plugin-devtools-json';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import sirv from 'sirv';
import type { Plugin } from 'vite';
import { svelteStaticRegions } from './scripts/svelte-static-regions.ts';
import process from 'node:process';

const DEBUG = process.env['DEBUG'] !== 'false';

function namedFiles() {
  return {
    name: 'hash-plugin',
    apply: 'build' as const,
    config(config: any) {
      if (!DEBUG) return config;

      config.build.rollupOptions.output.assetFileNames = config.build.rollupOptions.output.assetFileNames.replace('[hash]', `[name].[hash]`);
      config.build.rollupOptions.output.chunkFileNames = config.build.rollupOptions.output.chunkFileNames.replace('[hash]', `[name].[hash]`);
      config.build.rollupOptions.output.entryFileNames = config.build.rollupOptions.output.entryFileNames.replace('[hash]', `[name].[hash]`);
      return config;
    }
  } satisfies Plugin;
}

export default defineConfig({
  plugins: [
    tailwindcss(),
    svelteStaticRegions(),
    sveltekit(),
    devtoolsJson(),
    {
      name: 'serve-local-images',
      configureServer(server) {
        server.middlewares.use('/img', sirv('./img', { dev: true }));
      }
    },
    namedFiles()
  ],
  build: {
    minify: !DEBUG,
    sourcemap: DEBUG
  },
  define: {
    'import.meta.env.PUBLIC_BUILD_TIMESTAMP': new Date().getTime().toString()
  }
});
