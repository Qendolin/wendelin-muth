import './background-effect.css';

const symbol = Symbol.for('background_effect');

export function addBackgroundEffect() {
  if (!globalThis?.document?.body) return;

  // deno-lint-ignore no-explicit-any
  let instance = (globalThis as any)[symbol] as BackgroundEffect | undefined;
  if (instance) {
    return;
  }
  instance = new BackgroundEffect();
  // deno-lint-ignore no-explicit-any
  (globalThis as any)[symbol] = instance;

  if (document.readyState !== 'complete') {
    globalThis.addEventListener('load', () => instance?.loop(), { once: true });
  } else {
    instance.loop();
  }
}

type Vec2 = {
  x: number;
  y: number;
};

type Rect = {
  x: number;
  y: number;
  w: number;
  h: number;
};

class ProceduralSplineBrush {
  private splinePoints: Vec2[] = [];
  private splineT: number = 0;
  private brushPos: Vec2 | null = null;

  private minRadius = 5;
  private maxRadius = 30;
  private speed = 0.01;

  private readonly ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D, options: Partial<{ minRadius: number; maxRadius: number; speed: number }> = {}) {
    this.ctx = ctx;
    this.minRadius = options.minRadius ?? this.minRadius;
    this.maxRadius = options.maxRadius ?? this.maxRadius;
    this.speed = options.speed ?? this.speed;
  }

  /**
   * Call this every frame after the canvas resize logic.
   * The brush will seed itself on first call and then run forever.
   */
  update(viewport: Rect, dt: number) {
    if (this.splinePoints.length === 0) {
      // Start with a random first point
      let current = this.randomPointBiased(viewport);

      this.splinePoints = [current];

      // Generate the next 3 points, each within radius of the previous one
      for (let i = 0; i < 3; i++) {
        current = this.generateNextPoint(current, viewport);
        this.splinePoints.push(current);
      }

      this.splineT = 0;
      this.brushPos = { x: this.splinePoints[1].x, y: this.splinePoints[1].y };

      // Draw the starting pixel
      const ix = Math.floor(this.brushPos.x);
      const iy = Math.floor(this.brushPos.y);
      this.ctx.fillRect(ix, iy, 1, 1);
      return;
    }

    if (this.brushPos === null) return;

    const oldPos = this.brushPos;

    // Advance parameter
    this.splineT += this.speed * dt;
    if (this.splineT >= 1) {
      const overflow = this.splineT - 1;
      this.splineT = overflow;

      // Generate new point and shift the sliding window
      const last = this.splinePoints[3];
      const newPt = this.generateNextPoint(last, viewport);
      this.splinePoints.shift();
      this.splinePoints.push(newPt);
    }

    // Evaluate current position on the Catmull-Rom spline
    const newPos = this.getSplinePosition(this.splineT);

    // Rasterize the step
    const startX = Math.floor(oldPos.x);
    const startY = Math.floor(oldPos.y);
    const endX = Math.floor(newPos.x);
    const endY = Math.floor(newPos.y);

    if (startX !== endX || startY !== endY) {
      this.drawSharpLine(startX, startY, endX, endY);
    }

    this.brushPos = newPos;
  }

  private randomPointBiased(vp: Rect): Vec2 {
    return {
      x: vp.x + Math.random() * vp.w,
      y: vp.y + Math.random() * vp.h
    };
  }

  private generateNextPoint(last: Vec2, vp: Rect): Vec2 {
    const angle = Math.random() * 2 * Math.PI;
    const r = this.minRadius + (this.maxRadius - this.minRadius) * Math.sqrt(Math.random());

    let nx = last.x + Math.cos(angle) * r;
    let ny = last.y + Math.sin(angle) * r;

    // Strong bias toward viewport: pull the candidate toward a random point inside the viewport
    const biasStrength = 0.2;
    const biased = this.randomPointBiased(vp);

    if (nx < vp.x || nx >= vp.x + vp.w || ny < vp.y || ny >= vp.y + vp.h) {
      nx = nx * (1 - biasStrength) + biased.x * biasStrength;
      ny = ny * (1 - biasStrength) + biased.y * biasStrength;
    }

    return { x: nx, y: ny };
  }

  private getSplinePosition(t: number): Vec2 {
    const p0 = this.splinePoints[0];
    const p1 = this.splinePoints[1];
    const p2 = this.splinePoints[2];
    const p3 = this.splinePoints[3];

    const t2 = t * t;
    const t3 = t2 * t;

    const x = 0.5 * ((-t3 + 2 * t2 - t) * p0.x + (3 * t3 - 5 * t2 + 2) * p1.x + (-3 * t3 + 4 * t2 + t) * p2.x + (t3 - t2) * p3.x);

    const y = 0.5 * ((-t3 + 2 * t2 - t) * p0.y + (3 * t3 - 5 * t2 + 2) * p1.y + (-3 * t3 + 4 * t2 + t) * p2.y + (t3 - t2) * p3.y);

    return { x, y };
  }

  // Exact same Bresenham implementation used by the mouse trail
  // (keeps the visual style perfectly consistent)
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

      if (pointX === endX && pointY === endY) {
        break;
      }
    }
  }
}

class Wiper {
  private readonly handle: HTMLDivElement;
  private readonly terminator: HTMLDivElement;
  private relativeY: number = 0;
  private isDragging = false;

  private readonly dragMoveHandler: (e: MouseEvent) => void;
  private readonly dragEndHandler: (e: MouseEvent) => void;

  constructor() {
    this.handle = document.createElement('div');
    this.handle.id = 'wiper-handle';

    this.terminator = document.createElement('div');
    this.terminator.id = 'wiper-terminator';

    document.body.append(this.handle, this.terminator);

    this.dragMoveHandler = this.onDragMove.bind(this);
    this.dragEndHandler = this.onDragEnd.bind(this);

    this.handle.addEventListener('mousedown', this.onPointerDown.bind(this));

    // initial position (top of screen)
    this.updateDOMPositions();
  }

  private onPointerDown(e: MouseEvent) {
    if (e.button !== 0) return;
    e.preventDefault();

    this.isDragging = true;
    this.handle.dataset.grabbed = '';
    this.relativeY = e.clientY;
    this.updateDOMPositions();
    this.terminator.style.opacity = '1';

    document.addEventListener('mousemove', this.dragMoveHandler);
    document.addEventListener('mouseup', this.dragEndHandler);
  }

  private onDragMove(e: MouseEvent) {
    this.relativeY = e.clientY;
    this.updateDOMPositions();
  }

  private onDragEnd() {
    document.removeEventListener('mousemove', this.dragMoveHandler);
    document.removeEventListener('mouseup', this.dragEndHandler);
    this.isDragging = false;
    delete this.handle.dataset.grabbed;
    this.terminator.style.removeProperty('opacity');
  }

  private updateDOMPositions() {
    const maxY = globalThis.innerHeight;
    this.relativeY = Math.max(0, Math.min(this.relativeY, maxY));

    // Terminator line across the entire viewport
    this.terminator.style.top = `${this.relativeY}px`;

    // Handle centered vertically on the terminator line
    this.handle.style.top = `${Math.max(this.relativeY - 16, 0)}px`;
  }

  /**
   * Called every frame from the background loop.
   * Only handles snap-back when not dragging.
   */
  update(dt: number) {
    if (this.isDragging) return;

    if (this.relativeY > 0) {
      const decay = Math.pow(0.75, dt * 60);
      this.relativeY *= decay;
      if (this.relativeY < 1) this.relativeY = 0;
      this.updateDOMPositions();
    }
  }

  // Public API for canvas clearing (called from BackgroundEffect)
  getIsDragging(): boolean {
    return this.isDragging;
  }

  getScreenLineY(): number {
    return this.relativeY;
  }
}

class BackgroundEffect {
  private readonly wrapper: HTMLElement;
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private started: boolean;
  private pointerEvents: Vec2[];
  private pointerMoveHandler: (ev: MouseEvent) => void;
  private scrollHandler: (ev: Event) => void;
  private line: { x: number; y: number } | null = null;
  private pointer: Vec2 | null = null;
  private sizeInitialized = false;

  private readonly brushes: ProceduralSplineBrush[] = [];

  private readonly wiper: Wiper | null;

  constructor() {
    this.wrapper = document.createElement('div');
    this.wrapper.id = 'background-effect';
    this.wrapper.inert = true;
    this.canvas = document.createElement('canvas');
    this.canvas.width = 0;
    this.canvas.height = 0;
    this.wrapper.append(this.canvas);
    document.body.append(this.wrapper);
    this.ctx = this.canvas.getContext('2d')!;
    this.ctx.beginPath();
    this.ctx.imageSmoothingEnabled = false;

    this.started = false;
    this.pointerEvents = [];
    this.pointerMoveHandler = this.onPointerMove.bind(this);
    this.scrollHandler = this.onScroll.bind(this);

    document.addEventListener('mousemove', this.pointerMoveHandler);
    document.addEventListener('scroll', this.scrollHandler);

    const isMobile = globalThis.matchMedia('(pointer: coarse) and (max-width: 768px)').matches;
    this.brushes = isMobile
      ? []
      : [
          new ProceduralSplineBrush(this.ctx, { minRadius: 10, maxRadius: 80, speed: 0.2 * 1 }),
          new ProceduralSplineBrush(this.ctx, { minRadius: 10, maxRadius: 80, speed: 0.2 * 2 }),
          new ProceduralSplineBrush(this.ctx, { minRadius: 10, maxRadius: 80, speed: 0.2 * 3 })
        ];

    this.wiper = isMobile ? null : new Wiper();
  }

  private onScroll(ev: Event) {
    if (this.pointer == null) return;
    this.pointerEvents.push({ x: this.pointer.x, y: this.pointer.y });
  }

  private onPointerMove(ev: MouseEvent) {
    this.pointer ??= {} as Vec2;
    this.pointer.x = ev.clientX;
    this.pointer.y = ev.clientY;
    this.pointerEvents.push({ x: ev.clientX, y: ev.clientY });
  }

  loop() {
    if (this.started) return;
    this.started = true;

    this.#draw();
  }

  #draw(prevTime?: number) {
    const currTime = Date.now();
    const dt = Math.min(prevTime ? (currTime - prevTime) / 1000.0 : 1 / 60, 1 / 10.0);

    // Canvas resize handling (unchanged)
    const expectedWidth = Math.max(this.canvas.width, Math.ceil(document.body.offsetWidth / 5));
    const expectedHeight = Math.max(this.canvas.height, Math.ceil(document.body.offsetHeight / 5));
    if (!this.sizeInitialized || this.canvas.width !== expectedWidth || this.canvas.height !== expectedHeight) {
      const data = this.sizeInitialized ? this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height) : null;
      this.canvas.width = expectedWidth;
      this.canvas.height = expectedHeight;
      if (data) this.ctx.putImageData(data, 0, 0);
      this.sizeInitialized = true;
    }

    this.ctx.fillStyle = 'rgba(120, 120, 120, 0.05)';

    // Mouse trail (completely untouched)
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

      if (x !== this.line.x || y !== this.line.y) {
        this.drawSharpLine(this.line.x, this.line.y, x, y);
        this.line.x = x;
        this.line.y = y;
      }
    }

    const viewport: Rect = { x: 0, y: 0, w: 1, h: 1 };
    viewport.x = Math.floor((globalThis.scrollX || globalThis.pageXOffset) / 5);
    viewport.y = Math.floor((globalThis.scrollY || globalThis.pageYOffset) / 5);
    viewport.w = Math.floor(globalThis.innerWidth / 5);
    viewport.h = Math.floor(globalThis.innerHeight / 5);
    for (const brush of this.brushes) {
      brush.update(viewport, dt);
    }

    this.wiper?.update(dt);
    if (this.wiper?.getIsDragging() && this.wiper.getScreenLineY() > 0) {
      const clearHeightCanvas = this.wiper.getScreenLineY() / 5;
      this.ctx.clearRect(viewport.x, viewport.y, viewport.w, clearHeightCanvas);
    }

    requestAnimationFrame(this.#draw.bind(this, currTime));
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
      if (pointX === endX && pointY === endY) {
        break;
      }
    }
  }
}
