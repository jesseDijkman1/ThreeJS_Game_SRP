// @ts-nocheck

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const CONTAINER_NAME_REGEX = /^empty\d*$/i;
const BODY_NAME_REGEX = /^asteroid(?:_?\d+)?$/i;

const randomVector3 = () => {
  return new THREE.Vector3(
    Math.random() * 2 - 1,
    Math.random() * 2 - 1,
    Math.random() * 2 - 1
  );
};

class AsteroidInstance {
  constructor(scene, gltfScene, gltfAnimations) {
    this.scene = scene;
    this.gltfScene = gltfScene;
    this.gltfAnimations = gltfAnimations;

    this.container = null;
    this.body = null;
    this.cells = [];
    this.animations = [];

    this.init();
  }

  init() {
    this.initModel();
    this.initAnimations();
  }

  render(
    position: THREE.Vector3,
    rotation: THREE.Vector3 = new THREE.Vector3(),
    positionV: THREE.Vector3 = new THREE.Vector3(),
    rotationV: THREE.Vector3 = new THREE.Vector3()
  ) {
    this.cells.forEach((cell) => (cell.visible = false));

    // Set up bounding box for collision detection

    this.container.position.copy(position);
    this.container.rotation.copy(new THREE.Euler().setFromVector3(rotation));

    this.container.userData.positionV = positionV;
    this.container.userData.rotationV = rotationV;

    this.scene.add(this.container);

    this.container.updateMatrixWorld(true);
    this.body.geometry.computeBoundingSphere();
    this.container.userData.sphere.copy(this.body.geometry.boundingSphere);
    // this.container.userData.sphere.applyMatrix4(this.container.matrixWorld);
  }

  initModel() {
    this.gltfScene.traverse((child: THREE.Mesh) => {
      if (CONTAINER_NAME_REGEX.test(child.name)) {
        this.container = child;
      } else if (BODY_NAME_REGEX.test(child.name)) {
        this.body = child;
      } else {
        this.cells.push(child);
      }
    });

    this.body.geometry.computeBoundingSphere();

    const sphere = new THREE.Sphere();
    sphere.copy(this.body.geometry.boundingSphere);
    sphere.applyMatrix4(this.container.matrixWorld);
    this.container.userData.sphere = sphere;
  }

  initAnimations() {
    this.mixer = new THREE.AnimationMixer(this.container);

    this.animations = this.gltfAnimations.map((clip) => {
      const animation = this.mixer.clipAction(clip);
      animation.setLoop(THREE.LoopOnce, 1);
      animation.clampWhenFinished = true;

      return animation;
    });
  }

  update(deltaT) {
    this.updatePosition();
    this.updateRotation();
    this.updateBox();
    this.updateMixer(deltaT);
  }

  updatePosition() {
    const { x, y, z } = this.container.userData.positionV;

    this.container.position.x += x;
    this.container.position.y += y;
    this.container.position.z += z;
  }

  updateRotation() {
    const { x, y, z } = this.container.userData.rotationV;

    this.container.rotation.x += x;
    this.container.rotation.y += y;
    this.container.rotation.z += z;
  }

  updateBox() {
    this.body.geometry.computeBoundingSphere();
    this.container.userData.sphere.copy(this.body.geometry.boundingSphere);
    this.container.userData.sphere.applyMatrix4(this.container.matrixWorld);
  }

  updateMixer(deltaT) {
    this.mixer.update(deltaT);
  }

  explode() {
    let finishedAnimations = 0;

    const handleFinishedEvent = (e) => {
      finishedAnimations++;

      if (finishedAnimations === this.animations.length) {
        this.mixer.removeEventListener("finished", handleFinishedEvent);
        this.mixer.stopAllAction();
        this.cells.forEach((cell) => (cell.visible = false));

        setTimeout(() => {
          this.body.visible = true;
          this.body.userData.exploded = false;
        }, 200);
      }
    };

    this.mixer.addEventListener("finished", handleFinishedEvent);

    this.cells.forEach((cell) => (cell.visible = true));
    this.body.visible = false;
    this.body.userData.exploded = true;
    this.animations.forEach((animation) => animation.play());
  }
}

class AsteroidTemplate {
  constructor(scene, filePath, loader = new GLTFLoader()) {
    this.scene = scene;
    this.filePath = filePath;
    this.loader = loader;

    this.gltfScene = null;
    this.gltfAnimations = null;

    this.instances = [];
  }

  // Creates an instance (clone)
  create() {
    const instance = new AsteroidInstance(
      this.scene,
      this.gltfScene.clone(),
      this.gltfAnimations
    );

    // this.instances.push(instance);

    return instance;
  }

  done(resolve) {
    return (gltf) => {
      this.gltfScene = gltf.scene;
      this.gltfAnimations = gltf.animations;

      resolve();
    };
  }

  progress() {}

  // Public methods

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

  // update(deltaT) {
  //   // console.log("OEIFJOEIJFJIO");
  //   this.instances.forEach((instance) => {
  //     instance.update(deltaT);
  //   });
  // }
}

class Asteroids {
  asteroidInstances: any;

  constructor(scene: THREE.Scene, state) {
    this.scene = scene;
    this.filePaths = [
      "assets/asteroid-1.glb",
      "assets/asteroid-2.glb",
      "assets/asteroid-3.glb",
      "assets/asteroid-4.glb",
      "assets/asteroid-5.glb",
      "assets/asteroid-6.glb",
      "assets/asteroid-7.glb",
      "assets/asteroid-8.glb",
    ];
    this.loader = new GLTFLoader();
    this.state = state;

    // Asteroid makers
    this.asteroids = this.filePaths.map(
      (path) => new AsteroidTemplate(this.scene, path, this.loader)
    );

    this.asteroidInstances = [];
  }

  load() {
    const promises = this.asteroids.map((asteroid) => asteroid.load());

    return Promise.all(promises);
  }

  render(amount, maxRadius = 10) {
    for (let i = 0; i < amount; i++) {
      const template = this.asteroids[i % this.asteroids.length];
      const asteroid = template.create();

      const randomPosition = new THREE.Vector3();
      randomPosition.randomDirection();
      randomPosition.multiplyScalar(Math.random() * maxRadius);

      asteroid.render(
        randomPosition,
        new THREE.Vector3(Math.random(), Math.random(), Math.random()),
        randomVector3().divideScalar(1000),
        randomVector3().divideScalar(1000)
      );

      this.asteroidInstances.push(asteroid);
    }
  }

  update(deltaT) {
    this.asteroidInstances.forEach((asteroid) => {
      asteroid.update(deltaT);
    });
  }

  getClickedAsteroid(raycaster) {
    const clickableObjects = this.asteroidInstances
      .map(({ body }) => body)
      .filter((body) => !body.userData.exploded);
    const [clickedObject] = raycaster.intersectObjects(clickableObjects) || [];

    if (clickedObject && !clickedObject.object.userData.exploded) {
      // console.log(123, clickedObject.object);
      return this.asteroidInstances.find(
        (asteroid) => asteroid.body.uuid === clickedObject.object.uuid
      );
    }

    return null;
  }
}

export default Asteroids;
