import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

type LoaderTypes = GLTFLoader | THREE.CubeTextureLoader;

type LoaderResourceType = string[] | string;

export default class BatchLoader {
  private loaders: Array<any>;
  private storage: Record<string, any>;

  constructor() {
    this.loaders = [];
    this.storage = {};
  }

  addLoader(
    resultStorageKey: string,
    loaderClass: any,
    resources: LoaderResourceType
  ) {
    this.loaders.push([resultStorageKey, loaderClass, resources]);
  }

  load() {
    this.loaders.forEach(([key, loader, resources]) => {});
  }

  progress() {}

  error() {}
}

const batch = new BatchLoader();

batch.addLoader("test", GLTFLoader, "as");
