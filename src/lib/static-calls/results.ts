/** Generated callsite ID to results ordered by rendered component occurrence. */
export type StaticCallResultMap = Record<string, unknown[]>;
export type StaticCallPages = Record<string, StaticCallResultMap>;
export type StaticCallRoutes = Record<string, StaticCallPages>;

export interface StaticCallRecord {
  routeId: string;
  pathname: string;
  siteId: string;
  result: unknown;
}

const UNDEFINED_RESULT = '__svelteStaticUndefined__';

function serializeResult(value: unknown, ancestors = new WeakSet<object>()): unknown {
  if (value === undefined) return { [UNDEFINED_RESULT]: true };
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new TypeError('$static results must not contain NaN or Infinity.');
    return value;
  }
  if (typeof value !== 'object') {
    throw new TypeError(`$static results cannot contain values of type '${typeof value}'.`);
  }
  if (ancestors.has(value)) throw new TypeError('$static results cannot contain circular references.');

  ancestors.add(value);
  try {
    if (Array.isArray(value)) {
      return Array.from({ length: value.length }, (_, index) => {
        const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
        if (!descriptor) throw new TypeError('$static results cannot contain sparse arrays.');
        if (!('value' in descriptor)) throw new TypeError('$static results cannot contain accessor properties.');
        return serializeResult(descriptor.value, ancestors);
      });
    }

    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      throw new TypeError('$static results may contain only plain objects and arrays.');
    }
    if (Object.getOwnPropertySymbols(value).length > 0) {
      throw new TypeError('$static results cannot contain symbol-keyed properties.');
    }

    const descriptors = Object.getOwnPropertyDescriptors(value);
    const result: Record<string, unknown> = Object.create(null);
    for (const [key, descriptor] of Object.entries(descriptors)) {
      if (!descriptor.enumerable) continue;
      if (!('value' in descriptor)) throw new TypeError('$static results cannot contain accessor properties.');
      if (key === UNDEFINED_RESULT) throw new TypeError(`$static results cannot use the reserved property '${UNDEFINED_RESULT}'.`);
      result[key] = serializeResult(descriptor.value, ancestors);
    }
    return result;
  } finally {
    ancestors.delete(value);
  }
}

export function serializeStaticCallRecord(routeId: string, pathname: string, siteId: string, result: unknown): StaticCallRecord {
  return { routeId, pathname, siteId, result: serializeResult(result) };
}
