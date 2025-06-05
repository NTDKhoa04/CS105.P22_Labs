import * as THREE from "three";
import { GUI } from "dat.gui";
import { OrbitControls } from "three/examples/jsm/Addons.js";

function update(scene, camera, renderer, controls, gui) {
  renderer.render(scene, camera);
  requestAnimationFrame(() => update(scene, camera, renderer, controls, gui));
  gui.updateDisplay();
}

function updateLookAt(camera, lookAt) {
  camera.lookAt(new THREE.Vector3(lookAt.x, lookAt.y, lookAt.z));
}

function run() {
  // Scene
  const scene = new THREE.Scene();

  // Cam
  let camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
  );
  camera.position.z = 6;

  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor({ color: "rgb(120, 120, 120)" });
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);

  // Loader
  const woodTexture = new THREE.TextureLoader().load("assets/woodtexture.png");
  const concreteTexture = new THREE.TextureLoader().load("assets/concrete.png");
  const galaxyTexture = new THREE.TextureLoader().load("assets/galaxy.png");
  scene.background = galaxyTexture;

  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial({ map: woodTexture });
  const cube = new THREE.Mesh(geometry, material);
  cube.castShadow = true;
  scene.add(cube);

  const planeGeometry = new THREE.PlaneGeometry(10, 10);
  const planeMaterial = new THREE.MeshStandardMaterial({
    map: concreteTexture,
    side: THREE.DoubleSide,
  });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = -1;
  plane.receiveShadow = true;
  scene.add(plane);

  // OrbitControls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.addEventListener("change", () => controls.update());

  // Light
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(2, 2, 2);
  light.castShadow = true;
  scene.add(light);

  // GUI
  const gui = new GUI();

  //Translation folder
  const translationFolder = gui.addFolder("Translation");
  translationFolder.add(cube.position, "x", -10, 10).name("Translate X Axis");
  translationFolder.add(cube.position, "y", -10, 10).name("Translate Y Axis");
  translationFolder.add(cube.position, "z", -10, 10).name("Translate Z Axis");
  translationFolder.open();

  // Rotation folder
  const rotationFolder = gui.addFolder("Rotation");
  rotationFolder
    .add(cube.rotation, "x", -Math.PI, Math.PI)
    .name("Rotate X Axis");
  rotationFolder
    .add(cube.rotation, "y", -Math.PI, Math.PI)
    .name("Rotate Y Axis");
  rotationFolder
    .add(cube.rotation, "z", -Math.PI, Math.PI)
    .name("Rotate Z Axis");
  rotationFolder.open();

  // Scale folder
  const scaleFolder = gui.addFolder("Scale");
  scaleFolder.add(cube.scale, "x", 0, 3).name("Scale X Axis");
  scaleFolder.add(cube.scale, "y", 0, 3).name("Scale Y Axis");
  scaleFolder.add(cube.scale, "z", 0, 3).name("Scale Z Axis");
  scaleFolder.open();

  // Camera folder
  const cameraFolder = gui.addFolder("Camera");
  cameraFolder.add(camera.position, "x", -10, 10).name("Position X");
  cameraFolder.add(camera.position, "y", -10, 10).name("Position Y");
  cameraFolder.add(camera.position, "z", 0, 10).name("Position Z");
  cameraFolder
    .add(camera, "fov", 1, 180)
    .name("Field of View")
    .onChange(() => {
      camera.updateProjectionMatrix();
    });
  cameraFolder.open();

  // LookAt folder
  const lookAtFolder = gui.addFolder("LookAt");
  let lookAt = { x: 0, y: 0, z: 0 }; // Initial lookAt position
  lookAtFolder
    .add(lookAt, "x", -10, 10)
    .name("LookAt X")
    .onChange(() => updateLookAt(camera, lookAt));
  lookAtFolder
    .add(lookAt, "y", -10, 10)
    .name("LookAt Y")
    .onChange(() => updateLookAt(camera, lookAt));
  lookAtFolder
    .add(lookAt, "z", -10, 10)
    .name("LookAt Z")
    .onChange(() => updateLookAt(camera, lookAt));
  lookAtFolder.open();

  // Light folder
  const lightFolder = gui.addFolder("Light");
  lightFolder.add(light.position, "x", -10, 10).name("Position X");
  lightFolder.add(light.position, "y", -10, 10).name("Position Y");
  lightFolder.add(light.position, "z", -10, 10).name("Position Z");
  lightFolder.open();

  update(scene, camera, renderer, controls, gui);
}
run();
