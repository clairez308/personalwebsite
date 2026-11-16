import { ScrollTrigger } from "gsap/ScrollTrigger";
import { site } from "../content/site";

// The thread. Builds one SVG path through the page's sections (a winding
// S-curve on desktop, a gentle squiggle down the left edge on mobile), places
// the numbered stops, and draws the line and the paper plane with scroll.

const root = document.getElementById("thread");
const main = document.querySelector<HTMLElement>("main");
const svg = root?.querySelector<SVGSVGElement>(".thread-svg");
const path = document.getElementById("thread-path") as SVGPathElement | null;
const plane = root?.querySelector<SVGElement>(".thread-plane");
const startLabel = root?.querySelector<HTMLElement>("[data-thread-start]");

if (root && main && svg && path && plane) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hero = document.getElementById("top");
  const sections = site.sections
    .map((s) => document.getElementById(s.id))
    .filter((el): el is HTMLElement => el !== null);

  let length = 0;
  let progress = 0;

  type Pt = { x: number; y: number };

  // Where things sit on the thread. Pinned sections wrap themselves in a
  // spacer, so measure the spacer when there is one.
  const topOf = (el: HTMLElement) => (el.closest(".pin-spacer") as HTMLElement | null ?? el).offsetTop;

  function layout(): void {
    const W = main!.clientWidth;
    const H = main!.scrollHeight;
    svg!.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg!.style.height = `${H}px`;

    const desktop = W >= 768;
    const heroBottom = hero ? topOf(hero) + hero.offsetHeight : 0;
    const start: Pt = { x: W / 2, y: heroBottom - 24 };
    const end: Pt = { x: W / 2, y: H - 48 };

    // Stops alternate sides on desktop; the whole edge on mobile.
    const stops: Pt[] = sections.map((el, i) => {
      const y = topOf(el) + 110;
      const x = desktop ? (i % 2 === 0 ? W * 0.07 : W * 0.93) : W * 0.09;
      return { x, y };
    });

    const targets = [...stops, end];
    let d = `M ${start.x} ${start.y}`;
    let prev = start;
    targets.forEach((p, i) => {
      const dy = p.y - prev.y;
      if (desktop) {
        d += ` C ${prev.x} ${prev.y + dy * 0.5}, ${p.x} ${p.y - dy * 0.5}, ${p.x} ${p.y}`;
      } else {
        const wig = (i % 2 === 0 ? 1 : -1) * W * 0.04;
        d += ` C ${prev.x + wig} ${prev.y + dy * 0.35}, ${p.x - wig} ${p.y - dy * 0.35}, ${p.x} ${p.y}`;
      }
      prev = p;
    });
    path!.setAttribute("d", d);
    length = path!.getTotalLength();
    path!.style.strokeDasharray = `${length}`;

    // Stops and labels.
    root!.querySelectorAll<HTMLElement>(".thread-stop").forEach((node, i) => {
      const p = stops[i];
      if (!p) return;
      node.style.transform = `translate(${p.x}px, ${p.y}px)`;
      const flip = desktop && i % 2 === 1;
      flip ? node.setAttribute("data-flip", "") : node.removeAttribute("data-flip");
    });
    if (startLabel) {
      startLabel.style.transform = `translate(${start.x}px, ${start.y + 16}px) translateX(-50%)`;
    }

    draw(progress);
  }

  // Draw the line and move the plane to the end of the drawn part.
  function draw(p: number): void {
    progress = Math.min(1, Math.max(0, p));
    if (!length) return;
    path!.style.strokeDashoffset = `${length * (1 - progress)}`;
    const at = Math.max(0.01, length * progress);
    const pt = path!.getPointAtLength(at);
    const ahead = path!.getPointAtLength(Math.min(length, at + 1));
    const angle = (Math.atan2(ahead.y - pt.y, ahead.x - pt.x) * 180) / Math.PI;
    plane!.style.transform = `translate(${pt.x - 14}px, ${pt.y - 14}px) rotate(${angle}deg)`;
  }

  layout();

  if (reduceMotion) {
    draw(1);
  } else {
    ScrollTrigger.create({
      trigger: main,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.4,
      onUpdate: (self) => draw(self.progress),
    });
  }

  // Rebuild after every ScrollTrigger refresh (resize, pins, late images).
  ScrollTrigger.addEventListener("refresh", layout);

  // Sections that change height (islands hydrating, images loading) need a refresh.
  new ResizeObserver(() => ScrollTrigger.refresh()).observe(main);
}
