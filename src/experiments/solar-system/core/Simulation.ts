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
import type { SystemConfig } from "../systems/solar-system";
import { Renderer } from "./Renderer";
import { InputManager } from "../player/InputManager";
import { PlayerController } from "../player/PlayerController";
import { CelestialSystem } from "../entities/CelestialSystem";
import { BodyPicker } from "../ui/BodyPicker";
import { UIManager } from "../ui/UIManager";

export class Simulation {
  private renderer: Renderer;
  private inputManager: InputManager;
  private playerController: PlayerController;
  private celestialSystem: CelestialSystem;
  private bodyPicker: BodyPicker;
  private uiManager: UIManager;

  private systems: Record<string, SystemConfig>;
  private currentSystemKey: string = "";

  // Delta time tracking
  private lastTime: number = 0;
  private deltaTime: number = 0;

  constructor(systems: Record<string, SystemConfig>) {
    this.systems = systems;

    // Initialize core systems
    this.renderer = new Renderer("canvas-container");
    this.inputManager = new InputManager(this.renderer.domElement);
    this.playerController = new PlayerController(
      this.renderer.camera,
      this.inputManager
    );
    this.celestialSystem = new CelestialSystem(this.renderer.scene);
    this.bodyPicker = new BodyPicker(
      this.renderer.camera,
      this.renderer.domElement
    );
    this.uiManager = new UIManager();

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    // Input manager key handlers
    this.inputManager.onKeyDown((key) => {
      switch (key) {
        case "r":
          this.bodyPicker.cycleSelection();
          this.updateInfoDisplay();
          // If in walking mode, move player to the newly selected body
          if (this.playerController.getIsWalkingMode()) {
            this.updateWalkingModeBody();
          }
          break;
        case "p":
          this.uiManager.togglePause();
          break;
        case "tab":
          this.toggleWalkingMode();
          break;
      }
    });

    // Click handling
    this.inputManager.onClick((event) => {
      this.bodyPicker.handleClick(event);
    });

    // Body picker selection
    this.bodyPicker.onSelection((body, index) => {
      this.uiManager.showBodyInfo(body, true);
      this.updateInfoDisplay();
    });

    // Body picker hover
    this.bodyPicker.onHover((body) => {
      if (body && !this.bodyPicker.getPinnedBody()) {
        this.uiManager.showBodyInfo(body);
      } else if (!body && !this.bodyPicker.getPinnedBody()) {
        this.uiManager.hideBodyInfo();
      }
    });

    // System change from dropdown
    this.uiManager.onSystemChange((systemKey) => {
      if (this.systems[systemKey]) {
        this.loadSystem(systemKey);
        this.updateURLParam(systemKey);
      }
    });

    // Scale controls
    this.uiManager.onSizeScaleChange((scale) => {
      this.celestialSystem.setSizeScale(scale);
      // Update walking mode if active
      if (this.playerController.getIsWalkingMode()) {
        this.updateWalkingModeBody();
      }
    });

    this.uiManager.onDistanceScaleChange((scale) => {
      this.celestialSystem.setDistanceScale(scale);
      this.renderer.setStarFieldScale(scale);
    });
  }

  public loadSystem(systemKey: string): void {
    const config = this.systems[systemKey];
    if (!config) return;

    this.currentSystemKey = systemKey;

    // Exit walking mode if active
    if (this.playerController.getIsWalkingMode()) {
      this.playerController.exitWalkingMode();
      this.renderer.setNearPlane(0.1); // Reset to flight mode near plane
    }

    // Load celestial bodies
    this.celestialSystem.load(config);

    // Update renderer lighting
    this.renderer.setPointLightIntensity(config.centerLightIntensity);

    // Apply current distance scale to star field
    this.renderer.setStarFieldScale(this.uiManager.getDistanceScale());

    // Update body picker
    this.bodyPicker.setHoverableBodies(this.celestialSystem.getHoverableBodies());
    this.bodyPicker.resetSelection();

    // Reset player position to above orbital plane, looking at center
    const distanceScale = this.uiManager.getDistanceScale();
    const viewDistance = 200 * distanceScale;
    const viewHeight = 100 * distanceScale;
    this.playerController.setPosition(
      new THREE.Vector3(viewDistance, viewHeight, viewDistance)
    );
    this.playerController.pointAt(new THREE.Vector3(0, 0, 0));

    // Update UI
    this.uiManager.hideBodyInfo();
    this.uiManager.setSystemDropdownValue(systemKey);
    this.updateInfoDisplay();
  }

  private updateInfoDisplay(): void {
    const bodies = this.celestialSystem.getBodies();
    const selectedIndex = this.bodyPicker.getSelectedIndex();
    const selectedBody = bodies[selectedIndex];

    if (selectedBody) {
      this.uiManager.updateInfoDisplay(selectedBody, selectedIndex, bodies.length);
    }
  }

  private toggleWalkingMode(): void {
    const selectedIndex = this.bodyPicker.getSelectedIndex();
    const bodyData = this.celestialSystem.getBodyByIndex(selectedIndex);

    if (bodyData) {
      this.playerController.toggleWalkingMode(bodyData.mesh, bodyData.body);

      // Adjust camera near plane for walking vs flying
      if (this.playerController.getIsWalkingMode()) {
        this.renderer.setNearPlane(0.001); // Closer for surface viewing
      } else {
        this.renderer.setNearPlane(0.1); // Default for space flying
      }

      this.updateInfoDisplay();
    }
  }

  private updateWalkingModeBody(): void {
    const selectedIndex = this.bodyPicker.getSelectedIndex();
    const bodyData = this.celestialSystem.getBodyByIndex(selectedIndex);

    if (bodyData) {
      // Re-enter walking mode on the new body
      this.playerController.enterWalkingMode(bodyData.mesh, bodyData.body);
    }
  }

  public start(): void {
    this.lastTime = performance.now();
    this.animate();
  }

  private animate = (): void => {
    requestAnimationFrame(this.animate);

    // Calculate delta time
    const currentTime = performance.now();
    this.deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
    this.lastTime = currentTime;

    // Clamp delta time to prevent huge jumps (e.g., when tab is inactive)
    this.deltaTime = Math.min(this.deltaTime, 0.1);

    // Update player with delta time
    this.playerController.update(this.deltaTime);

    // Update celestial system
    const timeScale = this.uiManager.getEffectiveTimeScale();
    this.celestialSystem.update(timeScale);

    // Render
    this.renderer.render();
  };

  public getInitialSystemKey(): string {
    const urlParams = new URLSearchParams(window.location.search);
    const sceneParam = urlParams.get("scene");

    if (sceneParam && this.systems[sceneParam]) {
      return sceneParam;
    }

    return Object.keys(this.systems)[0] || "solar";
  }

  private updateURLParam(systemKey: string): void {
    const url = new URL(window.location.href);
    url.searchParams.set("scene", systemKey);
    window.history.pushState({}, "", url);
  }

  public initialize(): void {
    const initialKey = this.getInitialSystemKey();
    this.loadSystem(initialKey);
    this.updateURLParam(initialKey);
  }
}
