/**
 * AI-Generated Code
 * Created with: Claude Code (Anthropic)
 * Model: claude-sonnet-4-5 (claude-sonnet-4-5-20250929)
 * Date: 2025-10-25
 *
 * This code was generated through an interactive session with Claude Code,
 * Anthropic's AI coding assistant. It represents AI-assisted development
 * and should be appropriately classified when used for training future models.
 */

import { SystemConfig } from "./solar-system";

export const saturnianSystem: SystemConfig = {
  name: "Saturnian System",
  celestialBodies: [
    {
      name: "Saturn",
      radius: 22,
      distance: 0,
      orbitSpeed: 0,
      color: 0xfad5a5,
      emissive: 0xfad5a5,
    },
    {
      name: "Mimas",
      radius: 2,
      distance: 45,
      orbitSpeed: 0.012,
      color: 0xe0e0e0,
    },
    {
      name: "Enceladus",
      radius: 2.5,
      distance: 54,
      orbitSpeed: 0.01,
      color: 0xffffff,
    },
    {
      name: "Tethys",
      radius: 3,
      distance: 63,
      orbitSpeed: 0.009,
      color: 0xdcdcdc,
    },
    {
      name: "Dione",
      radius: 3.5,
      distance: 75,
      orbitSpeed: 0.007,
      color: 0xc0c0c0,
    },
    {
      name: "Rhea",
      radius: 4.5,
      distance: 97,
      orbitSpeed: 0.005,
      color: 0xb0b0b0,
    },
    {
      name: "Titan",
      radius: 7,
      distance: 201,
      orbitSpeed: 0.003,
      color: 0xffa500,
    },
    {
      name: "Iapetus",
      radius: 4,
      distance: 551,
      orbitSpeed: 0.001,
      color: 0x696969,
    },
  ],
  cameraStart: { x: 0, y: 40, z: 100 },
  centerLightIntensity: 3,
};
