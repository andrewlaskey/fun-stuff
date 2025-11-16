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

// Kepler-47 is a circumbinary system - planets orbit around BOTH stars.
// The two stars (G-type and M-dwarf) orbit their common barycenter (center of mass)
// with a period of 7.45 days. Three planets orbit the barycenter at much larger distances.
// This was the first multi-planet circumbinary system discovered.
export const kepler47System: SystemConfig = {
  name: "Kepler-47 System",
  celestialBodies: [
    // Binary star system - both stars orbit the barycenter
    // Primary: G-type star (~1.04 solar masses, closer to barycenter)
    {
      name: "Kepler-47A",
      radius: 14, // ~0.96 solar radii
      distance: 12, // Closer to barycenter (more massive)
      orbitSpeed: 0.15, // 7.45 day binary period (fast!)
      initialAngle: 0, // Start at 0 radians
      rotationSpeed: 0.001,
      color: 0xfff8dc, // G-type, Sun-like
      emissive: 0xfff8dc,
    },
    // Secondary: M-type red dwarf (~0.36 solar masses, farther from barycenter)
    {
      name: "Kepler-47B",
      radius: 5, // ~0.35 solar radii
      distance: 34, // Farther from barycenter (less massive)
      orbitSpeed: 0.15, // Same period as primary (they orbit together)
      initialAngle: Math.PI, // Start opposite (180° = π radians)
      rotationSpeed: 0.002,
      color: 0xff6644, // M-type red dwarf
      emissive: 0xff6644,
    },
    // Planets orbiting the barycenter (circumbinary orbits)
    {
      name: "Kepler-47b",
      radius: 9, // ~3 Earth radii - mini-Neptune
      distance: 120, // 0.2956 AU (scaled)
      orbitSpeed: 0.0036, // 49.5 day period
      rotationSpeed: 0.002,
      color: 0x6b8e9e, // Hot mini-Neptune
    },
    {
      name: "Kepler-47d",
      radius: 21, // ~7 Earth radii - Neptune-sized
      distance: 300, // 0.6992 AU (scaled)
      orbitSpeed: 0.00095, // 187.4 day period
      rotationSpeed: 0.003,
      color: 0x4169e1, // Gas/ice giant
    },
    {
      name: "Kepler-47c",
      radius: 14, // ~4.7 Earth radii - mini-Neptune in habitable zone!
      distance: 410, // 0.9638 AU (scaled)
      orbitSpeed: 0.00058, // 303.2 day period
      rotationSpeed: 0.002,
      color: 0x5f9ea0, // Potentially habitable zone
    },
  ],
  cameraStart: { x: 0, y: 80, z: 200 },
  centerLightIntensity: 4,
};
