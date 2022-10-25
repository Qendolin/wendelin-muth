export type Node = string | number | Tag;
export type Tag = {
	tag: string;
	content: Node[];
	attrs: Attributes;
	secure?: boolean;
};
export type Attributes = { [key: string]: string } & { $?: (el: HTMLElement) => void };
