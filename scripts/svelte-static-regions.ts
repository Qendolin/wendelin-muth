/**
 * Copyright 2026 Wendelin Muth
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import process from 'node:process';
import { createHash } from 'node:crypto';
import { createServer, type ViteDevServer, type Plugin, type InlineConfig, type ResolvedConfig } from 'vite';
import type { TransformPluginContext } from 'rollup';
import { parse, PreprocessorGroup, Processed, type AST } from 'svelte/compiler';
import type * as ESTree from 'estree';
import MagicString from 'magic-string';
import { SvelteConfig } from '@sveltejs/vite-plugin-svelte';

/**
 * Augment standard ESTree nodes to include the `start` and `end` positions
 * injected by Acorn and the Svelte compiler's internal script parser.
 */
declare module 'estree' {
  interface BaseNode {
    start: number;
    end: number;
  }
}

/**
 * Svelte Static Regions Architecture
 * This plugin enables "static-only" execution within Svelte components.
 * 1. It boots a background Vite SSR instance during the build.
 * 2. It identifies `<static>` blocks or `.static.svelte` components.
 * 3. It renders those regions to HTML at build-time.
 * 4. It replaces the source with static HTML while wrapping the original
 *    logic in `{#if false}` to ensure CSS is bundled but JS is omitted.
 */

export interface StaticRegionOptions {
  /**
   * A filter function to determine which files should be scanned for static blocks.
   * By default, this targets SvelteKit route files (starting with '+').
   */
  fileFilter?: (filename: string, id: string) => boolean;
  /**
   * An array of file extensions that should be treated as Svelte components.
   *
   * If omitted, the plugin attempts to automatically retrieve the extensions
   * from the `vite-plugin-svelte` configuration (enabling support for tools
   * like mdsvex which use `.svx` or `.md`). If auto-detection fails,
   * it defaults to `['.svelte']`.
   *
   * @example ['.svelte', '.svx', '.md']
   * @default undefined (auto-detected via vite-plugin-svelte)
   */
  extensions?: string[];
  /**
   * An optional post-processing hook applied to each region's rendered HTML
   * before it is injected into the Svelte source. Use this to strip
   * framework-specific runtime artifacts that must not appear in fully-static
   * output.
   *
   * @example
   * // Remove unpic image component event-listener attributes
   * htmlTransform: (html) =>
   *   html
   *     .replaceAll('onload="this.__e=event"', '')
   *     .replaceAll('onerror="this.__e=event"', '')
   */
  htmlTransform?: (html: string) => string;
}

/**
 * Internal state for the background Vite server and virtual file management.
 */
interface ServerState {
  serverPromise: Promise<ViteDevServer> | null;
  refs: number;
  virtualFiles: Map<string, string>;
}

/**
 * Partial interface for the Svelte compiler's server-side rendering output.
 * Svelte 5's `render` from `svelte/server` is synchronous.
 */
interface SvelteServerModule {
  render: (component: unknown, options?: Record<string, unknown>) => { html: string; head: string; body?: string };
}

/**
 * A lightweight interface wrapping identifying imports of static components.
 */
interface StaticImport {
  name: string;
  path: string;
}

// --- State Management ---

const GLOBAL_KEY = Symbol.for('svelte-static-regions');

/**
 * Initializes or retrieves the global state to ensure only one SSR server
 * is active across multiple plugin instances.
 */
if (!(globalThis as Record<symbol, unknown>)[GLOBAL_KEY]) {
  (globalThis as Record<symbol, unknown>)[GLOBAL_KEY] = {
    serverPromise: null,
    refs: 0,
    virtualFiles: new Map()
  } satisfies ServerState;
}

function getState(): ServerState {
  return (globalThis as Record<symbol, unknown>)[GLOBAL_KEY] as ServerState;
}

// --- AST Helpers ---

/**
 * Safely extracts the 'start' and 'end' coordinates from Svelte compiler nodes
 * that are missing from the formal types but are present at runtime.
 */
function getRange(node: unknown): { start: number; end: number } {
  if (!node || typeof node !== 'object') {
    throw new Error('[svelte-static-regions] AST node is not an object.');
  }
  const start = (node as { start?: unknown }).start;
  const end = (node as { end?: unknown }).end;

  if (typeof start !== 'number' || typeof end !== 'number') {
    throw new Error(`[svelte-static-regions] AST node missing start/end range: ${JSON.stringify(node)}`);
  }
  return { start, end };
}

/**
 * Scans component scripts for imports of '.static.svelte' files.
 * These imports identify components that should always be rendered statically.
 */
function getStaticImports(ast: AST.Root): StaticImport[] {
  const imports: StaticImport[] = [];
  const extract = (script?: AST.Script | null) => {
    if (!script?.content?.body) return;
    for (const node of script.content.body) {
      // Look for explicit static components to pass to findStaticNodes
      if (node.type === 'ImportDeclaration' && typeof node.source.value === 'string' && node.source.value.endsWith('.static.svelte')) {
        for (const specifier of node.specifiers) {
          if (specifier.type === 'ImportDefaultSpecifier' || specifier.type === 'ImportSpecifier') {
            imports.push({ name: specifier.local.name, path: node.source.value });
          }
        }
      }
    }
  };
  extract(ast.instance);
  extract(ast.module);
  return imports;
}

/**
 * Recursively unwraps TypeScript wrappers (like 'as any') to reach
 * the core function call expression. Uses intersection types to map
 * non-standard TS AST nodes safely.
 */
function getCallExpression(n: ESTree.Node | null | undefined): ESTree.CallExpression | null {
  if (!n) return null;
  if (n.type === 'CallExpression') return n;
  if (['TSAsExpression', 'TSNonNullExpression', 'TSInstantiationExpression'].includes(n.type)) {
    return getCallExpression((n as ESTree.Node & { expression: ESTree.Node }).expression);
  }
  return null;
}

/**
 * Prepares the JS environment for the SSR server by extracting existing logic.
 * It purposefully removes Svelte 5 '$props()' to avoid runtime warnings in
 * the isolated SSR context.
 *
 * Returns the concatenated module + instance script source as a plain string.
 */
function getScripts(code: string, ast: AST.Root): string {
  let scripts = '';

  if (ast.module) {
    const { start, end } = getRange(ast.module);
    scripts += code.slice(start, end) + '\n';
  }

  if (ast.instance && ast.instance.content) {
    const { start: scriptStart, end: scriptEnd } = getRange(ast.instance);
    const ms = new MagicString(code.slice(scriptStart, scriptEnd));
    const offset = scriptStart;

    for (const node of ast.instance.content.body) {
      if (node.type === 'VariableDeclaration') {
        const isProps = node.declarations.some((decl) => {
          const call = getCallExpression(decl.init);
          return call && call.callee.type === 'Identifier' && call.callee.name === '$props';
        });
        if (isProps) {
          ms.remove(node.start - offset, node.end - offset);
        }
      } else if (node.type === 'ExportNamedDeclaration') {
        ms.remove(node.start - offset, node.end - offset);
      }
    }
    scripts += ms.toString() + '\n';
  }

  return scripts;
}

/**
 * The set of Svelte AST properties that carry child template nodes (fragments,
 * arrays-of-nodes, or control-flow branches). Expression properties such as
 * `test`, `expression`, and `tag` are intentionally excluded, they hold JS
 * ESTree nodes, not SvelteNodes, and must not be walked as template children.
 */
const SVELTE_CHILD_KEYS = [
  'nodes', // Fragment.nodes
  'fragment', // RegularElement, Component, SnippetBlock, KeyBlock, ...
  'children', // TitleElement, ...
  'body', // EachBlock.body, SnippetBlock.body
  'consequent', // IfBlock.consequent
  'alternate', // IfBlock.alternate
  'fallback', // EachBlock.fallback
  'pending', // AwaitBlock.pending
  'then', // AwaitBlock.then
  'catch' // AwaitBlock.catch
] as const;

/**
 * Identifies nodes in the Svelte template that are either:
 * 1. An explicit `<static>` tag.
 * 2. An imported `.static.svelte` component.
 * 3. A tag with a `static` attribute.
 */
function findStaticNodes(rootNode: AST.SvelteNode | undefined, staticImports: StaticImport[]): AST.SvelteNode[] {
  const nodesToReplace: AST.SvelteNode[] = [];
  const names = new Set(staticImports.map((i) => i.name));

  const walk = (node: AST.SvelteNode) => {
    if (!node || typeof node !== 'object' || !('type' in node)) return;

    const isTag = node.type === 'RegularElement' || node.type === 'Component';
    let isStatic = false;

    if (isTag) {
      const name = (node as { name?: unknown }).name;
      if (name === 'static') isStatic = true;
      if (typeof name === 'string' && names.has(name)) isStatic = true;
    }

    // Check for `static` attribute safely without invalid index signatures.
    if ('attributes' in node) {
      const attrs = (node as { attributes?: unknown }).attributes;
      if (Array.isArray(attrs)) {
        for (const a of attrs) {
          if (a && typeof a === 'object' && 'name' in a && (a as AST.Attribute).name === 'static') {
            isStatic = true;
            break;
          }
        }
      }
    }

    if (isStatic) {
      nodesToReplace.push(node);
      return;
    }

    // Walk only the known child-bearing keys to avoid accidentally descending
    // into JS expression nodes (which share the `type` property but are ESTree
    // nodes, not SvelteNodes).
    for (const key of SVELTE_CHILD_KEYS) {
      if (!(key in node)) continue;
      const value = (node as unknown as Record<string, unknown>)[key];
      if (!value || typeof value !== 'object') continue;
      if (Array.isArray(value)) {
        for (const v of value) {
          if (v && typeof v === 'object' && 'type' in v) walk(v as AST.SvelteNode);
        }
      } else if ('type' in value) {
        walk(value as AST.SvelteNode);
      }
    }
  };

  if (rootNode) walk(rootNode);
  return nodesToReplace;
}

/**
 * Scans the children of an AST branch for interaction bindings (Svelte 5 syntax).
 * Static rendering removes JS completely so these directives are considered dead code.
 */
function checkInteractivity(node: AST.SvelteNode, filename: string) {
  const walk = (n: AST.SvelteNode) => {
    if (!n || typeof n !== 'object' || !('type' in n)) return;

    const isTag = n.type === 'RegularElement' || n.type === 'Component' || n.type === 'SvelteElement';
    if (isTag && 'attributes' in n) {
      const attrs = n.attributes;
      if (Array.isArray(attrs)) {
        for (const attr of attrs) {
          if (!attr || typeof attr !== 'object' || !('type' in attr)) continue;

          // Svelte 5 event attributes (e.g. onclick) are 'Attribute' nodes
          if (attr.type === 'Attribute' && typeof attr.name === 'string' && attr.name.startsWith('on')) {
            throw new Error(`[svelte-static-regions] Interactive attribute '${attr.name}' found inside static region in ${filename}`);
          }
          // Bindings (bind:value)
          if (attr.type === 'BindDirective') {
            throw new Error(`[svelte-static-regions] Interactive binding '${attr.name}' found inside static region in ${filename}`);
          }
          // Actions (use:action)
          if (attr.type === 'UseDirective') {
            throw new Error(`[svelte-static-regions] Interactive action (use:${attr.name}) found inside static region in ${filename}`);
          }
          // Svelte 4 style events (on:click)
          if (attr.type === 'OnDirective') {
            throw new Error(`[svelte-static-regions] Interactive event directive (on:${attr.name}) found inside static region in ${filename}`);
          }
        }
      }
    }

    for (const key of SVELTE_CHILD_KEYS) {
      if (key in n) {
        const val = (n as unknown as Record<string, unknown>)[key];
        if (Array.isArray(val)) val.forEach((v) => walk(v as AST.SvelteNode));
        else if (val && typeof val === 'object') walk(val as AST.SvelteNode);
      }
    }
  };
  walk(node);
}

/**
 * Validates 'regular components' that aren't enabled for background rendering.
 * Enforces our static component limits (e.g. no <static> markers) and alerts
 * on unsuppressed fallback dynamic imports.
 */
function checkRegularComponent(content: string, filename: string) {
  let ast: AST.Root;
  try {
    ast = parse(content, { filename, modern: true });
  } catch {
    return;
  }

  const throwOnStatic = (node: AST.SvelteNode) => {
    if (!node || typeof node !== 'object' || !('type' in node)) return;
    const isTag = node.type === 'RegularElement' || node.type === 'Component';

    if (isTag && (node as { name?: unknown }).name === 'static') {
      throw new Error(`[svelte-static-regions] Static tags are not allowed in regular components: ${filename}`);
    }
    if (isTag && 'attributes' in node) {
      const attrs = (node as { attributes?: unknown }).attributes;
      if (Array.isArray(attrs) && attrs.some((a) => a && typeof a === 'object' && 'name' in a && (a as AST.Attribute).name === 'static')) {
        throw new Error(`[svelte-static-regions] Static attributes are not allowed in regular components: ${filename}`);
      }
    }
    for (const key of SVELTE_CHILD_KEYS) {
      if (key in node) {
        const val = (node as unknown as Record<string, unknown>)[key];
        if (Array.isArray(val)) val.forEach((v) => throwOnStatic(v as AST.SvelteNode));
        else if (val && typeof val === 'object') throwOnStatic(val as AST.SvelteNode);
      }
    }
  };

  if (ast.fragment) throwOnStatic(ast.fragment);

  const checkImports = (script: AST.Script | null | undefined) => {
    if (!script?.content?.body) return;
    for (const node of script.content.body) {
      if (node.type === 'ImportDeclaration' && typeof node.source.value === 'string' && node.source.value.includes('.static.')) {
        const beforeImport = content.slice(0, node.start).trimEnd();
        // Regex allows safe multiline/spaced checking for the ignore flag
        if (!/\/\/\s*svelte-static:\s*ignore\s*$/.test(beforeImport)) {
          console.warn(
            `\n\x1b[33m\x1b[1m[svelte-static-regions]\x1b[22m Warning: Dynamic use of static module \x1b[36m${node.source.value}\x1b[33m in ${filename}\x1b[0m`
          );
        }
      }
    }
  };
  checkImports(ast.instance);
  checkImports(ast.module);
}

// --- Compilation Core ---

/**
 * Extracts the source to pass to the SSR renderer for a given static node.
 *
 * - `<static>` wrapper elements: returns only the inner fragment content so
 *   the `<static>`/`</static>` tags never appear in the rendered output.
 * - Elements with a `static` attribute: returns the element with the `static`
 *   attribute stripped so it does not leak into the HTML output.
 * - `.static.svelte` components: returns the full node source unchanged.
 *
 * Note: the full original source is still used in the `{#if false}` block
 * inside replaceStaticRegions so Vite can bundle the component's CSS.
 */
function extractRegionSource(node: AST.SvelteNode, code: string): string {
  const { start, end } = getRange(node);
  const name = (node as { name?: unknown }).name;

  // <static>...</static> -> pass only the inner fragment to the SSR renderer
  if (node.type === 'RegularElement' && name === 'static') {
    const nodes = (node as { fragment?: { nodes?: unknown[] } }).fragment?.nodes;
    if (!nodes || nodes.length === 0) return '';
    const { start: fStart } = getRange(nodes[0]);
    const { end: fEnd } = getRange(nodes[nodes.length - 1]);
    return code.slice(fStart, fEnd);
  }

  // <element static> -> strip the `static` attribute before rendering
  if (node.type === 'RegularElement') {
    const attrs = (node as { attributes?: unknown[] }).attributes;
    if (Array.isArray(attrs)) {
      const staticAttr = attrs.find((a) => a && typeof a === 'object' && 'name' in a && (a as AST.Attribute).name === 'static');
      if (staticAttr) {
        const ms = new MagicString(code.slice(start, end));
        const { start: attrStart, end: attrEnd } = getRange(staticAttr);
        ms.remove(attrStart - start, attrEnd - start);
        return ms.toString();
      }
    }
  }

  // Component (.static.svelte) -> render the full source as-is
  return code.slice(start, end);
}

/**
 * Takes a specific snippet of template code, runs it through the SSR server,
 * and returns the rendered HTML string with the optional `htmlTransform` applied.
 *
 * The HTML is returned verbatim; curly-brace escaping is handled by the caller
 * via Svelte's `{@html}` directive rather than entity-encoding.
 */
async function renderStaticRegion(
  ssrServer: ViteDevServer,
  id: string,
  virtualId: string,
  node: AST.SvelteNode,
  code: string,
  scripts: string,
  htmlTransform: ((html: string) => string) | undefined
): Promise<string> {
  const state = getState();
  const regionContent = extractRegionSource(node, code);

  // SvelteKit 5 strict mode requires @render tags in layouts.
  // We inject a dummy snippet to satisfy this requirement in the isolated build.
  const isLayout = id.split('?')[0].endsWith('+layout.svelte');
  const dummySlot = isLayout ? '\n{#snippet __svelte_static_dummy()}{/snippet}\n{#if false}{@render __svelte_static_dummy()}{/if}' : '';

  const tempCode = `${scripts}\n${regionContent}${dummySlot}`;
  state.virtualFiles.set(virtualId, tempCode);

  try {
    const module = await ssrServer.ssrLoadModule(virtualId);
    const svelteServer = (await ssrServer.ssrLoadModule('svelte/server')) as SvelteServerModule;

    const renderResult = svelteServer.render(module.default);
    let generatedHtml = (renderResult.body ?? renderResult.html ?? '').trim();
    // Strip out svelte hydration markers. This is required, but may be prone to unwanted side effects
    generatedHtml = generatedHtml.replace(/<!--\[!?-->|<!--\]!?-->|<!---->/g, '');

    return htmlTransform ? htmlTransform(generatedHtml) : generatedHtml;
  } catch (err) {
    const e = err as Error;
    throw new Error(
      `[svelte-static-regions] Failed to render static region.\n\n${tempCode
        .split('\n')
        .map((l) => '    ' + l)
        .join('\n')}\n\nInner Error: ${e.message}\n${e.stack}`
    );
  } finally {
    state.virtualFiles.delete(virtualId);
  }
}

/**
 * Iterates through all found static regions in a file and replaces them
 * with their rendered HTML equivalents.
 *
 * The rendered HTML is injected via Svelte's `{@html}` directive rather than
 * direct interpolation, which correctly handles curly braces in JSON-LD script
 * blocks, `calc()` in inline styles, and JSON in data attributes without
 * corrupting them via entity encoding.
 *
 * The original markup is preserved inside `{#if false}` so that Vite still
 * sees and bundles the component's CSS.
 *
 * Throws on any rendering failure, including SSR server disconnects, to
 * prevent a partial transform from producing malformed Svelte source.
 */
async function replaceStaticRegions(
  ssrServer: ViteDevServer,
  id: string,
  code: string,
  scripts: string,
  nodesToReplace: AST.SvelteNode[],
  magicString: MagicString,
  htmlTransform: ((html: string) => string) | undefined
): Promise<void> {
  for (let i = 0; i < nodesToReplace.length; i++) {
    const node = nodesToReplace[i];
    const { start, end } = getRange(node);

    const hash = createHash('sha256').update(code.slice(start, end)).digest('hex').slice(0, 8);
    const normalizedId = id.replace(/\.[^/.]+$/, '.svelte');
    const virtualId = normalizedId + `?static-region=${i}_${hash}`;

    try {
      const html = await renderStaticRegion(ssrServer, id, virtualId, node, code, scripts, htmlTransform);

      // {@html} renders the string as raw HTML, so curly braces in the output
      // are never misread as Svelte template expressions. JSON.stringify produces
      // a valid JS string literal with all necessary escapes.
      const replacement = `{@html ${JSON.stringify(html)}}{#if false}${code.slice(start, end)}{/if}`;
      magicString.overwrite(start, end, replacement);
    } catch (err) {
      const e = err as Error;
      if (e.message.includes('transport was disconnected')) {
        throw new Error(
          `[svelte-static-regions] SSR server disconnected while rendering a region in "${id}". ` +
            `Aborting to prevent a partial transform from producing malformed Svelte output.`
        );
      }
      if (e.message.includes('Vite module runner has been closed')) {
        throw new Error(
          `[svelte-static-regions] SSR server closed while rendering a region in "${id}". ` +
            `Aborting to prevent a partial transform from producing malformed Svelte output.`
        );
      }
      throw new Error(`[svelte-static-regions] Failed to render static block in "${id}".\nInner Error: ${e.message}\n${e.stack}`);
    }
  }
}

/**
 * Ensures CSS from '.static.svelte' components is imported into the
 * main JS bundle even if the components themselves are removed from the runtime.
 */
function injectCssImports(ast: AST.Root, staticImports: StaticImport[], magicString: MagicString): void {
  const uniquePaths = new Set(staticImports.map((i) => i.path));
  let sideEffectImports = '\n/* static-region css preservation */\n';

  for (const path of uniquePaths) {
    sideEffectImports += `import "${path}";\n`;
  }

  if (ast.instance?.content) {
    const { start } = getRange(ast.instance.content);
    magicString.appendRight(start, sideEffectImports);
  } else {
    magicString.prepend(`<script>${sideEffectImports}</script>\n`);
  }
}

/**
 * Orchestrates the parsing, rendering, and rewriting of a Svelte file.
 */
async function processTransform(code: string, id: string, htmlTransform: ((html: string) => string) | undefined): Promise<Processed | void> {
  let ast: AST.Root;
  try {
    ast = parse(code, { filename: id, modern: true });
  } catch (err) {
    const e = err as Error;
    throw new Error(`[svelte-static-regions] Failed to parse svelte code of "${id}".\nInner Error: ${e.message}\n${e.stack}`);
  }

  const templateRoot = ast.fragment;
  if (!templateRoot) return;

  const staticImports = getStaticImports(ast);
  const nodesToReplace = findStaticNodes(templateRoot, staticImports);

  if (nodesToReplace.length === 0) return;

  const state = getState();
  if (!state.serverPromise) throw new Error('[svelte-static-regions] SSR server was not initialized.');

  for (const node of nodesToReplace) {
    checkInteractivity(node, id);
  }

  const ssrServer = await state.serverPromise;
  const magicString = new MagicString(code);
  const scripts = getScripts(code, ast);

  await replaceStaticRegions(ssrServer, id, code, scripts, nodesToReplace, magicString, htmlTransform);

  if (staticImports.length > 0) {
    injectCssImports(ast, staticImports, magicString);
  }

  return {
    code: magicString.toString(),
    map: magicString.generateMap({ hires: true, source: id, includeContent: true })
  };
}

// --- Vite Plugins ---

/**
 * The main plugin suite for Svelte Static Regions.
 * Returns two plugins: one for 'pre' processing (rendering) and one for 'post' (stripping JS).
 */
export function svelteStaticRegions(options: StaticRegionOptions = {}): Plugin[] {
  const isStaticPass = process.env.IS_STATIC_REGION_SERVER === 'true';
  const fileFilter = options.fileFilter ?? ((filename) => filename.startsWith('+'));
  const { htmlTransform } = options;

  let extensions = options.extensions ?? ['.svelte'];
  let viteConfig: ResolvedConfig;

  const isSvelteFile = (id: string) => {
    return extensions.some((ext) => id.endsWith(ext));
  };

  // Inject our hook AFTER sveltex/mdsvex have turned Markdown into HTML.
  // This requires using a svelte preprocessor instead of a vite `transform` hook.
  const preprocessor: PreprocessorGroup = {
    name: 'svelte-static-regions',
    markup: ({ content, filename }: { content: string; filename?: string }) => {
      if (isStaticPass || !filename) return;

      const isSvelte = isSvelteFile(filename);
      if (!isSvelte || filename.includes('?static-region=')) return;

      // Ensure .static.svelte components themselves are checked for dead interactivity
      if (filename.endsWith('.static.svelte')) {
        let ast: AST.Root;
        try {
          ast = parse(content, { filename, modern: true });
        } catch {
          return;
        }
        if (ast.fragment) {
          checkInteractivity(ast.fragment, filename);
        }
        return;
      }

      const fname = filename.split('/').pop() ?? '';
      const isStaticCapable = fileFilter(fname, filename);

      if (!isStaticCapable) {
        if (content.includes('static')) {
          checkRegularComponent(content, filename);
        }
        return;
      }

      if (!content.includes('static')) return;

      return processTransform(content, filename, htmlTransform);
    }
  };

  /**
   * Plugin 1: The Pre-processor.
   * Handles SSR rendering and defines the __STATIC__ constant.
   */
  const prePlugin: Plugin = {
    name: 'svelte-static-regions:pre',
    enforce: 'pre',

    config() {
      return { define: { __STATIC__: isStaticPass ? 'true' : 'false' } };
    },

    configResolved(config) {
      viteConfig = config;
      if (!options.extensions) {
        // Automatically extract extensions from vite-plugin-svelte
        const sveltePlugin = config.plugins.find((p) => p.name === 'vite-plugin-svelte:config');
        const svelteOpts = sveltePlugin?.api?.options as SvelteConfig;
        if (svelteOpts) {
          const svelteExts = svelteOpts.extensions;
          if (Array.isArray(svelteExts)) extensions = svelteExts;

          const preprocessors = [svelteOpts.preprocess ?? []].flat();
          preprocessors.push(preprocessor);
          svelteOpts.preprocess = preprocessors;
        }
      }
      if (process.env.DEBUG !== 'false') {
        console.log('[svelte-static-regions] Using extensions: ', extensions);
      }
    },

    resolveId(id: string) {
      // Allow virtual static-region files to be resolved.
      if (id.includes('?static-region=') && !id.includes('&svelte')) return id;
      // Suppress CSS in the inner SSR server to speed up rendering.
      if (isStaticPass && id.includes('svelte&type=style')) return '\0suppressed-svelte-css';
    },

    load(id: string) {
      if (id.includes('?static-region=') && !id.includes('&svelte')) {
        return getState().virtualFiles.get(id);
      }
      if (isStaticPass && id === '\0suppressed-svelte-css') return '';
    },

    configureServer(server) {
      // Ensure the background server dies with the main dev server.
      server.httpServer?.on('close', async () => {
        const state = getState();
        if (state.serverPromise) {
          const s = await state.serverPromise;
          await s.close().catch(() => {});
          state.serverPromise = null;
          delete process.env.IS_STATIC_REGION_SERVER;
        }
      });
    },

    handleHotUpdate({ file }) {
      // Clear SSR cache when static components or Svelte files change.
      if (file.includes('.static.') || isSvelteFile(file)) {
        const state = getState();
        state.serverPromise
          ?.then((inner) => {
            const mod = inner.moduleGraph.getModuleById(file);
            if (mod) inner.moduleGraph.invalidateModule(mod);
          })
          .catch((err: unknown) => {
            console.warn('[svelte-static-regions] Failed to invalidate SSR module cache:', err);
          });
      }
    },

    async buildStart() {
      // Start the background Vite server once per build.
      if (isStaticPass) return;
      const state = getState();

      // We must mirror the HMR configuration of the main Vite server. Using a different value would cause a mismatch of scoped css ids.
      if (state.refs++ === 0) {
        process.env.IS_STATIC_REGION_SERVER = 'true';
        state.serverPromise = createServer({
          mode: viteConfig.mode,
          configFile: viteConfig.configFile,
          customLogger: viteConfig.customLogger,
          appType: 'custom',
          server: { middlewareMode: true, watch: null, hmr: viteConfig.server?.hmr ?? true }
        } satisfies InlineConfig);
        await state.serverPromise;
      }
    },

    async buildEnd() {
      // Gracefully shutdown the background server.
      if (isStaticPass) return;
      const state = getState();

      if (--state.refs === 0 && state.serverPromise) {
        const server = await state.serverPromise;
        await server.close().catch(() => {});
        state.serverPromise = null;
        delete process.env.IS_STATIC_REGION_SERVER;
      }
    }
  };

  /**
   * Plugin 2: The Logic Stripper.
   * Replaces '.static.ts' files and '.static.svelte' logic with proxies or empty shells.
   */
  const postPlugin: Plugin = {
    name: 'svelte-static-regions:post',
    enforce: 'post',

    generateBundle(_options, bundle) {
      if (isStaticPass) return;

      // Final safety check: throw an error if backend-only proxy leaked into the JS bundle without being tree-shaken.
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type === 'chunk') {
          for (const moduleId in chunk.modules) {
            const chunkFilename = moduleId.split('?')[0].split('/').pop() ?? '';
            if (chunkFilename.includes('.static.') && !isSvelteFile(chunkFilename)) {
              this.error(
                `[svelte-static-regions] Static module leaked into bundle: "${chunkFilename}" in "${fileName}".\n` +
                  `Backend logic from .static files must only be used inside <static> blocks.`
              );
            }
          }
        }
      }
    },

    transform(this: TransformPluginContext, code: string, id: string) {
      if (isStaticPass) {
        // Strip out sourcemaps completely for inner server virtual files, to avoid unnecessary sourcemap errors
        // IDs are normalized to a .svelte extension to avoid duplicate pre-processing, but that messes up the sourcemap.
        // Since it's only internal anyway, it doesn't matter and it's better to remove them entirely.
        if (id.includes('?static-region=')) {
          return {
            code: code.replace(/\/\/# sourceMappingURL=.*/g, '').replace(/\/\*# sourceMappingURL=.*?\*\//g, ''),
            map: { version: 3 as const, mappings: '', sources: [], names: [] }
          };
        }
        return null;
      }

      const cleanId = id.split('?')[0];
      const filename = cleanId.split('/').pop() ?? '';

      /**
       * Replaces '.static.ts' logic files with "poisoned" proxies.
       * If these proxies are ever called on the client, they throw a helpful error
       * explaining that the code leaked.
       *
       * The `createProxy` function tracks the full property-access path through
       * its `name` parameter so that error messages remain meaningful even when
       * deeply-nested properties are accessed (e.g. `myModule.util.format`).
       *
       * Note: `filename` is a build-time constant baked into the error strings.
       * `name` (without a backslash) would be undefined at build time, the
       * escapes on `\${name}` are intentional so that `name` is evaluated at
       * runtime as the proxy's parameter, not at transform time.
       */
      if (filename.includes('.static.') && !isSvelteFile(filename)) {
        const ast = this.parse(code) as ESTree.Program;
        const exports: string[] = [];
        let hasDefault = false;

        const extractIds = (node: ESTree.Pattern | undefined | null) => {
          if (!node) return;
          if (node.type === 'Identifier') exports.push(node.name);
          else if (node.type === 'ObjectPattern') {
            node.properties.forEach((p) => {
              if (p.type === 'Property') extractIds(p.value);
              else if (p.type === 'RestElement') extractIds(p.argument);
            });
          } else if (node.type === 'ArrayPattern') {
            node.elements.forEach((e) => extractIds(e));
          } else if (node.type === 'RestElement') {
            extractIds(node.argument);
          }
        };

        for (const node of ast.body) {
          if (node.type === 'ExportNamedDeclaration') {
            if (node.declaration) {
              if (node.declaration.type === 'VariableDeclaration') {
                node.declaration.declarations.forEach((d) => extractIds(d.id));
              } else if ('id' in node.declaration && node.declaration.id?.type === 'Identifier') {
                exports.push(node.declaration.id.name);
              }
            }
            if (node.specifiers) {
              node.specifiers.forEach((s) => {
                if (s.exported.type === 'Identifier') exports.push(s.exported.name);
                else if (s.exported.type === 'Literal' && typeof s.exported.value === 'string') exports.push(s.exported.value);
              });
            }
          } else if (node.type === 'ExportDefaultDeclaration') {
            hasDefault = true;
          }
        }

        const out = [
          `const createProxy = (name) => new Proxy(function() {}, {`,
          `  get(t, p) {`,
          `    if (p === '__esModule') return true;`,
          `    if (p === 'then') return undefined;`,
          `    if (p === Symbol.toPrimitive || p === 'toString') return () => \`[StaticProxy \${name}]\`;`,
          `    return createProxy(\`\${name}.\${String(p)}\`);`,
          `  },`,
          `  apply() {`,
          `    throw new Error(\`[svelte-static-regions] Static leak: '\${name}' from '${filename}' was called at runtime. Ensure this is inside a <static> block.\`);`,
          `  },`,
          `  construct() {`,
          `    throw new Error(\`[svelte-static-regions] Static leak: '\${name}' from '${filename}' was instantiated at runtime.\`);`,
          `  }`,
          `});`,
          ...Array.from(new Set(exports)).map((exp) => `export const ${exp} = createProxy("${exp}");`),
          hasDefault ? `export default createProxy("default");` : ''
        ].join('\n');

        return { code: out, map: null, moduleSideEffects: false };
      }

      return null;
    }
  };

  return [prePlugin, postPlugin];
}
