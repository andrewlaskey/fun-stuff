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
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

// Bloom layer constant - objects on this layer will have bloom applied
export const BLOOM_SCENE = 1;

export class Renderer {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public webGLRenderer: THREE.WebGLRenderer;
  public ambientLight: THREE.AmbientLight;
  public pointLight: THREE.PointLight;
  public directionalLight: THREE.DirectionalLight;
  private currentLightType: "point" | "directional" = "point";
  private starField: THREE.Group;

  // Post-processing properties
  private bloomLayer: THREE.Layers;
  private bloomComposer: EffectComposer;
  private finalComposer: EffectComposer;
  private bloomPass: UnrealBloomPass;
  private darkMaterial: THREE.MeshBasicMaterial;
  private materials: { [uuid: string]: THREE.Material };

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
      20000
    );
    this.camera.position.set(0, 50, 150);

    // WebGL renderer
    this.webGLRenderer = new THREE.WebGLRenderer({ antialias: true });
    this.webGLRenderer.setSize(window.innerWidth, window.innerHeight);
    this.webGLRenderer.shadowMap.enabled = true;
    this.webGLRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.webGLRenderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.webGLRenderer.toneMappingExposure = 1.5;

    const container = document.getElementById(containerId);
    if (container) {
      container.appendChild(this.webGLRenderer.domElement);
    }

    // Initialize bloom post-processing
    this.bloomLayer = new THREE.Layers();
    this.bloomLayer.set(BLOOM_SCENE);
    this.darkMaterial = new THREE.MeshBasicMaterial({ color: "black" });
    this.materials = {};

    // Create render passes
    const renderScene = new RenderPass(this.scene, this.camera);

    // Create bloom pass with parameters optimized for stars
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.0, // strength
      0.2, // radius
      0.85 // threshold
    );
    this.bloomPass.threshold = 0; // Low threshold to bloom bright objects
    this.bloomPass.strength = 0.75; // Strong bloom for stars
    this.bloomPass.radius = 0.15; // Medium radius for glow spread

    // Bloom composer - renders only bloomed objects
    const bloomRenderTarget = new THREE.WebGLRenderTarget(
      window.innerWidth,
      window.innerHeight,
      { type: THREE.HalfFloatType }
    );
    this.bloomComposer = new EffectComposer(this.webGLRenderer, bloomRenderTarget);
    this.bloomComposer.renderToScreen = false;
    this.bloomComposer.addPass(renderScene);
    this.bloomComposer.addPass(this.bloomPass);

    // Mix pass - combines base scene with bloom
    const mixPass = new ShaderPass(
      new THREE.ShaderMaterial({
        uniforms: {
          baseTexture: { value: null },
          bloomTexture: { value: this.bloomComposer.renderTarget2.texture },
          bloomStrength: { value: this.bloomPass.strength },
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform sampler2D baseTexture;
          uniform sampler2D bloomTexture;
          uniform float bloomStrength;
          varying vec2 vUv;
          void main() {
            gl_FragColor = (texture2D(baseTexture, vUv) + texture2D(bloomTexture, vUv) * bloomStrength);
          }
        `,
        defines: {},
      }),
      "baseTexture"
    );
    mixPass.needsSwap = true;

    const outputPass = new OutputPass();

    // Final composer - renders complete scene with bloom
    const finalRenderTarget = new THREE.WebGLRenderTarget(
      window.innerWidth,
      window.innerHeight,
      { type: THREE.HalfFloatType, samples: 4 }
    );
    this.finalComposer = new EffectComposer(this.webGLRenderer, finalRenderTarget);
    this.finalComposer.addPass(renderScene);
    this.finalComposer.addPass(mixPass);
    this.finalComposer.addPass(outputPass);

    // Lighting
    this.ambientLight = new THREE.AmbientLight(0xaaaaaa, 0.25);
    this.scene.add(this.ambientLight);

    this.pointLight = new THREE.PointLight(0xffffff, 5, 0, 0);
    this.pointLight.position.set(0, 0, 0);
    this.pointLight.castShadow = true;
    this.pointLight.shadow.mapSize.width = 2048;
    this.pointLight.shadow.mapSize.height = 2048;
    this.pointLight.shadow.camera.near = 0.5;
    this.pointLight.shadow.camera.far = 5000; // Updated dynamically
    this.pointLight.shadow.bias = -0.001;
    this.scene.add(this.pointLight);

    // Directional light for planetary systems (simulates distant Sun)
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 5);
    this.directionalLight.position.set(1, 1, 1);
    this.directionalLight.castShadow = true;
    this.directionalLight.shadow.mapSize.width = 2048;
    this.directionalLight.shadow.mapSize.height = 2048;
    this.directionalLight.shadow.camera.near = 0.5;
    this.directionalLight.shadow.camera.far = 5000;
    this.directionalLight.shadow.bias = -0.001;
    // Set up orthographic shadow camera for directional light
    const shadowSize = 500;
    this.directionalLight.shadow.camera.left = -shadowSize;
    this.directionalLight.shadow.camera.right = shadowSize;
    this.directionalLight.shadow.camera.top = shadowSize;
    this.directionalLight.shadow.camera.bottom = -shadowSize;
    // Don't add to scene yet - will be added based on system config

    // Handle window resize
    window.addEventListener("resize", this.handleResize.bind(this));
  }

  private loadSkybox(): void {
    const loader = new THREE.CubeTextureLoader();
    // Use Vite's base URL for proper path resolution
    // @ts-ignore
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
    const smallGeometry = new THREE.SphereGeometry(2, 4, 4);
    const mediumGeometry = new THREE.SphereGeometry(5, 4, 4);
    const largeGeometry = new THREE.SphereGeometry(8, 4, 4);

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
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.webGLRenderer.setSize(width, height);
    this.bloomComposer.setSize(width, height);
    this.finalComposer.setSize(width, height);
  }

  private darkenNonBloomed = (obj: THREE.Object3D): void => {
    if ((obj as THREE.Mesh).isMesh && this.bloomLayer.test(obj.layers) === false) {
      this.materials[obj.uuid] = (obj as THREE.Mesh).material as THREE.Material;
      (obj as THREE.Mesh).material = this.darkMaterial;
    }
  };

  private restoreMaterial = (obj: THREE.Object3D): void => {
    if (this.materials[obj.uuid]) {
      (obj as THREE.Mesh).material = this.materials[obj.uuid];
      delete this.materials[obj.uuid];
    }
  };

  public render(): void {
    // Render bloom scene - darken non-bloomed objects first
    this.scene.traverse(this.darkenNonBloomed);
    this.bloomComposer.render();
    this.scene.traverse(this.restoreMaterial);

    // Render entire scene with bloom effect applied
    this.finalComposer.render();
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

  public setFOV(fov: number): void {
    this.camera.fov = fov;
    this.camera.updateProjectionMatrix();
  }

  public updateShadowCameraRange(maxDistance: number): void {
    const shadowFar = maxDistance * 1.5;
    if (this.currentLightType === "point") {
      this.pointLight.shadow.camera.far = shadowFar;
      this.pointLight.shadow.camera.updateProjectionMatrix();
    } else {
      // For directional light, update orthographic camera size
      const shadowSize = maxDistance * 1.2;
      this.directionalLight.shadow.camera.left = -shadowSize;
      this.directionalLight.shadow.camera.right = shadowSize;
      this.directionalLight.shadow.camera.top = shadowSize;
      this.directionalLight.shadow.camera.bottom = -shadowSize;
      this.directionalLight.shadow.camera.far = shadowFar;
      this.directionalLight.shadow.camera.updateProjectionMatrix();
    }
  }

  public setLightType(
    type: "point" | "directional",
    intensity: number,
    direction?: { x: number; y: number; z: number }
  ): void {
    // Remove current light
    if (this.currentLightType === "point") {
      this.scene.remove(this.pointLight);
    } else {
      this.scene.remove(this.directionalLight);
    }

    this.currentLightType = type;

    if (type === "point") {
      this.pointLight.intensity = intensity;
      this.scene.add(this.pointLight);
    } else {
      this.directionalLight.intensity = intensity;
      if (direction) {
        this.directionalLight.position.set(direction.x, direction.y, direction.z);
      }
      this.scene.add(this.directionalLight);
    }
  }
}
