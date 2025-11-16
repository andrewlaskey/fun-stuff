import type { CelestialBody } from "../systems/solar-system";

type TimeScaleCallback = (scale: number) => void;
type PauseCallback = (isPaused: boolean) => void;
type SystemChangeCallback = (systemKey: string) => void;

export class UIManager {
  private infoDiv: HTMLElement | null;
  private bodyInfoDiv: HTMLElement | null;
  private bodyNameDiv: HTMLElement | null;
  private bodyDetailsDiv: HTMLElement | null;
  private pauseButton: HTMLButtonElement | null;
  private speedSlider: HTMLInputElement | null;
  private speedDisplay: HTMLSpanElement | null;
  private systemDropdown: HTMLSelectElement | null;

  private isPaused: boolean = false;
  private timeScale: number = 1.0;

  private timeScaleCallbacks: TimeScaleCallback[] = [];
  private pauseCallbacks: PauseCallback[] = [];
  private systemChangeCallbacks: SystemChangeCallback[] = [];

  constructor() {
    this.infoDiv = document.getElementById("info");
    this.bodyInfoDiv = document.getElementById("body-info");
    this.bodyNameDiv = document.getElementById("body-name");
    this.bodyDetailsDiv = document.getElementById("body-details");
    this.pauseButton = document.getElementById("pause-button") as HTMLButtonElement;
    this.speedSlider = document.getElementById("speed-slider") as HTMLInputElement;
    this.speedDisplay = document.getElementById("speed-display") as HTMLSpanElement;
    this.systemDropdown = document.getElementById("system-dropdown") as HTMLSelectElement;

    this.setupTimeControls();
    this.setupSystemDropdown();
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
}
