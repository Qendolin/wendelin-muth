import process from 'node:process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import type { Plugin, ResolvedConfig } from 'vite';
import type { PreprocessorGroup, Processed } from 'svelte/compiler';
import type { SvelteConfig } from '@sveltejs/vite-plugin-svelte';
import type { StaticCallRoutes } from '../src/lib/static-calls/results.ts';
import { injectModuleScript, STATIC_CALL_CAPTURE_FILE, STATIC_CALL_RESULTS_FILE } from './svelte-static-calls-config.js';

const STATIC_RESULTS_IMPORT_PREFIX = 'virtual:svelte-static-call-results:';
const STATIC_RESULTS_MODULE_PREFIX = '\0svelte-static-call-results:';
const STATIC_CAPTURE_IMPORT = 'virtual:svelte-static-call-capture';
const STATIC_CAPTURE_SERVER_MODULE = '\0svelte-static-call-capture:ssr';
const STATIC_CAPTURE_CLIENT_MODULE = '\0svelte-static-call-capture:client';
const DEFAULT_MAX_SERIALIZED_RESULT_BYTES = 64 * 1024;

export interface StaticCallResultsOptions {
  maxSerializedResultBytes?: number;
}

function getPageRouteId(filename: string, root: string): string | null {
  const cleanFilename = filename.split('?')[0];
  const file = cleanFilename.split(/[\\/]/).pop() ?? '';
  if (!file.startsWith('+page.')) return null;

  const routesDirectory = resolve(root, 'src/routes');
  const routeDirectory = dirname(cleanFilename);
  const relativeDirectory = relative(routesDirectory, routeDirectory);
  if (relativeDirectory === '..' || relativeDirectory.startsWith(`..${process.platform === 'win32' ? '\\' : '/'}`)) return null;

  if (relativeDirectory === '') return '/';
  return `/${relativeDirectory.replace(/\\/g, '/')}`;
}

function injectPageResults(code: string, filename: string, routeId: string): Processed {
  const importBlock = [
    `import { registerStaticCallResults as __registerStaticCallResults } from '$lib/static-calls/runtime';`,
    `import __staticCallPages from '${STATIC_RESULTS_IMPORT_PREFIX}${encodeURIComponent(routeId)}';`,
    `__registerStaticCallResults(${JSON.stringify(routeId)}, __staticCallPages);`
  ].join('\n');
  return injectModuleScript(code, filename, importBlock);
}

export function svelteStaticCallResultsPlugin(options: StaticCallResultsOptions = {}): Plugin {
  const maxSerializedResultBytes = options.maxSerializedResultBytes === undefined ? DEFAULT_MAX_SERIALIZED_RESULT_BYTES : options.maxSerializedResultBytes;
  if (!Number.isSafeInteger(maxSerializedResultBytes) || maxSerializedResultBytes <= 0) {
    throw new TypeError('[svelte-static-calls] maxSerializedResultBytes must be a positive safe integer.');
  }

  const isStaticPass = process.env.IS_STATIC_REGION_SERVER === 'true';
  const resultPass = process.env.STATIC_RESULT_PASS;
  let viteConfig: ResolvedConfig;
  let staticCallResults: StaticCallRoutes | null = null;
  let captureFileInitialized = false;

  const preprocessor: PreprocessorGroup = {
    name: 'svelte-static-call-results',
    markup: ({ content, filename }) => {
      if (isStaticPass || resultPass !== 'hybrid' || !filename) return;

      const routeId = getPageRouteId(filename, viteConfig.root);
      if (!routeId || !staticCallResults?.[routeId]) return;
      return injectPageResults(content, filename, routeId);
    }
  };

  return {
    name: 'svelte-static-call-results',
    enforce: 'pre',

    configResolved(config) {
      viteConfig = config;
      const sveltePlugin = config.plugins.find((plugin) => plugin.name === 'vite-plugin-svelte:config');
      const svelteOptions = sveltePlugin?.api?.options as SvelteConfig | undefined;
      if (!svelteOptions) return;

      svelteOptions.preprocess = [...[svelteOptions.preprocess ?? []].flat(), preprocessor];
    },

    async buildStart() {
      if (resultPass === 'capture' && !captureFileInitialized) {
        const capturePath = resolve(viteConfig.root, STATIC_CALL_CAPTURE_FILE);
        await mkdir(dirname(capturePath), { recursive: true });
        await writeFile(capturePath, '');
        captureFileInitialized = true;
      } else if (resultPass === 'hybrid') {
        const resultsPath = resolve(viteConfig.root, STATIC_CALL_RESULTS_FILE);
        try {
          staticCallResults = JSON.parse(await readFile(resultsPath, 'utf8')) as StaticCallRoutes;
        } catch (err) {
          throw new Error(
            `[svelte-static-calls] Could not read static call results at ${resultsPath}.\n` +
              `Run the capture build first (e.g. "deno task build:capture"), then build again with STATIC_RESULT_PASS=hybrid.`,
            { cause: err }
          );
        }
      }
    },

    resolveId(id, _importer, options) {
      if (id === STATIC_CAPTURE_IMPORT) {
        return options?.ssr ? STATIC_CAPTURE_SERVER_MODULE : STATIC_CAPTURE_CLIENT_MODULE;
      }
      if (id.startsWith(STATIC_RESULTS_IMPORT_PREFIX)) {
        return `${STATIC_RESULTS_MODULE_PREFIX}${id.slice(STATIC_RESULTS_IMPORT_PREFIX.length)}`;
      }
    },

    load(id) {
      if (id === STATIC_CAPTURE_SERVER_MODULE) {
        const capturePath = resolve(viteConfig.root, STATIC_CALL_CAPTURE_FILE);
        return [
          `import { appendFileSync } from 'node:fs';`,
          `import { Buffer } from 'node:buffer';`,
          `export function appendStaticCallRecord(record) {`,
          `  const parsed = JSON.parse(record);`,
          `  const resultBytes = Buffer.byteLength(JSON.stringify(parsed.result), 'utf8');`,
          `  if (resultBytes > ${maxSerializedResultBytes}) {`,
          `    throw new Error('[svelte-static-calls] Serialized result for generated callsite ' + JSON.stringify(parsed.siteId) + ' is ' + resultBytes + ' UTF-8 bytes, exceeding the ${maxSerializedResultBytes}-byte limit.');`,
          `  }`,
          `  appendFileSync(${JSON.stringify(capturePath)}, record + '\\n');`,
          `}`
        ].join('\n');
      }
      if (id === STATIC_CAPTURE_CLIENT_MODULE) {
        return 'export function appendStaticCallRecord() {}';
      }
      if (!id.startsWith(STATIC_RESULTS_MODULE_PREFIX)) return;
      const routeId = decodeURIComponent(id.slice(STATIC_RESULTS_MODULE_PREFIX.length));
      return `export default ${JSON.stringify(staticCallResults?.[routeId] ?? {})};`;
    }
  };
}
