import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

class Asteroids {
  scene: THREE.Scene;
  loader: GLTFLoader;
  filePath: string;
  entities: any[];

  _onLoadCallback: (Asteroids) => void;

  constructor(scene: THREE.Scene, filePath: string) {
    this.scene = scene;
    this.loader = new GLTFLoader();
    this.filePath = filePath;
    this.entities = [];
    this._onLoadCallback = null;

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
    const entities = [];

    gltfScene.scene.traverse(function (child: THREE.Mesh) {
      if ((child as THREE.Mesh).isMesh) {
        child.name = "asteroid";
        entities.push(child);
        // child.userData.rotationV = new THREE.Vector3(
        //   Math.random() * 0.002 - 0.001,
        //   Math.random() * 0.002 - 0.001,
        //   Math.random() * 0.002 - 0.001
        // );
      }
      // asteroids.push(child as THREE.Mesh);
    });
    // console.log(gltfScene);
    // this.scene.add(gltfScene.scene);
    // this.entity = gltfScene.scene.children[0];

    entities.forEach((asteroid) => {
      for (let i = 0; i < 4; i++) {
        const clonedAsteroid = asteroid.clone();
        clonedAsteroid.userData.rotationV = new THREE.Vector3(
          Math.random() * 0.002 - 0.001,
          Math.random() * 0.002 - 0.001,
          Math.random() * 0.002 - 0.001
        );
        clonedAsteroid.position.x = Math.random() * 50 - 25;
        clonedAsteroid.position.y = Math.random() * 50 - 25;
        clonedAsteroid.position.z = Math.random() * 50 - 25;

        this.entities.push(clonedAsteroid);
        this.scene.add(clonedAsteroid);
      }
    });

    this._onLoadCallback(this);
  }

  progress(xhr) {}

  onLoad(callback) {
    this._onLoadCallback = callback;
  }

  update() {
    this.entities.forEach((entity) => {
      entity.rotation.x += entity.userData.rotationV.x;
      entity.rotation.y += entity.userData.rotationV.y;
      entity.rotation.z += entity.userData.rotationV.z;
    });
  }

  error(error) {}

  public get(): THREE.Mesh {
    return;
  }
}

export default Asteroids;
