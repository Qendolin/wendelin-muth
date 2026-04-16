import { createHighlighter } from 'shiki';

const highlighter = await createHighlighter({
  themes: ['catppuccin-latte', 'catppuccin-macchiato'],
  langs: ['javascript', 'typescript', 'svelte', 'css', 'html', 'bash', 'json', 'python', 'c']
});

export function highlight(lang: string, code: string) {
  code = code.replaceAll(/^[ \t]*\n/gs, '').replaceAll(/\n[ \t]*$/gs, '');
  const indent = code.split('\n').reduce((min, line, i) => {
    if (line.length == 0 || i == 0) return min;
    return Math.min(line.match(/^ */)?.[0]?.length ?? 0);
  }, Number.POSITIVE_INFINITY);
  code = code.replaceAll(RegExp(`^ {${indent}}`, 'gm'), '');
  return highlighter.codeToHtml(code, {
    lang: lang,
    themes: {
      light: 'catppuccin-latte',
      dark: 'catppuccin-macchiato'
    }
  });
}

/*

Example:

<script>
import { highlight } from '$lib/code';
</script>

This is an example codeblock
{@html highlight('javascript', `
  console.log("Hello World!");
`)}

*/
