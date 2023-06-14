// @ts-nocheck

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

class Asteroid {
  constructor(scene, gltf) {
    this.scene = scene;
    this.container = gltf.scene.getObjectByName("Empty");
    this.body = gltf.scene.getObjectByName("Asteroid");
    this.clips = gltf.animations;
    this.animations = [];
    this.mixer = new THREE.AnimationMixer(this.container);
    // this.mixer = new THREE.AnimationMixer(object);

    this.init();
  }

  init() {
    this.animations = this.clips.map((clip) => {
      const animation = this.mixer.clipAction(clip);
      animation.setLoop(THREE.LoopOnce, 1);
      animation.clampWhenFinished = true;

      return animation;
    });

    this.scene.add(this.container);
    //   const animation = this.mixer.clipAction(clip);
    //   animation.setLoop(THREE.LoopOnce, 1);

    //   animation.clampWhenFinished = true;
  }

  update(deltaT) {
    this.mixer.update(deltaT);
  }

  explode() {
    this.body.visible = false;
    this.animations.forEach((animation) => {
      animation.play();
    });
  }
}

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

class Asteroids {
  scene: THREE.Scene;
  loader: GLTFLoader;
  filePath: string;
  entities: any[];
  mixer: THREE.AnimationMixer;
  actions: any;
  asteroid: any;

  _onLoadCallback: (Asteroids) => void;

  constructor(scene: THREE.Scene, filePath: string) {
    this.scene = scene;
    this.loader = new GLTFLoader();
    this.filePath = filePath;
    this.entities = [];
    this.mixer = null;
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
      // const object = ;
      this.asteroid = new Asteroid(this.scene, gltf);
      // let groups = Array(8)
      //   .fill(null)
      //   .map(() => []);

      // let animations = Array(8)
      //   .fill(null)
      //   .map(() => []);

      // gltf.scene.traverse(function (child: THREE.Mesh) {
      //   if (child.name.includes("Asteroid_")) {
      //     const index =
      //       parseInt(child.name.replace("Asteroid_", "").split("_")[0], 10) - 1;

      //     groups[index].push(child);
      //   }
      // });

      // groups = groups.map((objectsArray, index) => {
      //   const group = new THREE.Group();
      //   group.name = `Asteroid : ${index}`;

      //   objectsArray.forEach((obj) => {
      //     group.add(obj);
      //   });

      //   group.position.z = -1;
      //   return group;
      // });

      // gltf.animations.forEach((animation) => {
      //   if (animation.name.includes("Asteroid ")) {
      //     const index =
      //       parseInt(
      //         animation.name.replace("Asteroid ", "").split("_")[0],
      //         10
      //       ) - 1;

      //     animations[index].push(animation);
      //   }
      // });

      // animations.forEach((keyframes, index) => {
      //   groups[index].animations = keyframes;
      // });

      // this.asteroids = groups.map((group) => new Asteroid(this.scene, group));

      // this.scene.add(gltf.scene);

      document.addEventListener("explode", () => {
        this.asteroid.explode();
        // this.asteroids.forEach((asteroid) => {
        //   asteroid.explode();
        // });
        // console.log(this.asteroids[0]);
        // this.asteroids[0].explode();
      });

      resolve();
    };
  }

  update(deltaT) {
    this.asteroid.update(deltaT);
    // this.asteroids.forEach((asteroid) => {
    //   asteroid.update(deltaT);
    // });
  }

  // explode() {
  //   // this.asteroid.visible = false;
  //   // this.actions.forEach((action) => action.play());
  // }

  getClickableAsteroids() {
    return this.entities;
  }

  progress(xhr) {}

  onLoad(callback) {
    this._onLoadCallback = callback;
  }
}

export default Asteroids;
