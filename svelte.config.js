import adapter from '@sveltejs/adapter-static';
import MagicString from 'magic-string';

import sveltexConfig from './sveltex.config.js';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  compilerOptions: {
    runes: true
  },
  kit: {
    adapter: adapter(),
    alias: {
      '$app.css': 'src/routes/app.css'
    },
    paths: {
      relative: false
    }
  },
  preprocess: [
    sveltexConfig,
    {
      name: 'fix-sveltex-shit',
      markup(/** @type { {content: string; filename?: string} } */ { content, filename }) {
        if (!filename?.endsWith('.sveltex')) return;

        const s = new MagicString(content);

        const openBrace = /\{/g;
        const closeBrace = /\}/g;

        const scriptEnd = content.lastIndexOf('</script>');

        let match;
        while ((match = openBrace.exec(content))) {
          if (match.index > scriptEnd) {
            s.overwrite(match.index, match.index + 1, '&lbrace;');
          }
        }
        while ((match = closeBrace.exec(content))) {
          if (match.index > scriptEnd) {
            s.overwrite(match.index, match.index + 1, '&rbrace;');
          }
        }

        const contextModule = /context="module"/g;
        while ((match = contextModule.exec(content))) {
          s.overwrite(match.index, match.index + match[0].length, 'module');
        }

        return {
          code: s.toString(),
          map: s.generateMap({
            source: filename,
            file: filename,
            includeContent: true
          })
        };
      }
    }
  ],
  extensions: ['.svelte', '.sveltex']
};

export default config;
