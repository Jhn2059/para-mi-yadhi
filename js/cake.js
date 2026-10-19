import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export function initCake(container) {
  const scene = new THREE.Scene();
  scene.background = null;
  const camera = new THREE.PerspectiveCamera(36, 1, .1, 140);
  camera.position.set(0, 3.1, 8.9);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  container.appendChild(renderer.domElement);

  // Vista desde la silla: nunca se ve el piso, solo la mesa y el atardecer.
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.enablePan = false;
  controls.minDistance = 5.8; controls.maxDistance = 10.8;
  controls.minPolarAngle = .95; controls.maxPolarAngle = 1.5;
  controls.target.set(0, 1.5, 0);
  controls.autoRotate = true; controls.autoRotateSpeed = .5;

  const skyGroup = new THREE.Group(); scene.add(skyGroup);
  const skyCanvas = document.createElement("canvas"); skyCanvas.width = 4; skyCanvas.height = 512;
  const skyCtx = skyCanvas.getContext("2d");
  const skyGrad = skyCtx.createLinearGradient(0, 0, 0, 512);
  skyGrad.addColorStop(0, "#150c2e"); skyGrad.addColorStop(.32, "#3f1f4e"); skyGrad.addColorStop(.52, "#8a3560");
  skyGrad.addColorStop(.68, "#c65c42"); skyGrad.addColorStop(.8, "#e08a46"); skyGrad.addColorStop(.88, "#eaa85c");
  skyGrad.addColorStop(.94, "#5c2a44"); skyGrad.addColorStop(1, "#1d0f22");
  skyCtx.fillStyle = skyGrad; skyCtx.fillRect(0, 0, 4, 512);
  const skyTex = new THREE.CanvasTexture(skyCanvas); skyTex.colorSpace = THREE.SRGBColorSpace;
  const skyMesh = new THREE.Mesh(new THREE.SphereGeometry(70, 48, 32), new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, depthWrite: false }));
  skyGroup.add(skyMesh);

  new THREE.TextureLoader().load("assets/cielo-atardecer.jpg", tex => {
    tex.colorSpace = THREE.SRGBColorSpace; tex.mapping = THREE.EquirectangularReflectionMapping;
    skyMesh.material.map = tex; skyMesh.material.needsUpdate = true;
    skyMesh.material.color.set(0xb08ea6);
  }, undefined, () => {});

  scene.add(new THREE.HemisphereLight(0xe8b48f, 0x3a1a30, 1.15));
  const key = new THREE.DirectionalLight(0xffa86e, 2.4); key.position.set(-6, 2.8, -7); scene.add(key);
  const fill = new THREE.DirectionalLight(0xff9ec4, .85); fill.position.set(3.5, 3.5, 6); scene.add(fill);
  const rim = new THREE.PointLight(0xffb27a, 9, 14); rim.position.set(0, 3.2, -3.5); scene.add(rim);

  function woodTexture() {
    const c = document.createElement("canvas"); c.width = c.height = 512;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#2b1e19"; ctx.fillRect(0, 0, 512, 512);
    for (let r = 12; r < 370; r += 8 + Math.random() * 8) {
      ctx.beginPath(); ctx.arc(256, 256, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${58 + Math.random() * 34},${34 + Math.random() * 16},${24 + Math.random() * 10},${.3 + Math.random() * .3})`;
      ctx.lineWidth = 1.4 + Math.random() * 2.6; ctx.stroke();
    }
    for (let i = 0; i < 1400; i++) {
      ctx.fillStyle = `rgba(0,0,0,${Math.random() * .1})`;
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
    }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }
  const table = new THREE.Mesh(
    new THREE.CylinderGeometry(7.5, 7.5, .3, 80),
    new THREE.MeshStandardMaterial({ map: woodTexture(), roughness: .4, metalness: .22 })
  );
  table.position.y = -.15; scene.add(table);
  const tableRim = new THREE.Mesh(new THREE.TorusGeometry(7.48, .055, 10, 100), new THREE.MeshStandardMaterial({ color: 0xd8b46c, metalness: .85, roughness: .26 }));
  tableRim.rotation.x = Math.PI / 2; tableRim.position.y = .01; scene.add(tableRim);

  function doilyTexture() {
    const c = document.createElement("canvas"); c.width = c.height = 512;
    const ctx = c.getContext("2d");
    ctx.clearRect(0, 0, 512, 512);
    ctx.fillStyle = "rgba(250,242,230,.92)";
    ctx.beginPath(); ctx.arc(256, 256, 240, 0, Math.PI * 2); ctx.fill();
    ctx.globalCompositeOperation = "destination-out";
    for (let i = 0; i < 48; i++) {
      const a = i / 48 * Math.PI * 2;
      ctx.beginPath(); ctx.arc(256 + Math.cos(a) * 216, 256 + Math.sin(a) * 216, 11, 0, Math.PI * 2); ctx.fill();
    }
    for (const rr of [150, 185]) {
      ctx.beginPath(); ctx.arc(256, 256, rr, 0, Math.PI * 2);
      ctx.lineWidth = 4; ctx.strokeStyle = "rgba(0,0,0,1)"; ctx.stroke();
    }
    for (let i = 0; i < 24; i++) {
      const a = i / 24 * Math.PI * 2 + .1;
      ctx.beginPath(); ctx.arc(256 + Math.cos(a) * 168, 256 + Math.sin(a) * 168, 9, 0, Math.PI * 2); ctx.fill();
    }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }
  const doily = new THREE.Mesh(
    new THREE.CircleGeometry(2.8, 64),
    new THREE.MeshStandardMaterial({ map: doilyTexture(), transparent: true, roughness: .85, depthWrite: false })
  );
  doily.rotation.x = -Math.PI / 2; doily.position.y = .015; scene.add(doily);

  const stand = new THREE.Group(); scene.add(stand);
  const porcelain = new THREE.MeshStandardMaterial({ color: 0xf4e8e4, roughness: .16, metalness: .14 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xd8b46c, metalness: .85, roughness: .26 });
  function addCyl(parent, rTop, rBot, h, y, mat) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, 64), mat);
    m.position.y = y; parent.add(m); return m;
  }
  addCyl(stand, 1.55, 1.75, .12, .06, porcelain);
  addCyl(stand, .3, .5, .9, .55, porcelain);
  addCyl(stand, 2.05, 1.95, .1, 1.05, porcelain);
  const plateRim = new THREE.Mesh(new THREE.TorusGeometry(2.04, .03, 10, 80), goldMat);
  plateRim.rotation.x = Math.PI / 2; plateRim.position.y = 1.1; stand.add(plateRim);

  const cake = new THREE.Group(); stand.add(cake);
  const icingPink = new THREE.MeshStandardMaterial({ color: 0xf0aeb5, roughness: .34 });
  const icingCream = new THREE.MeshStandardMaterial({ color: 0xf7e3cd, roughness: .32 });
  const icingRose = new THREE.MeshStandardMaterial({ color: 0xe9b8ad, roughness: .34 });
  const spongeTan = new THREE.MeshStandardMaterial({ color: 0xd9a06c, roughness: .75 });
  const spongeChoc = new THREE.MeshStandardMaterial({ color: 0x8a5a3c, roughness: .75 });
  const creamWhite = new THREE.MeshStandardMaterial({ color: 0xfff3e4, roughness: .28 });
  function tier(r, hBottom, hSponge, hTop, matIcing, matSponge, y0) {
    const g = new THREE.Group(); cake.add(g);
    addCyl(g, r, r, hBottom, y0 + hBottom / 2, matIcing);
    addCyl(g, r * .995, r * .995, hSponge, y0 + hBottom + hSponge / 2, matSponge);
    addCyl(g, r, r, hTop, y0 + hBottom + hSponge + hTop / 2, matIcing);
    return y0 + hBottom + hSponge + hTop;
  }
  function drips(r, y, count, mat) {
    for (let i = 0; i < count; i++) {
      const a = i / count * Math.PI * 2 + .12;
      const len = .12 + Math.abs(Math.sin(i * 2.7)) * .16;
      const drop = new THREE.Mesh(new THREE.SphereGeometry(.085, 12, 10), mat);
      drop.scale.set(.75, len / .085 * .55, .75);
      drop.position.set(Math.cos(a) * r, y - len * .35, Math.sin(a) * r);
      cake.add(drop);
      const bead = new THREE.Mesh(new THREE.SphereGeometry(.1, 12, 10), mat);
      bead.scale.set(.9, .7, .9); bead.position.set(Math.cos(a) * r, y + .01, Math.sin(a) * r);
      cake.add(bead);
    }
  }
  function dollops(r, y, count, scale = 1) {
    for (let i = 0; i < count; i++) {
      const a = i / count * Math.PI * 2;
      const d = new THREE.Mesh(new THREE.SphereGeometry(.115 * scale, 14, 12), creamWhite);
      d.scale.set(1, .85, 1); d.position.set(Math.cos(a) * r, y, Math.sin(a) * r);
      cake.add(d);
    }
  }
  function cherry(x, y, z, s = .09) {
    const c = new THREE.Mesh(new THREE.SphereGeometry(s, 16, 14), new THREE.MeshStandardMaterial({ color: 0xb02438, roughness: .18, metalness: .05 }));
    c.position.set(x, y, z); cake.add(c);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, .12, 6), new THREE.MeshStandardMaterial({ color: 0x6b4a2a }));
    stem.position.set(x + .02, y + s + .05, z); stem.rotation.z = .3; cake.add(stem);
  }
  function strawberry(x, y, z, s = .17) {
    const b = new THREE.Mesh(new THREE.SphereGeometry(s, 20, 16), new THREE.MeshStandardMaterial({ color: 0xc43049, roughness: .3 }));
    b.scale.set(.85, 1.15, .9); b.position.set(x, y, z); cake.add(b);
    const leaf = new THREE.Mesh(new THREE.ConeGeometry(s * .7, .1, 6), new THREE.MeshStandardMaterial({ color: 0x5d8a4c }));
    leaf.position.set(x, y + s * 1.05, z); cake.add(leaf);
  }
  function sprinkle(x, y, z, color) {
    const s = new THREE.Mesh(new THREE.CapsuleGeometry(.014, .05, 2, 6), new THREE.MeshStandardMaterial({ color, roughness: .4 }));
    s.position.set(x, y, z);
    s.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    cake.add(s);
  }

  let y = 1.15;
  y = tier(1.52, .34, .16, .34, icingPink, spongeTan, y);
  drips(1.52, y - .02, 18, icingPink);
  dollops(1.34, y + .09, 14);
  y = tier(1.12, .28, .14, .28, icingCream, spongeChoc, y + .02);
  drips(1.12, y - .02, 14, creamWhite);
  dollops(.96, y + .08, 12, .92);
  y = tier(.74, .24, .12, .24, icingRose, spongeTan, y + .02);
  dollops(.62, y + .07, 9, .85);

  const topY = y + .1;
  cherry(0, topY + .12, 0, .11);
  for (const [cx, cz] of [[.96, 0], [-.96, 0], [0, .96], [0, -.96], [.68, .68], [-.68, -.68], [.68, -.68], [-.68, .68]]) cherry(cx, topY - .95 + .09, cz, .075);
  for (const [cx, cz, s] of [[-.3, -.22, .16], [.26, -.24, .14], [.08, .28, .13]]) strawberry(cx, topY + .14, cz, s);
  const sprinkleColors = [0xffd66e, 0xff8fb0, 0x9fd8ff, 0xc9a6ff, 0xffffff];
  for (let i = 0; i < 70; i++) {
    const a = Math.random() * Math.PI * 2, r = Math.random() * .58;
    sprinkle(Math.cos(a) * r, topY + .03 + Math.random() * .04, Math.sin(a) * r, sprinkleColors[i % sprinkleColors.length]);
  }
  for (let i = 0; i < 40; i++) {
    const a = Math.random() * Math.PI * 2, r = .85 + Math.random() * .2;
    sprinkle(Math.cos(a) * r, y - .9 + .02 + Math.random() * .3, Math.sin(a) * r, sprinkleColors[(i + 2) % sprinkleColors.length]);
  }

  function nameTexture() {
    const c = document.createElement("canvas"); c.width = 1024; c.height = 560;
    const ctx = c.getContext("2d");
    ctx.clearRect(0, 0, 1024, 560);
    const goldGrad = ctx.createLinearGradient(0, 30, 0, 150);
    goldGrad.addColorStop(0, "#ffe9b0"); goldGrad.addColorStop(.55, "#e0b96a"); goldGrad.addColorStop(1, "#b8873f");
    // Corona sobre el nombre.
    const cx = 512, cy = 122, cw = 180, ch = 95;
    ctx.fillStyle = goldGrad;
    ctx.beginPath();
    ctx.moveTo(cx - cw / 2, cy);
    ctx.lineTo(cx - cw / 2 + cw * .1, cy - ch * .62);
    ctx.lineTo(cx - cw * .18, cy - ch * .22);
    ctx.lineTo(cx, cy - ch);
    ctx.lineTo(cx + cw * .18, cy - ch * .22);
    ctx.lineTo(cx + cw / 2 - cw * .1, cy - ch * .62);
    ctx.lineTo(cx + cw / 2, cy);
    ctx.closePath(); ctx.fill();
    ctx.fillRect(cx - cw / 2, cy, cw, 24);
    for (const [jx, col] of [[cx - cw * .28, "#e4648c"], [cx, "#7fd0e8"], [cx + cw * .28, "#e4648c"]]) {
      ctx.beginPath(); ctx.fillStyle = col; ctx.arc(jx, cy - ch * .18, 8, 0, Math.PI * 2); ctx.fill();
    }
    ctx.beginPath(); ctx.fillStyle = goldGrad; ctx.arc(cx, cy - ch - 8, 10, 0, Math.PI * 2); ctx.fill();
    // Textos.
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0,0,0,.5)"; ctx.shadowBlur = 16; ctx.shadowOffsetY = 7;
    ctx.font = "italic 500 82px 'Cormorant Garamond', Georgia, serif";
    ctx.fillStyle = "#f6e2c8";
    ctx.fillText("Feliz cumpleaños", 512, 228);
    ctx.font = "italic 500 64px 'Cormorant Garamond', Georgia, serif";
    ctx.fillStyle = "#f3b6c6";
    ctx.fillText("mi", 512, 300);
    ctx.font = "600 140px 'Cormorant Garamond', Georgia, serif";
    const nameGrad = ctx.createLinearGradient(0, 330, 0, 480);
    nameGrad.addColorStop(0, "#ffe9b0"); nameGrad.addColorStop(.5, "#e0b96a"); nameGrad.addColorStop(1, "#b8873f");
    ctx.fillStyle = nameGrad;
    ctx.fillText("Yadhira", 470, 412);
    ctx.shadowBlur = 22; ctx.shadowColor = "rgba(255,110,150,.85)";
    ctx.font = "600 92px Georgia, serif";
    ctx.fillStyle = "#ff7fa5";
    ctx.fillText("♥", 810, 408);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }
  const topper = new THREE.Mesh(
    new THREE.PlaneGeometry(2.85, 1.58),
    new THREE.MeshBasicMaterial({ map: nameTexture(), transparent: true, side: THREE.DoubleSide, depthWrite: false })
  );
  topper.position.set(0, topY + 1.0, -.42); cake.add(topper);
  if (document.fonts?.load) {
    Promise.all([
      document.fonts.load("600 140px 'Cormorant Garamond'"),
      document.fonts.load("italic 500 82px 'Cormorant Garamond'"),
      document.fonts.load("italic 500 64px 'Cormorant Garamond'")
    ]).then(() => {
      topper.material.map = nameTexture(); topper.material.needsUpdate = true;
    }).catch(() => {});
  }

  const candles = [];
  for (let i = 0; i < 5; i++) {
    const a = i / 5 * Math.PI * 2 + Math.PI / 2;
    const cx = Math.cos(a) * .48, cz = Math.sin(a) * .48;
    const stripeMat = new THREE.MeshStandardMaterial({ color: i % 2 ? 0xf3d9a4 : 0xc9a8ee, roughness: .3 });
    const candle = new THREE.Mesh(new THREE.CylinderGeometry(.042, .048, .42, 14), stripeMat);
    candle.position.set(cx, topY + .21, cz); cake.add(candle);
    const stripe = new THREE.Mesh(new THREE.TorusGeometry(.045, .012, 6, 18), new THREE.MeshStandardMaterial({ color: i % 2 ? 0xd8a15c : 0x8f79c9 }));
    stripe.rotation.x = Math.PI / 2; stripe.position.set(cx, topY + .26, cz); cake.add(stripe);
    const wick = new THREE.Mesh(new THREE.CylinderGeometry(.008, .008, .05, 6), new THREE.MeshStandardMaterial({ color: 0x2b2320 }));
    wick.position.set(cx, topY + .44, cz); cake.add(wick);
    const flameMat = new THREE.MeshStandardMaterial({ color: 0xffc266, emissive: 0xff8c2b, emissiveIntensity: 2.6, transparent: true });
    const flame = new THREE.Mesh(new THREE.SphereGeometry(.07, 14, 12), flameMat);
    flame.scale.set(.6, 1.65, .6); flame.position.set(cx, topY + .53, cz); cake.add(flame);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: radialGlow(), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: .85
    }));
    glow.scale.set(.55, .55, 1); glow.position.set(cx, topY + .54, cz); cake.add(glow);
    const point = new THREE.PointLight(0xffa94d, 1.4, 2.4); point.position.set(cx, topY + .56, cz); cake.add(point);
    candles.push({ flame, glow, point, x: cx, z: cz, y: topY + .53, out: false });
  }

  function radialGlow() {
    const c = document.createElement("canvas"); c.width = c.height = 128;
    const ctx = c.getContext("2d");
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, "rgba(255,220,150,1)"); g.addColorStop(.4, "rgba(255,170,80,.5)"); g.addColorStop(1, "rgba(255,140,60,0)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }

  const smokeTex = radialGlow();
  const smoke = [];
  function spawnSmoke(x, y, z) {
    for (let i = 0; i < 4; i++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeTex, color: 0xbdb6c4, transparent: true, opacity: .55, depthWrite: false }));
      s.position.set(x + (Math.random() - .5) * .05, y + i * .08, z);
      s.scale.set(.12, .12, 1);
      scene.add(s);
      smoke.push({ s, life: 1, vy: .35 + Math.random() * .25, drift: (Math.random() - .5) * .2 });
    }
  }

  const confetti = [];
  const confettiColors = [0xffd66e, 0xff8fb0, 0xc9a6ff, 0x9fd8ff, 0xfff3e0, 0xff6f9c];
  function spawnConfetti() {
    const geo = new THREE.PlaneGeometry(.085, .13);
    for (let i = 0; i < 110; i++) {
      const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: confettiColors[i % confettiColors.length], side: THREE.DoubleSide, transparent: true }));
      const a = Math.random() * Math.PI * 2, r = Math.random() * 1.6;
      m.position.set(Math.cos(a) * r, 3.2 + Math.random() * 2.2, Math.sin(a) * r);
      m.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      stand.add(m);
      confetti.push({ m, vx: (Math.random() - .5) * .9, vy: -.5 - Math.random() * .9, vz: (Math.random() - .5) * .9, rx: (Math.random() - .5) * 6, rz: (Math.random() - .5) * 6, life: 1 });
    }
  }

  let blown = false, entering = false, enterT = 0;
  const ENTER_DUR = 1.7;
  stand.position.y = -3.4; stand.scale.setScalar(.5);
  function enter() {
    blown = false; entering = true; enterT = 0;
    stand.position.y = -3.4; stand.scale.setScalar(.5);
    candles.forEach(c => { c.out = false; c.flame.visible = false; c.glow.visible = false; c.point.intensity = 0; });
  }
  function blow() {
    if (blown || entering) return;
    blown = true;
    candles.forEach((c, i) => {
      setTimeout(() => {
        c.out = true; c.flame.visible = false; c.glow.visible = false; c.point.intensity = 0;
        spawnSmoke(c.x, c.y, c.z);
      }, i * 150);
    });
    setTimeout(spawnConfetti, 250);
  }

  function resize() {
    const w = container.clientWidth || 400, h = container.clientHeight || 350;
    camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h, false);
  }
  const observer = new ResizeObserver(resize); observer.observe(container); resize();

  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), .05);
    const t = clock.elapsedTime;
    skyGroup.rotation.y += dt * .015;

    if (entering) {
      enterT += dt;
      const k = Math.min(1, enterT / ENTER_DUR);
      const e = 1 - Math.pow(1 - k, 3);
      stand.position.y = -3.4 * (1 - e);
      stand.scale.setScalar(.5 + .5 * e);
      if (k > .72) candles.forEach(c => { if (!c.out) { c.flame.visible = true; c.glow.visible = true; c.point.intensity = 1.2; } });
      if (k >= 1) entering = false;
    }

    if (!blown) candles.forEach((c, i) => {
      if (!c.flame.visible) return;
      c.flame.scale.y = 1.5 + Math.sin(t * 9 + i * 1.7) * .28;
      c.flame.scale.x = c.flame.scale.z = .6 + Math.sin(t * 11 + i) * .06;
      c.point.intensity = 1.15 + Math.sin(t * 10 + i) * .3;
      c.glow.material.opacity = .65 + Math.sin(t * 8 + i) * .2;
    });

    for (let i = smoke.length - 1; i >= 0; i--) {
      const p = smoke[i];
      p.life -= dt * .45;
      p.s.position.y += p.vy * dt;
      p.s.position.x += p.drift * dt;
      const k = 1 - p.life;
      p.s.scale.set(.12 + k * .55, .12 + k * .55, 1);
      p.s.material.opacity = Math.max(0, p.life * .55);
      if (p.life <= 0) { scene.remove(p.s); smoke.splice(i, 1); }
    }

    for (let i = confetti.length - 1; i >= 0; i--) {
      const c = confetti[i];
      c.life -= dt * .18;
      c.vy -= dt * .35;
      c.m.position.x += c.vx * dt; c.m.position.y += c.vy * dt; c.m.position.z += c.vz * dt;
      c.m.rotation.x += c.rx * dt; c.m.rotation.z += c.rz * dt;
      c.m.material.opacity = Math.max(0, Math.min(1, c.life));
      if (c.m.position.y < -.2 || c.life <= 0) { stand.remove(c.m); c.m.material.dispose(); confetti.splice(i, 1); }
    }

    controls.target.y = 1.5 + Math.sin(t * .32) * .035;
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  return { enter, blow };
}
