import { Container, Graphics } from "pixi.js";
import { makeDraggable, DraggableBounds } from "../../../utils/pixiDraggable";
import { COLORS } from "../utils/constants";
import { Position } from "../types/LevelConfig";

export type MarkerKind = "start" | "goal";

export interface EditorMarkerCallbacks {
  onSelect?: () => void;
  onMove?: (position: { x: number; y: number }) => void;
}

// Matches entities/Level.ts's marker geometry exactly, so the editor preview
// lines up with how the marker actually renders in gameplay: the start
// marker is anchored at its top-left corner while the goal marker is
// anchored at its center.
const START_WIDTH = 60;
const START_HEIGHT = 5;
const GOAL_WIDTH = 60;
const GOAL_HEIGHT = 60;

export class EditorMarker {
  public view: Graphics;
  private destroyDrag: () => void;

  constructor(
    kind: MarkerKind,
    position: Position,
    stage: Container,
    bounds: DraggableBounds,
    callbacks: EditorMarkerCallbacks = {}
  ) {
    this.view = new Graphics();

    if (kind === "start") {
      this.view.rect(0, 0, START_WIDTH, START_HEIGHT).fill(COLORS["English Violet"]);
    } else {
      this.view
        .rect(-GOAL_WIDTH / 2, -GOAL_HEIGHT / 2, GOAL_WIDTH, GOAL_HEIGHT)
        .fill(COLORS["English Violet"]);
    }

    this.view.position.set(position.x, position.y);

    this.destroyDrag = makeDraggable(this.view, {
      stage,
      bounds,
      onDragStart: () => callbacks.onSelect?.(),
      onDragMove: (pos) => callbacks.onMove?.(pos),
    });
  }

  destroy(): void {
    this.destroyDrag();
    this.view.destroy();
  }
}
