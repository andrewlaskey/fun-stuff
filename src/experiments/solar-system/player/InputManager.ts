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

type KeyCallback = (key: string) => void;

export class InputManager {
  public movement: MovementState;
  public mouse: MouseState;

  private keyDownCallbacks: KeyCallback[] = [];
  private clickCallbacks: ((event: MouseEvent) => void)[] = [];
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

    this.setupKeyboardListeners();
    this.setupMouseListeners();
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

  public onKeyDown(callback: KeyCallback): void {
    this.keyDownCallbacks.push(callback);
  }

  public onClick(callback: (event: MouseEvent) => void): void {
    this.clickCallbacks.push(callback);
  }

  public isMoving(): boolean {
    return (
      this.movement.forward ||
      this.movement.backward ||
      this.movement.left ||
      this.movement.right
    );
  }
}
