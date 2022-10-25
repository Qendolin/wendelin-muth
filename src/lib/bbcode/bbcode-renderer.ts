import core from '@bbob/core';
import type { Tag, Node } from './types';

const renderNode = (node: Node, { stripTags = false }): globalThis.Node | globalThis.Node[] => {
	if (!node) return document.createTextNode('');
	const type = typeof node;

	if (type === 'string' || type === 'number') {
		return document.createTextNode(String(node));
	}

	if (Array.isArray(node)) {
		return renderNodes(node, { stripTags });
	}

	if (type === 'object') {
		const tag = node as Tag;
		if (stripTags === true) {
			return renderNodes(tag.content, { stripTags });
		}

		const element = document.createElement(tag.tag);
		for (const name in tag.attrs) {
			const value = tag.attrs[name];
			if (name == '$') {
				if (value && typeof value === 'function') (value as (el: HTMLElement) => void)(element);
				continue;
			}
			try {
				element.setAttribute(name, value);
				// eslint-disable-next-line no-empty
			} catch (ignored) {}
		}

		if (tag.content === null) {
			return element;
		}

		element.append(...renderNodes(tag.content));
		return element;
	}

	return document.createTextNode('');
};

const renderNodes = (nodes: Node[], { stripTags = false } = {}): globalThis.Node[] => {
	return nodes.flatMap((node) => renderNode(node, { stripTags }));
};

const toHTML = (source: string, plugins: any, options: any) =>
	core(plugins).process(source.replace(/\n(?= *\n)| {2,}\n/g, '[br][/br]\n'), {
		...options,
		render: (nodes: Node[], opts: any) => {
			const frag = document.createDocumentFragment();
			frag.append(...renderNodes(nodes, opts));
			return frag;
		}
	}).html as string;

export const render = renderNodes;
export default toHTML;
