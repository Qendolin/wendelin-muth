/**
 * Config-facing pieces of the svelte-static-calls build system.
 *
 * This module must stay plain JavaScript: it is imported by svelte.config.js,
 * which SvelteKit, vite-plugin-svelte and svelte-check all load with a bare
 * Node `import()` that has no TypeScript support.
 *
 * @typedef {import('svelte/compiler').Processed} Processed
 * @typedef {import('svelte/compiler').PreprocessorGroup} PreprocessorGroup
 * @typedef {import('@sveltejs/kit').Adapter} Adapter
 * @typedef {import('../src/lib/static-calls/results.ts').StaticCallRoutes} StaticCallRoutes
 * @typedef {import('../src/lib/static-calls/results.ts').StaticCallRecord} StaticCallRecord
 * @typedef {{
 *   start: number;
 *   end: number;
 *   argumentStart: number;
 *   argumentEnd: number;
 *   nested: StaticCallSite[];
 * }} StaticCallSite
 */

import process from 'node:process';
import { readFile, writeFile } from 'node:fs/promises';
import { relative, resolve } from 'node:path';
import { parse } from 'svelte/compiler';
import MagicString from 'magic-string';

export const STATIC_CALL_CAPTURE_FILE = '.svelte-kit/static-call-calls.ndjson';
export const STATIC_CALL_RESULTS_FILE = '.svelte-kit/static-call-results.json';

/**
 * @param {string} code
 * @param {MagicString} magicString
 * @param {string} importBlock
 */
function injectInstanceScript(code, magicString, importBlock) {
  const scriptTags = [...code.matchAll(/<script\b[^>]*>/g)];
  const instanceScript = scriptTags.find((match) => {
    const tag = match[0];
    return !/\bmodule\b/.test(tag) && !/\bcontext\s*=\s*["']module["']/.test(tag);
  });

  if (!instanceScript || instanceScript.index === undefined) {
    magicString.prepend(`<script>\n${importBlock}\n</script>\n`);
    return;
  }

  const insertion = instanceScript.index + instanceScript[0].length;
  magicString.appendLeft(insertion, `\n${importBlock}\n`);
}

/**
 * @param {string} code
 * @param {string} filename
 * @param {string} importBlock
 * @returns {Processed}
 */
export function injectModuleScript(code, filename, importBlock) {
  const magicString = new MagicString(code);
  const moduleScript = [...code.matchAll(/<script\b[^>]*>/g)].find((match) => {
    const tag = match[0];
    return /\bmodule\b/.test(tag) || /\bcontext\s*=\s*["']module["']/.test(tag);
  });

  if (!moduleScript || moduleScript.index === undefined) {
    magicString.prepend(`<script module>\n${importBlock}\n</script>\n`);
  } else {
    const insertion = moduleScript.index + moduleScript[0].length;
    magicString.appendLeft(insertion, `\n${importBlock}\n`);
  }

  return {
    code: magicString.toString(),
    map: magicString.generateMap({ hires: true, source: filename, includeContent: true })
  };
}

/**
 * @param {import('svelte/compiler').AST.Script | null | undefined} script
 * @returns {StaticCallSite[]}
 */
function collectStaticCalls(script) {
  /** @type {StaticCallSite[]} */
  const roots = [];
  if (!script?.content?.body) return roots;

  /**
   * @param {object} node
   * @param {StaticCallSite | undefined} [parent]
   */
  const walk = (node, parent) => {
    if (!node) return;
    let containingCall = parent;

    /** @type {Record<string, unknown>} */
    const current = /** @type {Record<string, unknown>} */ (node);
    if (current.type === 'CallExpression') {
      /** @type {{ callee: { type: string; name: string }; arguments: Array<{ type: string; start: number; end: number }>; start: number; end: number }} */
      const call = /** @type {{
        callee: { type: string; name: string };
        arguments: Array<{ type: string; start: number; end: number }>;
        start: number;
        end: number;
      }} */ (current);
      if (call.callee.type === 'Identifier' && call.callee.name === '$static') {
        if (call.arguments.length !== 1 || call.arguments[0].type === 'SpreadElement') {
          throw new Error('[svelte-static-calls] $static() expects exactly one expression.');
        }

        const argument = call.arguments[0];
        /** @type {StaticCallSite} */
        const site = {
          start: call.start,
          end: call.end,
          argumentStart: argument.start,
          argumentEnd: argument.end,
          nested: []
        };

        if (parent) parent.nested.push(site);
        else roots.push(site);
        containingCall = site;
      }
    }

    for (const [key, value] of Object.entries(current)) {
      if (key === 'loc' || key === 'start' || key === 'end') continue;
      if (Array.isArray(value)) value.forEach((child) => walk(child, containingCall));
      else if (value && typeof value === 'object') walk(value, containingCall);
    }
  };

  script.content.body.forEach((node) => walk(node));
  return roots.sort((a, b) => a.start - b.start);
}

/**
 * @param {string} code
 * @param {StaticCallSite} site
 * @returns {string}
 */
function unwrapNestedCalls(code, site) {
  const expression = code.slice(site.argumentStart, site.argumentEnd);
  if (site.nested.length === 0) return expression;

  const magicString = new MagicString(expression);
  for (const nested of site.nested) {
    magicString.overwrite(nested.start - site.argumentStart, nested.end - site.argumentStart, unwrapNestedCalls(code, nested));
  }
  return magicString.toString();
}

/**
 * @param {string} code
 * @param {string} filename
 * @returns {Processed | undefined}
 */
function transformStaticCalls(code, filename) {
  if (!code.includes('$static')) return;

  const ast = parse(code, { filename, modern: true });
  const moduleCalls = collectStaticCalls(ast.module);
  if (moduleCalls.length > 0) {
    throw new Error(`[svelte-static-calls] $static() is only supported in instance scripts, not module scripts: ${filename}`);
  }

  const calls = collectStaticCalls(ast.instance);
  if (calls.length === 0) return;

  const moduleId = relative(process.cwd(), resolve(filename.split('?')[0])).replace(/\\/g, '/');
  const magicString = new MagicString(code);
  calls.forEach((call, ordinal) => {
    const siteId = `${moduleId}#${ordinal}`;
    const expression = unwrapNestedCalls(code, call);
    magicString.overwrite(
      call.start,
      call.end,
      `__svelteStaticBrowser && !__svelteStaticDev ? __svelteStaticResult(${JSON.stringify(siteId)}) : __svelteStaticEval(${JSON.stringify(siteId)}, () => (${expression}))`
    );
  });

  const helperImport = [
    `import { browser as __svelteStaticBrowser, dev as __svelteStaticDev } from '$app/environment';`,
    `import { evaluateStaticCall as __svelteStaticEval, getStaticCallResult as __svelteStaticResult } from '$lib/static-calls/runtime';`
  ].join('\n');
  injectInstanceScript(code, magicString, helperImport);
  return {
    code: magicString.toString(),
    map: magicString.generateMap({ hires: true, source: filename, includeContent: true })
  };
}

/**
 * @returns {PreprocessorGroup}
 */
export function svelteStaticCallsPreprocessor() {
  return {
    name: 'svelte-static-calls',
    markup: ({ content, filename }) => {
      if (!filename || !content.includes('$static')) return;
      return transformStaticCalls(content, filename);
    }
  };
}

/**
 * @param {Adapter} adapter
 * @returns {Adapter}
 */
export function withStaticCallResultsAdapter(adapter) {
  return {
    ...adapter,
    async adapt(builder) {
      if (process.env.STATIC_RESULT_PASS === 'capture') {
        const capturePath = resolve(process.cwd(), STATIC_CALL_CAPTURE_FILE);
        const captureText = await readFile(capturePath, 'utf8');
        /** @type {StaticCallRoutes} */
        const results = {};

        for (const line of captureText.split('\n')) {
          if (!line) continue;
          /** @type {StaticCallRecord} */
          const record = JSON.parse(line);
          const routePages = (results[record.routeId] ??= {});
          const pageResults = (routePages[record.pathname] ??= {});
          (pageResults[record.siteId] ??= []).push(record.result);
        }

        await writeFile(resolve(process.cwd(), STATIC_CALL_RESULTS_FILE), JSON.stringify(results, null, 2));
        console.log(`[svelte-static-calls] Captured ${Object.keys(results).length} prerendered route(s).`);
      }

      await adapter.adapt(builder);
    }
  };
}
