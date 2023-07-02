// @ts-nocheck

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

class Navigator {
  constructor(scene, camera, spaceship, state) {
    this.scene = scene;
    this.camera = camera;
    this.spaceship = spaceship;
    this.state = state;

    this.arrow = null;
    this.shipCrosshair = null;
    this.cameraCrosshair = null;

    this.crossHairLerpNumber = 0;

    this.loader = new GLTFLoader();
    this.filePath = "assets/arrow.glb";
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
      this.arrow = gltf.scene.children[0];

      resolve();
    };
  }

  render() {
    this.renderCrosshair();
  }

  renderCrosshair() {
    this.shipCrosshair = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load("assets/crosshair_circles.png"),
        transparent: true,
      })
    );

    this.cameraCrosshair = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load("assets/crosshair_lines.png"),
        transparent: true,
      })
    );

    this.shipCrosshair.renderOrder = 100;
    this.shipCrosshair.material.depthTest = false;
    // this.shipCrosshair.material.depthWrite = false;
    // this.cameraCrosshair = new THREE.Mesh(
    //   new THREE.PlaneGeometry(0.5, 0.5),
    //   new THREE.MeshBasicMaterial({ color: 0x0000ff })
    // );

    this.scene.add(this.shipCrosshair, this.cameraCrosshair);
  }

  renderArrow() {
    this.arrow.material = new THREE.MeshBasicMaterial({ color: 0xff0000 });

    this.arrow.position.z = -10;
    this.arrow.position.y = -6;

    this.camera.add(this.arrow);
  }

  update(deltaT) {
    const currentInputState = this.state.getState();

    const shipCrosshairPosition = new THREE.Vector3(0, 0, -30);
    const cameraCrosshairPosition = new THREE.Vector3(0, 0, -30);

    if (currentInputState.tiltUp || currentInputState.tiltDown) {
      this.crossHairLerpNumber += deltaT;
      if (this.crossHairLerpNumber >= 1) {
        this.crossHairLerpNumber = 1;
      }
    } else {
      this.crossHairLerpNumber -= deltaT;

      if (this.crossHairLerpNumber <= 0) {
        this.crossHairLerpNumber = 0;
      }
    }

    cameraCrosshairPosition.lerp(
      new THREE.Vector3(0, 0, -10),
      this.crossHairLerpNumber
    );

    shipCrosshairPosition.applyQuaternion(this.spaceship.entity.quaternion);
    shipCrosshairPosition.add(this.spaceship.entity.position);

    this.shipCrosshair.position.copy(shipCrosshairPosition);
    this.shipCrosshair.quaternion.copy(this.camera.quaternion);

    cameraCrosshairPosition.applyQuaternion(this.spaceship.entity.quaternion);
    cameraCrosshairPosition.add(this.spaceship.entity.position);

    this.cameraCrosshair.position.copy(cameraCrosshairPosition);
    this.cameraCrosshair.quaternion.copy(this.camera.quaternion);
  }

  progress() {}
}

export default Navigator;
