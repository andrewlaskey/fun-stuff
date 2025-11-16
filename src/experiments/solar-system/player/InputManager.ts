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

export interface MovementState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  sprint: boolean;
}

export interface MouseState {
  isDown: boolean;
  downPosition: { x: number; y: number };
  movementX: number;
  movementY: number;
}

export interface TouchState {
  isActive: boolean;
  startPosition: { x: number; y: number };
  lastPosition: { x: number; y: number };
  movementX: number;
  movementY: number;
}

type KeyCallback = (key: string) => void;

export class InputManager {
  public movement: MovementState;
  public mouse: MouseState;
  public touch: TouchState;

  private keyDownCallbacks: KeyCallback[] = [];
  private clickCallbacks: ((event: MouseEvent) => void)[] = [];
  private tapCallbacks: ((event: TouchEvent) => void)[] = [];
  private domElement: HTMLElement;

  constructor(domElement: HTMLElement) {
    this.domElement = domElement;

    this.movement = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      sprint: false,
    };

    this.mouse = {
      isDown: false,
      downPosition: { x: 0, y: 0 },
      movementX: 0,
      movementY: 0,
    };

    this.touch = {
      isActive: false,
      startPosition: { x: 0, y: 0 },
      lastPosition: { x: 0, y: 0 },
      movementX: 0,
      movementY: 0,
    };

    this.setupKeyboardListeners();
    this.setupMouseListeners();
    this.setupTouchListeners();
  }

  private setupKeyboardListeners(): void {
    document.addEventListener("keydown", (e) => {
      switch (e.key.toLowerCase()) {
        case "w":
          this.movement.forward = true;
          break;
        case "s":
          this.movement.backward = true;
          break;
        case "a":
          this.movement.left = true;
          break;
        case "d":
          this.movement.right = true;
          break;
        case "shift":
          this.movement.sprint = true;
          break;
        case "tab":
          e.preventDefault();
          break;
      }

      // Notify callbacks for other key handling
      this.keyDownCallbacks.forEach((callback) => callback(e.key.toLowerCase()));
    });

    document.addEventListener("keyup", (e) => {
      switch (e.key.toLowerCase()) {
        case "w":
          this.movement.forward = false;
          break;
        case "s":
          this.movement.backward = false;
          break;
        case "a":
          this.movement.left = false;
          break;
        case "d":
          this.movement.right = false;
          break;
        case "shift":
          this.movement.sprint = false;
          break;
      }
    });
  }

  private setupMouseListeners(): void {
    this.domElement.addEventListener("mousedown", (e) => {
      this.mouse.isDown = true;
      this.mouse.downPosition = { x: e.clientX, y: e.clientY };
    });

    document.addEventListener("mouseup", (e) => {
      // Check if this was a click (not a drag)
      const dx = e.clientX - this.mouse.downPosition.x;
      const dy = e.clientY - this.mouse.downPosition.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (this.mouse.isDown && distance < 5) {
        // This was a click, not a drag
        this.clickCallbacks.forEach((callback) => callback(e));
      }

      this.mouse.isDown = false;
    });

    document.addEventListener("mousemove", (e) => {
      if (this.mouse.isDown) {
        this.mouse.movementX = e.movementX;
        this.mouse.movementY = e.movementY;
      } else {
        this.mouse.movementX = 0;
        this.mouse.movementY = 0;
      }
    });
  }

  private setupTouchListeners(): void {
    this.domElement.addEventListener("touchstart", (e) => {
      // Only handle single touch for camera control
      // Ignore touches on UI elements
      const target = e.target as HTMLElement;
      if (this.isUIElement(target)) {
        return;
      }

      if (e.touches.length === 1) {
        const touch = e.touches[0];
        this.touch.isActive = true;
        this.touch.startPosition = { x: touch.clientX, y: touch.clientY };
        this.touch.lastPosition = { x: touch.clientX, y: touch.clientY };
        this.touch.movementX = 0;
        this.touch.movementY = 0;
      }
    }, { passive: false });

    document.addEventListener("touchend", (e) => {
      // Ignore touches on UI elements
      const target = e.target as HTMLElement;
      if (this.isUIElement(target)) {
        return;
      }

      if (this.touch.isActive && e.changedTouches.length > 0) {
        const touch = e.changedTouches[0];
        const dx = touch.clientX - this.touch.startPosition.x;
        const dy = touch.clientY - this.touch.startPosition.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Check if this was a tap (not a drag)
        if (distance < 10) {
          this.tapCallbacks.forEach((callback) => callback(e));
        }
      }

      this.touch.isActive = false;
      this.touch.movementX = 0;
      this.touch.movementY = 0;
    });

    document.addEventListener("touchmove", (e) => {
      // Ignore touches on UI elements
      const target = e.target as HTMLElement;
      if (this.isUIElement(target)) {
        return;
      }

      if (this.touch.isActive && e.touches.length === 1) {
        const touch = e.touches[0];

        // Calculate movement delta (similar to mouse movementX/Y)
        this.touch.movementX = touch.clientX - this.touch.lastPosition.x;
        this.touch.movementY = touch.clientY - this.touch.lastPosition.y;

        // Update last position
        this.touch.lastPosition = { x: touch.clientX, y: touch.clientY };

        // Prevent scrolling when dragging on canvas
        e.preventDefault();
      }
    }, { passive: false });

    // Cancel touch on multi-touch
    this.domElement.addEventListener("touchcancel", () => {
      this.touch.isActive = false;
      this.touch.movementX = 0;
      this.touch.movementY = 0;
    });
  }

  private isUIElement(element: HTMLElement): boolean {
    // Check if the element or any of its parents are UI controls
    let current: HTMLElement | null = element;
    while (current) {
      if (
        current.tagName === "BUTTON" ||
        current.tagName === "INPUT" ||
        current.tagName === "SELECT" ||
        current.id === "mobile-controls" ||
        current.id === "dpad" ||
        current.id === "action-buttons" ||
        current.id === "mobile-menu-panel" ||
        current.id === "mobile-menu-btn"
      ) {
        return true;
      }
      current = current.parentElement;
    }
    return false;
  }

  public onKeyDown(callback: KeyCallback): void {
    this.keyDownCallbacks.push(callback);
  }

  public onClick(callback: (event: MouseEvent) => void): void {
    this.clickCallbacks.push(callback);
  }

  public onTap(callback: (event: TouchEvent) => void): void {
    this.tapCallbacks.push(callback);
  }

  public isMoving(): boolean {
    return (
      this.movement.forward ||
      this.movement.backward ||
      this.movement.left ||
      this.movement.right
    );
  }

  public isTouchDevice(): boolean {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }
}
