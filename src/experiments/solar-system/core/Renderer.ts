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

export class Renderer {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public webGLRenderer: THREE.WebGLRenderer;
  public ambientLight: THREE.AmbientLight;
  public pointLight: THREE.PointLight;
  private starField: THREE.Group;

  constructor(containerId: string = "canvas-container") {
    // Scene setup
    this.scene = new THREE.Scene();

    // Load skybox
    // this.loadSkybox();

    // Create star field
    this.starField = this.createStarField();
    this.scene.add(this.starField);

    // Camera setup
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      10000
    );
    this.camera.position.set(0, 50, 150);

    // WebGL renderer
    this.webGLRenderer = new THREE.WebGLRenderer({ antialias: true });
    this.webGLRenderer.setSize(window.innerWidth, window.innerHeight);

    const container = document.getElementById(containerId);
    if (container) {
      container.appendChild(this.webGLRenderer.domElement);
    }

    // Lighting
    this.ambientLight = new THREE.AmbientLight(0xaaaaaa, 0.8);
    this.scene.add(this.ambientLight);

    this.pointLight = new THREE.PointLight(0xffffff, 5, 0);
    this.scene.add(this.pointLight);

    // Handle window resize
    window.addEventListener("resize", this.handleResize.bind(this));
  }

  private loadSkybox(): void {
    const loader = new THREE.CubeTextureLoader();
    // Use Vite's base URL for proper path resolution
    const basePath = import.meta.env.BASE_URL || "/";
    loader.setPath(`${basePath}images/skybox/`);

    // Load cube map faces: +x, -x, +y, -y, +z, -z
    // Mapping numbered files to cube faces (adjust if orientation is wrong)
    const texture = loader.load([
      "1.png", // positive x (right)
      "2.png", // negative x (left)
      "3.png", // positive y (top)
      "4.png", // negative y (bottom)
      "5.png", // positive z (front)
      "6.png", // negative z (back)
    ]);

    this.scene.background = texture;
  }

  private createStarField(): THREE.Group {
    const starGroup = new THREE.Group();
    const starCount = 5000;
    const sphereRadius = 6000; // Beyond Neptune (4497)

    // Create shared geometries for different star sizes
    const smallGeometry = new THREE.SphereGeometry(4, 4, 4);
    const mediumGeometry = new THREE.SphereGeometry(8, 6, 6);
    const largeGeometry = new THREE.SphereGeometry(16, 8, 8);

    // MeshBasicMaterial is unaffected by lights
    const starMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
    });

    for (let i = 0; i < starCount; i++) {
      // Random position on unit sphere using spherical coordinates
      const theta = Math.random() * Math.PI * 2; // Azimuthal angle
      const phi = Math.acos(2 * Math.random() - 1); // Polar angle (uniform distribution)

      const x = sphereRadius * Math.sin(phi) * Math.cos(theta);
      const y = sphereRadius * Math.sin(phi) * Math.sin(theta);
      const z = sphereRadius * Math.cos(phi);

      // Random size selection
      const sizeRoll = Math.random();
      let geometry: THREE.SphereGeometry;
      if (sizeRoll < 0.7) {
        geometry = smallGeometry;
      } else if (sizeRoll < 0.95) {
        geometry = mediumGeometry;
      } else {
        geometry = largeGeometry;
      }

      const star = new THREE.Mesh(geometry, starMaterial);
      star.position.set(x, y, z);
      starGroup.add(star);
    }

    return starGroup;
  }

  private handleResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.webGLRenderer.setSize(window.innerWidth, window.innerHeight);
  }

  public render(): void {
    this.webGLRenderer.render(this.scene, this.camera);
  }

  public setPointLightIntensity(intensity: number): void {
    this.pointLight.intensity = intensity;
  }

  public setNearPlane(near: number): void {
    this.camera.near = near;
    this.camera.updateProjectionMatrix();
  }

  public get domElement(): HTMLCanvasElement {
    return this.webGLRenderer.domElement;
  }

  public setStarFieldScale(scale: number): void {
    this.starField.scale.set(scale, scale, scale);
  }
}
