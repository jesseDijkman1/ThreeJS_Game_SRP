import * as THREE from "three";

class WorldBox {
  scene: THREE.Scene;
  assets: string[];
  loader: THREE.CubeTextureLoader;
  hdr: THREE.CubeTexture;

  constructor(scene: THREE.Scene, assets: string[]) {
    this.scene = scene;
    this.assets = assets;
    this.loader = new THREE.CubeTextureLoader();
    this.hdr = this.loader.load(this.assets);

    this.scene.background = this.hdr;
  }
}

export default WorldBox;
