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

// TRAPPIST-1 is a compact system with 7 Earth-sized planets orbiting
// an ultra-cool red dwarf star. All planets orbit closer than Mercury
// does to our Sun. Distances and sizes scaled for visualization.
export const trappistSystem: SystemConfig = {
  name: "TRAPPIST-1 System",
  celestialBodies: [
    {
      name: "TRAPPIST-1",
      radius: 12, // Ultra-cool red dwarf (~0.12 solar radii, Jupiter-sized)
      distance: 0,
      orbitSpeed: 0,
      rotationSpeed: 0.001,
      color: 0xcc4422, // Deep red dwarf color
      emissive: 0xcc4422,
    },
    {
      name: "TRAPPIST-1b",
      radius: 4.1, // 1.017 Earth radii
      distance: 35, // 0.01154 AU (scaled)
      orbitSpeed: 0.012, // 1.51 day period (fastest)
      rotationSpeed: 0.002,
      color: 0x8b4513, // Hot, tidally locked inner planet
    },
    {
      name: "TRAPPIST-1c",
      radius: 4.4, // 1.1 Earth radii
      distance: 48, // 0.01580 AU (scaled)
      orbitSpeed: 0.0074, // 2.42 day period
      rotationSpeed: 0.002,
      color: 0xa0522d, // Hot rocky planet
    },
    {
      name: "TRAPPIST-1d",
      radius: 3.2, // 0.788 Earth radii (smallest)
      distance: 68, // 0.02227 AU (scaled)
      orbitSpeed: 0.0044, // 4.05 day period
      rotationSpeed: 0.002,
      color: 0xcd853f, // Warm rocky planet
    },
    {
      name: "TRAPPIST-1e",
      radius: 3.7, // 0.92 Earth radii
      distance: 89, // 0.02925 AU (scaled)
      orbitSpeed: 0.0029, // 6.10 day period
      rotationSpeed: 0.002,
      color: 0x4682b4, // Potentially habitable - ocean world?
    },
    {
      name: "TRAPPIST-1f",
      radius: 4.2, // 1.045 Earth radii
      distance: 117, // 0.03849 AU (scaled)
      orbitSpeed: 0.0019, // 9.21 day period
      rotationSpeed: 0.002,
      color: 0x5f9ea0, // Potentially habitable
    },
    {
      name: "TRAPPIST-1g",
      radius: 4.5, // 1.129 Earth radii (largest)
      distance: 143, // 0.04683 AU (scaled)
      orbitSpeed: 0.0014, // 12.35 day period
      rotationSpeed: 0.002,
      color: 0x708090, // Potentially habitable - cooler
    },
    {
      name: "TRAPPIST-1h",
      radius: 3.0, // 0.755 Earth radii
      distance: 189, // 0.06189 AU (scaled)
      orbitSpeed: 0.00095, // 18.77 day period (slowest)
      rotationSpeed: 0.002,
      color: 0x778899, // Outermost, coldest planet
    },
  ],
  cameraStart: { x: 0, y: 30, z: 80 },
  centerLightIntensity: 2.5, // Dimmer red dwarf
};
