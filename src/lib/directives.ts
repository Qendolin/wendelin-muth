export function spinner(node: HTMLElement, show: boolean) {
	node.classList.add('spinner-container');

	const update = () => {
		const contains = node.classList.contains('spinner-container');
		if (show && !contains) {
			node.classList.add('spinner-container');
		} else if (contains) {
			node.classList.remove('spinner-container');
		}
	};
	update();

	return {
		update(newShow: boolean) {
			show = newShow;
			update();
		},

		destroy() {
			node.classList.remove('spinner-container');
		}
	};
}
