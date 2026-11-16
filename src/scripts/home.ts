import { activeSection } from "../lib/stores";
import { scrollToTarget, refresh } from "../lib/scroll";
import { site } from "../content/site";
import "./loader.ts";
import "./hero.ts";
import "./thread.ts";

// Home page only. Lenis and ScrollTrigger come in through lib/scroll, so they
// ship here and nowhere else.

// 1. Same-page links (/#work, #journal) scroll through Lenis.
document.addEventListener("click", (event) => {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey) return;
  const link = (event.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
  if (!link) return;
  const url = new URL(link.href, location.href);
  if (url.origin !== location.origin || url.pathname !== location.pathname || !url.hash) return;
  const target = document.querySelector<HTMLElement>(url.hash);
  if (!target) return;
  event.preventDefault();
  history.pushState(null, "", url.hash);
  scrollToTarget(target);
});

// 2. Active section: the section crossing the middle of the viewport.
const sectionEls = site.sections
  .map((s) => document.getElementById(s.id))
  .filter((el): el is HTMLElement => el !== null);
if ("IntersectionObserver" in window && sectionEls.length) {
  const activeObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) activeSection.set(entry.target.id);
      }
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sectionEls.forEach((el) => activeObserver.observe(el));
}

// 3. Divider tabs: the tab for the section in view sticks out (data-active).
activeSection.subscribe((id) => {
  document.querySelectorAll<HTMLElement>("[data-tab]").forEach((tab) => {
    tab.dataset.active = String(tab.dataset.tab === id);
  });
});

// 4. Hand-drawn doodles draw themselves in when they reach the viewport.
const doodles = document.querySelectorAll<SVGPathElement>(".doodle");
if ("IntersectionObserver" in window) {
  const doodleObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("drawn");
        doodleObserver.unobserve(entry.target);
      }
    },
    { threshold: 0.4 }
  );
  doodles.forEach((d) => doodleObserver.observe(d));
} else {
  doodles.forEach((d) => d.classList.add("drawn"));
}

// 5. Images that load late change page height; keep ScrollTrigger honest.
window.addEventListener("load", () => refresh());
