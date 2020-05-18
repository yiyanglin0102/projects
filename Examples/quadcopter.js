/*jshint esversion: 6 */
// @ts-check

/**
 * Minimal Starter Code for the QuadCopter assignment
 */

import { onWindowOnload } from "./Libs/helpers.js";

// these four lines fake out TypeScript into thinking that THREE
// has the same type as the T.js module, so things work for type checking
// type inferencing figures out that THREE has the same type as T
// and then I have to use T (not THREE) to avoid the "UMD Module" warning
/**  @type typeof import("./THREE/threets/index"); */
let T;
// @ts-ignore
T = THREE;

const shellParam = {
  color: 0xc0c0c0,
  roughness: 0.5,
};


function defaultquadcopter(color1) {

  let group = new T.Group();
  let points = [];
  for (let i = 0; i < 6; i++) {
    points.push(new T.Vector2(Math.sin(i * 0.2) * 10 + 5, (i - 5) * 2));
  }
  let geometry = new T.LatheGeometry(points, 12, -0.49, 4);
  let material = new T.MeshStandardMaterial({ color: "rgb(30%, 30%, 40%)", transparent: true, opacity: 0.2 });
  let lathe = new T.Mesh(geometry, material);
  lathe.scale.set(0.04, -0.04, 0.04);
  lathe.position.set(0, 0.55, 0);
  group.add(lathe);

  let geometry1 = new T.LatheGeometry(points, 12, -0.49, 4);
  let material1 = new T.MeshStandardMaterial({ color: color1, metalness: 0.5, roughness: 0.7 });
  let lathe1 = new T.Mesh(geometry1, material1);
  lathe1.scale.set(0.04, -0.04, 0.04);
  lathe1.position.set(0, 0.55, 0);
  lathe1.rotateY(Math.PI);
  group.add(lathe1);

  let geometry2 = new T.LatheGeometry(points, 12, 0, 4);
  let material2 = new T.MeshStandardMaterial({ color: color1, metalness: 0.5, roughness: 0.7 });
  let lathe2 = new T.Mesh(geometry2, material2);
  lathe2.scale.set(0.04, 0.04, 0.04);
  lathe2.position.set(0, 0.55, 0);
  lathe2.rotateY(Math.PI);
  group.add(lathe2);

  let geometry3 = new T.LatheGeometry(points, 12, 0, 4);
  let material3 = new T.MeshStandardMaterial({ color: color1, metalness: 0.5, roughness: 0.7 });
  let lathe3 = new T.Mesh(geometry3, material3);
  lathe3.scale.set(0.04, 0.04, 0.04);
  lathe3.position.set(0, 0.55, 0);
  group.add(lathe3);

  // legs
  let rightleg = new T.BoxGeometry(0.05, 0.25, 0.05);
  let rightleg1 = new T.Mesh(rightleg, new T.MeshStandardMaterial({ color: "black", metalness: 0.5, roughness: 0.7 }));
  rightleg1.position.set(0, 0.15, -0.2);
  group.add(rightleg1);

  let leftleg = new T.BoxGeometry(0.05, 0.25, 0.05);
  let leftleg1 = new T.Mesh(leftleg, new T.MeshStandardMaterial({ color: "black" }));
  leftleg1.position.set(0, 0.15, 0.2);
  group.add(leftleg1);

  //feet
  let leftfeet = new T.BoxGeometry(0.5, 0.05, 0.05);
  let leftfeet1 = new T.Mesh(leftfeet, new T.MeshStandardMaterial({ color: "black" }));
  leftfeet1.position.set(0, 0.05, 0.2);
  group.add(leftfeet1);

  let rightfeet = new T.BoxGeometry(0.5, 0.05, 0.05);
  let rightfeet1 = new T.Mesh(rightfeet, new T.MeshStandardMaterial({ color: "black" }));
  rightfeet1.position.set(0, 0.05, -0.2);
  group.add(rightfeet1);

  // stick
  let stick = new T.BoxGeometry(0.05, 0.25, 0.05);
  let stick1 = new T.Mesh(stick, new T.MeshStandardMaterial({ color: "black" }));
  stick1.position.set(0, 1.05, 0);
  group.add(stick1);

  // tail
  let tail = new T.BoxGeometry(0.9, 0.25, 0.05);
  let tail1 = new T.Mesh(tail, new T.MeshStandardMaterial({ color: "black" }));
  tail1.position.set(-0.8, 0.65, 0);
  tail1.rotateZ(-0.2);
  group.add(tail1);

  return group;
}

function propeller() {

  let group = new T.Group();

  let propeller1 = new T.BoxGeometry(0.75, 0.02, 0.15);
  let propeller11 = new T.Mesh(propeller1, new T.MeshStandardMaterial({ color: "grey" }));
  propeller11.position.set(0.4, 1.15, 0);
  group.add(propeller11);

  let propeller2 = new T.BoxGeometry(0.15, 0.02, 0.75);
  let propeller22 = new T.Mesh(propeller2, new T.MeshStandardMaterial({ color: "grey" }));
  propeller22.position.set(0, 1.15, 0.4);
  group.add(propeller22);

  let propeller3 = new T.BoxGeometry(0.75, 0.02, 0.15);
  let propeller33 = new T.Mesh(propeller3, new T.MeshStandardMaterial({ color: "grey" }));
  propeller33.position.set(-0.4, 1.15, 0);
  group.add(propeller33);

  let propeller4 = new T.BoxGeometry(0.15, 0.02, 0.75);
  let propeller44 = new T.Mesh(propeller4, new T.MeshStandardMaterial({ color: "grey" }));
  propeller44.position.set(0, 1.15, -0.4);
  group.add(propeller44);

  return group;
}

function propellertail() {

  let group = new T.Group();
  let propeller1 = new T.BoxGeometry(0.1, 0.7, 0.01);
  let propeller11 = new T.Mesh(propeller1, new T.MeshStandardMaterial({ color: "grey" }));
  group.add(propeller11);

  let propeller2 = new T.BoxGeometry(0.1, 0.7, 0.01);
  let propeller22 = new T.Mesh(propeller2, new T.MeshStandardMaterial({ color: "grey" }));
  propeller22.rotateZ(Math.PI / 2);
  group.add(propeller22);

  group.position.set(-1.2, 0.75, -0.1);

  return group;
}

function radar({ color, target }) {
  shellParam.color = color;
  let group = new T.Group();

  let head = new T.Group();
  group.add(head);

  let shellPoints = [];
  for (let i = 0; i <= 0.8; i += 0.1) {
    shellPoints.push(new T.Vector2(i, 0.8 * (1 - Math.sqrt(1 - i * i))));
  }
  let shellGeo = new T.LatheGeometry(shellPoints, 64);
  shellGeo.rotateX(Math.PI / 2);
  let shellMet = new T.MeshStandardMaterial(Object.assign(shellParam, {
    side: T.DoubleSide,
  }));
  let shell = new T.Mesh(shellGeo, shellMet);
  shell.castShadow = true;

  shell.position.z = 0.1;
  head.add(shell);

  let antennaGeo = new T.CylinderGeometry(0.05, 0.08, 0.8,64);
  antennaGeo.rotateX(Math.PI / 2);
  let antenna = new T.Mesh(antennaGeo, new T.MeshStandardMaterial(shellParam));
  antenna.castShadow = true;
  antenna.position.z = 0.3;
  head.add(antenna);

  let headShaft = new T.Mesh(new T.SphereGeometry(0.2, 16, 16), new T.MeshStandardMaterial(shellParam));
  headShaft.castShadow = true;
  head.position.y = 0.7;
  head.add(headShaft);

  let standGroup = new T.Group();
  group.add(standGroup);

  let standTopGeo = new T.CylinderGeometry(0.08, 0.08, 0.4);
  let standTop = new T.Mesh(standTopGeo, new T.MeshStandardMaterial({
    color: shellParam.color,
    roughness: 0.8
  }));
  standTop.castShadow = true;
  standTop.position.y = 0.5;
  standTop.rotation.y = Math.PI / 4;
  standGroup.add(standTop);
  const standBaseGeo = new T.CylinderGeometry(0.2, 0.4, 0.4, 4);
  const standBase = new T.Mesh(standBaseGeo, new T.MeshStandardMaterial({
    color: shellParam.color,
    roughness: 0.8
  }));
  standBase.castShadow = true;
  standBase.position.y = 0.2;
  standBase.rotation.y = Math.PI / 4;
  standGroup.add(standBase);

  if (target) {
    let raf = () => {
      head.lookAt(target.position);
      requestAnimationFrame(raf);
    };
    raf();
  }

  return group;
}

function quadcopter() {
  let renderer = new T.WebGLRenderer();
  renderer.setSize(1200, 700);
  document.body.appendChild(renderer.domElement);

  let scene = new T.Scene();
  let camera = new T.PerspectiveCamera(40, renderer.domElement.width / renderer.domElement.height, 1, 1000);

  camera.position.z = 10;
  camera.position.y = 5;
  camera.position.x = 5;
  camera.lookAt(0, 0, 0);

  // since we're animating, add OrbitControls
  let controls = new T.OrbitControls(camera, renderer.domElement);

  scene.add(new T.AmbientLight("white", 0.2));

  // two lights - both a little off white to give some contrast
  let dirLight1 = new T.DirectionalLight(0xF0E0D0, 1);
  dirLight1.position.set(1, 1, 0);
  scene.add(dirLight1);

  let dirLight2 = new T.DirectionalLight(0xD0E0F0, 1);
  dirLight2.position.set(-1, 1, -0.2);
  scene.add(dirLight2);

  // make a ground plane
  let groundBox = new T.BoxGeometry(10, 0.1, 10);
  let groundMesh = new T.Mesh(groundBox, new T.MeshStandardMaterial({ color: 0x88B888, roughness: 0.9 }));
  // put the top of the box at the ground level (0)
  groundMesh.position.y = -0.05;
  scene.add(groundMesh);

  // copter 1
  let copter1 = new T.Group();
  let quadcopter1 = defaultquadcopter("blue");
  let objpropeller1 = propeller();
  let objtailpropeller1 = propellertail();
  copter1.add(quadcopter1);
  copter1.add(objpropeller1);
  copter1.add(objtailpropeller1);
  scene.add(copter1);
  let rad1 = radar({ color: "blue", target: copter1 });
  rad1.position.set(3, 0, -3);
  scene.add(rad1);

  // copter 2
  let copter2 = new T.Group();
  let quadcopter2 = defaultquadcopter("red");
  let objpropeller2 = propeller();
  let objtailpropeller2 = propellertail();
  copter2.add(quadcopter2);
  copter2.add(objpropeller2);
  copter2.add(objtailpropeller2);
  scene.add(copter2);
  let rad2 = radar({ color: "red", target: copter2 });
  rad2.position.set(-3, 0, 3);
  scene.add(rad2);

  let s = 0;
  copter1.rotateY(-Math.PI * 2 / 3);

  // let axWorld = new T.AxesHelper();
  // scene.add(axWorld);

  function animateLoop() {

    let theta = performance.now() / 1000;
    let x = 3 * Math.cos(theta);
    let z = 3 * Math.sin(theta);
    let ds = theta - s;
    s = theta;

    // copter 1
    copter1.position.set(1.5*x, 1.5, 1.5*z);
    copter1.rotation.y += ds;
    objtailpropeller1.rotateZ(1);
    objpropeller1.rotateY(1);

    // copter 2
    copter2.position.set(2 * Math.cos(theta), 4*Math.cos(theta)+4, 2 * Math.sin(theta));
    objtailpropeller2.rotateZ(1);
    objpropeller2.rotateY(1);

    renderer.setClearColor("lightblue");
    renderer.render(scene, camera);

    window.requestAnimationFrame(animateLoop);
  }
  animateLoop();
}
onWindowOnload(quadcopter);