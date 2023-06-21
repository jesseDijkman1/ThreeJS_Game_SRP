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

class Asteroid {
  constructor(scene, filePath, loader = new GLTFLoader()) {
    this.scene = scene;
    this.filePath = filePath;
    this.loader = loader;

    this.container = null;
    this.body = null;
    this.cells = [];

    this.animations = [];

    this.instances = [];

    this.mixer = null;
  }

  done(resolve) {
    return (gltf) => {
      this.initModel(gltf.scene);
      this.initAnimations(gltf.animations);

      resolve();
    };
  }

  progress() {}

  initModel(gltfScene) {
    // let containerName;
    // let bodyName;
    // const cells = []

    gltfScene.traverse((child: THREE.Mesh) => {
      if (CONTAINER_NAME_REGEX.test(child.name)) {
        this.container = child;
      } else if (BODY_NAME_REGEX.test(child.name)) {
        this.body = child;
      } else {
        this.cells.push(child);
      }
    });

    // console.log("after", this.filePath, containerName, bodyName);
    // this.container = gltfScene.getObjectByName(containerName);
    // this.body = gltfScene.getObjectByName(bodyName);

    this.scene.add(this.container);

    // console.log(this.container);
  }

  initAnimations(gltfAnimations) {
    this.mixer = new THREE.AnimationMixer(this.container);

    this.animations = gltfAnimations.map((clip) => {
      const animation = this.mixer.clipAction(clip);
      animation.setLoop(THREE.LoopOnce, 1);
      animation.clampWhenFinished = true;

      return animation;
    });
  }

  updateRotation() {
    const { x, y, z } = this.container.userData.rotationV;

    this.container.rotation.x += x;
    this.container.rotation.y += y;
    this.container.rotation.z += z;
  }

  updatePosition() {
    const { x, y, z } = this.container.userData.positionV;

    this.container.position.x += x;
    this.container.position.y += y;
    this.container.position.z += z;
  }

  updateMixer(deltaT) {
    this.mixer.update(deltaT);
  }

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

  render(
    position: THREE.Vector3,
    rotation: THREE.Vector3 = new THREE.Vector3(),
    positionV: THREE.Vector3 = new THREE.Vector3(),
    rotationV: THREE.Vector3 = new THREE.Vector3()
  ) {
    this.cells.forEach((cell) => (cell.visible = false));

    this.container.position.copy(position);
    this.container.rotation.copy(new THREE.Euler().setFromVector3(rotation));

    this.container.userData.positionV = positionV;
    this.container.userData.rotationV = rotationV;

    this.scene.add(this.container);
  }

  update(deltaT) {
    this.updatePosition();
    this.updateRotation();
    this.updateMixer(deltaT);
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

class Asteroids {
  constructor(scene: THREE.Scene, filePaths: string[]) {
    this.scene = scene;
    this.filePaths = filePaths;
    this.loader = new GLTFLoader();
    this.asteroids = this.filePaths.map(
      (path) => new Asteroid(this.scene, path, this.loader)
    );
  }

  load() {
    const promises = this.asteroids.map((asteroid) => asteroid.load());

    return Promise.all(promises);
  }

  render() {
    this.asteroids.forEach((asteroid, index) => {
      asteroid.render(
        new THREE.Vector3(index * 3, 0, 0),
        new THREE.Vector3(Math.random(), Math.random(), Math.random()),
        randomVector3().divideScalar(1000),
        randomVector3().divideScalar(1000)
      );
    });
  }

  update(deltaT) {
    this.asteroids.forEach((asteroid) => {
      asteroid.update(deltaT);
    });
  }

  getClickedAsteroid(raycaster) {
    const clickableObjects = this.asteroids.map(({ body }) => body);
    const [clickedObject] = raycaster.intersectObjects(clickableObjects) || [];

    if (clickedObject && !clickedObject.object.userData.exploded) {
      return this.asteroids.find(
        (asteroid) => asteroid.body.name === clickedObject.object.name
      );
    }

    return null;
  }
}

// class Asteroid {
//   constructor(scene, gltf) {
//     console.log(gltf);
//     this.scene = scene;
//     this.container = gltf.scene.getObjectByName("Empty");
//     this.body = gltf.scene.getObjectByName("Asteroid");
//     this.clips = gltf.animations;
//     this.animations = [];
//     this.mixer = new THREE.AnimationMixer(this.container);
//     // this.mixer = new THREE.AnimationMixer(object);

//     this.init();
//   }

//   init() {
//     this.animations = this.clips.map((clip) => {
//       const animation = this.mixer.clipAction(clip);
//       animation.setLoop(THREE.LoopOnce, 1);
//       animation.clampWhenFinished = true;

//       return animation;
//     });

//     this.scene.add(this.container);
//     //   const animation = this.mixer.clipAction(clip);
//     //   animation.setLoop(THREE.LoopOnce, 1);

//     //   animation.clampWhenFinished = true;
//   }

//   update(deltaT) {
//     this.mixer.update(deltaT);
//   }

//   explode() {
//     this.body.visible = false;
//     this.animations.forEach((animation) => {
//       animation.play();
//     });
//   }
// }

// class Asteroids {
//   constructor(scene, filePaths) {
//     this.scene = scene
//     this.filePaths = filePaths

//     this.asteroids = []
//     this.renderedAsteroids = []

//     this.loader = new GLTFLoader()
//   }

//   create(position: THREE.Vector3) {

//   }
// }

// class Asteroid {
//   constructor(model) {}
// }

// class Asteroids {
//   scene: THREE.Scene;
//   loader: GLTFLoader;
//   filePath: string;
//   entities: any[];
//   mixer: THREE.AnimationMixer;
//   actions: any;
//   asteroid: any;

//   _onLoadCallback: (Asteroids) => void;

//   constructor(scene: THREE.Scene, filePath: string) {
//     this.scene = scene;
//     this.loader = new GLTFLoader();
//     this.filePath = filePath;
//     this.entities = [];
//     this.mixer = null;
//   }

//   load() {
//     return new Promise((resolve, reject) => {
//       this.loader.load(
//         this.filePath,
//         this.done.call(this, resolve),
//         this.progress.bind(this),
//         reject
//       );
//     });
//   }

//   done(resolve) {
//     return (gltf) => {
//       // const object = ;
//       this.asteroid = new Asteroid(this.scene, gltf);
//       // let groups = Array(8)
//       //   .fill(null)
//       //   .map(() => []);

//       // let animations = Array(8)
//       //   .fill(null)
//       //   .map(() => []);

//       // gltf.scene.traverse(function (child: THREE.Mesh) {
//       //   if (child.name.includes("Asteroid_")) {
//       //     const index =
//       //       parseInt(child.name.replace("Asteroid_", "").split("_")[0], 10) - 1;

//       //     groups[index].push(child);
//       //   }
//       // });

//       // groups = groups.map((objectsArray, index) => {
//       //   const group = new THREE.Group();
//       //   group.name = `Asteroid : ${index}`;

//       //   objectsArray.forEach((obj) => {
//       //     group.add(obj);
//       //   });

//       //   group.position.z = -1;
//       //   return group;
//       // });

//       // gltf.animations.forEach((animation) => {
//       //   if (animation.name.includes("Asteroid ")) {
//       //     const index =
//       //       parseInt(
//       //         animation.name.replace("Asteroid ", "").split("_")[0],
//       //         10
//       //       ) - 1;

//       //     animations[index].push(animation);
//       //   }
//       // });

//       // animations.forEach((keyframes, index) => {
//       //   groups[index].animations = keyframes;
//       // });

//       // this.asteroids = groups.map((group) => new Asteroid(this.scene, group));

//       // this.scene.add(gltf.scene);

//       document.addEventListener("explode", () => {
//         this.asteroid.explode();
//         // this.asteroids.forEach((asteroid) => {
//         //   asteroid.explode();
//         // });
//         // console.log(this.asteroids[0]);
//         // this.asteroids[0].explode();
//       });

//       resolve();
//     };
//   }

//   update(deltaT) {
//     this.asteroid.update(deltaT);
//     // this.asteroids.forEach((asteroid) => {
//     //   asteroid.update(deltaT);
//     // });
//   }

//   // explode() {
//   //   // this.asteroid.visible = false;
//   //   // this.actions.forEach((action) => action.play());
//   // }

//   getClickableAsteroids() {
//     return this.entities;
//   }

//   progress(xhr) {}

//   onLoad(callback) {
//     this._onLoadCallback = callback;
//   }
// }

export default Asteroids;
