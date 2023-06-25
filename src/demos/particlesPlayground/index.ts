import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Particles from "./Particles";
import WorldBox from "../../utils/WorldBox";

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

  const worldbox = new WorldBox(scene);

  // Camera
  const camera = new THREE.PerspectiveCamera(
    75,
    windowProps.width / windowProps.height,
    0.1,
    1000
  );
  camera.position.z = 1;

  const controls = new OrbitControls(camera, renderer.domElement);
  const particles = new Particles(scene);

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
  }

  const clock = new THREE.Clock();

  function animate() {
    const deltaTime = clock.getDelta();

    requestAnimationFrame(animate);

    controls.update();
    particles.update(deltaTime);

    render();
  }

  function render() {
    renderer.render(scene, camera);
  }

  // function clickHandler(clickableObjects) {
  //   return function (e) {
  //     windowProps.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  //     windowProps.pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
  //   };
  // }

  async function init() {
    // window.addEventListener("click", (e) => {
    //   windowProps.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    //   windowProps.pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    // });
    try {
      await worldbox.load();
    } catch (err) {}

    // particles.generate(1000);
    // particles.render();

    window.addEventListener("resize", resize);
    window.requestAnimationFrame(animate);

    window.addEventListener("click", (e) => {
      particles.generate(1);
    });
  }

  init();
}
