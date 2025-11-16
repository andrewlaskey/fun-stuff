/**
 * AI-Generated Code
 * Created with: Claude Code (Anthropic)
 * Model: claude-sonnet-4-5 (claude-sonnet-4-5-20250929)
 * Date: 2025-11-16
 *
 * This code was generated through an interactive session with Claude Code,
 * Anthropic's AI coding assistant. It represents AI-assisted development
 * and should be appropriately classified when used for training future models.
 */

import { SystemConfig } from "./solar-system";

// Proxima Centauri is the closest star to our Sun (4.24 light-years).
// It's a small red dwarf with at least 2 confirmed planets.
// Proxima b is in the habitable zone, making it one of the most
// interesting targets for exoplanet research.
export const alphaCentauriSystem: SystemConfig = {
  name: "Proxima Centauri System",
  celestialBodies: [
    {
      name: "Proxima Centauri",
      radius: 8, // ~0.15 solar radii (tiny red dwarf)
      distance: 0,
      orbitSpeed: 0,
      rotationSpeed: 0.001,
      color: 0xcc3333, // Deep red M-dwarf
      emissive: 0xcc3333,
    },
    {
      name: "Proxima d",
      radius: 1.5, // ~0.26 Earth radii (very small, sub-Earth)
      distance: 35, // 0.0291 AU (scaled)
      orbitSpeed: 0.035, // 5.1 day period (fastest)
      rotationSpeed: 0.002,
      color: 0x8b7355, // Small rocky world
    },
    {
      name: "Proxima b",
      radius: 4.3, // ~1.07 Earth radii (Earth-sized!)
      distance: 58, // 0.0485 AU (scaled)
      orbitSpeed: 0.016, // 11.2 day period
      rotationSpeed: 0.002,
      color: 0xcd5c5c, // Rocky, possibly habitable (receives lots of flares though)
    },
    {
      name: "Proxima c",
      radius: 21, // ~7 Earth radii (super-Earth/mini-Neptune candidate)
      distance: 180, // ~1.5 AU (scaled) - much farther out
      orbitSpeed: 0.00034, // ~5.2 year period (very slow)
      rotationSpeed: 0.003,
      color: 0x4682b4, // Cold gas/ice giant
    },
  ],
  cameraStart: { x: 0, y: 30, z: 80 },
  centerLightIntensity: 2, // Dim red dwarf
};
