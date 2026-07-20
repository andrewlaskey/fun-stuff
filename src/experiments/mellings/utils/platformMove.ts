import { PlatformConfig, PlatformMoveEase } from "../types/LevelConfig";

export interface PlatformMove {
  deltaX: number;
  deltaY: number;
  duration: number;
  ease: PlatformMoveEase;
}

export function getPlatformMove(config: PlatformConfig): PlatformMove | null {
  if (!config.isDynamic) return null;

  return {
    deltaX: config.moveDelta?.x ?? 0,
    deltaY: config.moveDelta?.y ?? 0,
    duration: config.moveSpeed ?? 0,
    ease: config.moveEase ?? "linear",
  };
}
