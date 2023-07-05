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
    this.arrowOpacity = 0;

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
    this.renderArrow();
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

    this.cameraCrosshair.renderOrder = 99;
    this.cameraCrosshair.material.depthTest = false;

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
    this.arrow.material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
    });

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

    const cameraShipAngleZ = Math.atan2(
      this.spaceship.entity.position.x - this.camera.position.x,
      this.spaceship.entity.position.z - this.camera.position.z
    );

    const angleWorldOriginZ = Math.atan2(
      this.spaceship.entity.position.x,
      this.spaceship.entity.position.z
    );

    const yAngle = angleWorldOriginZ - cameraShipAngleZ + Math.PI / 2;

    if (
      this.spaceship.entity.position.distanceTo(new THREE.Vector3(0, 0, 0)) >
      100
    ) {
      if (this.arrowOpacity < 1) this.arrowOpacity += deltaT;
      if (this.arrowOpacity > 1) this.arrowOpacity = 1;
    } else {
      if (this.arrowOpacity > 0) this.arrowOpacity -= deltaT;
      if (this.arrowOpacity < 0) this.arrowOpacity = 0;
    }

    if (this.arrow.material.opacity != this.arrowOpacity) {
      this.arrow.material.opacity = this.arrowOpacity;
    }

    this.arrow.rotation.y = yAngle;
  }

  progress() {}
}

export default Navigator;
