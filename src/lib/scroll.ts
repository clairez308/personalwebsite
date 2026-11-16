import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Shared scroll core. Lenis drives smooth scrolling and GSAP's ticker drives
// both Lenis and ScrollTrigger, so pinned/scrubbed timelines stay in sync.
// Anything else that needs the scroll instance imports it from here.

gsap.registerPlugin(ScrollTrigger);

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const lenis: Lenis | null = reduceMotion
  ? null
  : new Lenis({ duration: 1.1, smoothWheel: true });

if (lenis) {
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

// Call after anything changes page height (islands hydrating, images loading).
export function refresh(): void {
  ScrollTrigger.refresh();
}

// Smooth-scroll to a same-page target, or fall back to native scrolling.
export function scrollToTarget(target: string | HTMLElement): void {
  if (lenis) lenis.scrollTo(target, { offset: -16 });
  else if (typeof target === "string") document.querySelector(target)?.scrollIntoView();
  else target.scrollIntoView();
}

// Scroll to an absolute page offset, through Lenis when it's running.
export function scrollToY(y: number): void {
  if (lenis) lenis.scrollTo(y);
  else window.scrollTo({ top: y, behavior: "smooth" });
}
