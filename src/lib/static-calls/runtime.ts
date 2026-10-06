import { page } from '$app/state';
import { serializeStaticCallRecord, type StaticCallPages } from './results';
import { appendStaticCallRecord } from 'virtual:svelte-static-call-capture';

declare const __STATIC_RESULT_CAPTURE__: boolean;

const routeResults = new Map<string, StaticCallPages>();
let activePage = '';
// Each callsite can occur in multiple rendered component instances on one page.
const cursors = new Map<string, number>();

function getPageKey(): { routeId: string; pathname: string; key: string } | null {
  try {
    const routeId = page.route.id;
    const pathname = page.url.pathname;
    if (!routeId) return null;
    return { routeId, pathname, key: `${routeId}\0${pathname}` };
  } catch {
    return null;
  }
}

export function registerStaticCallResults(routeId: string, pages: StaticCallPages): void {
  routeResults.set(routeId, pages);
}

function reviveStaticResult(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(reviveStaticResult);
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    if (record.__svelteStaticUndefined__ === true && Object.keys(record).length === 1) return undefined;
    return Object.fromEntries(Object.entries(record).map(([key, entry]) => [key, reviveStaticResult(entry)]));
  }
  return value;
}

export function getStaticCallResult<T>(siteId: string): T {
  const current = getPageKey();
  if (!current) throw new Error(`[static-call] Cannot resolve slot '${siteId}' outside a page.`);

  if (current.key !== activePage) {
    activePage = current.key;
    cursors.clear();
  }

  const results = routeResults.get(current.routeId)?.[current.pathname]?.[siteId];
  if (!results) {
    throw new Error(`[static-call] No prerendered results for slot '${siteId}' on ${current.pathname}.`);
  }

  const index = cursors.get(siteId) ?? 0;
  if (index >= results.length) {
    throw new Error(`[static-call] Slot '${siteId}' was evaluated more times on ${current.pathname} than during prerender.`);
  }

  cursors.set(siteId, index + 1);
  return reviveStaticResult(results[index]) as T;
}

export function evaluateStaticCall<T>(siteId: string, evaluate: () => T): T {
  const result = evaluate();
  if (__STATIC_RESULT_CAPTURE__) {
    const current = getPageKey();
    if (current) {
      appendStaticCallRecord(JSON.stringify(serializeStaticCallRecord(current.routeId, current.pathname, siteId, result)));
    }
  }
  return result;
}
