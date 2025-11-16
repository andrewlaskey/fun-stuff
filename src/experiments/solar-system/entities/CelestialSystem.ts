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

import * as THREE from "three";
import type { SystemConfig, CelestialBody } from "../systems/solar-system";

interface OrbitingBody {
  mesh: THREE.Mesh;
  baseDistance: number;
  distance: number;
  orbitSpeed: number;
  rotationSpeed: number;
  angle: number;
}

export interface HoverableBody {
  mesh: THREE.Mesh;
  body: CelestialBody;
  ringMesh?: THREE.Mesh;
}

export class CelestialSystem {
  private scene: THREE.Scene;
  private currentConfig: SystemConfig | null = null;

  private orbitingBodies: OrbitingBody[] = [];
  private allMeshes: THREE.Mesh[] = [];
  private orbitMeshes: THREE.Mesh[] = [];
  private hoverableBodies: HoverableBody[] = [];

  private sizeScale: number = 2.0;
  private distanceScale: number = 1.8;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  public load(config: SystemConfig): void {
    this.clear();
    this.currentConfig = config;

    config.celestialBodies.forEach((body) => {
      this.createBody(body);
    });
  }

  private createBody(body: CelestialBody): void {
    const scaledRadius = body.radius * this.sizeScale;
    const scaledDistance = body.distance * this.distanceScale;

    const geometry = new THREE.SphereGeometry(scaledRadius, 32, 32);
    const material = new THREE.MeshStandardMaterial({
      color: body.color,
      emissive: body.emissive || body.color,
      emissiveIntensity: body.emissive ? 1 : 0.2,
      metalness: 0.1,
      roughness: 0.8,
    });

    const mesh = new THREE.Mesh(geometry, material);

    if (scaledDistance === 0) {
      mesh.position.set(0, 0, 0);
    } else {
      mesh.position.set(scaledDistance, 0, 0);
    }

    this.scene.add(mesh);
    this.allMeshes.push(mesh);

    const hoverableBody: HoverableBody = { mesh, body };

    // Add rings for Saturn
    if (body.name === "Saturn") {
      const ringMesh = this.createRings(body);
      hoverableBody.ringMesh = ringMesh;
    }

    this.hoverableBodies.push(hoverableBody);

    // Add orbit path for orbiting bodies
    if (body.distance > 0) {
      this.createOrbitPath(scaledDistance);
      this.orbitingBodies.push({
        mesh,
        baseDistance: body.distance,
        distance: scaledDistance,
        orbitSpeed: body.orbitSpeed,
        rotationSpeed: body.rotationSpeed ?? 0.002, // Default rotation speed
        angle: Math.random() * Math.PI * 2,
      });
    } else if (body.rotationSpeed) {
      // Center body (like Sun) still rotates but doesn't orbit
      this.orbitingBodies.push({
        mesh,
        baseDistance: 0,
        distance: 0,
        orbitSpeed: 0,
        rotationSpeed: body.rotationSpeed,
        angle: 0,
      });
    }
  }

  private createRings(body: CelestialBody): THREE.Mesh {
    const scaledRadius = body.radius * this.sizeScale;
    const scaledDistance = body.distance * this.distanceScale;

    const ringGeometry = new THREE.RingGeometry(
      scaledRadius * 1.2,
      scaledRadius * 1.7,
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

    if (scaledDistance === 0) {
      ringMesh.position.set(0, 0, 0);
    } else {
      ringMesh.position.set(scaledDistance, 0, 0);
    }

    this.scene.add(ringMesh);
    this.allMeshes.push(ringMesh);

    return ringMesh;
  }

  private createOrbitPath(distance: number): void {
    const orbitGeometry = new THREE.RingGeometry(
      distance - 0.2,
      distance + 0.2,
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
    orbitMesh.renderOrder = -1;
    this.scene.add(orbitMesh);
    this.orbitMeshes.push(orbitMesh);
  }

  public clear(): void {
    // Remove all celestial body meshes
    this.allMeshes.forEach((mesh) => {
      this.scene.remove(mesh);
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    });
    this.allMeshes = [];
    this.orbitingBodies = [];

    // Remove all orbit meshes
    this.orbitMeshes.forEach((orbit) => {
      this.scene.remove(orbit);
      orbit.geometry.dispose();
      (orbit.material as THREE.Material).dispose();
    });
    this.orbitMeshes = [];

    this.hoverableBodies = [];
  }

  public update(timeScale: number): void {
    this.orbitingBodies.forEach((body) => {
      body.angle += body.orbitSpeed * timeScale;
      body.mesh.position.x = Math.cos(body.angle) * body.distance;
      body.mesh.position.z = Math.sin(body.angle) * body.distance;
      body.mesh.rotation.y += body.rotationSpeed * timeScale;
    });

    // Update ring positions to follow their parent bodies
    this.hoverableBodies.forEach((hoverableBody) => {
      if (hoverableBody.ringMesh) {
        hoverableBody.ringMesh.position.copy(hoverableBody.mesh.position);
      }
    });
  }

  public getBodies(): CelestialBody[] {
    return this.currentConfig?.celestialBodies || [];
  }

  public getHoverableBodies(): HoverableBody[] {
    return this.hoverableBodies;
  }

  public getBodyMesh(index: number): THREE.Mesh | null {
    if (index >= 0 && index < this.hoverableBodies.length) {
      return this.hoverableBodies[index].mesh;
    }
    return null;
  }

  public getBodyByIndex(index: number): { mesh: THREE.Mesh; body: CelestialBody } | null {
    if (index >= 0 && index < this.hoverableBodies.length) {
      return this.hoverableBodies[index];
    }
    return null;
  }

  public getConfig(): SystemConfig | null {
    return this.currentConfig;
  }

  public setSizeScale(scale: number): void {
    this.sizeScale = scale;

    // Update all body meshes with new scale
    this.hoverableBodies.forEach((hoverableBody) => {
      const { mesh, body, ringMesh } = hoverableBody;
      const newRadius = body.radius * scale;

      // Replace geometry with new scaled size
      mesh.geometry.dispose();
      mesh.geometry = new THREE.SphereGeometry(newRadius, 32, 32);

      // Update ring if present
      if (ringMesh) {
        ringMesh.geometry.dispose();
        ringMesh.geometry = new THREE.RingGeometry(
          newRadius * 1.2,
          newRadius * 1.7,
          64
        );
      }
    });
  }

  public setDistanceScale(scale: number): void {
    this.distanceScale = scale;

    // Update orbital distances
    this.orbitingBodies.forEach((orbitBody) => {
      orbitBody.distance = orbitBody.baseDistance * scale;
      // Update current position based on new distance
      orbitBody.mesh.position.x = Math.cos(orbitBody.angle) * orbitBody.distance;
      orbitBody.mesh.position.z = Math.sin(orbitBody.angle) * orbitBody.distance;
    });

    // Update ring positions to match their parent bodies
    this.hoverableBodies.forEach((hoverableBody) => {
      if (hoverableBody.ringMesh) {
        const scaledDistance = hoverableBody.body.distance * scale;
        // Find the corresponding orbiting body to get current angle
        const orbitBody = this.orbitingBodies.find(
          (ob) => ob.mesh === hoverableBody.mesh
        );
        if (orbitBody) {
          hoverableBody.ringMesh.position.x =
            Math.cos(orbitBody.angle) * scaledDistance;
          hoverableBody.ringMesh.position.z =
            Math.sin(orbitBody.angle) * scaledDistance;
        }
      }
    });

    // Recreate orbit paths with new distances
    this.orbitMeshes.forEach((orbit) => {
      this.scene.remove(orbit);
      orbit.geometry.dispose();
      (orbit.material as THREE.Material).dispose();
    });
    this.orbitMeshes = [];

    // Create new orbit paths
    this.orbitingBodies.forEach((orbitBody) => {
      if (orbitBody.baseDistance > 0) {
        this.createOrbitPath(orbitBody.distance);
      }
    });
  }

  public getSizeScale(): number {
    return this.sizeScale;
  }

  public getDistanceScale(): number {
    return this.distanceScale;
  }
}
