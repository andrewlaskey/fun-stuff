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
import { MobileControls } from "../ui/MobileControls";

export class Simulation {
  private renderer: Renderer;
  private inputManager: InputManager;
  private playerController: PlayerController;
  private celestialSystem: CelestialSystem;
  private bodyPicker: BodyPicker;
  private uiManager: UIManager;
  private mobileControls: MobileControls;

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
    this.mobileControls = new MobileControls();
    this.mobileControls.setInputManager(this.inputManager);

    this.setupEventHandlers();
    this.setupMobileControls();
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

    this.uiManager.onFOVChange((fov) => {
      this.renderer.setFOV(fov);
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
        // Slow down time when entering walking mode (if not paused)
        if (!this.uiManager.getIsPaused()) {
          this.uiManager.setTimeScale(0.1);
        }
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

  private setupMobileControls(): void {
    // Wire mobile action buttons
    this.mobileControls.onCycleBody(() => {
      this.bodyPicker.cycleSelection();
      this.updateInfoDisplay();
      if (this.playerController.getIsWalkingMode()) {
        this.updateWalkingModeBody();
      }
    });

    this.mobileControls.onWalkModeToggle(() => {
      this.toggleWalkingMode();
    });

    this.mobileControls.onPauseToggle(() => {
      this.uiManager.togglePause();
      this.mobileControls.updatePauseButton(this.uiManager.getIsPaused());
    });

    // Sync pause button state
    this.uiManager.onPauseToggle((isPaused) => {
      this.mobileControls.updatePauseButton(isPaused);
    });

    // Move settings controls into mobile menu
    this.setupMobileMenu();
  }

  private setupMobileMenu(): void {
    const menuPanel = this.mobileControls.getMenuPanel();
    const contentContainer = menuPanel.querySelector("#mobile-menu-content");

    if (!contentContainer) return;

    // Create mobile-friendly versions of controls
    const controlsDiv = document.createElement("div");
    controlsDiv.style.cssText = "color: white; font-family: monospace; font-size: 14px;";
    controlsDiv.innerHTML = `
      <div style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 5px;">System:</label>
        <select id="mobile-system-dropdown" style="width: 100%; padding: 8px; background: #333; color: white; border: 1px solid #666; border-radius: 3px;">
          <option value="solar">Solar System</option>
          <option value="jovian">Jovian System</option>
          <option value="saturnian">Saturnian System</option>
          <option value="alpha-centauri">Proxima Centauri</option>
          <option value="trappist">TRAPPIST-1 System</option>
          <option value="kepler90">Kepler-90 System</option>
          <option value="kepler47">Kepler-47 (Binary)</option>
        </select>
      </div>

      <div style="margin-bottom: 20px;">
        <label id="mobile-speed-display" style="display: block; margin-bottom: 5px;">Speed: 1.0x</label>
        <input type="range" id="mobile-speed-slider" min="0" max="2" step="0.1" value="1.0" style="width: 100%;">
      </div>

      <div style="margin-bottom: 20px;">
        <label id="mobile-size-display" style="display: block; margin-bottom: 5px;">Size: 1.0x</label>
        <input type="range" id="mobile-size-slider" min="0.5" max="2" step="0.05" value="1.0" style="width: 100%;">
      </div>

      <div style="margin-bottom: 20px;">
        <label id="mobile-distance-display" style="display: block; margin-bottom: 5px;">Distance: 1.0x</label>
        <input type="range" id="mobile-distance-slider" min="0.5" max="2" step="0.05" value="1.0" style="width: 100%;">
      </div>

      <div style="margin-bottom: 20px;">
        <label id="mobile-fov-display" style="display: block; margin-bottom: 5px;">FOV: 75°</label>
        <input type="range" id="mobile-fov-slider" min="30" max="120" step="1" value="75" style="width: 100%;">
      </div>
    `;

    contentContainer.appendChild(controlsDiv);

    // Wire up mobile controls to sync with desktop controls
    const mobileSystemDropdown = document.getElementById("mobile-system-dropdown") as HTMLSelectElement;
    const mobileSpeedSlider = document.getElementById("mobile-speed-slider") as HTMLInputElement;
    const mobileSpeedDisplay = document.getElementById("mobile-speed-display") as HTMLElement;
    const mobileSizeSlider = document.getElementById("mobile-size-slider") as HTMLInputElement;
    const mobileSizeDisplay = document.getElementById("mobile-size-display") as HTMLElement;
    const mobileDistanceSlider = document.getElementById("mobile-distance-slider") as HTMLInputElement;
    const mobileDistanceDisplay = document.getElementById("mobile-distance-display") as HTMLElement;
    const mobileFovSlider = document.getElementById("mobile-fov-slider") as HTMLInputElement;
    const mobileFovDisplay = document.getElementById("mobile-fov-display") as HTMLElement;

    if (mobileSystemDropdown) {
      mobileSystemDropdown.addEventListener("change", (e) => {
        const target = e.target as HTMLSelectElement;
        if (this.systems[target.value]) {
          this.loadSystem(target.value);
          this.updateURLParam(target.value);
        }
      });
    }

    if (mobileSpeedSlider) {
      mobileSpeedSlider.addEventListener("input", (e) => {
        const target = e.target as HTMLInputElement;
        const scale = parseFloat(target.value);
        this.uiManager.setTimeScale(scale);
        if (mobileSpeedDisplay) {
          mobileSpeedDisplay.textContent = `Speed: ${scale.toFixed(1)}x`;
        }
      });
    }

    if (mobileSizeSlider) {
      mobileSizeSlider.addEventListener("input", (e) => {
        const target = e.target as HTMLInputElement;
        const displayValue = parseFloat(target.value);
        // Use same conversion as UIManager
        let outputScale: number;
        if (displayValue <= 1.0) {
          outputScale = ((displayValue - 0.5) / 0.5) * 2.0;
        } else {
          outputScale = 2.0 + ((displayValue - 1.0) / 1.0) * 1.0;
        }
        this.celestialSystem.setSizeScale(outputScale);
        if (this.playerController.getIsWalkingMode()) {
          this.updateWalkingModeBody();
        }
        if (mobileSizeDisplay) {
          mobileSizeDisplay.textContent = `Size: ${displayValue.toFixed(1)}x`;
        }
      });
    }

    if (mobileDistanceSlider) {
      mobileDistanceSlider.addEventListener("input", (e) => {
        const target = e.target as HTMLInputElement;
        const displayValue = parseFloat(target.value);
        // Use same conversion as UIManager
        let outputScale: number;
        if (displayValue <= 1.0) {
          outputScale = 0.5 + ((displayValue - 0.5) / 0.5) * 1.3;
        } else {
          outputScale = 1.8 + ((displayValue - 1.0) / 1.0) * 0.2;
        }
        this.celestialSystem.setDistanceScale(outputScale);
        this.renderer.setStarFieldScale(outputScale);
        if (mobileDistanceDisplay) {
          mobileDistanceDisplay.textContent = `Distance: ${displayValue.toFixed(1)}x`;
        }
      });
    }

    if (mobileFovSlider) {
      mobileFovSlider.addEventListener("input", (e) => {
        const target = e.target as HTMLInputElement;
        const fov = parseFloat(target.value);
        this.renderer.setFOV(fov);
        if (mobileFovDisplay) {
          mobileFovDisplay.textContent = `FOV: ${fov}°`;
        }
      });
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
    // Mobile controls directly update InputManager.movement state
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
