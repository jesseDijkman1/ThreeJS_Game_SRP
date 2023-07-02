import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import Particles from "../../utils/Particles";
import WorldBox from "../../utils/WorldBox";
import Asteroids from "../../utils/Asteroids";
import SpaceShip from "../../utils/SpaceShip";
import ThirdPersonCamera from "../../utils/ThirdPersonCamera";
import { InputController, InputState } from "../../utils/InputController";
import Navigator from "../../utils/Navigator";
import UI from "../../utils/UI";

export default function () {
  const windowProps = {
    width: window.innerWidth,
    height: window.innerHeight,
    pointer: new THREE.Vector2(),
  };

  const clock = new THREE.Clock();

  // DOM
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  const uiContainer = document.getElementById("ui") as HTMLDivElement;

  // Renderer
  const renderer = new THREE.WebGLRenderer({
    canvas,
  });

  renderer.setSize(windowProps.width, windowProps.height);

  // Scene
  const scene = new THREE.Scene();

  const light = new THREE.PointLight(0xffffff, 12, 100);
  const light2 = new THREE.PointLight(0xffffff, 12, 100);
  const light3 = new THREE.PointLight(0xffffff, 12, 200);
  const light4 = new THREE.PointLight(0xffffff, 12, 200);
  const light5 = new THREE.PointLight(0xffffff, 12, 200);
  const light6 = new THREE.PointLight(0xffffff, 12, 200);
  const light7 = new THREE.PointLight(0xffffff, 12, 200);
  light.position.set(0, 2, -15);
  light2.position.set(0, -20, 5);
  light3.position.set(50, 50, 50);
  light4.position.set(-50, -50, -50);
  light5.position.set(-50, 50, 50);
  light6.position.set(50, -50, 50);
  light7.position.set(50, 50, -50);
  // light6.position.set(50, -50, 50);
  scene.add(light, light2, light3, light4, light5, light6, light7);

  const inputState = new InputState();
  const controller = new InputController(inputState);

  const particles = new Particles(scene);

  const worldbox = new WorldBox(scene);

  const spaceship = new SpaceShip(scene, inputState);
  const asteroids = new Asteroids(scene, inputState);

  const raycaster = new THREE.Raycaster();

  // Camera
  const camera = new THREE.PerspectiveCamera(
    75,
    windowProps.width / windowProps.height,
    0.1,
    1000
  );
  const thirdPersonCamera = new ThirdPersonCamera(scene, camera);
  const navigator = new Navigator(scene, camera, spaceship, inputState);

  const render = () => {
    renderer.render(scene, camera);
  };

  const resize = () => {
    windowProps.width = window.innerWidth;
    windowProps.height = window.innerHeight;

    camera.aspect = windowProps.width / windowProps.height;
    camera.updateProjectionMatrix();

    renderer.setSize(windowProps.width, windowProps.height);

    render();
  };

  let blasterTime = 0;
  const update = () => {
    const deltaTime = clock.getDelta();

    const currentInputState = inputState.getState();

    if (currentInputState.shooting) {
      console.log(blasterTime);
      if (blasterTime === 0) {
        // this.fire();
        const position = spaceship.getBlasterPosition();
        // position.applyQuaternion(spaceship.entity.quaternion);

        const velocity = new THREE.Vector3(0, 0, -1);
        velocity.applyQuaternion(spaceship.entity.quaternion);

        const particle = particles.create(position, velocity);

        raycaster.set(position, velocity.normalize());
        // console.log(asteroids.asteroidInstances);

        asteroids.asteroidInstances.forEach((instance) => {
          const intersects = raycaster.intersectObject(instance.body);

          if (intersects.length) {
            instance.expectBulletHit(particle);
          }
        });
      }

      blasterTime += deltaTime;

      if (blasterTime >= 0.1) {
        blasterTime = 0;
      }
    } else {
      blasterTime = 0;
    }

    particles.update(deltaTime);
    spaceship.update(deltaTime);
    asteroids.update(deltaTime);
    thirdPersonCamera.update(deltaTime);
    navigator.update(deltaTime);

    asteroids.asteroidInstances.forEach((instance) => {
      if (
        spaceship.entity.userData.box.intersectsSphere(
          instance.container.userData.sphere
        ) &&
        instance.exploded === false
      ) {
        instance.explode();
        spaceship.applyDamage();
      }
    });

    render();
  };

  const animate = () => {
    window.requestAnimationFrame(animate);

    update();
  };

  const init = async () => {
    const ui = new UI(uiContainer, inputState, false);

    try {
      await Promise.all([
        worldbox.load(),
        spaceship.load(),
        asteroids.load(),
        navigator.load(),
      ]);
    } catch (err) {
      console.error(err);
    }

    particles.setParent(spaceship.entity);
    spaceship.render();
    asteroids.render(40, 100);
    navigator.render();

    scene.add(camera);

    thirdPersonCamera.setTarget(spaceship.entity);

    window.requestAnimationFrame(animate);

    window.addEventListener("resize", resize);

    window.addEventListener("click", (e) => {
      // const [intersects,] = raycaster.intersectObjects(
      //   asteroids.asteroidInstances.map((instance) => instance.body)
      // );
    });
  };

  init();

  window.THREE = THREE;

  // const controls = new OrbitControls(camera, renderer.domElement);

  // const light = new THREE.PointLight(0xffffff, 12, 100);
  // light.position.set(0, 2, -5);

  // scene.add(light);

  // function resize() {
  //   windowProps.width = window.innerWidth;
  //   windowProps.height = window.innerHeight;

  //   camera.aspect = windowProps.width / windowProps.height;
  //   camera.updateProjectionMatrix();

  //   renderer.setSize(windowProps.width, windowProps.height);

  //   render();
  //   -1;
  // }

  // let asteroids;
  // const mixers = [];
  // const clock = new THREE.Clock();

  // function animate() {
  //   requestAnimationFrame(animate);

  //   // console.log(intersects);
  //   const deltaTime = clock.getDelta();

  //   controls.update();
  //   asteroids.update(deltaTime);
  //   // mixers.forEach((mixer) => mixer.update(deltaTime));

  //   render();
  // }

  // function render() {
  //   renderer.render(scene, camera);
  // }

  // async function init() {
  //   // asteroids = new Asteroids(scene, "assets/asteroid-1.glb");
  //   asteroids = new Asteroids(scene, [
  //     "assets/asteroid-1.glb",
  //     "assets/asteroid-2.glb",
  //     "assets/asteroid-3.glb",
  //     "assets/asteroid-4.glb",
  //     "assets/asteroid-5.glb",
  //     "assets/asteroid-6.glb",
  //     "assets/asteroid-7.glb",
  //     "assets/asteroid-8.glb",
  //   ]);

  //   // scene.add(boxMesh);
  //   render();
  //   // console.log(1);

  //   try {
  //     await asteroids.load();
  //     asteroids.render();
  //     // mixers.push(asteroids.mixer);
  //     // console.log(asteroids);
  //   } catch (err) {
  //     console.error(err);
  //   }

  //   window.addEventListener("click", (e) => {
  //     windowProps.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  //     windowProps.pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;

  //     raycaster.setFromCamera(windowProps.pointer, camera);

  //     const clickedAsteroid = asteroids.getClickedAsteroid(raycaster);

  //     if (clickedAsteroid) {
  //       clickedAsteroid.explode();
  //     }
  //     console.log(clickedAsteroid);
  //   });
  //   window.addEventListener("resize", resize);
  //   window.requestAnimationFrame(animate);
  // }

  // init();
}
