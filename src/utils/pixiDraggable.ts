import type { Container, FederatedPointerEvent } from 'pixi.js';

export interface DraggableBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export interface DraggableOptions {
  /** Listened on for pointermove/pointerup so drags keep tracking outside the target's own hit area. */
  stage: Container;
  bounds?: DraggableBounds;
  onDragStart?: (event: FederatedPointerEvent) => void;
  onDragMove?: (position: { x: number; y: number }) => void;
  onDragEnd?: (position: { x: number; y: number }) => void;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Makes a Pixi Container draggable via pointer events. Framework- and
 * domain-agnostic: operates only on Pixi objects and plain callbacks, so it
 * can be reused by any Pixi-based experiment, not just the one it was
 * written for.
 *
 * Returns a cleanup function that removes all attached listeners.
 */
export function makeDraggable(target: Container, options: DraggableOptions): () => void {
  const { stage, bounds } = options;

  target.eventMode = 'static';
  target.cursor = 'pointer';

  // globalpointermove/pointerup only fire on objects with eventMode
  // 'static' or 'dynamic' — upgrade the stage if it isn't already
  // interactive, without downgrading a caller's stricter setting.
  if (stage.eventMode === 'auto' || stage.eventMode === 'passive' || stage.eventMode === 'none') {
    stage.eventMode = 'static';
  }

  let dragging = false;
  let offsetX = 0;
  let offsetY = 0;

  const onPointerDown = (event: FederatedPointerEvent) => {
    dragging = true;
    offsetX = event.global.x - target.position.x;
    offsetY = event.global.y - target.position.y;
    options.onDragStart?.(event);
  };

  const onPointerMove = (event: FederatedPointerEvent) => {
    if (!dragging) return;

    let x = event.global.x - offsetX;
    let y = event.global.y - offsetY;

    if (bounds) {
      x = clamp(x, bounds.minX, bounds.maxX);
      y = clamp(y, bounds.minY, bounds.maxY);
    }

    target.position.set(x, y);
    options.onDragMove?.({ x, y });
  };

  const onPointerUp = () => {
    if (!dragging) return;
    dragging = false;
    options.onDragEnd?.({ x: target.position.x, y: target.position.y });
  };

  target.on('pointerdown', onPointerDown);
  stage.on('globalpointermove', onPointerMove);
  stage.on('pointerup', onPointerUp);
  stage.on('pointerupoutside', onPointerUp);

  return () => {
    target.off('pointerdown', onPointerDown);
    stage.off('globalpointermove', onPointerMove);
    stage.off('pointerup', onPointerUp);
    stage.off('pointerupoutside', onPointerUp);
  };
}
