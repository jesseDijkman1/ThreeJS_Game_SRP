import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OBB } from "three/examples/jsm/math/OBB";

class SpaceShip {
  scene: THREE.Scene;
  loader: GLTFLoader;
  filePath: string;
  entity: THREE.Mesh;
  currentRotation: THREE.Vector3;
  state: any;

  acceleration: number;

  maxVelocity: THREE.Vector3;
  minVelocity: THREE.Vector3;
  velocity: THREE.Vector3;

  box: any;
  helper: any;

  tiltingVelocity: THREE.Vector3;
  rotationVelocity: THREE.Vector3;

  gltfScene: any;
  hasLoaded: boolean;

  _onLoadCallback: (SpaceShip) => void;

  constructor(scene: THREE.Scene, state: any) {
    this.scene = scene;
    this.loader = new GLTFLoader();
    this.filePath = "assets/spaceship.glb";
    this.entity = null;

    this.acceleration = -0.05;

    this.maxVelocity = new THREE.Vector3(0, 0, -0.25);
    this.minVelocity = new THREE.Vector3(0, 0, -0.05);

    this.velocity = new THREE.Vector3(0, 0, -0.05);

    this.tiltingVelocity = new THREE.Vector3(0, 0, 0);
    this.rotationVelocity = new THREE.Vector3(0, 0, 0);

    this.state = state;
    this.hasLoaded = false;
    // this._onLoadCallback = null;

    this.currentRotation = new THREE.Vector3();

    // this.load();
  }

  load() {
    return new Promise((resolve, reject) => {
      this.loader.load(
        this.filePath,
        this.done.call(this, resolve),
        this.progress.bind(this),
        reject
      );
    });
  }

  done(resolve) {
    return (gltf) => {
      this.gltfScene = gltf.scene;
      // this.entity = gltf.scene.children[0];

      // this.entity.userData.box = new THREE.Box3();
      // this.entity.userData.box.setFromObject(this.entity);
      // // this.entity.userData.box.applyMatrix4(this.entity.matrixWorld);

      // // this.box.
      // this.helper = new THREE.BoxHelper(this.entity, 0xffff00);
      // this.scene.add(this.helper);

      // this.scene.add(gltfScene.scene);

      // this._onLoadCallback(this);
      resolve();
    };
  }

  render() {
    this.entity = this.gltfScene.children[0];
    this.helper = new THREE.BoxHelper(this.entity, 0xffff00);

    this.scene.add(this.helper, this.entity);
    // this.entity.updateMatrixWorld(true);
    this.entity.userData.box = new THREE.Box3();
    this.entity.userData.box.setFromObject(this.entity);
    // this.entity.userData.box.applyMatrix4(this.entity.matrixWorld);

    this.hasLoaded = true;

    console.log(this.entity);

    // this.box.

    // this.scene.add();
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

    this.velocity.lerp(
      currentInputState.boost ? this.maxVelocity : this.minVelocity,
      timeElapsed
    );

    controlObject.quaternion.copy(_R);

    const forward = new THREE.Vector3(0, 0, 1);

    forward.applyQuaternion(controlObject.quaternion);

    forward.multiplyScalar(this.velocity.z);
    controlObject.position.add(forward);

    if (!currentInputState.rotateRight && !currentInputState.rotateLeft) {
      this.rotationVelocity.lerp(new THREE.Vector3(0, 0, 0), timeElapsed * 2);
    }

    if (!currentInputState.tiltUp && !currentInputState.tiltDown) {
      this.tiltingVelocity.lerp(new THREE.Vector3(0, 0, 0), timeElapsed * 2);
    }

    if (this.helper) {
      this.helper.update();

      // let v = new THREE.Vector3();
      // this.entity.userData.box.getCenter(v);
      // console.log(v);
    }
    // this.entity.updateMatrixWorld(true);
    this.entity.userData.box.setFromObject(this.entity);
    // this.entity.userData.box.applyMatrix4(this.entity.matrixWorld);
  }

  explode() {
    this.velocity = new THREE.Vector3(0, 0, 0.05);
  }

  error(error) {}

  public get(): THREE.Mesh {
    return;
  }
}

export default SpaceShip;
