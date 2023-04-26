import * as THREE from "three";
// import { Vector3 } from "three";

class ThirdPersonCamera {
  scene: THREE.Scene;
  camera: THREE.Camera;
  currentOffset: THREE.Vector3;
  currentLookat: THREE.Vector3;
  target: any;

  constructor(scene: THREE.Scene, camera: THREE.Camera) {
    this.scene = scene;
    this.camera = camera;

    this.currentOffset = new THREE.Vector3();
    this.currentLookat = new THREE.Vector3();

    this.target = null;
  }

  calculateOffset(): THREE.Vector3 {
    const idealOffset = new THREE.Vector3(0, 0, 1);
    // idealOffset.applyQuaternion(this.target.quaternion);
    idealOffset.add(this.target.position);
    // offset.applyQuaternion(this.camera.)
    return idealOffset;
  }

  calculateLookat(): THREE.Vector3 {
    const idealLookat = new THREE.Vector3(0, 0, -1);
    idealLookat.applyQuaternion(this.target.quaternion);
    idealLookat.add(this.target.position);
    return idealLookat;
  }

  public update(timeElapsed: number);

  update(timeElapsed) {
    if (this.target === null) return;

    const offset = this.calculateOffset();
    const lookat = this.calculateLookat();

    const t = 1.0 - Math.pow(0.001, timeElapsed);

    this.currentOffset.lerp(offset, t);

    this.currentLookat.lerp(lookat, t);

    this.camera.position.copy(this.currentOffset);
    this.camera.lookAt(this.currentOffset);
  }

  setTarget(target) {
    this.target = target;
  }
}

export default ThirdPersonCamera;
