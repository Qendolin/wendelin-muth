import { sveltex } from '@nvl/sveltex';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import remarkGfm from 'remark-gfm';
import type * as Hast from 'hast';
import type * as MDast from 'mdast';
import type * as RemarkRehype from 'remark-rehype';

// Idfk where to get the type from
type RemarkRehypeHandlers = RemarkRehype.Options['handlers'];

const handlers: RemarkRehypeHandlers = {
  link(state, node: MDast.Link) {
    const properties: Hast.Properties = { href: node.url, title: node.title };
    const result: Hast.Element = {
      type: 'element',
      tagName: 'Link',
      properties,
      children: state.all(node)
    };
    state.patch(node, result);
    return state.applyData(node, result);
  },
  image(state, node: MDast.Image) {
    const attribs = node.alt?.match(/\s*\|([^\|]*)$/)?.[1] ?? '';
    const [, w, h] = attribs.match(/=(\d*)x(\d*)/) ?? [];
    const alt = node.alt?.replace(/\s*\|[^\|]*$/, '');

    const properties: Hast.Properties = { src: node.url, alt: alt, title: node.title, w: w, h: h };
    const result: Hast.Element = {
      type: 'element',
      tagName: 'Image',
      properties,
      children: state.all(node)
    };
    state.patch(node, result);
    return state.applyData(node, result);
  }
};

export default await sveltex(
  {
    markdownBackend: 'unified',
    codeBackend: 'shiki',
    mathBackend: 'mathjax'
  },
  {
    markdown: {
      remarkPlugins: [remarkGfm],
      remarkRehypeOptions: {
        handlers
      },
      rehypePlugins: [rehypeAutolinkHeadings],
      rehypeStringifyOptions: {},
      components: [
        {
          name: 'Link',
          importPath: '$lib/components/Link.svelte'
        },
        {
          name: 'Image',
          importPath: '$lib/components/Image.svelte'
        }
      ],
      directives: {
        enabled: false
      }
    },
    code: {
      shiki: {
        tabindex: false,
        themes: {
          light: 'catppuccin-latte',
          dark: 'catppuccin-macchiato'
        }
      }
    }
  }
);
