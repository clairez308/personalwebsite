import { ScrollTrigger } from "gsap/ScrollTrigger";
import { activeProject, deckPinned } from "../lib/stores";
import { scrollToY } from "../lib/scroll";

// Projects: the index (left) and the flip-card deck (right).
// Desktop: the section pins and scroll steps through the projects one by one.
// Mobile: no pinning; the cards swipe horizontally and the index follows.

const section = document.getElementById("work");
const tocLinks = Array.from(section?.querySelectorAll<HTMLAnchorElement>("[data-toc]") ?? []);
const deck = section?.querySelector<HTMLElement>(".deck");
const count = tocLinks.length;

if (section && deck && count) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const desktop = window.matchMedia("(min-width: 1024px)").matches;
  const pinned = desktop && !reduceMotion;
  const clamp = (n: number) => Math.min(count - 1, Math.max(0, n));

  let trigger: ScrollTrigger | undefined;

  if (pinned) {
    deckPinned.set(true);
    trigger = ScrollTrigger.create({
      trigger: section,
      start: "top top+=72",
      end: `+=${count * 60}%`,
      pin: true,
      scrub: 0.5,
      onUpdate: (self) => activeProject.set(clamp(Math.floor(self.progress * count))),
    });
  }

  // Index links: on desktop, jump to that project's step; on mobile, scroll the row.
  tocLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const i = clamp(Number(link.dataset.index));
      if (trigger) {
        const y = trigger.start + (trigger.end - trigger.start) * ((i + 0.5) / count);
        scrollToY(y);
      } else {
        document
          .getElementById(`work-${link.dataset.toc}`)
          ?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
      activeProject.set(i);
    });
  });

  // The index mirrors the active project.
  activeProject.subscribe((i) => {
    tocLinks.forEach((link) => {
      link.dataset.active = String(Number(link.dataset.index) === i);
    });
  });

  // Mobile: the card that's mostly in view in the swipe row becomes active.
  if (!pinned && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            activeProject.set(clamp(Number((entry.target as HTMLElement).dataset.index)));
          }
        }
      },
      { root: deck, threshold: 0.6 }
    );
    deck.querySelectorAll<HTMLElement>(".deck-item").forEach((item) => observer.observe(item));
  }
}
