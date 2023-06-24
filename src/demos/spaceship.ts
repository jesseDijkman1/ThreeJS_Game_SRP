// import * as THREE from "three";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
// import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
// import WorldBox from "../utils/WorldBox";
// import SpaceShip from "../utils/SpaceShip";
// import Asteroids from "../utils/Asteroids";
// import ThirdPersonCamera from "../utils/ThirdPersonCamera";
// import { InputController, InputState } from "../utils/InputController";
// import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
// import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
// import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";

// export default function () {
//   class Gun {
//     position: THREE.Vector3;
//     quaternion: THREE.Quaternion;
//     entities: THREE.Mesh[];
//     scene: THREE.Scene;
//     blasters: THREE.Mesh[];
//     ship: THREE.Mesh;
//     lifeSpan: number;
//     accumulatedTime: number;
//     state: any;
//     velocity: number;

//     constructor(scene: THREE.Scene, state: any) {
//       this.position = new THREE.Vector3();
//       this.quaternion = new THREE.Quaternion();
//       this.blasters = [];
//       this.ship = null;
//       this.scene = scene;
//       this.lifeSpan = 10;
//       this.state = state;

//       this.velocity = 0.24;

//       this.entities = [];

//       this.accumulatedTime = 0;

//       // this.init();
//     }

//     fire() {
//       // console.log(this.blasters);
//       if (this.blasters.length === 0) return;

//       const blaster = this.blasters.shift();

//       // console.log(blaster);
//       const bullet = this.createBullet();

//       const position = blaster.position.clone();
//       position.applyQuaternion(this.ship.quaternion);
//       position.add(this.ship.position);

//       bullet.quaternion.copy(this.ship.quaternion);
//       bullet.position.copy(position);

//       // bullet.position.multiply(blaster.position);

//       this.entities.push(bullet);

//       this.blasters = [...this.blasters, blaster];

//       this.scene.add(bullet);
//     }

//     update(timeElapsed) {
//       // console.log(timeElapsed);

//       const currentInputState = this.state.getState();

//       if (currentInputState.shooting) {
//         if (this.accumulatedTime === 0) {
//           this.fire();
//         }

//         this.accumulatedTime += timeElapsed;

//         if (this.accumulatedTime >= 100) {
//           this.accumulatedTime = 0;
//         }
//       } else {
//         this.accumulatedTime = 0;
//       }

//       this.entities.forEach((entity) => {
//         const forward = new THREE.Vector3(0, 0, -1);
//         forward.multiplyScalar(this.velocity);
//         forward.applyQuaternion(entity.quaternion);
//         entity.position.add(forward);

//         entity.userData.life = (entity.userData.life ?? 0) + 0.1;

//         if (entity.userData.life >= this.lifeSpan) this.scene.remove(entity);

//         entity.geometry.computeBoundingBox();
//         entity.userData.box.copy(entity.geometry.boundingBox);
//         entity.userData.box.applyMatrix4(entity.matrixWorld);
//       });

//       this.entities = this.entities.filter(
//         (entity) => entity.userData.life < this.lifeSpan
//       );
//     }

//     createBullet() {
//       const size = 0.05;
//       const geometry = new THREE.BoxGeometry(size, size, size);
//       const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
//       const mesh = new THREE.Mesh(geometry, material);

//       mesh.userData.box = new THREE.Box3();

//       return mesh;
//     }

//     setShip(target: THREE.Mesh) {
//       this.ship = target;

//       target.traverse((data) => {
//         if (data.name.includes("Blaster")) {
//           const t = new THREE.Vector3(0, 0, 0);
//           this.blasters.push(data as THREE.Mesh);
//           data.getWorldPosition(t);
//         }
//       });
//     }
//   }

//   const windowProps = {
//     width: window.innerWidth,
//     height: window.innerHeight,
//   };

//   // DOM
//   const canvas = document.getElementById("canvas") as HTMLCanvasElement;

//   // Renderer
//   const renderer = new THREE.WebGLRenderer({
//     canvas,
//   });
//   renderer.setSize(windowProps.width, windowProps.height);

//   // Scene
//   const scene = new THREE.Scene();
//   new WorldBox(scene, [
//     "assets/px_eso0932a.jpg",
//     "assets/nx_eso0932a.jpg",
//     "assets/py_eso0932a.jpg",
//     "assets/ny_eso0932a.jpg",
//     "assets/pz_eso0932a.jpg",
//     "assets/nz_eso0932a.jpg",
//   ]);

//   // Camera
//   const camera = new THREE.PerspectiveCamera(
//     75,
//     windowProps.width / windowProps.height,
//     0.1,
//     1000
//   );

//   const thirdPersonCamera = new ThirdPersonCamera(scene, camera);

//   const light = new THREE.PointLight(0xffffff, 12, 100);
//   const light2 = new THREE.PointLight(0xffffff, 12, 100);
//   light.position.set(0, 2, -5);
//   light2.position.set(0, -2, 5);
//   scene.add(light, light2);

//   // const controls = new OrbitControls(camera, renderer.domElement);

//   const inputState = new InputState();
//   const inputController = new InputController(renderer, inputState);

//   // Models

//   const collisionBox = new THREE.Mesh(
//     new THREE.BoxGeometry(1, 1, 1),
//     new THREE.MeshBasicMaterial({ color: 0xff0000 })
//   );
//   collisionBox.position.z = -10;

//   scene.add(collisionBox);

//   const spaceShip = new SpaceShip(scene, "assets/spaceship.glb", inputState);
//   const gun = new Gun(scene, inputState);

//   let asteroidsLoaded = false;
//   let spaceshipLoaded = false;
//   spaceShip.onLoad(({ entity }) => {
//     thirdPersonCamera.setTarget(entity);
//     gun.setShip(entity);
//     spaceshipLoaded = true;
//   });

//   const asteroids = new Asteroids(scene, "assets/asteroids.glb");

//   asteroids.onLoad(({ entities }) => {
//     asteroidsLoaded = true;
//   });

//   // console.log(scene);

//   function resize() {
//     windowProps.width = window.innerWidth;
//     windowProps.height = window.innerHeight;

//     camera.aspect = windowProps.width / windowProps.height;
//     camera.updateProjectionMatrix();

//     renderer.setSize(windowProps.width, windowProps.height);

//     render();
//   }

//   let previousTimeStamp = null;

//   function animate(timestamp) {
//     if (previousTimeStamp === null) {
//       previousTimeStamp = timestamp;
//     }

//     const roids = asteroids.getEntities();
//     // console.log(roids);

//     if (asteroidsLoaded && spaceshipLoaded) {
//       for (let i = 0; i < roids.length; i++) {
//         if (
//           spaceShip.entity.userData.box.intersectsSphere(
//             roids[i].userData.sphere
//           )
//         ) {
//           // roids[i].userData.hits = (roids[i].userData.hits ?? 0) + 1;
//           spaceShip.explode();
//         }
//       }
//     }

//     for (let i = 0; i < gun.entities.length; i++) {
//       const bullet = gun.entities[i];
//       // let hit = false
//       // bullet.geometry.computeBoundingBox();

//       for (let i = 0; i < roids.length; i++) {
//         if (bullet.userData.box.intersectsSphere(roids[i].userData.sphere)) {
//           roids[i].userData.hits = (roids[i].userData.hits ?? 0) + 1;
//           bullet.userData.life = Infinity;

//           break;
//         }
//       }
//     }

//     const timeElapsed = (timestamp - previousTimeStamp) * 0.001;

//     spaceShip.update(timeElapsed);
//     asteroids.update();
//     thirdPersonCamera.update(timeElapsed);
//     gun.update(timestamp - previousTimeStamp);
//     // controls.update();
//     // thirdPersonCamera.update();
//     previousTimeStamp = timestamp;
//     render();
//     requestAnimationFrame(animate);
//   }

//   function render() {
//     renderer.render(scene, camera);
//   }

//   window.addEventListener("resize", resize);
//   window.requestAnimationFrame(animate);
// }
