import type { WsrvOperations } from 'unpic/providers/wsrv';
import { createExtractAndGenerate, createOperationsHandlers, toCanonicalUrlString, toUrl } from 'unpic/utils';
import type { URLExtractor, URLGenerator, URLTransformer } from 'unpic';

const { operationsGenerator, operationsParser } = createOperationsHandlers<WsrvOperations>({
  keyMap: {
    width: 'w',
    height: 'h',
    format: 'output',
    quality: 'q'
  },
  defaults: {
    fit: 'cover'
  }
});

export const extract: URLExtractor<'wsrv'> = (url) => {
  const urlObj = toUrl(url);

  const srcParam = urlObj.searchParams.get('url');
  if (!srcParam) {
    return null;
  }

  let src = srcParam;
  if (!src.startsWith('http://') && !src.startsWith('https://')) {
    src = 'https://' + src;
  }

  urlObj.searchParams.delete('url');

  const operations = operationsParser(urlObj);

  return {
    src,
    operations
  };
};

export const generate: URLGenerator<'wsrv'> = (src, operations) => {
  const url = new URL('https://wsrv.nl/');

  const srcUrl = typeof src === 'string' ? src : src.toString();
  url.searchParams.set('url', srcUrl);

  const params = operationsGenerator(operations);
  const searchParams = new URLSearchParams(params);
  for (const [key, value] of searchParams) {
    if (key !== 'url') {
      url.searchParams.set(key, value);
    }
  }

  return toCanonicalUrlString(url);
};

export const transform: URLTransformer<'wsrv'> = createExtractAndGenerate(extract, generate);
