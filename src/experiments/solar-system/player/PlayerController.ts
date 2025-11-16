import * as THREE from "three";
import { InputManager } from "./InputManager";
import type { CelestialBody } from "../systems/solar-system";

export class PlayerController {
  private camera: THREE.PerspectiveCamera;
  private inputManager: InputManager;

  // Flight mode camera orientation
  private yaw: number = 0;
  private pitch: number = 0;

  // Movement parameters
  private moveSpeed: number = 0.5;
  private sprintMultiplier: number = 3;
  private lookSpeed: number = 0.002;

  // Walking mode state
  private isWalkingMode: boolean = false;
  private currentBodyMesh: THREE.Mesh | null = null;
  private currentBodyData: CelestialBody | null = null;
  private surfaceHeight: number = 0.05; // Height above surface (fraction of radius)

  // Cartesian position relative to body center (normalized direction * distance)
  private localPosition: THREE.Vector3 = new THREE.Vector3(0, 1, 0);

  // Player's orientation on the surface - stores the rotation that defines "forward"
  private surfaceOrientation: THREE.Quaternion = new THREE.Quaternion();

  // Auto-leveling strength (0 = off, 1 = instant)
  private autoLevelStrength: number = 0.15;

  // Walking speed in world units per second
  private walkSpeed: number = 2.0;

  // Track body rotation to sync player with spinning planet
  private lastBodyRotationY: number = 0;

  constructor(camera: THREE.PerspectiveCamera, inputManager: InputManager) {
    this.camera = camera;
    this.inputManager = inputManager;
  }

  public update(deltaTime: number = 1/60): void {
    this.updateLook();

    if (this.isWalkingMode) {
      this.updateWalkingPosition(deltaTime);
    } else {
      this.updateMovement();
    }
  }

  private updateLook(): void {
    if (this.inputManager.mouse.isDown) {
      this.yaw -= this.inputManager.mouse.movementX * this.lookSpeed;

      // Flip y-axis in walking mode for more natural FPS controls
      if (this.isWalkingMode) {
        this.pitch += this.inputManager.mouse.movementY * this.lookSpeed;
      } else {
        this.pitch -= this.inputManager.mouse.movementY * this.lookSpeed;
      }

      // Limit pitch to prevent flipping
      this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));
    }

    // Reset movement deltas after processing
    this.inputManager.mouse.movementX = 0;
    this.inputManager.mouse.movementY = 0;
  }

  private updateMovement(): void {
    const direction = new THREE.Vector3();
    direction.x = Math.sin(this.yaw) * Math.cos(this.pitch);
    direction.y = Math.sin(this.pitch);
    direction.z = Math.cos(this.yaw) * Math.cos(this.pitch);
    direction.normalize();

    this.camera.lookAt(this.camera.position.clone().add(direction));

    // Flight-style movement
    const forward = direction.clone();
    const right = new THREE.Vector3();
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

    const movement = this.inputManager.movement;
    const currentSpeed = movement.sprint
      ? this.moveSpeed * this.sprintMultiplier
      : this.moveSpeed;

    if (movement.forward) {
      this.camera.position.add(forward.clone().multiplyScalar(currentSpeed));
    }
    if (movement.backward) {
      this.camera.position.sub(forward.clone().multiplyScalar(currentSpeed));
    }
    if (movement.left) {
      this.camera.position.sub(right.clone().multiplyScalar(currentSpeed));
    }
    if (movement.right) {
      this.camera.position.add(right.clone().multiplyScalar(currentSpeed));
    }
  }

  public pointAt(target: THREE.Vector3): void {
    const direction = target.clone().sub(this.camera.position).normalize();
    this.yaw = Math.atan2(direction.x, direction.z);
    this.pitch = Math.asin(direction.y);
  }

  public setPosition(position: THREE.Vector3): void {
    this.camera.position.copy(position);
  }

  public getPosition(): THREE.Vector3 {
    return this.camera.position.clone();
  }

  public getYaw(): number {
    return this.yaw;
  }

  public getPitch(): number {
    return this.pitch;
  }

  public enterWalkingMode(bodyMesh: THREE.Mesh, bodyData: CelestialBody): void {
    this.isWalkingMode = true;
    this.currentBodyMesh = bodyMesh;
    this.currentBodyData = bodyData;

    this.positionAtNorthPole();
  }

  public exitWalkingMode(): void {
    this.isWalkingMode = false;
    this.currentBodyMesh = null;
    this.currentBodyData = null;

    // Reset camera up vector to standard
    this.camera.up.set(0, 1, 0);
  }

  public toggleWalkingMode(bodyMesh: THREE.Mesh, bodyData: CelestialBody): void {
    if (this.isWalkingMode) {
      this.exitWalkingMode();
    } else {
      this.enterWalkingMode(bodyMesh, bodyData);
    }
  }

  private positionAtNorthPole(): void {
    if (!this.currentBodyMesh || !this.currentBodyData) return;

    // Set local position to north pole (positive Y direction from body center)
    this.localPosition.set(0, 1, 0);

    // Initialize surface orientation - player faces toward -Z (south) when at north pole
    // This quaternion represents "no rotation" - forward is -Z, up is +Y
    this.surfaceOrientation.identity();

    // Reset camera yaw and pitch for walking mode
    this.yaw = 0;
    this.pitch = 0;

    // Initialize rotation tracking
    this.lastBodyRotationY = this.currentBodyMesh.rotation.y;

    // Update camera position immediately
    this.updateWalkingPosition(0);
  }

  private updateWalkingPosition(deltaTime: number): void {
    if (!this.isWalkingMode || !this.currentBodyMesh || !this.currentBodyData) {
      return;
    }

    // === STEP 0: Sync player with body rotation ===
    // Calculate how much the body has rotated since last frame
    const currentBodyRotationY = this.currentBodyMesh.rotation.y;
    const rotationDelta = currentBodyRotationY - this.lastBodyRotationY;
    this.lastBodyRotationY = currentBodyRotationY;

    // Apply rotation to player's local position (rotate around Y-axis)
    // This makes the player "stick" to the spinning planet surface
    if (Math.abs(rotationDelta) > 0.000001) {
      this.localPosition.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotationDelta);

      // Also rotate the surface orientation to keep forward direction consistent
      const rotationQuat = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(0, 1, 0),
        rotationDelta
      );
      this.surfaceOrientation.premultiply(rotationQuat);
      this.surfaceOrientation.normalize();
    }

    // === STEP 1: Calculate surface normal (points away from body center) ===
    // localPosition is our position relative to body center, normalized
    const surfaceNormal = this.localPosition.clone().normalize();

    // === STEP 2: Build local coordinate system on the surface ===
    // We need tangent vectors (forward and right) that lie on the surface

    // Get the current "forward" direction from our surface orientation
    // surfaceOrientation rotates the default forward (-Z) to our actual forward
    const localForward = new THREE.Vector3(0, 0, -1);
    localForward.applyQuaternion(this.surfaceOrientation);

    // Project forward onto tangent plane (remove component along surface normal)
    // This ensures movement stays on the sphere surface
    const normalComponent = surfaceNormal.clone().multiplyScalar(localForward.dot(surfaceNormal));
    const tangentForward = localForward.sub(normalComponent).normalize();

    // Handle edge case: if forward is parallel to normal (looking straight up/down)
    if (tangentForward.lengthSq() < 0.001) {
      // Use a fallback direction
      tangentForward.set(0, 0, -1);
      const nc = surfaceNormal.clone().multiplyScalar(tangentForward.dot(surfaceNormal));
      tangentForward.sub(nc).normalize();
    }

    // Right vector is perpendicular to both up (normal) and forward
    const tangentRight = new THREE.Vector3().crossVectors(tangentForward, surfaceNormal).normalize();

    // === STEP 2.5: Apply yaw rotation to get actual movement direction ===
    // The player's yaw determines which way they're facing, so movement should be relative to that
    tangentForward.applyAxisAngle(surfaceNormal, this.yaw);
    tangentRight.applyAxisAngle(surfaceNormal, this.yaw);

    // === STEP 3: Apply WASD movement in tangent plane ===
    const movement = this.inputManager.movement;
    if (movement.forward || movement.backward || movement.left || movement.right) {
      const currentSpeed = movement.sprint
        ? this.walkSpeed * this.sprintMultiplier
        : this.walkSpeed;

      // Calculate movement vector in world space
      const moveVector = new THREE.Vector3();

      if (movement.forward) {
        moveVector.add(tangentForward.clone().multiplyScalar(currentSpeed * deltaTime));
      }
      if (movement.backward) {
        moveVector.sub(tangentForward.clone().multiplyScalar(currentSpeed * deltaTime));
      }
      if (movement.right) {
        moveVector.add(tangentRight.clone().multiplyScalar(currentSpeed * deltaTime));
      }
      if (movement.left) {
        moveVector.sub(tangentRight.clone().multiplyScalar(currentSpeed * deltaTime));
      }

      // === STEP 4: Update position and re-normalize to stay on sphere ===
      // Add movement to local position
      this.localPosition.add(moveVector);

      // Re-normalize to keep on sphere surface (this is the key to avoiding pole issues!)
      this.localPosition.normalize();

      // === STEP 5: Update surface orientation to match new position ===
      // We need to rotate our orientation to account for moving on the curved surface
      // Calculate the rotation needed to move from old normal to new normal
      const newSurfaceNormal = this.localPosition.clone().normalize();

      // Calculate rotation from old surface normal to new surface normal
      const rotationAxis = new THREE.Vector3().crossVectors(surfaceNormal, newSurfaceNormal);

      if (rotationAxis.lengthSq() > 0.000001) {
        rotationAxis.normalize();
        const rotationAngle = Math.acos(Math.min(1, Math.max(-1, surfaceNormal.dot(newSurfaceNormal))));

        // Create quaternion for this rotation
        const movementRotation = new THREE.Quaternion().setFromAxisAngle(rotationAxis, rotationAngle);

        // Apply this rotation to our surface orientation
        // This keeps "forward" pointing in a consistent direction as we move
        this.surfaceOrientation.premultiply(movementRotation);
        this.surfaceOrientation.normalize();
      }
    }

    // === STEP 6: Calculate world position ===
    // Player height above surface
    const playerHeight = this.currentBodyData.radius * (1 + this.surfaceHeight);

    // World position = body center + local position scaled to player height
    const worldPosition = this.currentBodyMesh.position.clone();
    worldPosition.add(this.localPosition.clone().multiplyScalar(playerHeight));

    this.camera.position.copy(worldPosition);

    // === STEP 7: Update camera orientation ===
    // Recalculate surface normal at current position
    const currentNormal = this.localPosition.clone().normalize();

    // Set camera up vector to surface normal
    this.camera.up.copy(currentNormal);

    // Calculate look direction from yaw and pitch
    // Start with our tangent forward direction
    const currentTangentForward = new THREE.Vector3(0, 0, -1);
    currentTangentForward.applyQuaternion(this.surfaceOrientation);

    // Project onto tangent plane again to ensure it's perpendicular to normal
    const nComp = currentNormal.clone().multiplyScalar(currentTangentForward.dot(currentNormal));
    currentTangentForward.sub(nComp).normalize();

    // Handle degenerate case
    if (currentTangentForward.lengthSq() < 0.001) {
      currentTangentForward.set(0, 0, -1);
      const nc2 = currentNormal.clone().multiplyScalar(currentTangentForward.dot(currentNormal));
      currentTangentForward.sub(nc2).normalize();
    }

    // Get right vector for current position
    const currentTangentRight = new THREE.Vector3().crossVectors(currentTangentForward, currentNormal).normalize();

    // Apply yaw rotation (rotate around surface normal)
    const lookDir = currentTangentForward.clone();
    lookDir.applyAxisAngle(currentNormal, this.yaw);

    // Apply pitch rotation (rotate around the horizontal axis perpendicular to look direction)
    const pitchAxis = new THREE.Vector3().crossVectors(currentNormal, lookDir).normalize();
    lookDir.applyAxisAngle(pitchAxis, this.pitch);

    // Set camera to look in that direction
    const lookTarget = this.camera.position.clone().add(lookDir);
    this.camera.lookAt(lookTarget);

    // === STEP 8: Auto-level the surface orientation ===
    // This gradually corrects any accumulated rotation errors
    // and ensures "forward" stays properly aligned with the tangent plane
    if (this.autoLevelStrength > 0 && deltaTime > 0) {
      // We want to ensure our stored forward direction lies in the tangent plane
      // and doesn't drift due to numerical errors

      // Get current stored forward
      const storedForward = new THREE.Vector3(0, 0, -1);
      storedForward.applyQuaternion(this.surfaceOrientation);

      // Project it onto tangent plane
      const projected = storedForward.clone();
      const comp = currentNormal.clone().multiplyScalar(projected.dot(currentNormal));
      projected.sub(comp);

      if (projected.lengthSq() > 0.001) {
        projected.normalize();

        // Build target orientation quaternion that aligns with this projected forward
        // We need a quaternion that rotates (0,0,-1) to projected and (0,1,0) to currentNormal
        const targetMatrix = new THREE.Matrix4();
        const targetRight = new THREE.Vector3().crossVectors(projected, currentNormal).normalize();

        // Set matrix columns: right, up, -forward (camera convention)
        targetMatrix.makeBasis(targetRight, currentNormal, projected.clone().negate());

        const targetOrientation = new THREE.Quaternion().setFromRotationMatrix(targetMatrix);

        // Slerp toward target orientation
        this.surfaceOrientation.slerp(targetOrientation, this.autoLevelStrength * deltaTime * 10);
        this.surfaceOrientation.normalize();
      }
    }
  }

  public getIsWalkingMode(): boolean {
    return this.isWalkingMode;
  }

  public getCurrentBody(): CelestialBody | null {
    return this.currentBodyData;
  }
}
