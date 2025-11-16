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

export const jovianSystem: SystemConfig = {
  name: "Jovian System",
  celestialBodies: [
    {
      name: "Jupiter",
      radius: 25,
      distance: 0,
      orbitSpeed: 0,
      color: 0xc88b3a,
      emissive: 0xc88b3a,
    },
    {
      name: "Io",
      radius: 4,
      distance: 50,
      orbitSpeed: 0.008,
      color: 0xffd700,
    },
    {
      name: "Europa",
      radius: 3.5,
      distance: 75,
      orbitSpeed: 0.006,
      color: 0xd0e8ff, // Icy blue-white
    },
    {
      name: "Ganymede",
      radius: 5,
      distance: 115,
      orbitSpeed: 0.004,
      color: 0x8b7355,
    },
    {
      name: "Callisto",
      radius: 4.5,
      distance: 196,
      orbitSpeed: 0.002,
      color: 0x696969,
    },
    {
      name: "Amalthea",
      radius: 2,
      distance: 32,
      orbitSpeed: 0.012,
      color: 0xcd5c5c,
    },
    {
      name: "Thebe",
      radius: 1.5,
      distance: 38,
      orbitSpeed: 0.011,
      color: 0xa0522d,
    },
  ],
  cameraStart: { x: 0, y: 30, z: 80 },
  centerLightIntensity: 3,
};
