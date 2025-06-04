import { LevelConfig } from "../types/LevelConfig";

export const levels: LevelConfig[] = [
  {
    goalPosition: { x: 500, y: 360 },
    startPosition: { x: 40, y: 100 },
    platforms: [
      {
        position: { x: 40, y: 180 },
        width: 230,
        isDynamic: false,
        orientation: "horizontal",
      },
      {
        position: { x: 300, y: 270 },
        width: 100,
        orientation: "horizontal",
        isDynamic: false,
      },
    ],
  },
  {
    goalPosition: { x: 500, y: 360 },
    startPosition: { x: 40, y: 100 },
    platforms: [
      {
        position: { x: 40, y: 180 },
        width: 230,
        isDynamic: false,
        orientation: "horizontal",
      },
      {
        position: { x: 300, y: 270 },
        width: 270,
        orientation: "vertical",
        isDynamic: true,
        moveDelta: { x: 0, y: -150 },
        moveSpeed: 3,
      },
    ],
  },
];
