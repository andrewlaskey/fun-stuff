import type { LevelConfig, PlatformConfig, Position } from '../types/LevelConfig';

export function createBlankLevel(existingCount: number): LevelConfig {
  return {
    id: crypto.randomUUID(),
    name: `New Level ${existingCount + 1}`,
    startPosition: { x: 40, y: 100 },
    goalPosition: { x: 500, y: 360 },
    platforms: [],
  };
}

export function createDefaultPlatform(position: Position): PlatformConfig {
  return {
    position,
    width: 100,
    orientation: 'horizontal',
    isDynamic: false,
  };
}
