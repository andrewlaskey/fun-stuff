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

// Kepler-90 is a Sun-like G-type star with 8 known planets - the same number
// as our Solar System. All planets orbit within what would be Earth's orbit,
// making it an extremely compact system. The outer planet (h) is Jupiter-sized.
export const kepler90System: SystemConfig = {
  name: "Kepler-90 System",
  celestialBodies: [
    {
      name: "Kepler-90",
      radius: 15, // G-type star, ~1.2 solar radii
      distance: 0,
      orbitSpeed: 0,
      rotationSpeed: 0.0008,
      color: 0xfff4e0, // Slightly warmer than Sun
      emissive: 0xfff4e0,
    },
    {
      name: "Kepler-90b",
      radius: 3.9, // 1.31 Earth radii - rocky super-Earth
      distance: 30, // 0.074 AU (scaled)
      orbitSpeed: 0.025, // 7.0 day period (fastest)
      rotationSpeed: 0.002,
      color: 0xa0522d, // Hot rocky planet
    },
    {
      name: "Kepler-90c",
      radius: 3.5, // 1.18 Earth radii - rocky super-Earth
      distance: 36, // 0.089 AU (scaled)
      orbitSpeed: 0.02, // 8.7 day period
      rotationSpeed: 0.002,
      color: 0x8b6914, // Hot rocky planet
    },
    {
      name: "Kepler-90i",
      radius: 4.0, // 1.32 Earth radii - discovered by AI/ML
      distance: 50, // 0.1234 AU (scaled)
      orbitSpeed: 0.012, // 14.4 day period
      rotationSpeed: 0.002,
      color: 0xcd853f, // Warm rocky planet
    },
    {
      name: "Kepler-90d",
      radius: 8.6, // 2.88 Earth radii - mini-Neptune
      distance: 130, // 0.32 AU (scaled)
      orbitSpeed: 0.0029, // 59.7 day period
      rotationSpeed: 0.003,
      color: 0x6b8e9e, // Mini-Neptune, gas/ice
    },
    {
      name: "Kepler-90e",
      radius: 8.0, // 2.67 Earth radii - mini-Neptune
      distance: 170, // 0.42 AU (scaled)
      orbitSpeed: 0.0019, // 91.9 day period
      rotationSpeed: 0.003,
      color: 0x5f9ea0, // Mini-Neptune
    },
    {
      name: "Kepler-90f",
      radius: 8.7, // 2.89 Earth radii - mini-Neptune
      distance: 195, // 0.48 AU (scaled)
      orbitSpeed: 0.0014, // 124.9 day period
      rotationSpeed: 0.003,
      color: 0x4682b4, // Mini-Neptune
    },
    {
      name: "Kepler-90g",
      radius: 24.4, // 8.13 Earth radii - Saturn-sized gas giant
      distance: 288, // 0.71 AU (scaled)
      orbitSpeed: 0.00083, // 210.6 day period
      rotationSpeed: 0.004,
      color: 0xdaa520, // Gas giant, golden/tan
    },
    {
      name: "Kepler-90h",
      radius: 34.0, // 11.32 Earth radii - Jupiter-sized gas giant
      distance: 410, // 1.01 AU (scaled) - roughly Earth's distance!
      orbitSpeed: 0.00053, // 331.6 day period (slowest)
      rotationSpeed: 0.0045,
      color: 0xc9a961, // Gas giant
    },
  ],
  cameraStart: { x: 0, y: 80, z: 200 },
  centerLightIntensity: 4.5,
};
