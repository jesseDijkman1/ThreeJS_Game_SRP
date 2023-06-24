import * as THREE from "three";

class WorldBox {
  scene: THREE.Scene;
  assets: string[];
  loader: THREE.CubeTextureLoader;
  hdr: THREE.CubeTexture;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.assets = [
      "assets/px_eso0932a.jpg",
      "assets/nx_eso0932a.jpg",
      "assets/py_eso0932a.jpg",
      "assets/ny_eso0932a.jpg",
      "assets/pz_eso0932a.jpg",
      "assets/nz_eso0932a.jpg",
    ];
    this.loader = new THREE.CubeTextureLoader();
    // this.hdr = this.loader.load(this.assets, this.done.call(this));

    // this.scene.background = this.hdr;

    // this.load();
  }

  load() {
    return new Promise((resolve, reject) => {
      this.loader.load(
        this.assets,
        this.done.call(this, resolve),
        this.progress,
        this.error
      );
    });
  }

  done(resolve) {
    return (texture) => {
      this.scene.background = texture;

      resolve();
    };
  }

  progress() {}

  error() {}
}

export default WorldBox;
