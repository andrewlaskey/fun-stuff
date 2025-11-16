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

import type { MovementState, InputManager } from "../player/InputManager";

type ActionCallback = () => void;

export class MobileControls {
  private container: HTMLElement;
  private dpadContainer: HTMLElement;
  private actionsContainer: HTMLElement;
  private menuButton: HTMLElement;
  private menuPanel: HTMLElement;

  private movementState: MovementState;
  private sprintActive: boolean = false;
  private inputManager: InputManager | null = null;

  private cycleCallbacks: ActionCallback[] = [];
  private walkModeCallbacks: ActionCallback[] = [];
  private pauseCallbacks: ActionCallback[] = [];
  private menuToggleCallbacks: ActionCallback[] = [];

  constructor() {
    this.movementState = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      sprint: false,
    };

    this.container = this.createContainer();
    this.dpadContainer = this.createDpad();
    this.actionsContainer = this.createActionButtons();
    this.menuButton = this.createMenuButton();
    this.menuPanel = this.createMenuPanel();

    this.container.appendChild(this.dpadContainer);
    this.container.appendChild(this.actionsContainer);
    document.body.appendChild(this.container);
    document.body.appendChild(this.menuButton);
    document.body.appendChild(this.menuPanel);

    this.setupStyles();
  }

  public setInputManager(inputManager: InputManager): void {
    this.inputManager = inputManager;
  }

  private createContainer(): HTMLElement {
    const container = document.createElement("div");
    container.id = "mobile-controls";
    container.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      pointer-events: none;
      z-index: 1000;
      display: none;
    `;
    return container;
  }

  private createDpad(): HTMLElement {
    const dpad = document.createElement("div");
    dpad.id = "dpad";
    dpad.style.cssText = `
      position: absolute;
      bottom: 20px;
      left: 20px;
      width: 150px;
      height: 150px;
      pointer-events: auto;
    `;

    // Create D-pad buttons
    const directions = [
      { id: "up", label: "▲", top: "0", left: "50px", movement: "forward" },
      { id: "down", label: "▼", top: "100px", left: "50px", movement: "backward" },
      { id: "left", label: "◀", top: "50px", left: "0", movement: "left" },
      { id: "right", label: "▶", top: "50px", left: "100px", movement: "right" },
    ];

    directions.forEach(({ id, label, top, left, movement }) => {
      const button = this.createDpadButton(id, label, movement as keyof MovementState);
      button.style.top = top;
      button.style.left = left;
      dpad.appendChild(button);
    });

    // Sprint button in center
    const sprintButton = document.createElement("button");
    sprintButton.id = "sprint-btn";
    sprintButton.textContent = "RUN";
    sprintButton.style.cssText = `
      position: absolute;
      top: 50px;
      left: 50px;
      width: 50px;
      height: 50px;
      border-radius: 5px;
      background-color: rgba(100, 100, 100, 0.7);
      color: white;
      border: 2px solid #888;
      font-family: monospace;
      font-size: 10px;
      font-weight: bold;
      touch-action: manipulation;
      user-select: none;
      -webkit-user-select: none;
    `;

    const toggleSprint = () => {
      this.sprintActive = !this.sprintActive;
      this.movementState.sprint = this.sprintActive;
      if (this.inputManager) {
        this.inputManager.movement.sprint = this.sprintActive;
      }
      sprintButton.style.backgroundColor = this.sprintActive
        ? "rgba(255, 150, 0, 0.8)"
        : "rgba(100, 100, 100, 0.7)";
    };

    sprintButton.addEventListener("touchstart", (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleSprint();
    }, { passive: false });

    sprintButton.addEventListener("click", (e) => {
      e.preventDefault();
      toggleSprint();
    });

    dpad.appendChild(sprintButton);

    return dpad;
  }

  private createDpadButton(id: string, label: string, movement: keyof MovementState): HTMLElement {
    const button = document.createElement("button");
    button.id = `dpad-${id}`;
    button.textContent = label;
    button.style.cssText = `
      position: absolute;
      width: 50px;
      height: 50px;
      border-radius: 10px;
      background-color: rgba(255, 255, 255, 0.3);
      color: white;
      border: 2px solid rgba(255, 255, 255, 0.5);
      font-size: 20px;
      touch-action: manipulation;
      user-select: none;
      -webkit-user-select: none;
    `;

    const setMovement = (value: boolean) => {
      this.movementState[movement] = value;
      if (this.inputManager) {
        this.inputManager.movement[movement] = value;
      }
      button.style.backgroundColor = value
        ? "rgba(255, 255, 255, 0.6)"
        : "rgba(255, 255, 255, 0.3)";
    };

    button.addEventListener("touchstart", (e) => {
      e.preventDefault();
      e.stopPropagation();
      setMovement(true);
    }, { passive: false });

    button.addEventListener("touchend", (e) => {
      e.preventDefault();
      e.stopPropagation();
      setMovement(false);
    }, { passive: false });

    button.addEventListener("touchcancel", (e) => {
      e.preventDefault();
      setMovement(false);
    });

    // Also support mouse for testing on desktop
    button.addEventListener("mousedown", (e) => {
      e.preventDefault();
      setMovement(true);
    });

    button.addEventListener("mouseup", (e) => {
      e.preventDefault();
      setMovement(false);
    });

    button.addEventListener("mouseleave", () => {
      setMovement(false);
    });

    return button;
  }

  private createActionButtons(): HTMLElement {
    const container = document.createElement("div");
    container.id = "action-buttons";
    container.style.cssText = `
      position: absolute;
      bottom: 20px;
      right: 20px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: auto;
    `;

    // Cycle body button
    const cycleBtn = this.createActionButton("cycle-btn", "⟳", "Cycle Body");
    cycleBtn.addEventListener("touchstart", (e) => {
      e.preventDefault();
      this.cycleCallbacks.forEach((cb) => cb());
    });
    container.appendChild(cycleBtn);

    // Walk mode toggle button
    const walkBtn = this.createActionButton("walk-btn", "🚶", "Walk Mode");
    walkBtn.addEventListener("touchstart", (e) => {
      e.preventDefault();
      this.walkModeCallbacks.forEach((cb) => cb());
    });
    container.appendChild(walkBtn);

    // Pause button
    const pauseBtn = this.createActionButton("pause-mobile-btn", "⏸", "Pause");
    pauseBtn.addEventListener("touchstart", (e) => {
      e.preventDefault();
      this.pauseCallbacks.forEach((cb) => cb());
    });
    container.appendChild(pauseBtn);

    return container;
  }

  private createActionButton(id: string, icon: string, label: string): HTMLElement {
    const button = document.createElement("button");
    button.id = id;
    button.innerHTML = `<div style="font-size: 24px;">${icon}</div><div style="font-size: 10px;">${label}</div>`;
    button.style.cssText = `
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background-color: rgba(0, 0, 0, 0.7);
      color: white;
      border: 2px solid #666;
      font-family: monospace;
      touch-action: manipulation;
      user-select: none;
      -webkit-user-select: none;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    `;

    button.addEventListener("touchstart", () => {
      button.style.backgroundColor = "rgba(50, 50, 50, 0.9)";
    });

    button.addEventListener("touchend", () => {
      button.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    });

    return button;
  }

  private createMenuButton(): HTMLElement {
    const button = document.createElement("button");
    button.id = "mobile-menu-btn";
    button.textContent = "☰";
    button.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      width: 44px;
      height: 44px;
      border-radius: 5px;
      background-color: rgba(0, 0, 0, 0.7);
      color: white;
      border: 1px solid #666;
      font-size: 24px;
      z-index: 1001;
      touch-action: manipulation;
      user-select: none;
      -webkit-user-select: none;
      display: none;
    `;

    button.addEventListener("touchstart", (e) => {
      e.preventDefault();
      this.toggleMenu();
      this.menuToggleCallbacks.forEach((cb) => cb());
    });

    return button;
  }

  private createMenuPanel(): HTMLElement {
    const panel = document.createElement("div");
    panel.id = "mobile-menu-panel";
    panel.style.cssText = `
      position: fixed;
      top: 0;
      right: -250px;
      width: 250px;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.9);
      z-index: 1002;
      transition: right 0.3s ease;
      overflow-y: auto;
      padding: 60px 10px 20px 10px;
      box-sizing: border-box;
    `;

    // Close button
    const closeBtn = document.createElement("button");
    closeBtn.id = "mobile-menu-close";
    closeBtn.textContent = "✕";
    closeBtn.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      width: 44px;
      height: 44px;
      background-color: transparent;
      color: white;
      border: none;
      font-size: 24px;
      touch-action: manipulation;
      user-select: none;
      -webkit-user-select: none;
    `;
    closeBtn.addEventListener("touchstart", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.closeMenu();
    }, { passive: false });

    // Also support click for desktop testing
    closeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      this.closeMenu();
    });

    panel.appendChild(closeBtn);

    // Create a container for the controls content
    const contentContainer = document.createElement("div");
    contentContainer.id = "mobile-menu-content";
    panel.appendChild(contentContainer);

    return panel;
  }

  private setupStyles(): void {
    // Add CSS for preventing zoom and ensuring proper touch behavior
    const style = document.createElement("style");
    style.textContent = `
      @media (max-width: 768px) {
        #mobile-controls {
          display: block !important;
        }
        #mobile-menu-btn {
          display: block !important;
        }
        #system-selector,
        #time-controls {
          display: none !important;
        }
        #info {
          font-size: 12px !important;
          max-width: 60% !important;
        }
        #body-info {
          bottom: 200px !important;
          max-width: 50% !important;
        }
      }

      @media (hover: none) and (pointer: coarse) {
        #mobile-controls {
          display: block !important;
        }
        #mobile-menu-btn {
          display: block !important;
        }
        #system-selector,
        #time-controls {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  public toggleMenu(): void {
    const isOpen = this.menuPanel.style.right === "0px";
    this.menuPanel.style.right = isOpen ? "-250px" : "0px";
  }

  public closeMenu(): void {
    this.menuPanel.style.right = "-250px";
  }

  public openMenu(): void {
    this.menuPanel.style.right = "0px";
  }

  public getMenuPanel(): HTMLElement {
    return this.menuPanel;
  }

  public getMovementState(): MovementState {
    return this.movementState;
  }

  public onCycleBody(callback: ActionCallback): void {
    this.cycleCallbacks.push(callback);
  }

  public onWalkModeToggle(callback: ActionCallback): void {
    this.walkModeCallbacks.push(callback);
  }

  public onPauseToggle(callback: ActionCallback): void {
    this.pauseCallbacks.push(callback);
  }

  public onMenuToggle(callback: ActionCallback): void {
    this.menuToggleCallbacks.push(callback);
  }

  public updatePauseButton(isPaused: boolean): void {
    const pauseBtn = document.getElementById("pause-mobile-btn");
    if (pauseBtn) {
      const icon = isPaused ? "▶" : "⏸";
      pauseBtn.innerHTML = `<div style="font-size: 24px;">${icon}</div><div style="font-size: 10px;">${isPaused ? "Play" : "Pause"}</div>`;
    }
  }

  public show(): void {
    this.container.style.display = "block";
    this.menuButton.style.display = "block";
  }

  public hide(): void {
    this.container.style.display = "none";
    this.menuButton.style.display = "none";
  }
}
