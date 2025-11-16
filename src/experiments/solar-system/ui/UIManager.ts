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

import type { CelestialBody } from "../systems/solar-system";

type TimeScaleCallback = (scale: number) => void;
type PauseCallback = (isPaused: boolean) => void;
type SystemChangeCallback = (systemKey: string) => void;
type SizeScaleCallback = (scale: number) => void;
type DistanceScaleCallback = (scale: number) => void;
type FOVChangeCallback = (fov: number) => void;

export class UIManager {
  private infoDiv: HTMLElement | null;
  private bodyInfoDiv: HTMLElement | null;
  private bodyNameDiv: HTMLElement | null;
  private bodyDetailsDiv: HTMLElement | null;
  private pauseButton: HTMLButtonElement | null;
  private speedSlider: HTMLInputElement | null;
  private speedDisplay: HTMLSpanElement | null;
  private systemDropdown: HTMLSelectElement | null;
  private sizeScaleSlider: HTMLInputElement | null;
  private sizeScaleDisplay: HTMLSpanElement | null;
  private distanceScaleSlider: HTMLInputElement | null;
  private distanceScaleDisplay: HTMLSpanElement | null;
  private fovSlider: HTMLInputElement | null;
  private fovDisplay: HTMLSpanElement | null;

  private isPaused: boolean = false;
  private timeScale: number = 1.0;
  private sizeScale: number = 2.0; // Actual output scale
  private distanceScale: number = 1.8; // Actual output scale
  private sizeDisplayValue: number = 1.0; // Display value (slider position)
  private distanceDisplayValue: number = 1.0; // Display value (slider position)
  private fov: number = 50;

  private timeScaleCallbacks: TimeScaleCallback[] = [];
  private pauseCallbacks: PauseCallback[] = [];
  private systemChangeCallbacks: SystemChangeCallback[] = [];
  private sizeScaleCallbacks: SizeScaleCallback[] = [];
  private distanceScaleCallbacks: DistanceScaleCallback[] = [];
  private fovChangeCallbacks: FOVChangeCallback[] = [];

  constructor() {
    this.infoDiv = document.getElementById("info");
    this.bodyInfoDiv = document.getElementById("body-info");
    this.bodyNameDiv = document.getElementById("body-name");
    this.bodyDetailsDiv = document.getElementById("body-details");
    this.pauseButton = document.getElementById("pause-button") as HTMLButtonElement;
    this.speedSlider = document.getElementById("speed-slider") as HTMLInputElement;
    this.speedDisplay = document.getElementById("speed-display") as HTMLSpanElement;
    this.systemDropdown = document.getElementById("system-dropdown") as HTMLSelectElement;
    this.sizeScaleSlider = document.getElementById("size-scale-slider") as HTMLInputElement;
    this.sizeScaleDisplay = document.getElementById("size-scale-display") as HTMLSpanElement;
    this.distanceScaleSlider = document.getElementById("distance-scale-slider") as HTMLInputElement;
    this.distanceScaleDisplay = document.getElementById("distance-scale-display") as HTMLSpanElement;
    this.fovSlider = document.getElementById("fov-slider") as HTMLInputElement;
    this.fovDisplay = document.getElementById("fov-display") as HTMLSpanElement;

    this.setupTimeControls();
    this.setupSystemDropdown();
    this.setupScaleControls();
    this.setupFOVControl();
  }

  private setupTimeControls(): void {
    if (this.pauseButton) {
      this.pauseButton.addEventListener("click", () => {
        this.isPaused = !this.isPaused;
        this.updatePauseButton();
        this.updateSpeedDisplay();
        this.pauseCallbacks.forEach((cb) => cb(this.isPaused));
      });
    }

    if (this.speedSlider) {
      this.speedSlider.addEventListener("input", (e) => {
        const target = e.target as HTMLInputElement;
        this.timeScale = parseFloat(target.value);
        this.updateSpeedDisplay();

        // Auto-unpause when slider is moved
        if (this.isPaused) {
          this.isPaused = false;
          this.updatePauseButton();
          this.pauseCallbacks.forEach((cb) => cb(this.isPaused));
        }

        this.timeScaleCallbacks.forEach((cb) => cb(this.timeScale));
      });
    }
  }

  private setupSystemDropdown(): void {
    if (this.systemDropdown) {
      this.systemDropdown.addEventListener("change", (e) => {
        const target = e.target as HTMLSelectElement;
        this.systemChangeCallbacks.forEach((cb) => cb(target.value));
      });
    }
  }

  private setupScaleControls(): void {
    if (this.sizeScaleSlider) {
      this.sizeScaleSlider.addEventListener("input", (e) => {
        const target = e.target as HTMLInputElement;
        this.sizeDisplayValue = parseFloat(target.value);
        this.sizeScale = this.sizeDisplayToOutput(this.sizeDisplayValue);
        this.updateSizeScaleDisplay();
        this.sizeScaleCallbacks.forEach((cb) => cb(this.sizeScale));
      });
    }

    if (this.distanceScaleSlider) {
      this.distanceScaleSlider.addEventListener("input", (e) => {
        const target = e.target as HTMLInputElement;
        this.distanceDisplayValue = parseFloat(target.value);
        this.distanceScale = this.distanceDisplayToOutput(this.distanceDisplayValue);
        this.updateDistanceScaleDisplay();
        this.distanceScaleCallbacks.forEach((cb) => cb(this.distanceScale));
      });
    }
  }

  // Convert size display value (0.5-2.0) to output value (0.0-3.0)
  // Display 0.5 → Output 0.0
  // Display 1.0 → Output 2.0
  // Display 2.0 → Output 3.0
  private sizeDisplayToOutput(display: number): number {
    if (display <= 1.0) {
      // Map 0.5-1.0 to 0.0-2.0
      return ((display - 0.5) / 0.5) * 2.0;
    } else {
      // Map 1.0-2.0 to 2.0-3.0
      return 2.0 + ((display - 1.0) / 1.0) * 1.0;
    }
  }

  // Convert distance display value (0.5-2.0) to output value (0.5-2.0)
  // Display 0.5 → Output 0.5
  // Display 1.0 → Output 1.8
  // Display 2.0 → Output 2.0
  private distanceDisplayToOutput(display: number): number {
    if (display <= 1.0) {
      // Map 0.5-1.0 to 0.5-1.8
      return 0.5 + ((display - 0.5) / 0.5) * 1.3;
    } else {
      // Map 1.0-2.0 to 1.8-2.0
      return 1.8 + ((display - 1.0) / 1.0) * 0.2;
    }
  }

  private updateSizeScaleDisplay(): void {
    if (this.sizeScaleDisplay) {
      this.sizeScaleDisplay.textContent = `Size: ${this.sizeDisplayValue.toFixed(1)}x`;
    }
  }

  private updateDistanceScaleDisplay(): void {
    if (this.distanceScaleDisplay) {
      this.distanceScaleDisplay.textContent = `Distance: ${this.distanceDisplayValue.toFixed(1)}x`;
    }
  }

  private setupFOVControl(): void {
    if (this.fovSlider) {
      this.fovSlider.addEventListener("input", (e) => {
        const target = e.target as HTMLInputElement;
        this.fov = parseFloat(target.value);
        this.updateFOVDisplay();
        this.fovChangeCallbacks.forEach((cb) => cb(this.fov));
      });
    }
  }

  private updateFOVDisplay(): void {
    if (this.fovDisplay) {
      this.fovDisplay.textContent = `FOV: ${this.fov}°`;
    }
  }

  public updateInfoDisplay(
    selectedBody: CelestialBody,
    selectedIndex: number,
    totalBodies: number
  ): void {
    if (this.infoDiv) {
      let text = "Use WASD to move, Hold Shift to sprint, Mouse drag to look<br>";
      text += "R: Cycle planets | P: Pause<br>";
      text += `Selected: ${selectedBody.name} (${selectedIndex + 1}/${totalBodies})`;
      this.infoDiv.innerHTML = text;
    }
  }

  public showBodyInfo(body: CelestialBody, isPinned: boolean = false): void {
    if (this.bodyInfoDiv && this.bodyNameDiv && this.bodyDetailsDiv) {
      this.bodyNameDiv.textContent = body.name + (isPinned ? " 📌" : "");

      let details = `Radius: ${body.radius}`;
      if (body.distance > 0) {
        details += `<br>Orbital Distance: ${body.distance}`;
        details += `<br>Orbital Speed: ${body.orbitSpeed.toFixed(4)}`;
      }

      const wikiName = body.name.replace(/ /g, "_");
      const wikiUrl = `https://en.wikipedia.org/wiki/${wikiName}`;
      details += `<br><br><a href="${wikiUrl}" target="_blank" style="color: #66b3ff; text-decoration: none;">Wikipedia →</a>`;

      if (isPinned) {
        details += `<br><small>(Click to unpin)</small>`;
      }
      this.bodyDetailsDiv.innerHTML = details;

      this.bodyInfoDiv.style.display = "block";
    }
  }

  public hideBodyInfo(): void {
    if (this.bodyInfoDiv) {
      this.bodyInfoDiv.style.display = "none";
    }
  }

  private updatePauseButton(): void {
    if (this.pauseButton) {
      this.pauseButton.textContent = this.isPaused ? "▶" : "⏸";
    }
  }

  private updateSpeedDisplay(): void {
    if (this.speedDisplay) {
      this.speedDisplay.textContent = `Speed: ${this.timeScale.toFixed(1)}x`;
      this.speedDisplay.style.opacity = this.isPaused ? "0.5" : "1.0";
    }
  }

  public setSystemDropdownValue(value: string): void {
    if (this.systemDropdown) {
      this.systemDropdown.value = value;
    }
  }

  public togglePause(): void {
    this.isPaused = !this.isPaused;
    this.updatePauseButton();
    this.updateSpeedDisplay();
    this.pauseCallbacks.forEach((cb) => cb(this.isPaused));
  }

  public getIsPaused(): boolean {
    return this.isPaused;
  }

  public getTimeScale(): number {
    return this.timeScale;
  }

  public getEffectiveTimeScale(): number {
    return this.isPaused ? 0 : this.timeScale;
  }

  public onTimeScaleChange(callback: TimeScaleCallback): void {
    this.timeScaleCallbacks.push(callback);
  }

  public onPauseToggle(callback: PauseCallback): void {
    this.pauseCallbacks.push(callback);
  }

  public onSystemChange(callback: SystemChangeCallback): void {
    this.systemChangeCallbacks.push(callback);
  }

  public onSizeScaleChange(callback: SizeScaleCallback): void {
    this.sizeScaleCallbacks.push(callback);
  }

  public onDistanceScaleChange(callback: DistanceScaleCallback): void {
    this.distanceScaleCallbacks.push(callback);
  }

  public getSizeScale(): number {
    return this.sizeScale;
  }

  public getDistanceScale(): number {
    return this.distanceScale;
  }

  public resetScales(): void {
    this.sizeDisplayValue = 1.0;
    this.distanceDisplayValue = 1.0;
    this.sizeScale = this.sizeDisplayToOutput(1.0); // 2.0
    this.distanceScale = this.distanceDisplayToOutput(1.0); // 1.8
    if (this.sizeScaleSlider) {
      this.sizeScaleSlider.value = "1.0";
    }
    if (this.distanceScaleSlider) {
      this.distanceScaleSlider.value = "1.0";
    }
    this.updateSizeScaleDisplay();
    this.updateDistanceScaleDisplay();
  }

  public onFOVChange(callback: FOVChangeCallback): void {
    this.fovChangeCallbacks.push(callback);
  }

  public getFOV(): number {
    return this.fov;
  }

  public setTimeScale(scale: number): void {
    this.timeScale = scale;
    if (this.speedSlider) {
      this.speedSlider.value = scale.toString();
    }
    this.updateSpeedDisplay();
    this.timeScaleCallbacks.forEach((cb) => cb(this.timeScale));
  }
}
