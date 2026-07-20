import { Application as PixiApplication, Container, FederatedPointerEvent, Graphics, Rectangle } from "pixi.js";
import { usePixiApp } from "./pixi";
import { EditorPlatform } from "../entities/EditorPlatform";
import { EditorMarker } from "../entities/EditorMarker";
import { COLORS } from "../utils/constants";
import type { LevelConfig, PlatformConfig, PlatformOrientation } from "../types/LevelConfig";
import type { Selection } from "../types/EditorState";
import type { DraggableBounds } from "../../../utils/pixiDraggable";

const SELECTION_OUTLINE_PADDING = 4;

export type EditorObjectKind = "platform" | "start" | "goal";
export type PlacementMode = "platform" | null;

export interface EditorCanvasCallbacks {
  onObjectMoved: (
    kind: EditorObjectKind,
    index: number | null,
    position: { x: number; y: number }
  ) => void;
  onObjectSelected: (kind: EditorObjectKind, index: number | null) => void;
  onPlatformPlaced: (position: { x: number; y: number }) => void;
}

export function useEditorCanvas(callbacks: EditorCanvasCallbacks) {
  const { pixiContainer, initPixiApp, destroyPixiApp } = usePixiApp();

  let pixiApp: PixiApplication | null = null;
  let root: Container | null = null;
  let startMarker: EditorMarker | null = null;
  let goalMarker: EditorMarker | null = null;
  let platforms: EditorPlatform[] = [];
  let selectionOutline: Graphics | null = null;
  let bounds: DraggableBounds = { minX: 0, maxX: 800, minY: 0, maxY: 600 };
  let placementMode: PlacementMode = null;

  const initEditorCanvas = async (width: number, height: number) => {
    pixiApp = await initPixiApp(width, height);
    bounds = { minX: 0, maxX: width, minY: 0, maxY: height };

    // hitArea makes empty canvas space hit-testable so clicks there register
    // for placement mode, rather than only registering on drawn objects.
    pixiApp.stage.eventMode = "static";
    pixiApp.stage.hitArea = new Rectangle(0, 0, width, height);
    pixiApp.stage.on("pointerdown", (event: FederatedPointerEvent) => {
      if (placementMode === "platform" && event.target === pixiApp!.stage) {
        callbacks.onPlatformPlaced({ x: event.global.x, y: event.global.y });
        placementMode = null;
      }
    });

    root = new Container();
    pixiApp.stage.addChild(root);

    return pixiApp;
  };

  const clearScene = () => {
    startMarker?.destroy();
    goalMarker?.destroy();
    for (const platform of platforms) platform.destroy();
    selectionOutline?.destroy();
    startMarker = null;
    goalMarker = null;
    platforms = [];
    selectionOutline = null;
    root?.removeChildren();
  };

  const mountLevel = (level: LevelConfig) => {
    if (!root || !pixiApp) return;

    clearScene();

    const stage = pixiApp.stage;

    startMarker = new EditorMarker("start", level.startPosition, stage, bounds, {
      onSelect: () => callbacks.onObjectSelected("start", null),
      onMove: (position) => callbacks.onObjectMoved("start", null, position),
    });

    goalMarker = new EditorMarker("goal", level.goalPosition, stage, bounds, {
      onSelect: () => callbacks.onObjectSelected("goal", null),
      onMove: (position) => callbacks.onObjectMoved("goal", null, position),
    });

    platforms = level.platforms.map(
      (platformConfig, index) =>
        new EditorPlatform(platformConfig, stage, bounds, {
          onSelect: () => callbacks.onObjectSelected("platform", index),
          onMove: (position) => callbacks.onObjectMoved("platform", index, position),
        })
    );

    root.addChild(startMarker.view, goalMarker.view, ...platforms.map((p) => p.view));
  };

  const rebuildPlatform = (index: number, width: number, orientation: PlatformOrientation) => {
    platforms[index]?.redraw(width, orientation);
  };

  const getSelectedView = (selection: Selection): Graphics | null => {
    if (!selection) return null;
    if (selection.kind === "start") return startMarker?.view ?? null;
    if (selection.kind === "goal") return goalMarker?.view ?? null;
    return platforms[selection.index]?.view ?? null;
  };

  const setSelection = (selection: Selection) => {
    if (!root) return;

    if (!selectionOutline) {
      selectionOutline = new Graphics();
      root.addChild(selectionOutline);
    }

    selectionOutline.clear();

    const target = getSelectedView(selection);
    if (!target) return;

    const targetBounds = target.getBounds();
    const p = SELECTION_OUTLINE_PADDING;
    selectionOutline
      .rect(
        targetBounds.x - p,
        targetBounds.y - p,
        targetBounds.width + p * 2,
        targetBounds.height + p * 2
      )
      .stroke({ width: 2, color: COLORS["Hunyadi yellow"] });
  };

  const setPlacementMode = (mode: PlacementMode) => {
    placementMode = mode;
  };

  // Visual-only: animates each platform's Graphics via the same tween math
  // gameplay uses, with no Matter body involved. Selection is cleared so a
  // stale outline doesn't sit at the pre-animation position.
  const startPreview = (platformConfigs: PlatformConfig[]) => {
    setSelection(null);
    platforms.forEach((platform, index) => {
      const config = platformConfigs[index];
      if (config) platform.startPreview(config);
    });
  };

  const stopPreview = (platformConfigs: PlatformConfig[]) => {
    platforms.forEach((platform, index) => {
      const config = platformConfigs[index];
      if (config) platform.stopPreview(config);
    });
  };

  // Since the canvas <div> is unmounted/remounted whenever LevelEditorView
  // toggles between list and edit mode (not the whole component), the Pixi
  // app must be explicitly torn down and recreated on each entry rather
  // than relying on onUnmounted, which only fires once per component
  // instance.
  const teardown = () => {
    clearScene();
    destroyPixiApp();
    pixiApp = null;
    root = null;
  };

  return {
    pixiContainer,
    initEditorCanvas,
    mountLevel,
    rebuildPlatform,
    setSelection,
    setPlacementMode,
    startPreview,
    stopPreview,
    teardown,
  };
}
