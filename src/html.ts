export type ElementInitializer = {
	class?: string | string[];
	attr?: {
		[key: string]: string;
	};
	on?: {
		[key in keyof HTMLElementEventMap]?: (this: HTMLElement, ev: HTMLElementEventMap[key]) => any;
	};
	childs?: HTMLElement[];
	text?: string;
};

export function $(selector: string): HTMLElement | null;
export function $(element: 'text', text: string): Text;
export function $(element: string, init: ElementInitializer): HTMLElement;

export function $(...args: any): Text | HTMLElement | null {
	const [arg0, arg1] = args;
	if (arg1 === undefined) {
		return document.querySelector(arg0);
	}

	if (arg0 == 'text') {
		return document.createTextNode(arg1);
	}

	const init = <ElementInitializer>arg1;
	const el = document.createElement(arg0);

	init.class ??= [];
	init.attr ??= {};
	init.on ??= {};
	init.childs ??= [];
	init.text ??= '';
	if (typeof init.class == 'string') init.class = init.class.split(/\s+/);
	for (const cl of init.class) {
		el.classList.add(cl);
	}
	for (const key in init.attr) {
		const value = init.attr[key];
		el.setAttribute(key, value);
	}
	for (const ev in init.on) {
		el.addEventListener(ev, (init.on as any)[ev]);
	}
	for (const child of init.childs.reverse()) {
		el.append(child);
	}
	if (init.text != '') {
		el.textContent = init.text;
	}

	return el;
}
