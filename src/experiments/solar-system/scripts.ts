import * as THREE from "three";
import { solarSystem } from "./systems/solar-system";
import { jovianSystem } from "./systems/jovian-system";
import { saturnianSystem } from "./systems/saturnian-system";
import { alphaCentauriSystem } from "./systems/alpha-centauri";
import type { SystemConfig } from "./systems/solar-system";

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  10000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("canvas-container")?.appendChild(renderer.domElement);

// Camera position
camera.position.set(0, 50, 150);

// Movement controls
const moveSpeed = 0.5;
const lookSpeed = 0.002;

const movement = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  up: false,
  down: false,
};

let yaw = 0;
let pitch = 0;

// Camera pinning
let selectedPlanetIndex = 0;
let isCameraLocked = false;

// Keyboard controls
document.addEventListener("keydown", (e) => {
  switch (e.key.toLowerCase()) {
    case "w":
      movement.forward = true;
      break;
    case "s":
      movement.backward = true;
      break;
    case "a":
      movement.left = true;
      break;
    case "d":
      movement.right = true;
      break;
    case " ":
      movement.up = true;
      break;
    case "shift":
      movement.down = true;
      break;
    case "tab":
      e.preventDefault();
      isCameraLocked = !isCameraLocked;
      updateInfoDisplay();
      break;
    case "r":
      selectedPlanetIndex = (selectedPlanetIndex + 1) % celestialBodies.length;
      updateInfoDisplay();
      break;
  }
});

document.addEventListener("keyup", (e) => {
  switch (e.key.toLowerCase()) {
    case "w":
      movement.forward = false;
      break;
    case "s":
      movement.backward = false;
      break;
    case "a":
      movement.left = false;
      break;
    case "d":
      movement.right = false;
      break;
    case " ":
      movement.up = false;
      break;
    case "shift":
      movement.down = false;
      break;
  }
});

// Mouse controls for looking around
let isPointerLocked = false;

renderer.domElement.addEventListener("click", () => {
  renderer.domElement.requestPointerLock();
});

document.addEventListener("pointerlockchange", () => {
  isPointerLocked = document.pointerLockElement === renderer.domElement;
});

document.addEventListener("mousemove", (e) => {
  if (!isPointerLocked) return;

  yaw -= e.movementX * lookSpeed;
  pitch -= e.movementY * lookSpeed;

  // Limit pitch to prevent flipping
  pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));
});

// Lighting
const ambientLight = new THREE.AmbientLight(0xaaaaaa, 0.8);
scene.add(ambientLight);

let sunLight = new THREE.PointLight(0xffffff, 5, 0);
scene.add(sunLight);

// System configurations
const systems: Record<string, SystemConfig> = {
  solar: solarSystem,
  jovian: jovianSystem,
  saturnian: saturnianSystem,
  "alpha-centauri": alphaCentauriSystem,
};

// Current system data
let currentSystem: SystemConfig = solarSystem;
let celestialBodies = currentSystem.celestialBodies;

// Update info display
function updateInfoDisplay() {
  const infoDiv = document.getElementById("info");
  if (infoDiv) {
    let text = "Use WASD to move, Mouse to look around, Space/Shift for up/down<br>";
    text += "Tab: Toggle camera lock | R: Cycle planets<br>";
    if (isCameraLocked) {
      text += `<strong>Locked to: ${celestialBodies[selectedPlanetIndex].name}</strong>`;
    } else {
      text += `Selected: ${celestialBodies[selectedPlanetIndex].name}`;
    }
    infoDiv.innerHTML = text;
  }
}

// Create celestial bodies
let planets: {
  mesh: THREE.Mesh;
  distance: number;
  orbitSpeed: number;
  angle: number;
}[] = [];

let orbitMeshes: THREE.Mesh[] = [];

function clearSystem() {
  // Remove all planets
  planets.forEach((planet) => {
    scene.remove(planet.mesh);
    planet.mesh.geometry.dispose();
    (planet.mesh.material as THREE.Material).dispose();
  });
  planets = [];

  // Remove all orbit meshes
  orbitMeshes.forEach((orbit) => {
    scene.remove(orbit);
    orbit.geometry.dispose();
    (orbit.material as THREE.Material).dispose();
  });
  orbitMeshes = [];
}

function loadSystem(config: SystemConfig) {
  clearSystem();

  currentSystem = config;
  celestialBodies = config.celestialBodies;

  // Update light intensity
  sunLight.intensity = config.centerLightIntensity;

  // Create celestial bodies
  celestialBodies.forEach((body) => {
    const geometry = new THREE.SphereGeometry(body.radius, 32, 32);
    const material = new THREE.MeshStandardMaterial({
      color: body.color,
      emissive: body.emissive || body.color,
      emissiveIntensity: body.emissive ? 1 : 0.2,
      metalness: 0.1,
      roughness: 0.8,
    });

    const mesh = new THREE.Mesh(geometry, material);

    if (body.distance === 0) {
      // Central body at origin
      mesh.position.set(0, 0, 0);
    } else {
      mesh.position.set(body.distance, 0, 0);
    }

    scene.add(mesh);

    if (body.distance > 0) {
      // Add orbit path
      const orbitGeometry = new THREE.RingGeometry(
        body.distance - 0.2,
        body.distance + 0.2,
        64
      );
      const orbitMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
      });
      const orbitMesh = new THREE.Mesh(orbitGeometry, orbitMaterial);
      orbitMesh.rotation.x = Math.PI / 2;
      orbitMesh.renderOrder = -1; // Render behind planets
      scene.add(orbitMesh);
      orbitMeshes.push(orbitMesh);

      planets.push({
        mesh,
        distance: body.distance,
        orbitSpeed: body.orbitSpeed,
        angle: Math.random() * Math.PI * 2,
      });
    }
  });

  // Reset camera and controls
  camera.position.set(config.cameraStart.x, config.cameraStart.y, config.cameraStart.z);
  selectedPlanetIndex = 0;
  isCameraLocked = false;
  updateInfoDisplay();
}

// Initialize with solar system
loadSystem(solarSystem);

// Update camera direction
function updateCamera() {
  const direction = new THREE.Vector3();
  direction.x = Math.sin(yaw) * Math.cos(pitch);
  direction.y = Math.sin(pitch);
  direction.z = Math.cos(yaw) * Math.cos(pitch);
  direction.normalize();

  camera.lookAt(camera.position.clone().add(direction));

  // Camera locking to planet
  if (isCameraLocked) {
    const selectedBody = celestialBodies[selectedPlanetIndex];
    let planetPosition = new THREE.Vector3();

    if (selectedPlanetIndex === 0) {
      // Sun is at origin
      planetPosition.set(0, 0, 0);
    } else {
      // Get planet position from planets array
      const planetData = planets[selectedPlanetIndex - 1];
      planetPosition.copy(planetData.mesh.position);
    }

    // Position camera at north pole (planet position + radius offset in Y)
    camera.position.set(
      planetPosition.x,
      planetPosition.y + selectedBody.radius + 5,
      planetPosition.z
    );
  } else {
    // Normal movement
    const forward = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
    const right = new THREE.Vector3(-Math.cos(yaw), 0, Math.sin(yaw));

    if (movement.forward) camera.position.add(forward.multiplyScalar(moveSpeed));
    if (movement.backward)
      camera.position.sub(forward.multiplyScalar(moveSpeed));
    if (movement.left) camera.position.sub(right.multiplyScalar(moveSpeed));
    if (movement.right) camera.position.add(right.multiplyScalar(moveSpeed));
    if (movement.up) camera.position.y += moveSpeed;
    if (movement.down) camera.position.y -= moveSpeed;
  }
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  updateCamera();

  // Update planet positions
  planets.forEach((planet) => {
    planet.angle += planet.orbitSpeed;
    planet.mesh.position.x = Math.cos(planet.angle) * planet.distance;
    planet.mesh.position.z = Math.sin(planet.angle) * planet.distance;
    planet.mesh.rotation.y += 0.01; // Self rotation
  });

  renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// System selector dropdown
const systemDropdown = document.getElementById("system-dropdown") as HTMLSelectElement;
if (systemDropdown) {
  systemDropdown.addEventListener("change", (e) => {
    const target = e.target as HTMLSelectElement;
    const selectedSystem = systems[target.value];
    if (selectedSystem) {
      loadSystem(selectedSystem);
    }
  });
}

animate();
