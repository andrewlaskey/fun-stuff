import * as THREE from "three";
import type { CelestialBody } from "../systems/solar-system";
import type { HoverableBody } from "../entities/CelestialSystem";

type SelectionCallback = (body: CelestialBody, index: number) => void;
type HoverCallback = (body: CelestialBody | null) => void;

export class BodyPicker {
  private camera: THREE.PerspectiveCamera;
  private domElement: HTMLCanvasElement;
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;

  private hoverableBodies: HoverableBody[] = [];
  private pinnedBody: CelestialBody | null = null;
  private selectedIndex: number = 0;

  private selectionCallbacks: SelectionCallback[] = [];
  private hoverCallbacks: HoverCallback[] = [];

  private lastHoverCheck: number = 0;
  private hoverThrottleMs: number = 150;

  constructor(camera: THREE.PerspectiveCamera, domElement: HTMLCanvasElement) {
    this.camera = camera;
    this.domElement = domElement;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.setupHoverDetection();
  }

  private setupHoverDetection(): void {
    this.domElement.addEventListener("mousemove", (e) => {
      const now = Date.now();
      if (now - this.lastHoverCheck >= this.hoverThrottleMs) {
        this.lastHoverCheck = now;
        this.checkHover(e);
      }
    });
  }

  private checkHover(event: MouseEvent): void {
    if (this.pinnedBody) {
      return;
    }

    const rect = this.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const meshesToCheck = this.hoverableBodies.map((item) => item.mesh);
    const intersects = this.raycaster.intersectObjects(meshesToCheck);

    if (intersects.length > 0) {
      const intersectedMesh = intersects[0].object as THREE.Mesh;
      const hoverableItem = this.hoverableBodies.find(
        (item) => item.mesh === intersectedMesh
      );

      if (hoverableItem) {
        this.hoverCallbacks.forEach((cb) => cb(hoverableItem.body));
      }
    } else {
      this.hoverCallbacks.forEach((cb) => cb(null));
    }
  }

  public handleClick(event: MouseEvent): void {
    const rect = this.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const meshesToCheck = this.hoverableBodies.map((item) => item.mesh);
    const intersects = this.raycaster.intersectObjects(meshesToCheck);

    if (intersects.length > 0) {
      const intersectedMesh = intersects[0].object as THREE.Mesh;
      const hoverableItem = this.hoverableBodies.find(
        (item) => item.mesh === intersectedMesh
      );

      if (hoverableItem) {
        this.pinnedBody = hoverableItem.body;
        const bodyIndex = this.hoverableBodies.findIndex(
          (item) => item.body.name === hoverableItem.body.name
        );
        if (bodyIndex !== -1) {
          this.selectedIndex = bodyIndex;
          this.selectionCallbacks.forEach((cb) =>
            cb(hoverableItem.body, bodyIndex)
          );
        }
      }
    } else {
      this.pinnedBody = null;
      this.hoverCallbacks.forEach((cb) => cb(null));
    }
  }

  public setHoverableBodies(bodies: HoverableBody[]): void {
    this.hoverableBodies = bodies;
  }

  public cycleSelection(): void {
    if (this.hoverableBodies.length === 0) return;

    this.selectedIndex = (this.selectedIndex + 1) % this.hoverableBodies.length;
    const selected = this.hoverableBodies[this.selectedIndex];
    this.selectionCallbacks.forEach((cb) => cb(selected.body, this.selectedIndex));
  }

  public getSelectedIndex(): number {
    return this.selectedIndex;
  }

  public getSelectedBody(): CelestialBody | null {
    if (this.selectedIndex >= 0 && this.selectedIndex < this.hoverableBodies.length) {
      return this.hoverableBodies[this.selectedIndex].body;
    }
    return null;
  }

  public getPinnedBody(): CelestialBody | null {
    return this.pinnedBody;
  }

  public clearPinned(): void {
    this.pinnedBody = null;
  }

  public resetSelection(): void {
    this.selectedIndex = 0;
    this.pinnedBody = null;
  }

  public onSelection(callback: SelectionCallback): void {
    this.selectionCallbacks.push(callback);
  }

  public onHover(callback: HoverCallback): void {
    this.hoverCallbacks.push(callback);
  }
}
