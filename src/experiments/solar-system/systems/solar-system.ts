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

export interface CelestialBody {
  name: string;
  radius: number;
  distance: number;
  orbitSpeed: number;
  color: number;
  emissive?: number;
}

export interface SystemConfig {
  name: string;
  celestialBodies: CelestialBody[];
  cameraStart: { x: number; y: number; z: number };
  centerLightIntensity: number;
}

export const solarSystem: SystemConfig = {
  name: "Solar System",
  celestialBodies: [
    {
      name: "Sun",
      radius: 20,
      distance: 0,
      orbitSpeed: 0,
      color: 0xfdb813,
      emissive: 0xfdb813,
    },
    {
      name: "Mercury",
      radius: 3,
      distance: 58,
      orbitSpeed: 0.004,
      color: 0x8c7853,
    },
    {
      name: "Venus",
      radius: 5,
      distance: 108,
      orbitSpeed: 0.0015,
      color: 0xffc649,
    },
    {
      name: "Earth",
      radius: 5.5,
      distance: 150,
      orbitSpeed: 0.001,
      color: 0x4169e1,
    },
    {
      name: "Mars",
      radius: 4,
      distance: 228,
      orbitSpeed: 0.0008,
      color: 0xcd5c5c,
    },
    {
      name: "Jupiter",
      radius: 12,
      distance: 778,
      orbitSpeed: 0.0005,
      color: 0xc88b3a,
    },
    {
      name: "Saturn",
      radius: 10,
      distance: 1427,
      orbitSpeed: 0.0003,
      color: 0xfad5a5,
    },
    {
      name: "Uranus",
      radius: 7,
      distance: 2871,
      orbitSpeed: 0.0002,
      color: 0x4fd0e0,
    },
    {
      name: "Neptune",
      radius: 7,
      distance: 4497,
      orbitSpeed: 0.0001,
      color: 0x4166f5,
    },
  ],
  cameraStart: { x: 0, y: 50, z: 150 },
  centerLightIntensity: 5,
};
