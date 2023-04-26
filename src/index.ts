import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import WorldBox from "./utils/WorldBox";
import SpaceShip from "./utils/SpaceShip";
import Asteroids from "./utils/Asteroids";
import ThirdPersonCamera from "./utils/ThirdPersonCamera";
import { InputController, InputState } from "./utils/InputController";

const windowProps = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// DOM
const canvas = document.getElementById("canvas") as HTMLCanvasElement;

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas,
});
renderer.setSize(windowProps.width, windowProps.height);

// Scene
const scene = new THREE.Scene();
new WorldBox(scene, [
  "assets/px_eso0932a.jpg",
  "assets/nx_eso0932a.jpg",
  "assets/py_eso0932a.jpg",
  "assets/ny_eso0932a.jpg",
  "assets/pz_eso0932a.jpg",
  "assets/nz_eso0932a.jpg",
]);

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  windowProps.width / windowProps.height,
  0.1,
  1000
);

const thirdPersonCamera = new ThirdPersonCamera(scene, camera);

const light = new THREE.PointLight(0xffffff, 12, 100);
const light2 = new THREE.PointLight(0xffffff, 12, 100);
light.position.set(0, 2, -5);
light2.position.set(0, -2, 5);
scene.add(light, light2);

// const controls = new OrbitControls(camera, renderer.domElement);

const inputState = new InputState();
const inputController = new InputController(renderer, inputState);

// Models

const spaceShip = new SpaceShip(scene, "assets/spaceship.glb", inputState);

spaceShip.onLoad(({ entity }) => {
  // entity.position.z = -1;
  // entity.position.y = -0.25;

  thirdPersonCamera.setTarget(entity);
});

const asteroids = new Asteroids(scene, "assets/asteroids.glb");

asteroids.onLoad(({ entities }) => {});

// console.log(scene);

function resize() {
  windowProps.width = window.innerWidth;
  windowProps.height = window.innerHeight;

  camera.aspect = windowProps.width / windowProps.height;
  camera.updateProjectionMatrix();

  renderer.setSize(windowProps.width, windowProps.height);

  render();
}

let previousTimeStamp = null;

function animate(timestamp) {
  if (previousTimeStamp === null) {
    previousTimeStamp = timestamp;
  }

  const timeElapsed = (timestamp - previousTimeStamp) * 0.001;
  // const currentInputState = inputState.getState();

  // console.log(currentInputState);

  spaceShip.update(timeElapsed);
  asteroids.update();
  thirdPersonCamera.update(timeElapsed);
  // controls.update();
  // thirdPersonCamera.update();
  previousTimeStamp = timestamp;
  render();
  requestAnimationFrame(animate);
}

function render() {
  renderer.render(scene, camera);
}

window.addEventListener("resize", resize);
window.requestAnimationFrame(animate);

// import { FlyControls } from "three/examples/jsm/controls/FlyControls.js";

// import colorRange from "./utils/colorRange";
// import { MeshStandardMaterial, Vector2 } from "three";

// // DOM Content
// const canvas = document.getElementById("canvas") as HTMLCanvasElement;

// // Renderer
// const renderer = new THREE.WebGLRenderer({ canvas });
// renderer.setSize(window.innerWidth, window.innerHeight);

// // Scene
// const scene = new THREE.Scene();

// // console.log(colors, new THREE.Color("#FF0000"));

// // const ambientLight = new THREE.AmbientLight(0xffffff);

// const light = new THREE.PointLight(0xffffff, 12, 100);
// light.position.set(0, 2, 5);

// const sphereSize = 1;
// const pointLightHelper = new THREE.PointLightHelper(light, sphereSize);
// scene.add(pointLightHelper);

// const hdr = new THREE.CubeTextureLoader().load([
//   "assets/px_eso0932a.jpg",
//   "assets/nx_eso0932a.jpg",
//   "assets/py_eso0932a.jpg",
//   "assets/ny_eso0932a.jpg",
//   "assets/pz_eso0932a.jpg",
//   "assets/nz_eso0932a.jpg",
// ]);

// scene.background = hdr;

// // Camera
// const camera = new THREE.PerspectiveCamera(
//   75,
//   window.innerWidth / window.innerHeight,
//   0.1,
//   1000
// );
// camera.position.z = 3;

// const maxRollSpeed = Math.PI / 7;
// const minRollSpeed = Math.PI / 15;

// const flyControls = new FlyControls(camera, renderer.domElement);
// flyControls.dragToLook = false;
// flyControls.movementSpeed = 1;
// flyControls.rollSpeed = maxRollSpeed;
// flyControls.autoForward = true;

// scene.add(camera, light);

// // const explosionColors = colorRange([
// //   new THREE.Color("#b59651"),
// //   new THREE.Color("#b5562d"),
// //   new THREE.Color("#a83a32"),
// // ]);

// const asteroids: THREE.Mesh[] = [];
// const loader = new GLTFLoader();
// loader.load(
//   "assets/asteroids.glb",
//   function (gltf) {
//     gltf.scene.traverse(function (child: THREE.Mesh) {
//       if ((child as THREE.Mesh).isMesh) {
//         child.name = "asteroid";
//         child.userData.rotationV = new THREE.Vector3(
//           Math.random() * 0.002 - 0.001,
//           Math.random() * 0.002 - 0.001,
//           Math.random() * 0.002 - 0.001
//         );

//         asteroids.push(child as THREE.Mesh);
//       }
//     });

//     asteroids.forEach((asteroid) => {
//       for (let i = 0; i < 4; i++) {
//         const clonedAsteroid = asteroid.clone();
//         clonedAsteroid.userData.rotationV = new THREE.Vector3(
//           Math.random() * 0.002 - 0.001,
//           Math.random() * 0.002 - 0.001,
//           Math.random() * 0.002 - 0.001
//         );
//         clonedAsteroid.position.x = Math.random() * 50 - 25;
//         clonedAsteroid.position.y = Math.random() * 50 - 25;
//         clonedAsteroid.position.z = Math.random() * 50 - 25;

//         scene.add(clonedAsteroid);
//       }
//     });
//   },
//   (xhr) => {
//     console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
//   },
//   (error) => {
//     console.log(error);
//   }
// );

// let spaceShip: THREE.Mesh;
// let boost: THREE.Mesh;
// let boostOriginalZ;
// let spaceShipOriginAngleX;
// let spaceShipMaxAngleX = 0.2;
// let spaceShipMinAngleX = 0.2;
// let spaceShipOriginAngleZ;
// let spaceShipMaxAngleZ = 0.2;
// let spaceShipMinAngleZ = 0.2;

// loader.load(
//   "assets/spaceship.glb",
//   function (gltf) {
//     console.log(gltf);
//     // scene.add(gltf.scene);
//     gltf.scene.traverse(function (child: THREE.Mesh) {
//       if (child.name == "ship") {
//         spaceShip = child;
//         // child.name = "asteroid";
//         // child.userData.rotationV = new THREE.Vector3(
//         //   Math.random() * 0.002 - 0.001,
//         //   Math.random() * 0.002 - 0.001,
//         //   Math.random() * 0.002 - 0.001
//         // );
//         child.rotateY(Math.PI);
//         child.translateZ(2.5);
//         child.translateY(-0.75);
//         spaceShipOriginAngleX = spaceShip.rotation.x + 0.1;
//         spaceShipMaxAngleX = spaceShipOriginAngleX + 0.2;
//         spaceShipMinAngleX = spaceShipOriginAngleX - 0.2;

//         spaceShipOriginAngleZ = spaceShip.rotation.y;
//         spaceShipMaxAngleZ = spaceShipOriginAngleZ + 0.2;
//         spaceShipMinAngleZ = spaceShipOriginAngleZ - 0.2;

//         console.log(child);
//         // camera.lookAt(child.position);
//         camera.add(child);

//         var dotGeometry = new THREE.BufferGeometry();
//         dotGeometry.setAttribute(
//           "position",
//           new THREE.Float32BufferAttribute([0, 0, 0], 3)
//         );
//         var dotMaterial = new THREE.PointsMaterial({
//           size: 0.05,
//           color: 0x00ff00,
//         });
//         var dot = new THREE.Points(dotGeometry, dotMaterial);
//         dot.position.z = 3;

//         spaceShip.add(dot);
//         // asteroids.push(child as THREE.Mesh);
//       }

//       if (child.name === "Boost") {
//         // boost = child;
//         // boostOriginalZ = child.position.z;
//         // child.position.z = boostOriginalZ + 0.3;
//         // child.scale.y = 0.2;
//         child.material = new MeshStandardMaterial({
//           emissive: new THREE.Color("#ffbb00"),
//           emissiveIntensity: 2,
//           opacity: 0,
//           transparent: true,
//           color: new THREE.Color("#ffbb00"),
//         });

//         boost = child;
//       }
//     });

//     // asteroids.forEach((asteroid) => {
//     //   for (let i = 0; i < 4; i++) {
//     //     const clonedAsteroid = asteroid.clone();
//     //     clonedAsteroid.userData.rotationV = new THREE.Vector3(
//     //       Math.random() * 0.002 - 0.001,
//     //       Math.random() * 0.002 - 0.001,
//     //       Math.random() * 0.002 - 0.001
//     //     );
//     //     clonedAsteroid.position.x = Math.random() * 50 - 25;
//     //     clonedAsteroid.position.y = Math.random() * 50 - 25;
//     //     clonedAsteroid.position.z = Math.random() * 50 - 25;

//     //     scene.add(clonedAsteroid);
//     //   }
//     // });
//   },
//   (xhr) => {
//     console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
//   },
//   (error) => {
//     console.log(error);
//   }
// );

// function resize() {}

// function animate() {}

// function render() {}

// // Resize
// window.addEventListener(
//   "resize",
//   () => {
//     camera.aspect = window.innerWidth / window.innerHeight;
//     camera.updateProjectionMatrix();

//     renderer.setSize(window.innerWidth, window.innerHeight);
//     render();
//   },
//   false
// );

// // Animation loop

// const pressedKeys = {};

// const clock = new THREE.Clock();
// let delta;

// const direction = new THREE.Vector3();

// let s = -0.01;

// const maxSpeed = 10;
// const minSpeed = 0.4;

// const maxAngleX = Math.PI / 30;
// let spaceShipXR = 0;

// function animate() {
//   requestAnimationFrame(animate);

//   delta = Math.min(clock.getDelta(), 0.1);
//   // console.log(pressedKeys);
//   if (pressedKeys["w"]) {
//     // if (boost) {
//     //   if (boost.position.z > boostOriginalZ) {
//     //     boost.position.z -= 0.003;
//     //   }
//     // }

//     if (flyControls.movementSpeed < maxSpeed) {
//       flyControls.movementSpeed *= 1.01;
//     }
//   } else {
//     // if (boost) {
//     //   if (boost.position.z < boostOriginalZ) {
//     //     boost.position.z += 0.003;
//     //   }
//     // }
//     if (flyControls.movementSpeed > minSpeed) {
//       flyControls.movementSpeed -= 0.1;
//     }
//   }

//   if (boost) {
//     // console.log("oi");
//     if (pressedKeys["w"]) {
//       if ((boost.material as any).opacity < 1) {
//         (boost.material as any).opacity += 0.01;
//       }
//     } else {
//       if ((boost.material as any).opacity > 0) {
//         (boost.material as any).opacity -= 0.01;
//       }
//     }
//   }

//   if (spaceShip) {
//     // spaceShip.rotation.x += spaceShipXR - spaceShip.rotation.x / 50;
//     if (pressedKeys["ArrowUp"] || pressedKeys["ArrowDown"]) {
//       if (pressedKeys["ArrowUp"]) {
//         if (spaceShip.rotation.x < spaceShipMaxAngleX) {
//           spaceShip.rotation.x += 0.003;
//         }
//       }

//       if (pressedKeys["ArrowDown"]) {
//         if (spaceShip.rotation.x > spaceShipMinAngleX) {
//           spaceShip.rotation.x -= 0.003;
//         }
//       }
//     } else {
//       if (spaceShip.rotation.x > spaceShipOriginAngleX) {
//         spaceShip.rotation.x -= 0.003;
//       } else if (spaceShip.rotation.x < spaceShipOriginAngleX) {
//         spaceShip.rotation.x += 0.003;
//       }
//     }

//     if (pressedKeys["ArrowLeft"] || pressedKeys["ArrowRight"]) {
//       if (pressedKeys["ArrowLeft"]) {
//         if (spaceShip.rotation.y > spaceShipMinAngleZ) {
//           spaceShip.rotation.y -= 0.003;
//         }
//       }

//       if (pressedKeys["ArrowRight"]) {
//         if (spaceShip.rotation.y < spaceShipMaxAngleZ) {
//           spaceShip.rotation.y += 0.003;
//         }
//       }
//     } else {
//       if (spaceShip.rotation.y > spaceShipOriginAngleZ) {
//         spaceShip.rotation.y -= 0.003;
//       } else if (spaceShip.rotation.y < spaceShipOriginAngleZ) {
//         spaceShip.rotation.y += 0.003;
//       }
//       // if (flyControls.rollSpeed < maxRollSpeed) {
//       //   flyControls.rollSpeed *= 1 + s;
//       // }
//     }
//   }

//   // flyControls.rollSpeed = Math.max(
//   //   maxRollSpeed - (flyControls.movementSpeed / maxSpeed) * maxRollSpeed,
//   //   minRollSpeed
//   // );

//   if (pressedKeys["ArrowLeft"] || pressedKeys["ArrowRight"]) {
//     // if (pressedKeys["ArrowLeft"]) {
//     //   if (spaceShip.rotation.z < spaceShipMaxAngleZ) {
//     //     spaceShip.rotation.z += 0.003;
//     //   }
//     // }

//     // if (pressedKeys["ArrowDown"]) {
//     //   if (spaceShip.rotation.z > spaceShipMinAngleZ) {
//     //     spaceShip.rotation.z -= 0.003;
//     //   }
//     // }

//     if (
//       flyControls.rollSpeed > minRollSpeed &&
//       flyControls.rollSpeed < maxRollSpeed
//     ) {
//       // console.log(s);
//       flyControls.rollSpeed *= 1 + s;
//     } else {
//       if (flyControls.rollSpeed < minRollSpeed)
//         flyControls.rollSpeed = minRollSpeed;
//       if (flyControls.rollSpeed > maxRollSpeed)
//         flyControls.rollSpeed = maxRollSpeed;
//     }
//   } else {
//     // if (spaceShip.rotation.z > spaceShipOriginAngleZ) {
//     //   spaceShip.rotation.z -= 0.003;
//     // } else if (spaceShip.rotation.z < spaceShipOriginAngleZ) {
//     //   spaceShip.rotation.z += 0.003;
//     // }
//     // if (flyControls.rollSpeed < maxRollSpeed) {
//     //   flyControls.rollSpeed *= 1 + s;
//     // }
//   }

//   // console.log(flyControls.rollSpeed);

//   // if (pressedKeys["a"]) {
//   //   camera.rotation.y += 0.005;
//   //   // camera.rotation.z += 0.005;
//   // }

//   // const t = camera.getWorldDirection(direction).multiplyScalar(0.0005);

//   // camera.position.add(t);
//   // camera.position.z -= 0.01;
//   // direction.z = camera.position.z - 3;
//   flyControls.update(delta);

//   scene.children.forEach((child: THREE.Mesh) => {
//     if (child.name === "asteroid") {
//       if (child.userData.rotationV) {
//         child.rotation.x += child.userData.rotationV.x;
//         child.rotation.y += child.userData.rotationV.y;
//         child.rotation.z += child.userData.rotationV.z;
//       }
//     }
//   });

//   // flyControls.update(d);

//   render();
// }

// animate();

// // Render function
// function render() {
//   renderer.render(scene, camera);
// }
// render();

// document.body.addEventListener("keydown", (e) => {
//   // console.log(camera);
//   if (e.key === "w") {
//     s = -0.01;
//     // flyControls.movementSpeed = 10;
//   }
//   pressedKeys[e.key] = true;
// });

// document.body.addEventListener("keyup", (e) => {
//   pressedKeys[e.key] = false;
//   if (e.key === "w") {
//     s = 0.01;
//     // flyControls.movementSpeed = 1;
//   }

//   // if (e.key == "ArrowUp") {
//   //   spaceShip.rotation.x = spaceShip.rotation.x + 0.2;
//   // }
// });

// // window.addEventListener("click", (e) => {
// //   console.log(scene);
// // });
