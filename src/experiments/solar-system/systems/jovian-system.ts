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
      distance: 42,
      orbitSpeed: 0.008,
      color: 0xffd700,
    },
    {
      name: "Europa",
      radius: 3.5,
      distance: 67,
      orbitSpeed: 0.006,
      color: 0xdcdcdc,
    },
    {
      name: "Ganymede",
      radius: 5,
      distance: 107,
      orbitSpeed: 0.004,
      color: 0x8b7355,
    },
    {
      name: "Callisto",
      radius: 4.5,
      distance: 188,
      orbitSpeed: 0.002,
      color: 0x696969,
    },
    {
      name: "Amalthea",
      radius: 2,
      distance: 18,
      orbitSpeed: 0.012,
      color: 0xcd5c5c,
    },
    {
      name: "Thebe",
      radius: 1.5,
      distance: 22,
      orbitSpeed: 0.011,
      color: 0xa0522d,
    },
  ],
  cameraStart: { x: 0, y: 30, z: 80 },
  centerLightIntensity: 3,
};
