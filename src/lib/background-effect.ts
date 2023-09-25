import './background-effect.css';

const symbol = Symbol.for('background_effect');

export function addBackgroundEffect() {
	if (!globalThis?.document?.body) return;

	let instance = (globalThis as any)[symbol];
	instance?.stop();
	instance = new BackgroundEffect();
	(globalThis as any)[symbol] = instance;
	instance.loop();
}

type PointerPos = {
	x: number;
	y: number;
};

class BackgroundEffect {
	private readonly wrapper: HTMLElement;
	private readonly canvas: HTMLCanvasElement;
	private readonly ctx: CanvasRenderingContext2D;
	private stopped: boolean;
	private pointerEvents: PointerPos[];
	private moveListener: any;
	private scrollListener: any;
	private line: { x: number; y: number } | null = null;
	private pointer: PointerPos | null = null;

	constructor() {
		this.wrapper = document.createElement('div');
		this.wrapper.id = 'background-effect';
		this.wrapper.inert = true;
		this.canvas = document.createElement('canvas');
		this.wrapper.append(this.canvas);
		document.body.prepend(this.wrapper);
		this.ctx = this.canvas.getContext('2d')!;
		this.ctx.beginPath();
		this.ctx.imageSmoothingEnabled = false;

		this.stopped = false;
		this.pointerEvents = [];
		this.moveListener = this.onPointerMove.bind(this);
		this.scrollListener = this.onScroll.bind(this);
		document.addEventListener('pointermove', this.moveListener);
		document.addEventListener('scroll', this.scrollListener);
	}

	private onScroll(ev: Event) {
		if (this.pointer == null) return;

		this.pointerEvents.push({ x: this.pointer.x, y: this.pointer.y });
	}

	private onPointerMove(ev: PointerEvent) {
		this.pointer ??= {} as PointerPos;
		this.pointer.x = ev.clientX;
		this.pointer.y = ev.clientY;
		this.pointerEvents.push({ x: ev.clientX, y: ev.clientY });
	}

	stop() {
		this.stopped = true;
		this.canvas.remove();
		document.removeEventListener('pointermove', this.moveListener);
		document.removeEventListener('scroll', this.scrollListener);
	}

	loop() {
		if (this.stopped) return;

		let expectedWidth = Math.max(this.canvas.width, Math.ceil(document.body.offsetWidth / 5));
		let expectedHeight = Math.max(this.canvas.height, Math.ceil(document.body.offsetHeight / 5));
		if (this.canvas.width != expectedWidth || this.canvas.height != expectedHeight) {
			const data = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
			this.canvas.width = expectedWidth;
			this.canvas.height = expectedHeight;
			this.ctx.putImageData(data, 0, 0);
		}

		if (this.pointerEvents.length > 0) {
			this.ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';

			while (this.pointerEvents.length > 0) {
				let { x, y } = this.pointerEvents.pop()!;
				x += document.documentElement.scrollLeft;
				y += document.documentElement.scrollTop;
				x = Math.floor(x / 5);
				y = Math.floor(y / 5);

				if (this.line == null) {
					this.line = { x, y };
					this.ctx.fillRect(x, y, 1, 1);
					continue;
				}

				if (x != this.line.x || y != this.line.y) {
					this.drawSharpLine(this.line.x, this.line.y, x, y);
					this.line.x = x;
					this.line.y = y;
				}
			}
		}

		requestAnimationFrame(this.loop.bind(this));
	}

	// From: https://javascript.plainenglish.io/the-bresenhams-line-algorithm-for-javascript-developers-ada1d973be76
	private drawSharpLine(startX: number, startY: number, endX: number, endY: number) {
		const deltaCol = Math.abs(endX - startX);
		const deltaRow = Math.abs(endY - startY);

		let pointX = startX;
		let pointY = startY;

		const horizontalStep = startX < endX ? 1 : -1;

		const verticalStep = startY < endY ? 1 : -1;

		let difference = deltaCol - deltaRow;

		for (let max = 0; max < 1000; max++) {
			const doubleDifference = 2 * difference;

			if (doubleDifference > -deltaRow) {
				difference -= deltaRow;
				pointX += horizontalStep;
			}
			if (doubleDifference < deltaCol) {
				difference += deltaCol;
				pointY += verticalStep;
			}

			this.ctx.fillRect(pointX, pointY, 1, 1);
			if (pointX == endX && pointY == endY) {
				break;
			} // doesnt include the end point
		}
	}
}
