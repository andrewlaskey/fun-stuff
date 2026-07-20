import { Graphics } from "pixi.js";
import { PlatformOrientation } from "../types/LevelConfig";

export const PLATFORM_HEIGHT = 15;

export function drawPlatform(
  graphics: Graphics,
  width: number,
  orientation: PlatformOrientation,
  color: string
): void {
  graphics.clear();

  if (orientation === "horizontal") {
    graphics
      .rect(-width / 2, -PLATFORM_HEIGHT / 2, width, PLATFORM_HEIGHT)
      .fill(color);
  } else {
    graphics
      .rect(-PLATFORM_HEIGHT / 2, -width / 2, PLATFORM_HEIGHT, width)
      .fill(color);
  }
}
