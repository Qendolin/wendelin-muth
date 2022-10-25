import { getUniqAttr, isStringNode, isTagNode } from '@bbob/plugin-helper/lib/index';
import { TagNode } from '@bbob/plugin-helper/lib/TagNode';
import type { Node, Attributes, Tag } from './types';
import { createPreset } from '@bbob/preset';

const renderStyle = (name: string, value: string) => {
	value = value.replaceAll(`"`, ``).replaceAll(`'`, '').replaceAll(`;`, '');
	return `${name}: ${value};`;
};

const styleMap = {
	color: (val: string) => renderStyle('color', val)
} as { [key: string]: (val: string) => string };

const getStyleFromAttrs = (attrs: Attributes) => {
	let style = '';
	for (const name in styleMap) {
		if (Object.prototype.hasOwnProperty.call(attrs, name)) {
			style += styleMap[name](attrs[name]);
		}
	}
	return { style };
};

const getColorStyle = (attrs: Attributes) => {
	return getStyleFromAttrs({
		color: getUniqAttr(attrs) ?? 'inherit'
	});
};

const asListItems = (content: Node[]) => {
	let listIdx = 0;
	const listItems: Node[] = [];

	const createItemNode = () => {
		const node = TagNode.create('li');
		(node as any).secure = true;
		return node;
	};
	const ensureListItem = (val: Node) => {
		listItems[listIdx] = listItems[listIdx] || val;
	};
	const addItem = (val: Node) => {
		if (listItems[listIdx] && isTagNode(listItems[listIdx] as Tag)) {
			const tag = listItems[listIdx] as Tag;
			tag.content = tag.content.concat(val);
		} else {
			const content = listItems[listIdx] as any;
			listItems[listIdx] = content.concat(val);
		}
	};

	content.forEach((node) => {
		if (isStringNode(node) && node.startsWith('*')) {
			if (listItems[listIdx]) {
				listIdx++;
			}
			ensureListItem(createItemNode());
			addItem(node.substring(1));
		} else if (isTagNode(node) && TagNode.isOf(node, '*')) {
			if (listItems[listIdx]) {
				listIdx++;
			}
			ensureListItem(createItemNode());
		} else if (!isTagNode(listItems[listIdx])) {
			listIdx++;
			ensureListItem(node);
		} else if (listItems[listIdx]) {
			addItem(node);
		} else {
			ensureListItem(node);
		}
	});

	return listItems;
};

const getUrlHref = (node: TagNode, render: any) => {
	let url = getUniqAttr(node.attrs);
	url ??= render(node.content, { stripTags: true })?.textContent ?? '';
	return url;
};

const getImgSrc = (node: TagNode, render: any) => {
	if (typeof node.content == 'string') return node.content;
	return render(node.content, { stripTags: true })?.textContent ?? '';
};

const toNode = (tag: string, attrs: any, content: Node[]) => ({
	tag,
	attrs,
	content,
	secure: true
});

export const definitions = {
	b: (node: TagNode) => toNode('b', {}, node.content),
	i: (node: TagNode) => toNode('i', {}, node.content),
	u: (node: TagNode) => toNode('span', { style: `text-decoration: underline;` }, node.content),
	s: (node: TagNode) => toNode('s', {}, node.content),
	br: (node: TagNode) => toNode('br', {}, node.content),
	url: (node: TagNode, { render }: any) =>
		toNode(
			'a',
			{
				href: getUrlHref(node, render),
				rel: 'noreferrer noopener nofollow',
				target: '_blank'
			},
			node.content
		),
	img: (node: TagNode, { render }: any) =>
		toNode(
			'img',
			{
				src: getImgSrc(node, render),
				referrerpolicy: 'no-referrer',
				crossorigin: 'anonymous',
				width: node.attrs.width,
				height: node.attrs.height
			},
			[]
		),
	quote: (node: TagNode) => toNode('blockquote', {}, node.content),
	code: (node: TagNode, { render }: any) => {
		const content = render(node.content, { stripTags: true }).textContent;
		const block = content.includes('\n');
		return toNode(
			'code',
			{
				style: block ? 'display: block;' : ''
			},
			[
				toNode(
					'pre',
					{
						style: block ? '' : 'display: inline-block; margin: unset;'
					},
					[content.replace(/^\s*\n/, '')]
				)
			]
		);
	},
	style: (node: TagNode) => toNode('span', getStyleFromAttrs(node.attrs), node.content),
	color: (node: TagNode) => toNode('span', getColorStyle(node.attrs), node.content),
	ul: (node: TagNode) => toNode('ul', {}, asListItems(node.content)),
	ol: (node: TagNode) => toNode('ol', {}, asListItems(node.content)),
	spoiler: (node: TagNode) =>
		toNode(
			'button',
			{
				class: 'bbcode-spoiler',
				$: (el: HTMLElement) => {
					const toggle = () => {
						el.classList.toggle('bbcode-spoiler-revealed');
						const child = el.firstElementChild;
						if (!child) return;
						child.ariaHidden = child.ariaHidden === 'true' ? 'true' : 'false';
					};
					el.addEventListener('click', toggle);
				}
			},
			[
				toNode(
					'span',
					{
						'aria-hidden': 'true'
					},
					node.content
				)
			]
		)
};

function process(tags: any, tree: any, core: any, options: any) {
	tree.walk((node: any) => {
		if (isTagNode(node)) {
			if (tags[node.tag]) {
				const result = tags[node.tag](node, core, options);
				return result;
			}
			if (node.secure === true) {
				return node;
			}
			return {
				tag: 'span',
				attrs: {},
				content: node.content
			};
		}
		return node;
	});
}

export const preset = createPreset(definitions, process);
