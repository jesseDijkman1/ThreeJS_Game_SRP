import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import WorldBox from "../../utils/WorldBox";
import Asteroids from "./asteroids";

export default function () {
  const windowProps = {
    width: window.innerWidth,
    height: window.innerHeight,
    pointer: new THREE.Vector2(),
  };

  const raycaster = new THREE.Raycaster();

  // DOM
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;

  // Renderer
  const renderer = new THREE.WebGLRenderer({
    canvas,
  });
  renderer.setSize(windowProps.width, windowProps.height);

  // Scene
  const scene = new THREE.Scene();
  new WorldBox(scene);

  // Camera
  const camera = new THREE.PerspectiveCamera(
    75,
    windowProps.width / windowProps.height,
    0.1,
    1000
  );
  camera.position.z = -2;

  const controls = new OrbitControls(camera, renderer.domElement);

  const light = new THREE.PointLight(0xffffff, 12, 100);
  light.position.set(0, 2, -5);

  scene.add(light);

  function resize() {
    windowProps.width = window.innerWidth;
    windowProps.height = window.innerHeight;

    camera.aspect = windowProps.width / windowProps.height;
    camera.updateProjectionMatrix();

    renderer.setSize(windowProps.width, windowProps.height);

    render();
    -1;
  }

  let asteroids;
  const mixers = [];
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    // console.log(intersects);
    const deltaTime = clock.getDelta();

    controls.update();
    asteroids.update(deltaTime);
    // mixers.forEach((mixer) => mixer.update(deltaTime));

    render();
  }

  function render() {
    renderer.render(scene, camera);
  }

  function clickHandler(clickableObjects) {
    return function (e) {
      windowProps.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      windowProps.pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(windowProps.pointer, camera);
      const intersects = raycaster.intersectObjects(clickableObjects);

      // if (intersects.length > 0) {
      //   asteroids.explode();
      // }

      console.log(intersects);
    };
  }

  async function init() {
    // asteroids = new Asteroids(scene, "assets/asteroid-1.glb");
    asteroids = new Asteroids(scene, [
      "assets/asteroid-1.glb",
      "assets/asteroid-2.glb",
      "assets/asteroid-3.glb",
      "assets/asteroid-4.glb",
      "assets/asteroid-5.glb",
      "assets/asteroid-6.glb",
      "assets/asteroid-7.glb",
      "assets/asteroid-8.glb",
    ]);

    // scene.add(boxMesh);
    render();
    // console.log(1);

    try {
      await asteroids.load();
      asteroids.render();
      // mixers.push(asteroids.mixer);
      // console.log(asteroids);
    } catch (err) {
      console.error(err);
    }

    window.addEventListener("click", (e) => {
      windowProps.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      windowProps.pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(windowProps.pointer, camera);

      const clickedAsteroid = asteroids.getClickedAsteroid(raycaster);

      if (clickedAsteroid) {
        clickedAsteroid.explode();
      }
      console.log(clickedAsteroid);
    });
    window.addEventListener("resize", resize);
    window.requestAnimationFrame(animate);
  }

  init();
}
