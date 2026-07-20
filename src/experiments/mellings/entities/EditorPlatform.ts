import gsap from "gsap";
import { Container, Graphics } from "pixi.js";
import { makeDraggable, DraggableBounds } from "../../../utils/pixiDraggable";
import { COLORS } from "../utils/constants";
import { drawPlatform } from "../utils/platformGraphics";
import { getPlatformMove } from "../utils/platformMove";
import { PlatformConfig, PlatformOrientation } from "../types/LevelConfig";

export interface EditorPlatformCallbacks {
  onSelect?: () => void;
  onMove?: (position: { x: number; y: number }) => void;
}

export class EditorPlatform {
  public view: Graphics;
  private destroyDrag: () => void;
  private previewTween: gsap.core.Tween | null = null;

  constructor(
    config: PlatformConfig,
    stage: Container,
    bounds: DraggableBounds,
    callbacks: EditorPlatformCallbacks = {}
  ) {
    this.view = new Graphics();
    drawPlatform(this.view, config.width, config.orientation, COLORS["Flame"]);
    this.view.position.set(config.position.x, config.position.y);

    this.destroyDrag = makeDraggable(this.view, {
      stage,
      bounds,
      onDragStart: () => callbacks.onSelect?.(),
      onDragMove: (position) => callbacks.onMove?.(position),
    });
  }

  redraw(width: number, orientation: PlatformOrientation): void {
    drawPlatform(this.view, width, orientation, COLORS["Flame"]);
  }

  // Visual-only preview of the same yoyo/repeat tween entities/Platform.ts
  // drives during real gameplay (see setupPhysics there) — no Matter body
  // here, just the Graphics position.
  startPreview(config: PlatformConfig): void {
    this.stopPreview(config);

    const move = getPlatformMove(config);
    if (!move) return;

    this.previewTween = gsap.to(this.view.position, {
      x: config.position.x + move.deltaX,
      y: config.position.y + move.deltaY,
      duration: move.duration,
      repeat: -1,
      yoyo: true,
      ease: move.ease,
    });
  }

  stopPreview(config: PlatformConfig): void {
    this.previewTween?.kill();
    this.previewTween = null;
    this.view.position.set(config.position.x, config.position.y);
  }

  destroy(): void {
    this.previewTween?.kill();
    this.destroyDrag();
    this.view.destroy();
  }
}
