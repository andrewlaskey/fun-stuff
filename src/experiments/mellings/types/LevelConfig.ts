export interface Position {
    x: number;
    y: number;
}

export type PlatformOrientation = 'horizontal' | 'vertical';

export interface PlatformConfig {
    position: Position;
    width: number;
    orientation: PlatformOrientation;
    isDynamic: boolean;
    moveDelta?: Position;
    moveSpeed?: number;
}

export interface LevelConfig {
    goalPosition: Position;
    startPosition: Position;
    platforms: PlatformConfig[];
}