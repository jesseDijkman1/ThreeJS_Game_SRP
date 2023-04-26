import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

class SpaceShip {
  scene: THREE.Scene;
  loader: GLTFLoader;
  filePath: string;
  entity: THREE.Mesh;
  currentRotation: THREE.Vector3;
  state: any;

  _onLoadCallback: (SpaceShip) => void;

  constructor(scene: THREE.Scene, filePath: string, state) {
    this.scene = scene;
    this.loader = new GLTFLoader();
    this.filePath = filePath;
    this.entity = null;
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
    // console.log(gltfScene);
    this.scene.add(gltfScene.scene);
    this.entity = gltfScene.scene.children[0];
    this._onLoadCallback(this);
  }

  progress(xhr) {}

  onLoad(callback) {
    this._onLoadCallback = callback;
  }

  update(timeElapsed) {
    // console.log(timeElapsed);
    if (this.entity === null) return;

    const currentInputState = this.state.getState();
    const t = 1.0 - Math.pow(0.001, timeElapsed);

    const desiredRotation = new THREE.Vector3();
    desiredRotation.x = this.entity.rotation.x;
    desiredRotation.y = this.entity.rotation.y;
    desiredRotation.z = this.entity.rotation.z;
    // const rotation = new THREE.Vector3(0, 0, 0)

    if (currentInputState.rotateLeft) {
      // desiredRotation.z = 0.2;
      // desiredRotation.y = 0.7;
      // this.entity.rotation.lerp(0.3, t);
      desiredRotation.y += 0.1;
    }

    if (currentInputState.rotateRight) {
      desiredRotation.y -= 0.1;
      // desiredRotation.z = -0.2;
      // desiredRotation.y = -0.7;
    }

    if (currentInputState.tiltUp) {
      desiredRotation.x += 0.1;
      // desiredRotation.x = 0.7;
      // desiredRotation.y = 0;
    }

    if (currentInputState.tiltDown) {
      desiredRotation.x -= 0.1;
      // desiredRotation.x = -0.7;a
      // desiredRotation.y = 0;
    }

    // const quaternion = this.entity.quaternion.clone();
    // quaternion.setFromAxisAngle(desiredRotation, Math.PI / 30);

    // const vector = new THREE.Vector3( 1, 0, 0 );
    // this.entity.applyQuaternion(quaternion);

    // this.currentRotation.applyQuaternion(this.entity.quaternion);
    // this.currentRotation.normalize();
    this.currentRotation.lerp(desiredRotation, t);
    // var axis = new THREE.Vector3(0, 1, 0);
    // this.entity.lookAt(this.currentRotation);
    // this.entity.rotateOnAxis(axis, 0.1);
    this.entity.rotation.x = this.currentRotation.x;
    this.entity.rotation.y = this.currentRotation.y;
    this.entity.rotation.z = this.currentRotation.z;
    this.entity.translateZ(-0.005);
  }

  error(error) {}

  public get(): THREE.Mesh {
    return;
  }
}

export default SpaceShip;
