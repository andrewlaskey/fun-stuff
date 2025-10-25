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

import * as THREE from "three";
import { solarSystem } from "./systems/solar-system";
import { jovianSystem } from "./systems/jovian-system";
import { saturnianSystem } from "./systems/saturnian-system";
import { alphaCentauriSystem } from "./systems/alpha-centauri";
import type { SystemConfig, CelestialBody } from "./systems/solar-system";

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
const sprintMultiplier = 3;
const lookSpeed = 0.002;

const movement = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  sprint: false,
};

let yaw = 0;
let pitch = 0;

// Camera pinning
let selectedPlanetIndex = 0;
let isCameraLocked = false;

// Raycasting for hover detection
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hoverableMeshes: { mesh: THREE.Mesh; body: CelestialBody }[] = [];
let pinnedBody: CelestialBody | null = null;

// Time scale controls
let isPaused = false;
let timeScale = 1.0;

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
    case "shift":
      movement.sprint = true;
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
    case "p":
      isPaused = !isPaused;
      updatePauseButton();
      updateSpeedDisplay();
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
    case "shift":
      movement.sprint = false;
      break;
  }
});

// Mouse controls for looking around
let isMouseDown = false;
let mouseDownPosition = { x: 0, y: 0 };

renderer.domElement.addEventListener("mousedown", (e) => {
  isMouseDown = true;
  mouseDownPosition = { x: e.clientX, y: e.clientY };
});

document.addEventListener("mouseup", (e) => {
  // Check if this was a click (not a drag)
  const dx = e.clientX - mouseDownPosition.x;
  const dy = e.clientY - mouseDownPosition.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (isMouseDown && distance < 5) {
    // This was a click, not a drag
    handleClick(e);
  }

  isMouseDown = false;
});

document.addEventListener("mousemove", (e) => {
  if (!isMouseDown) return;

  yaw -= e.movementX * lookSpeed;
  pitch -= e.movementY * lookSpeed;

  // Limit pitch to prevent flipping
  pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));
});

// Throttle function for performance
function throttle(func: Function, delay: number) {
  let lastCall = 0;
  return function (...args: any[]) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
}

// Update mouse position and check for hover
function checkHover(event: MouseEvent) {
  // Don't check hover when dragging to look around or when info is pinned
  if (isMouseDown || pinnedBody) {
    return;
  }

  // Calculate mouse position in normalized device coordinates (-1 to +1)
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  performRaycast();
}

// Handle click to pin/unpin body info
function handleClick(event: MouseEvent) {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const meshesToCheck = hoverableMeshes.map((item) => item.mesh);
  const intersects = raycaster.intersectObjects(meshesToCheck);

  if (intersects.length > 0) {
    const intersectedMesh = intersects[0].object as THREE.Mesh;
    const hoverableItem = hoverableMeshes.find((item) => item.mesh === intersectedMesh);

    if (hoverableItem) {
      // Pin this body
      pinnedBody = hoverableItem.body;
      showBodyInfo(hoverableItem.body, true);

      // Set this body as the selected body for camera lock
      const bodyIndex = celestialBodies.findIndex((body) => body.name === hoverableItem.body.name);
      if (bodyIndex !== -1) {
        selectedPlanetIndex = bodyIndex;
        updateInfoDisplay();
      }
    }
  } else {
    // Clicked empty space - unpin but keep selected body
    pinnedBody = null;
    hideBodyInfo();
  }
}

// Throttled hover check (runs every 150ms)
const throttledCheckHover = throttle(checkHover, 150);

// Listen for mouse movement
renderer.domElement.addEventListener("mousemove", (e) => {
  throttledCheckHover(e);
});

// Perform raycasting to detect hovered celestial body
function performRaycast() {
  raycaster.setFromCamera(mouse, camera);

  const meshesToCheck = hoverableMeshes.map((item) => item.mesh);
  const intersects = raycaster.intersectObjects(meshesToCheck);

  if (intersects.length > 0) {
    const intersectedMesh = intersects[0].object as THREE.Mesh;
    const hoverableItem = hoverableMeshes.find((item) => item.mesh === intersectedMesh);

    if (hoverableItem) {
      showBodyInfo(hoverableItem.body);
    }
  } else {
    hideBodyInfo();
  }
}

// Show celestial body info
function showBodyInfo(body: CelestialBody, isPinned: boolean = false) {
  const bodyInfoDiv = document.getElementById("body-info");
  const bodyNameDiv = document.getElementById("body-name");
  const bodyDetailsDiv = document.getElementById("body-details");

  if (bodyInfoDiv && bodyNameDiv && bodyDetailsDiv) {
    bodyNameDiv.textContent = body.name + (isPinned ? " 📌" : "");

    let details = `Radius: ${body.radius}`;
    if (body.distance > 0) {
      details += `<br>Orbital Distance: ${body.distance}`;
      details += `<br>Orbital Speed: ${body.orbitSpeed.toFixed(4)}`;
    }

    // Add Wikipedia link
    const wikiName = body.name.replace(/ /g, "_");
    const wikiUrl = `https://en.wikipedia.org/wiki/${wikiName}`;
    details += `<br><br><a href="${wikiUrl}" target="_blank" style="color: #66b3ff; text-decoration: none;">Wikipedia →</a>`;

    if (isPinned) {
      details += `<br><small>(Click to unpin)</small>`;
    }
    bodyDetailsDiv.innerHTML = details;

    bodyInfoDiv.style.display = "block";
  }
}

// Hide celestial body info
function hideBodyInfo() {
  const bodyInfoDiv = document.getElementById("body-info");
  if (bodyInfoDiv) {
    bodyInfoDiv.style.display = "none";
  }
}

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
    let text = "Use WASD to move, Hold Shift to sprint, Mouse drag to look<br>";
    text += "Tab: Toggle camera lock | R: Cycle planets | P: Pause<br>";
    if (isCameraLocked) {
      text += `<strong>Locked to: ${celestialBodies[selectedPlanetIndex].name} (${selectedPlanetIndex + 1}/${celestialBodies.length})</strong>`;
    } else {
      text += `Selected: ${celestialBodies[selectedPlanetIndex].name} (${selectedPlanetIndex + 1}/${celestialBodies.length})`;
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
let allCelestialMeshes: THREE.Mesh[] = [];

function clearSystem() {
  // Remove all celestial bodies
  allCelestialMeshes.forEach((mesh) => {
    scene.remove(mesh);
    mesh.geometry.dispose();
    (mesh.material as THREE.Material).dispose();
  });
  allCelestialMeshes = [];
  planets = [];

  // Remove all orbit meshes
  orbitMeshes.forEach((orbit) => {
    scene.remove(orbit);
    orbit.geometry.dispose();
    (orbit.material as THREE.Material).dispose();
  });
  orbitMeshes = [];

  // Clear hoverable meshes, unpin, and hide info
  hoverableMeshes = [];
  pinnedBody = null;
  hideBodyInfo();
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
    allCelestialMeshes.push(mesh);

    // Add to hoverable meshes for raycasting
    hoverableMeshes.push({ mesh, body });

    // Add rings for Saturn
    if (body.name === "Saturn") {
      const ringGeometry = new THREE.RingGeometry(
        body.radius * 1.2,
        body.radius * 1.7,
        64
      );
      const ringMaterial = new THREE.MeshStandardMaterial({
        color: 0xc9b58a,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
        metalness: 0.1,
        roughness: 0.8,
      });
      const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
      ringMesh.rotation.x = Math.PI / 2;

      if (body.distance === 0) {
        ringMesh.position.set(0, 0, 0);
      } else {
        ringMesh.position.set(body.distance, 0, 0);
      }

      scene.add(ringMesh);
      allCelestialMeshes.push(ringMesh);
    }

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

  // Point camera at center (0, 0, 0)
  const direction = new THREE.Vector3(0, 0, 0).sub(camera.position).normalize();
  yaw = Math.atan2(direction.x, direction.z);
  pitch = Math.asin(direction.y);

  selectedPlanetIndex = 0;
  isCameraLocked = false;
  updateInfoDisplay();
}

// Get initial system from query parameter
function getInitialSystem(): SystemConfig {
  const urlParams = new URLSearchParams(window.location.search);
  const sceneParam = urlParams.get('scene');

  if (sceneParam && systems[sceneParam]) {
    return systems[sceneParam];
  }

  return solarSystem;
}

// Update URL query parameter
function updateURLParam(systemKey: string) {
  const url = new URL(window.location.href);
  url.searchParams.set('scene', systemKey);
  window.history.pushState({}, '', url);
}

// Initialize with system from query param or default to solar system
const initialSystem = getInitialSystem();
const initialKey = Object.keys(systems).find(key => systems[key] === initialSystem) || 'solar';
loadSystem(initialSystem);

// Update URL to ensure scene parameter is set
updateURLParam(initialKey);

// Set up dropdown and initialize
const systemDropdown = document.getElementById("system-dropdown") as HTMLSelectElement;
if (systemDropdown) {
  // Set dropdown to match initial system
  systemDropdown.value = initialKey;

  // Add change event listener
  systemDropdown.addEventListener("change", (e) => {
    const target = e.target as HTMLSelectElement;
    const selectedSystem = systems[target.value];
    if (selectedSystem) {
      loadSystem(selectedSystem);
      updateURLParam(target.value);
    }
  });
}

// Set up time controls
const pauseButton = document.getElementById("pause-button") as HTMLButtonElement;
const speedSlider = document.getElementById("speed-slider") as HTMLInputElement;
const speedDisplay = document.getElementById("speed-display") as HTMLSpanElement;

function updatePauseButton() {
  if (pauseButton) {
    pauseButton.textContent = isPaused ? "▶" : "⏸";
  }
}

function updateSpeedDisplay() {
  if (speedDisplay) {
    speedDisplay.textContent = `Speed: ${timeScale.toFixed(1)}x`;
    if (isPaused) {
      speedDisplay.style.opacity = "0.5";
    } else {
      speedDisplay.style.opacity = "1.0";
    }
  }
}

if (pauseButton) {
  pauseButton.addEventListener("click", () => {
    isPaused = !isPaused;
    updatePauseButton();
    updateSpeedDisplay();
  });
}

if (speedSlider) {
  speedSlider.addEventListener("input", (e) => {
    const target = e.target as HTMLInputElement;
    timeScale = parseFloat(target.value);
    updateSpeedDisplay();

    // Auto-unpause when slider is moved
    if (isPaused) {
      isPaused = false;
      updatePauseButton();
    }
  });
}

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
    // Flight-style movement
    const forward = direction.clone();
    const right = new THREE.Vector3();
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

    const currentSpeed = movement.sprint ? moveSpeed * sprintMultiplier : moveSpeed;

    if (movement.forward) camera.position.add(forward.multiplyScalar(currentSpeed));
    if (movement.backward)
      camera.position.sub(forward.multiplyScalar(currentSpeed));
    if (movement.left) camera.position.sub(right.multiplyScalar(currentSpeed));
    if (movement.right) camera.position.add(right.multiplyScalar(currentSpeed));
  }
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  updateCamera();

  // Calculate effective time scale
  const effectiveTimeScale = isPaused ? 0 : timeScale;

  // Update planet positions
  planets.forEach((planet) => {
    planet.angle += planet.orbitSpeed * effectiveTimeScale;
    planet.mesh.position.x = Math.cos(planet.angle) * planet.distance;
    planet.mesh.position.z = Math.sin(planet.angle) * planet.distance;
    planet.mesh.rotation.y += 0.01 * effectiveTimeScale; // Self rotation
  });

  renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
