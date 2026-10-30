import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

let scene, renderer;
let camera;
let info;
let grid;
let estrella,
  Planetas = [],
  Lunas = [];
let skelet;
let keysPressed = {};

let accglobal = 0.001;
let timestamp = 0;

let previousTime = 0;
let paused = false;

init();
previousTime = performance.now();
animationLoop();

function init() {
  info = document.createElement("div");
  info.style.position = "absolute";
  info.style.top = "30px";
  info.style.width = "100%";
  info.style.textAlign = "center";
  info.style.color = "#fff";
  info.style.fontWeight = "bold";
  info.style.backgroundColor = "transparent";
  info.style.zIndex = "1";
  info.style.fontFamily = "Impact";
  info.innerHTML = "Esqueleto por el Sistema solar";
  document.body.appendChild(info);

  //Defino cámara
  scene = new THREE.Scene();
  const spaeshtxt = new THREE.TextureLoader().load("/src/spashe.jpg");
  scene.background = spaeshtxt;
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 10, 50);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  //let camcontrols = new OrbitControls(camera, renderer.domElement);
  const suntxt = new THREE.TextureLoader().load("/src/Here comes the sun.jpg");
  const venustxt = new THREE.TextureLoader().load("/src/venus.jpg");
  const earthtxt = new THREE.TextureLoader().load("/src/earth.jpg");
  const mercurytxt = new THREE.TextureLoader().load("/src/mercurio.jpg");
  const marstxt = new THREE.TextureLoader().load("/src/marte.jpg");
  const lavetxt = new THREE.TextureLoader().load("/src/Lava_005_COLOR.jpg");
  const jupitertxt = new THREE.TextureLoader().load("/src/jupiter.jpg");
  const saturntxt = new THREE.TextureLoader().load("/src/saturno.jpg");
  const neptunetxt = new THREE.TextureLoader().load("/src/neptuno.png");
  const uranustxt = new THREE.TextureLoader().load("/src/uranus.jpg");
  const skeletxt = new THREE.TextureLoader().load("/src/Marcelo en nave.png")

  //Rejilla de referencia indicando tamaño y divisiones
  grid = new THREE.GridHelper(40, 60);
  //Mostrarla en vertical
  grid.geometry.rotateY(Math.PI / 2);
  grid.position.set(0, 0, 0.05);
  //scene.add(grid);

  //Objetos
  playableSkeleton(skeletxt);

  Estrella(8, 0xffcc33, suntxt);
  Planeta(0.62, 9.8, 0.12, 0xec3410, 2.8, 2.7, marstxt);
  Planeta(0.7, 10.8, -0.6, 0xffffff, 2.05, 2.04, earthtxt);
  Planeta(0.6, 9.3, 0.7, 0xe9dc42, 2.03, 1.9, venustxt);
  Planeta(0.43, 8, 1, 0xffffdd, 1.8, 1.9, mercurytxt);
  Planeta(2, 12, 0.4, 0x997950, 3, 3.2, jupitertxt);
  Planeta(1.7, 14, -0.36, 0xeedc82, 3.5, 3.3, saturntxt);
  Planeta(1.3, 14.7, 0.46, 0xcdcdde, 3.8, 3.5, uranustxt);
  Planeta(1.5, 15.9, 0.22, 0xc7c7e3, 4.1, 3.9, neptunetxt);

  Luna(Planetas[0], 0.15, 0.75, -3.5, 0xffff00, 0.0);
  Luna(Planetas[0], 0.04, 0.7, 1.5, 0xff0f00, Math.PI / 2);
  Luna(Planetas[0], 0.06, 1, -2.2, 0xff0cd4, 15.0);
  Luna(Planetas[1], 0.13, 1.23, -1.2, 0xffefcc, 30);

  Anillo(Planetas[5], 1.9, 2.7, 0xcdcdcc, Math.PI / 3, saturntxt);

  //Inicio tiempo
  pauseButton();
}

function Estrella(rad, col, texture = undefined) {
  let geometry = new THREE.SphereGeometry(rad, 32, 32);
  let material = new THREE.MeshBasicMaterial({ color: col });
  if (texture != undefined) {
    material.map = texture;
  }
  estrella = new THREE.Mesh(geometry, material);
  scene.add(estrella);
}

function Planeta(radio, dist, vel, col, f1, f2, texture = undefined) {
  let geom = new THREE.SphereGeometry(radio, 32, 32);
  let mat = new THREE.MeshBasicMaterial({ color: col });
  if (texture != undefined) {
    mat.map = texture;
  }
  let planeta = new THREE.Mesh(geom, mat);
  planeta.rotation.y = Math.PI / 2;
  planeta.userData.dist = dist;
  planeta.userData.speed = vel;
  planeta.userData.f1 = f1;
  planeta.userData.f2 = f2;

  Planetas.push(planeta);
  scene.add(planeta);

  //Dibuja trayectoria, con
  let curve = new THREE.EllipseCurve(
    0,
    0, // centro
    dist * f1,
    dist * f2 // radios elipse
  );
  //Crea geometría
  let points = curve.getPoints(50);
  let geome = new THREE.BufferGeometry().setFromPoints(points);
  let mate = new THREE.LineBasicMaterial({ color: 0xffffff });
  // Objeto
  let orbita = new THREE.Line(geome, mate);
  orbita.rotateX(Math.PI / 2);
  scene.add(orbita);
}

function Luna(planeta, radio, dist, vel, col, angle) {
  var pivote = new THREE.Object3D();
  pivote.rotation.x = angle; //si no nulo, rotación suera de plano
  planeta.add(pivote);
  var geom = new THREE.SphereGeometry(radio, 32, 32);
  var mat = new THREE.MeshBasicMaterial({ color: col });
  var luna = new THREE.Mesh(geom, mat);
  luna.userData.dist = dist;
  luna.userData.speed = vel;

  Lunas.push(luna);
  pivote.add(luna);
}

function Anillo(planeta, radioIn, radioEx, col, angle = 0, texture = undefined) {
  var casado = new THREE.Object3D();
  casado.rotation.x = angle;
  planeta.add(casado);
  var geom = new THREE.RingGeometry(radioIn, radioEx, 32);
  var mat = new THREE.MeshBasicMaterial({ color: col, side: THREE.DoubleSide });
  var anillo = new THREE.Mesh(geom, mat);
  casado.add(anillo);
}

function pauseButton() {
  const button = document.createElement("button");

  button.textContent = "⏸ Pausar órbitas";

  button.style.position = "absolute";
  button.style.bottom = "30px";
  button.style.left = "50%";
  button.style.transform = "translateX(-50%)";
  button.style.padding = "12px 16px";
  button.style.fontSize = "16px";
  button.style.fontWeight = "bold";
  button.style.cursor = "pointer";
  button.style.border = "2px solid white";
  button.style.borderRadius = "8px";
  button.style.backgroundColor = "#222222";
  button.style.color = "white";
  button.style.zIndex = "2";

  button.addEventListener("click", () => {
    paused = !paused;

    button.textContent = paused ? "▶ Reanudar órbitas" : "⏸ Pausar órbitas";
  });

  document.body.appendChild(button);
}

function playableSkeleton(texture) {
  skelet = new THREE.Object3D();
  skelet.position.set(0,0,30);
  scene.add(skelet);

  const geom = new THREE.PlaneGeometry(0.2,0.3);
  const material = new THREE.MeshBasicMaterial({map:texture, transparent:true, side: THREE.DoubleSide});

  const model = new THREE.Mesh(geom, material);
  skelet.add(model);

  camera.position.set(0,0.2,0.6);
  camera.rotation.set(-0.15,0,0);
  skelet.add(camera);
}

//Bucle de animación
function animationLoop() {
  requestAnimationFrame(animationLoop);
  const currentTime = performance.now();
  const deltaTime = currentTime - previousTime;

  previousTime = currentTime;
  updateSkelet(deltaTime);

  if (!paused) {
    timestamp += deltaTime * accglobal;

    estrella.rotation.y += 0.001;

    //Modifica rotación de todos los objetos
    for (let object of Planetas) {
      object.position.x =
        Math.cos(timestamp * object.userData.speed) *
        object.userData.f1 *
        object.userData.dist;
      object.position.z =
        Math.sin(timestamp * object.userData.speed) *
        object.userData.f2 *
        object.userData.dist;
      object.rotation.y += 0.005;
    }

    for (let object of Lunas) {
      object.position.x =
        Math.cos(timestamp * object.userData.speed) * object.userData.dist;
      object.position.y =
        Math.sin(timestamp * object.userData.speed) * object.userData.dist;
    }
  }
  renderer.render(scene, camera);
}
window.addEventListener("keydown", (event)=>{keysPressed[event.code]=true;});

window.addEventListener("keyup", (event)=> {keysPressed[event.code]=false;});

function updateSkelet(deltaTime){
  const movespeed = 0.005;
  const rotationSpeed = 0.00025;

  if (keysPressed["KeyA"]){
    skelet.rotation.y += rotationSpeed * deltaTime;
  }
  if (keysPressed["KeyD"]){
    skelet.rotation.y -= rotationSpeed * deltaTime;
  }
  if (keysPressed["KeyW"]){
    skelet.translateZ(-movespeed* deltaTime);
  }
  if (keysPressed["KeyS"]){
    skelet.translateZ (movespeed * deltaTime);
  }
}
