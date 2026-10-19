import { initBook } from "./book.js";
import { initCake } from "./cake.js";

const screens = [...document.querySelectorAll(".screen")];
function showScreen(id) {
  screens.forEach(screen => screen.classList.toggle("hidden", screen.id !== id));
  window.scrollTo({ top: 0, behavior: "smooth" });
}
document.querySelectorAll("[data-back]").forEach(button => button.addEventListener("click", () => showScreen(button.dataset.back)));
let cakeApi = null;
function playLetterAnimation() {
  const stage = document.getElementById("envelope-stage");
  const reveal = document.getElementById("message-reveal");
  clearTimeout(playLetterAnimation._t1);
  clearTimeout(playLetterAnimation._t2);
  stage.classList.remove("open", "done");
  reveal.classList.remove("show");
  void stage.offsetWidth;
  playLetterAnimation._t1 = setTimeout(() => stage.classList.add("open"), 400);
  playLetterAnimation._t2 = setTimeout(() => {
    stage.classList.add("done");
    reveal.classList.add("show");
  }, 2400);
}
document.querySelectorAll("[data-panel]").forEach(button => button.addEventListener("click", () => {
  showScreen(button.dataset.panel);
  if (button.dataset.panel === "cake" && cakeApi) {
    cakeApi.enter();
    document.getElementById("blow-candles").disabled = false;
    document.getElementById("wish-message").textContent = "";
  }
  if (button.dataset.panel === "message") playLetterAnimation();
}));
document.getElementById("reopen-letter").addEventListener("click", playLetterAnimation);
document.getElementById("open-book").addEventListener("click", () => window.dispatchEvent(new CustomEvent("book:open")));
window.addEventListener("book:open", () => setTimeout(() => showScreen("letter"), 650));
document.getElementById("continue-to-world").addEventListener("click", () => showScreen("world"));
document.querySelector(".brand").addEventListener("click", e => { e.preventDefault(); showScreen("intro"); });

const stars = document.getElementById("stars");
for (let i = 0; i < 85; i++) {
  const star = document.createElement("span");
  star.className = "star-dot";
  star.style.left = `${Math.random() * 100}%`;
  star.style.top = `${Math.random() * 100}%`;
  star.style.animationDelay = `${Math.random() * 4}s`;
  star.style.opacity = `${0.15 + Math.random() * 0.55}`;
  stars.appendChild(star);
}

const petals = document.getElementById("petals");
const petalGlyphs = ["♥", "♡", "❀", "♥"];
for (let i = 0; i < 16; i++) {
  const p = document.createElement("span");
  p.className = "petal";
  p.textContent = petalGlyphs[i % petalGlyphs.length];
  p.style.left = `${Math.random() * 100}%`;
  p.style.fontSize = `${9 + Math.random() * 12}px`;
  p.style.animationDuration = `${11 + Math.random() * 14}s`;
  p.style.animationDelay = `${-Math.random() * 20}s`;
  petals.appendChild(p);
}

const music = document.getElementById("bg-music");
const musicToggle = document.getElementById("music-toggle");
function setMusicUI(playing) {
  musicToggle.classList.toggle("playing", playing);
  musicToggle.textContent = playing ? "♫" : "♪";
}
musicToggle.addEventListener("click", async () => {
  if (music.paused) {
    try { await music.play(); localStorage.setItem("yadhira_music", "on"); setMusicUI(true); }
    catch { setMusicUI(false); }
  } else {
    music.pause(); localStorage.setItem("yadhira_music", "off"); setMusicUI(false);
  }
});
if (localStorage.getItem("yadhira_music") === "on") {
  const start = async () => {
    document.removeEventListener("pointerdown", start);
    try { await music.play(); setMusicUI(true); } catch { setMusicUI(false); }
  };
  document.addEventListener("pointerdown", start);
}

let toastTimer = null;
function toast(message) {
  const el = document.getElementById("toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 2400);
}

document.getElementById("welcome-enter").addEventListener("click", async () => {
  document.getElementById("welcome").classList.add("hide");
  document.body.classList.remove("welcoming");
  if (localStorage.getItem("yadhira_music") !== "off") {
    try {
      await music.play();
      localStorage.setItem("yadhira_music", "on");
      setMusicUI(true);
    } catch { setMusicUI(false); }
  }
});

function playPuff() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const dur = 0.5;
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / data.length;
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 2.6) * 0.32;
    }
    const src = ctx.createBufferSource(); src.buffer = buf;
    const filter = ctx.createBiquadFilter(); filter.type = "lowpass"; filter.frequency.value = 850;
    const gain = ctx.createGain(); gain.gain.value = 0.75;
    src.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
    src.start();
    setTimeout(() => ctx.close(), 900);
  } catch { }
}

function idbOpen() {
  return new Promise((resolve, reject) => {
    const rq = indexedDB.open("yadhira_universo", 1);
    rq.onupgradeneeded = () => rq.result.createObjectStore("recuerdos", { keyPath: "id", autoIncrement: true });
    rq.onsuccess = () => resolve(rq.result);
    rq.onerror = () => reject(rq.error);
  });
}
async function idbGetAll() {
  const db = await idbOpen();
  return new Promise((resolve, reject) => {
    const rq = db.transaction("recuerdos").objectStore("recuerdos").getAll();
    rq.onsuccess = () => resolve(rq.result); rq.onerror = () => reject(rq.error);
  });
}
async function idbAdd(rec) {
  const db = await idbOpen();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("recuerdos", "readwrite");
    tx.objectStore("recuerdos").add(rec);
    tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error);
  });
}
async function idbDelete(id) {
  const db = await idbOpen();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("recuerdos", "readwrite");
    tx.objectStore("recuerdos").delete(id);
    tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error);
  });
}

function resizeImage(file, max = 1100) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(img.src);
      resolve(canvas.toDataURL("image/jpeg", 0.78));
    };
    img.onerror = () => { URL.revokeObjectURL(img.src); reject(new Error("no se pudo leer la imagen")); };
    img.src = URL.createObjectURL(file);
  });
}

const rotations = ["rotate-left", "rotate-right", "rotate-slight"];
const scrapbook = document.getElementById("scrapbook");
const SEEDS = [
  { photo: null, tone: "", symbol: "✧", label: "FOTO 01", note: "Un recuerdo que siempre quiero guardar." },
  { photo: null, tone: "photo-lilac", symbol: "♥", label: "FOTO 02", note: "De esos momentos que se quedan contigo." },
  { photo: null, tone: "photo-gold", symbol: "☼", label: "FOTO 03", note: "Una página más de nuestra historia." },
  { photo: null, tone: "photo-blue", symbol: "☾", label: "FOTO 04", note: "Y todavía quedan recuerdos por crear." }
];
async function idbPut(rec) {
  const db = await idbOpen();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("recuerdos", "readwrite");
    tx.objectStore("recuerdos").put(rec);
    tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error);
  });
}
function buildMemoryCard(rec, index) {
  const card = document.createElement("article");
  card.className = `photo-note ${rotations[index % rotations.length]}`;

  let media;
  if (rec.photo) {
    media = document.createElement("img");
    media.className = "memory-photo"; media.src = rec.photo; media.alt = "Recuerdo";
  } else {
    media = document.createElement("div");
    media.className = `photo-placeholder ${rec.tone || ""}`.trim();
    const span = document.createElement("span"); span.textContent = rec.symbol || "✧";
    const small = document.createElement("small"); small.textContent = rec.label || "RECUERDO";
    media.append(span, small);
  }

  const note = document.createElement("p");
  note.className = "memory-note"; note.dataset.ph = "Toca para escribir una nota…";
  note.contentEditable = "true"; note.textContent = rec.note || "";
  note.addEventListener("blur", async () => {
    const text = note.textContent.trim();
    if (text === rec.note) return;
    rec.note = text;
    try { await idbPut(rec); toast("Nota guardada ♥"); } catch { }
  });

  const actions = document.createElement("div");
  actions.className = "memory-actions";

  const edit = document.createElement("button");
  edit.className = "memory-btn"; edit.type = "button"; edit.textContent = "✎";
  edit.title = "Editar la nota"; edit.setAttribute("aria-label", "Editar la nota");
  edit.addEventListener("click", () => {
    note.focus();
    const range = document.createRange();
    range.selectNodeContents(note); range.collapse(false);
    const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
  });

  const replace = document.createElement("button");
  replace.className = "memory-btn"; replace.type = "button"; replace.textContent = "↻";
  replace.title = "Cambiar la foto"; replace.setAttribute("aria-label", "Cambiar la foto");
  replace.addEventListener("click", () => {
    memoryMode = "replace";
    replaceTarget = { rec, card, index };
    memoryInput.click();
  });

  const del = document.createElement("button");
  del.className = "memory-btn memory-btn-danger"; del.type = "button"; del.textContent = "✕";
  del.title = "Borrar recuerdo"; del.setAttribute("aria-label", "Borrar recuerdo");
  del.addEventListener("click", async () => {
    if (!confirm("¿Borrar este recuerdo? No se puede deshacer.")) return;
    try { await idbDelete(rec.id); card.remove(); toast("Recuerdo borrado"); } catch { }
  });

  actions.append(edit, replace, del);
  card.append(actions, media, note);
  card._rec = rec;
  return card;
}
function renderMemory(rec, index) {
  scrapbook.appendChild(buildMemoryCard(rec, index));
}
async function loadMemories() {
  try {
    let all = await idbGetAll();
    if (!all.length) {
      for (const seed of SEEDS) await idbAdd({ ...seed });
      all = await idbGetAll();
    }
    all.forEach((rec, i) => renderMemory(rec, i));
  } catch { /* indexedDB no disponible */ }
}
loadMemories();

const memoryInput = document.getElementById("memory-input");
let memoryMode = "create";
let replaceTarget = null;
document.getElementById("add-memory").addEventListener("click", () => {
  memoryMode = "create"; replaceTarget = null; memoryInput.click();
});
memoryInput.addEventListener("change", async () => {
  const files = [...memoryInput.files];
  memoryInput.value = "";
  if (memoryMode === "replace" && replaceTarget && files[0]) {
    try {
      const photo = await resizeImage(files[0]);
      replaceTarget.rec.photo = photo;
      replaceTarget.card.replaceWith(buildMemoryCard(replaceTarget.rec, replaceTarget.index));
      await idbPut(replaceTarget.rec);
      toast("Foto actualizada ♥");
    } catch { }
    memoryMode = "create"; replaceTarget = null;
    return;
  }
  for (const file of files) {
    try {
      const photo = await resizeImage(file);
      const rec = { photo, note: "" };
      const db = await idbOpen();
      rec.id = await new Promise((resolve, reject) => {
        const tx = db.transaction("recuerdos", "readwrite");
        const rq = tx.objectStore("recuerdos").add(rec);
        rq.onsuccess = () => resolve(rq.result);
        tx.onerror = () => reject(tx.error);
      });
      renderMemory(rec, scrapbook.querySelectorAll(".photo-note").length);
      toast("Recuerdo guardado ♥");
    } catch { }
  }
});

function heartBurst() {
  for (let i = 0; i < 26; i++) {
    const h = document.createElement("span");
    h.className = "burst-heart";
    h.textContent = petalGlyphs[i % petalGlyphs.length];
    h.style.fontSize = `${11 + Math.random() * 14}px`;
    const angle = Math.random() * Math.PI * 2;
    const dist = 90 + Math.random() * 240;
    h.style.setProperty("--bx", `${Math.cos(angle) * dist}px`);
    h.style.setProperty("--by", `${Math.sin(angle) * dist}px`);
    h.style.setProperty("--br", `${Math.random() * 360}deg`);
    document.body.appendChild(h);
    setTimeout(() => h.remove(), 1700);
  }
}

initBook(document.getElementById("book-canvas"));
cakeApi = initCake(document.getElementById("cake-canvas"));
document.getElementById("blow-candles").addEventListener("click", (e) => {
  cakeApi.blow();
  e.currentTarget.disabled = true;
  playPuff();
  const wish = document.getElementById("wish-message");
  wish.textContent = "Que todos tus deseos se cumplan.";
  wish.classList.remove("pop"); void wish.offsetWidth; wish.classList.add("pop");
  heartBurst();
});
