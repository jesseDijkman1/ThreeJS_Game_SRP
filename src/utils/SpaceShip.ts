import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

class SpaceShip {
  scene: THREE.Scene;
  loader: GLTFLoader;
  filePath: string;
  entity: THREE.Mesh;
  currentRotation: THREE.Vector3;
  state: any;

  velocity: THREE.Vector3;
  maxVelocity: THREE.Vector3;
  acceleration: number;

  tiltingVelocity: THREE.Vector3;
  rotationVelocity: THREE.Vector3;

  _onLoadCallback: (SpaceShip) => void;

  constructor(scene: THREE.Scene, filePath: string, state) {
    this.scene = scene;
    this.loader = new GLTFLoader();
    this.filePath = filePath;
    this.entity = null;

    this.maxVelocity = new THREE.Vector3(0.25, 0, 1);
    this.velocity = new THREE.Vector3(0, 0, 1);
    this.acceleration = -0.05;

    this.tiltingVelocity = new THREE.Vector3(0, 0, 0);
    this.rotationVelocity = new THREE.Vector3(0, 0, 0);

    this.state = state;
    this._onLoadCallback = null;

    this.currentRotation = new THREE.Vector3();

    this.load();
  }

  load() {
    this.loader.load(
      this.filePath,
      this.done.bind(this),
      this.progress.bind(this),
      this.error.bind(this)
    );
  }

  done(gltfScene) {
    this.scene.add(gltfScene.scene);
    this.entity = gltfScene.scene.children[0];
    this._onLoadCallback(this);
  }

  progress(xhr) {}

  onLoad(callback) {
    this._onLoadCallback = callback;
  }

  update(timeElapsed) {
    if (this.entity === null) return;
    if (this.entity.userData.cameraLocked === false) return;

    const controlObject = this.entity;
    const _Q = new THREE.Quaternion();
    const _A = new THREE.Vector3();
    const _R = controlObject.quaternion.clone();

    const currentInputState = this.state.getState();

    if (currentInputState.rotateLeft || this.rotationVelocity.z > 0) {
      if (currentInputState.rotateLeft) {
        this.rotationVelocity.lerp(new THREE.Vector3(0, 0, 1), timeElapsed * 4);
      }

      _A.set(0, 0, 1);
      _Q.setFromAxisAngle(_A, Math.PI * timeElapsed * this.rotationVelocity.z);
      _R.multiply(_Q);
    }

    if (currentInputState.rotateRight || this.rotationVelocity.z < 0) {
      if (currentInputState.rotateRight) {
        this.rotationVelocity.lerp(
          new THREE.Vector3(0, 0, -1),
          timeElapsed * 4
        );
      }

      _A.set(0, 0, 1);
      _Q.setFromAxisAngle(_A, Math.PI * timeElapsed * this.rotationVelocity.z);
      _R.multiply(_Q);
    }

    if (currentInputState.tiltUp || this.tiltingVelocity.x > 0) {
      if (currentInputState.tiltUp) {
        this.tiltingVelocity.lerp(new THREE.Vector3(1, 0, 0), timeElapsed * 4);
      }
      _A.set(1, 0, 0);
      _Q.setFromAxisAngle(_A, Math.PI * timeElapsed * this.tiltingVelocity.x);
      _R.multiply(_Q);
    }

    if (currentInputState.tiltDown || this.tiltingVelocity.x < 0) {
      if (currentInputState.tiltDown) {
        this.tiltingVelocity.lerp(new THREE.Vector3(-1, 0, 0), timeElapsed * 4);
      }

      _A.set(1, 0, 0);
      _Q.setFromAxisAngle(_A, Math.PI * timeElapsed * this.tiltingVelocity.x);
      _R.multiply(_Q);
    }

    controlObject.quaternion.copy(_R);

    const forward = new THREE.Vector3(0, 0, 1);

    forward.applyQuaternion(controlObject.quaternion);

    forward.multiplyScalar(this.acceleration);
    controlObject.position.add(forward);

    if (!currentInputState.rotateRight && !currentInputState.rotateLeft) {
      this.rotationVelocity.lerp(new THREE.Vector3(0, 0, 0), timeElapsed * 2);
    }

    if (!currentInputState.tiltUp && !currentInputState.tiltDown) {
      this.tiltingVelocity.lerp(new THREE.Vector3(0, 0, 0), timeElapsed * 2);
    }
  }

  error(error) {}

  public get(): THREE.Mesh {
    return;
  }
}

export default SpaceShip;
