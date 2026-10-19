import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export function initBook(container) {
  const scene = new THREE.Scene();
  scene.background = null;
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, 2.5, 7.7);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.enablePan = false;
  controls.minDistance = 5.8; controls.maxDistance = 9;
  controls.minPolarAngle = 0.85; controls.maxPolarAngle = 2.1;
  controls.target.set(0, 0.1, 0); controls.autoRotate = true; controls.autoRotateSpeed = 0.7;

  scene.add(new THREE.HemisphereLight(0xc9d8ff, 0x29152a, 2.1));
  const key = new THREE.DirectionalLight(0xffdfaa, 3.2); key.position.set(-3, 6, 5); scene.add(key);
  const rim = new THREE.PointLight(0x9b8cff, 22, 15); rim.position.set(3, 1, -3); scene.add(rim);
  const pink = new THREE.PointLight(0xe77da7, 9, 10); pink.position.set(-4, 0, 2); scene.add(pink);

  const group = new THREE.Group(); scene.add(group);
  const coverMat = new THREE.MeshStandardMaterial({ color: 0x421c32, roughness: 0.42, metalness: 0.22 });
  const pagesMat = new THREE.MeshStandardMaterial({ color: 0xe8d8bb, roughness: 0.9 });
  const spine = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.16, 2.65), coverMat);
  spine.position.x = -1.38; group.add(spine);
  const pageBlock = new THREE.Mesh(new THREE.BoxGeometry(2.55, 0.13, 2.6), pagesMat);
  pageBlock.position.set(0, -0.015, 0); group.add(pageBlock);
  const backCover = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.16, 2.75), coverMat);
  backCover.position.set(0.02, -0.11, 0); group.add(backCover);

  const pivot = new THREE.Group(); pivot.position.set(-1.28, 0.075, 0); group.add(pivot);
  const frontCover = new THREE.Mesh(new THREE.BoxGeometry(2.62, 0.12, 2.72), coverMat);
  frontCover.geometry.translate(1.31, 0, 0);
  frontCover.position.set(0, 0, 0); pivot.add(frontCover);
  const coverInset = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.012, 2.44), new THREE.MeshStandardMaterial({color:0x55253c, roughness:.5, metalness:.15}));
  coverInset.geometry.translate(1.175, 0, 0); coverInset.position.set(0, .066, 0); pivot.add(coverInset);

  // Gold title sits on the cover as a small decorative plaque.
  const plaque = new THREE.Mesh(new THREE.BoxGeometry(1.25, .025, .88), new THREE.MeshStandardMaterial({color:0xb89a5d, metalness:.7, roughness:.32}));
  plaque.geometry.translate(.625,0,0); plaque.position.set(.28,.083,0); pivot.add(plaque);
  const plaqueFace = new THREE.Mesh(new THREE.BoxGeometry(1.18,.012,.81), new THREE.MeshStandardMaterial({color:0x4a2036, roughness:.55}));
  plaqueFace.geometry.translate(.59,0,0); plaqueFace.position.set(.28,.101,0); pivot.add(plaqueFace);

  // Raised decorative heart on the cover.
  const heartShape = new THREE.Shape();
  heartShape.moveTo(0, .12); heartShape.bezierCurveTo(-.38,.42,-.62,.12,0,-.28); heartShape.bezierCurveTo(.62,.12,.38,.42,0,.12);
  const heartGeo = new THREE.ExtrudeGeometry(heartShape, {depth:.035, bevelEnabled:true, bevelSegments:2, steps:1, bevelSize:.025, bevelThickness:.02});
  const heart = new THREE.Mesh(heartGeo, new THREE.MeshStandardMaterial({color:0xd7b96f, metalness:.55, roughness:.3}));
  heart.rotation.x = -Math.PI/2; heart.position.set(.9,.13,0); heart.scale.set(.52,.52,.52); pivot.add(heart);

  // Fine gold corner ornaments.
  const gold = new THREE.MeshStandardMaterial({color:0xd4b76f, metalness:.65, roughness:.35});
  for (const x of [.18, 2.42]) for (const z of [-1.18,1.18]) {
    const dot = new THREE.Mesh(new THREE.SphereGeometry(.045,12,12),gold);
    dot.position.set(x,.11,z); pivot.add(dot);
  }

  // Individual page leaves create a visible layered page block and animate with the cover.
  const leaves = [];
  for (let i=0;i<7;i++) {
    const leafPivot = new THREE.Group(); leafPivot.position.set(-1.27, .04 + i*.002, 0); group.add(leafPivot);
    const leaf = new THREE.Mesh(new THREE.BoxGeometry(2.5,.012,2.58), new THREE.MeshStandardMaterial({color:i%2?0xf4e9d4:0xe8d8bb,roughness:.92}));
    leaf.geometry.translate(1.25,0,0); leaf.position.set(0,0,0); leafPivot.add(leaf); leaves.push(leafPivot);
  }
  let isOpen = false, targetAngle = 0;
  window.addEventListener("book:open", () => { isOpen = true; targetAngle = -Math.PI * .83; controls.autoRotate = false; });

  let downX = 0, downY = 0;
  renderer.domElement.addEventListener("pointerdown", e => { downX = e.clientX; downY = e.clientY; });
  renderer.domElement.addEventListener("pointerup", e => {
    if (Math.hypot(e.clientX - downX, e.clientY - downY) < 6) window.dispatchEvent(new CustomEvent("book:open"));
  });

  function resize() {
    const w = container.clientWidth || 400, h = container.clientHeight || 300;
    camera.aspect = w/h; camera.updateProjectionMatrix(); renderer.setSize(w,h,false);
  }
  const observer = new ResizeObserver(resize); observer.observe(container); resize();
  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    pivot.rotation.y += (targetAngle - pivot.rotation.y) * .045;
    leaves.forEach((leaf,i) => { const openAngle = isOpen ? -Math.PI*.79 + i*.025 : 0; leaf.rotation.y += (openAngle-leaf.rotation.y)*.035; });
    if (!isOpen) { group.position.y = Math.sin(t*1.2)*.07; group.rotation.y = Math.sin(t*.25)*.08; }
    else { group.position.y += (0-group.position.y)*.05; }
    controls.update(); renderer.render(scene,camera);
  }
  animate();
}
