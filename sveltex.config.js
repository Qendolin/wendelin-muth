import { sveltex } from '@nvl/sveltex';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import remarkGfm from 'remark-gfm';

/** @typedef {import('hast').Properties} HastProperties */
/** @typedef {import('hast').Element} HastElement */
/** @typedef {import('mdast').Link} MdastLink */
/** @typedef {import('mdast').Image} MdastImage */
/** @typedef {import('remark-rehype').Options['handlers']} RemarkRehypeHandlers */

/**
 * Custom handlers for remark-rehype to transform Markdown nodes
 * into HAST (HTML Abstract Syntax Tree) elements.
 *
 * @type {RemarkRehypeHandlers}
 */
const handlers = {
  /**
   * @param {any} state - The remark-rehype state.
   * @param {MdastLink} node - The Markdown link node.
   */
  link(state, node) {
    /** @type {HastProperties} */
    const properties = { href: node.url, title: node.title };

    /** @type {HastElement} */
    const result = {
      type: 'element',
      tagName: 'Link',
      properties,
      children: state.all(node)
    };

    state.patch(node, result);
    return state.applyData(node, result);
  },

  /**
   * @param {any} state - The remark-rehype state.
   * @param {MdastImage} node - The Markdown image node.
   */
  image(state, node) {
    const attribs = node.alt?.match(/\s*\|([^\|]*)$/)?.[1] ?? '';
    const [, w, h] = attribs.match(/=(\d*)x(\d*)/) ?? [];
    const alt = node.alt?.replace(/\s*\|[^\|]*$/, '');

    /** @type {HastProperties} */
    const properties = {
      src: node.url,
      alt: alt,
      title: node.title,
      w: w,
      h: h
    };

    /** @type {HastElement} */
    const result = {
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
          importPath: '$lib/components/Link.static.svelte'
        },
        {
          name: 'Image',
          importPath: '$lib/components/Image.static.svelte'
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
