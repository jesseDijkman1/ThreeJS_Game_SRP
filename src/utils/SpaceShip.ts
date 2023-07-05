// @ts-nocheck

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OBB } from "three/examples/jsm/math/OBB";
import Particles from "./Particles";

class Gun {
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
  entities: THREE.Mesh[];
  scene: THREE.Scene;
  blasters: THREE.Mesh[];
  ship: THREE.Mesh;
  lifeSpan: number;
  accumulatedTime: number;
  state: any;
  velocity: number;

  constructor(scene: THREE.Scene, state: any) {
    this.position = new THREE.Vector3();
    this.quaternion = new THREE.Quaternion();
    this.blasters = [];
    this.ship = null;
    this.scene = scene;
    this.lifeSpan = 10;
    this.state = state;

    this.velocity = 0.24;

    this.entities = [];

    this.accumulatedTime = 0;

    // this.init();
  }

  fire() {
    // console.log(this.blasters);
    if (this.blasters.length === 0) return;

    const blaster = this.blasters.shift();

    // console.log(blaster);
    const bullet = this.createBullet();

    const position = blaster.position.clone();
    position.applyQuaternion(this.ship.quaternion);
    position.add(this.ship.position);

    bullet.quaternion.copy(this.ship.quaternion);
    bullet.position.copy(position);

    // bullet.position.multiply(blaster.position);

    this.entities.push(bullet);

    this.blasters = [...this.blasters, blaster];

    this.scene.add(bullet);
  }

  update(timeElapsed) {
    // console.log(timeElapsed);

    const currentInputState = this.state.getState();

    if (currentInputState.shooting) {
      if (this.accumulatedTime === 0) {
        this.fire();
      }

      this.accumulatedTime += timeElapsed;

      if (this.accumulatedTime >= 100) {
        this.accumulatedTime = 0;
      }
    } else {
      this.accumulatedTime = 0;
    }

    this.entities.forEach((entity) => {
      const forward = new THREE.Vector3(0, 0, -1);
      forward.multiplyScalar(this.velocity);
      forward.applyQuaternion(entity.quaternion);
      entity.position.add(forward);

      entity.userData.life = (entity.userData.life ?? 0) + 0.1;

      if (entity.userData.life >= this.lifeSpan) this.scene.remove(entity);

      entity.geometry.computeBoundingBox();
      entity.userData.box.copy(entity.geometry.boundingBox);
      entity.userData.box.applyMatrix4(entity.matrixWorld);
    });

    this.entities = this.entities.filter(
      (entity) => entity.userData.life < this.lifeSpan
    );
  }

  createBullet() {
    const size = 0.05;
    const geometry = new THREE.BoxGeometry(size, size, size);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const mesh = new THREE.Mesh(geometry, material);

    mesh.userData.box = new THREE.Box3();

    return mesh;
  }

  setShip(target: THREE.Mesh) {
    this.ship = target;

    target.traverse((data) => {
      if (data.name.includes("Blaster")) {
        // const t = new THREE.Vector3(0, 0, 0);
        this.blasters.push(data as THREE.Mesh);
        // data.getWorldPosition(t);
      }
    });
  }
}

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

    this.blasters = [];

    this.currentRotation = new THREE.Vector3();

    this.particleSystem = new Particles(scene);
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

      resolve();
    };
  }

  render() {
    this.entity = this.gltfScene.children[0];

    this.entity.renderOrder = 201;
    this.entity.material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    this.entity.material.depthTest = false;
    this.entity.material.depthWrite = false;

    this.scene.add(this.entity);

    this.entity.userData.box = new THREE.Box3();
    this.entity.userData.box.setFromObject(this.entity);

    this.hasLoaded = true;

    this.state.initState("spaceship:health", 3);

    this.gun = new Gun(this.scene, this.state);
    this.gun.setShip(this.entity);

    this.entity.traverse((data) => {
      if (data.name.includes("Blaster")) {
        this.blasters.push(data as THREE.Mesh);
      }
    });
  }

  applyDamage() {
    const currentHealth = this.state.getState("spaceship:health");
    this.state.setState("spaceship:health", currentHealth - 1);
  }

  progress(xhr) {}

  onLoad(callback) {
    this._onLoadCallback = callback;
  }

  getBlasterPosition() {
    if (this.blasters.length === 0) return;

    const blaster = this.blasters.shift();

    const position = blaster.position.clone();
    position.applyQuaternion(this.entity.quaternion);
    position.add(this.entity.position);

    this.blasters = [...this.blasters, blaster];

    return position;
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
    }

    this.entity.userData.box.setFromObject(this.entity);

    // const boxPosition = new THREE.Vector3(0, 0, -10);
    // boxPosition.applyQuaternion(controlObject.quaternion);
    // boxPosition.add(this.entity.position);

    // this.box.position.copy(boxPosition);
    // this.box.quaternion.copy(this.entity.quaternion);
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
