import { SystemConfig } from "./solar-system";

export const alphaCentauriSystem: SystemConfig = {
  name: "Alpha Centauri System",
  celestialBodies: [
    {
      name: "Alpha Centauri A",
      radius: 18,
      distance: 0,
      orbitSpeed: 0,
      color: 0xffff99,
      emissive: 0xffff99,
    },
    {
      name: "Alpha Centauri B",
      radius: 15,
      distance: 230,
      orbitSpeed: 0.001,
      color: 0xffcc66,
      emissive: 0xffcc66,
    },
    {
      name: "Proxima Centauri",
      radius: 10,
      distance: 1300,
      orbitSpeed: 0.0001,
      color: 0xff6666,
      emissive: 0xff6666,
    },
    {
      name: "Proxima b",
      radius: 4,
      distance: 1320,
      orbitSpeed: 0.008,
      color: 0x8b4513,
    },
    {
      name: "Proxima d",
      radius: 3,
      distance: 1310,
      orbitSpeed: 0.015,
      color: 0x696969,
    },
    {
      name: "Proxima c",
      radius: 5,
      distance: 1450,
      orbitSpeed: 0.0002,
      color: 0x4169e1,
    },
  ],
  cameraStart: { x: 0, y: 100, z: 300 },
  centerLightIntensity: 4,
};
