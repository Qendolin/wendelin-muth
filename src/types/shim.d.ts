declare module '@bbob/html';
declare module '@bbob/core';
declare module '@bbob/preset-html5';
declare module '@bbob/plugin-helper/lib/TagNode' {
	import type { Attributes, Node, Tag } from '$lib/bbcode/types';

	export class TagNode {
		public tag: string;
		public attrs: Attributes;
		public content: Node[];
		public get length(): number;

		constructor(tag: string, attrs: Attributes, content: Node[]);

		public attr(name: string, value: string): string;
		public append(value: Node): void;
		public toTagStart({
			openTag = '[',
			closeTag = ']'
		}: {
			openTag: string;
			closeTag: string;
		}): string;
		public toTagEnd({
			openTag = '[',
			closeTag = ']'
		}: {
			openTag: string;
			closeTag: string;
		}): string;
		public toTagNode(): TagNode;
		public toString({
			openTag = '[',
			closeTag = ']'
		}: {
			openTag: string;
			closeTag: string;
		}): string;

		public static create(tag: string, attrs?: Attributes, content?: Node[]): TagNode;
		public static isOf(node: Tag, type: string): boolean;
		public static isOf(node: TagNode, type: string): boolean;
	}
}
declare module '@bbob/plugin-helper/lib/index' {
	import type { Attributes, Node, Tag } from '$lib/bbcode/types';

	export function isTagNode(node: Node): node is Tag;
	export function isStringNode(node: Node): node is string;
	export function getUniqAttr(attr: Attributes): string | null;
}
declare module '@bbob/preset';
