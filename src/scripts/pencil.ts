// The pencil cursor, the hero ink trail, the Shift crosshair and the plain-cursor
// toggle. Desktop with a fine pointer only. Touch keeps the native behaviour.
// Loaded from core.ts, so every page gets the same cursor.

const STORAGE_KEY = "bj-plain-cursor";
const root = document.documentElement;
const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function plainChosen(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function setPlain(on: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, on ? "1" : "0");
  } catch {
    // Storage blocked: the choice lasts for this page only.
  }
  document.querySelectorAll<HTMLElement>("[data-plain-cursor-toggle]").forEach((btn) => {
    btn.setAttribute("aria-pressed", String(on));
    btn.textContent = on ? "plain cursor: on" : "plain cursor: off";
  });
}

// The "plain cursor" toggle (footer).
document.addEventListener("click", (event) => {
  const btn = (event.target as Element | null)?.closest?.("[data-plain-cursor-toggle]");
  if (!btn) return;
  const on = !plainChosen();
  setPlain(on);
  if (on) disable();
  else enable();
});

// Mark the toggle as it currently is, on every page.
setPlain(plainChosen());

// --- Pencil -----------------------------------------------------------------

const pencil = document.createElement("div");
pencil.className = "pencil";
pencil.setAttribute("aria-hidden", "true");
pencil.innerHTML = `
  <svg class="pencil-art" viewBox="0 0 40 40" width="28" height="28">
    <g class="pencil-body">
      <polygon points="0,0 9,3 3,9" fill="#2b2420" />
      <polygon points="9,3 30,4 34,8 31,13 9,12" fill="#f5d867" stroke="#2b2420" stroke-width="1.2" stroke-linejoin="round" />
      <rect x="30" y="4" width="6" height="9" rx="1" fill="#e2483d" stroke="#2b2420" stroke-width="1.2" />
    </g>
    <g class="pencil-nib">
      <circle cx="14" cy="14" r="4" fill="none" stroke="#2b2420" stroke-width="1.4" />
      <circle cx="14" cy="14" r="1.6" fill="#e2483d" />
    </g>
    <g class="pencil-scribble">
      <path d="M-4 -2 C 6 -10, 14 6, 22 -4 S 40 -6, 42 4" fill="none" stroke="#2b2420" stroke-width="1.2" />
    </g>
  </svg>
  <span class="pencil-label font-hand"></span>
`;

const trailCanvas = document.createElement("canvas");
trailCanvas.className = "ink-trail";
trailCanvas.setAttribute("aria-hidden", "true");

const crosshair = document.createElement("div");
crosshair.className = "crosshair";
crosshair.setAttribute("aria-hidden", "true");
crosshair.innerHTML = `<span class="ch-x"></span><span class="ch-y"></span><span class="ch-label font-mono"></span>`;

const labels: Record<string, string> = {
  link: "",
  text: "",
  flip: "flip ↻",
  envelope: "open ✉",
  drag: "",
  page: "turn ↷",
  nib: "",
  shift: "",
};

let enabled = false;
let target = { x: -100, y: -100 };
let pos = { x: -100, y: -100 };
let lastX = -100;
let tilt = -35;
let raf = 0;
let trail: { x: number; y: number; t: number }[] = [];
let trailRaf = 0;

function context(el: Element): string {
  const cursorEl = el.closest<HTMLElement>("[data-cursor]");
  if (cursorEl && cursorEl.dataset.cursor) return cursorEl.dataset.cursor;
  if (el.closest(".scrap-board[data-mode='pen']")) return "nib";
  if (el.closest("input, textarea, select, [contenteditable='true']")) return "text";
  if (el.closest(".postcard-sticky, .deck-item")) return "flip";
  if (el.closest(".envelope")) return "envelope";
  if (el.closest(".hand-arrow")) return "page";
  if (el.closest(".drag, .piece")) return "drag";
  if (el.closest("a[href], button, [role='button'], [role='tab'], summary, label")) return "link";
  return "";
}

function setContext(mode: string) {
  if (pencil.dataset.mode === mode) return;
  pencil.dataset.mode = mode;
  const label = pencil.querySelector<HTMLElement>(".pencil-label");
  if (label) label.textContent = labels[mode] ?? "";
}

function frame() {
  raf = 0;
  const dx = target.x - pos.x;
  const dy = target.y - pos.y;
  pos.x += dx * 0.28;
  pos.y += dy * 0.28;
  // Tilt toward the direction of travel, a few degrees at most.
  const vx = pos.x - lastX;
  lastX = pos.x;
  tilt += (Math.max(-12, Math.min(12, vx * 0.6)) - 35 - tilt) * 0.2;
  const rotate = reduceMotion ? -35 : tilt;
  const pressed = pencil.dataset.mode === "link" ? " translateY(3px) rotate(-18deg)" : "";
  pencil.style.transform = `translate(${pos.x}px, ${pos.y}px) rotate(${rotate}deg)${pressed}`;
  raf = requestAnimationFrame(frame);
}

function onMove(event: PointerEvent) {
  target = { x: event.clientX, y: event.clientY };
  if (event.pointerType !== "mouse") return;
  if (!raf) raf = requestAnimationFrame(frame);
  setContext(context(event.target as Element));
  if (crosshairOn) moveCrosshair(event.clientX, event.clientY);
  if (trailOn) {
    trail.push({ x: event.clientX, y: event.clientY, t: performance.now() });
    if (trail.length > 28) trail.shift();
    if (!trailRaf) trailRaf = requestAnimationFrame(drawTrail);
  }
}

// --- Ink trail (hero only) ---------------------------------------------------

let trailOn = false;
let heroVisible = true;
const hero = document.getElementById("top");

function drawTrail() {
  const ctx = trailCanvas.getContext("2d");
  if (!ctx) return;
  const now = performance.now();
  trail = trail.filter((p) => now - p.t < 600);
  ctx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
  for (let i = 1; i < trail.length; i++) {
    const a = trail[i - 1];
    const b = trail[i];
    const age = (now - b.t) / 600;
    ctx.strokeStyle = i % 2 ? `rgba(43,36,32,${0.5 * (1 - age)})` : `rgba(226,72,61,${0.45 * (1 - age)})`;
    ctx.lineWidth = 1.4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
  trailRaf = trail.length ? requestAnimationFrame(drawTrail) : 0;
}

function resizeTrail() {
  trailCanvas.width = window.innerWidth;
  trailCanvas.height = window.innerHeight;
}

// --- Shift crosshair (projects) ----------------------------------------------

let crosshairOn = false;
const projects = document.getElementById("work");
let projectsVisible = false;

function moveCrosshair(x: number, y: number) {
  crosshair.style.transform = `translate(${x}px, ${y}px)`;
  const label = crosshair.querySelector<HTMLElement>(".ch-label");
  if (label) label.textContent = `${Math.round(x)}, ${Math.round(y)}`;
}

// --- Enable / disable --------------------------------------------------------

function enable() {
  if (enabled || !fine || plainChosen()) return;
  enabled = true;
  document.body.append(pencil, trailCanvas, crosshair);
  root.classList.add("has-pencil");
  resizeTrail();
  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("resize", resizeTrail);
  if (hero && !reduceMotion) {
    new IntersectionObserver((entries) => {
      heroVisible = entries[0]?.isIntersecting ?? false;
      trailOn = heroVisible;
      if (!trailOn) trail = [];
    }).observe(hero);
  }
  if (projects) {
    new IntersectionObserver((entries) => {
      projectsVisible = entries[0]?.isIntersecting ?? false;
      if (!projectsVisible) root.removeAttribute("data-shift");
    }, { threshold: 0.2 }).observe(projects);
  }
  window.addEventListener("keydown", (e) => {
    if (e.key === "Shift" && projectsVisible && !(e.target as Element).closest("input, textarea")) {
      root.dataset.shift = "1";
      crosshairOn = true;
      setContext("shift");
    }
  });
  window.addEventListener("keyup", (e) => {
    if (e.key === "Shift") {
      root.removeAttribute("data-shift");
      crosshairOn = false;
    }
  });
  raf = requestAnimationFrame(frame);
}

function disable() {
  if (!enabled) return;
  enabled = false;
  root.classList.remove("has-pencil");
  pencil.remove();
  trailCanvas.remove();
  crosshair.remove();
}

enable();
