import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Hero: the pinned zoom into the thread's start, the three parallax depths,
// and a small pointer tilt on desktop. Reduced motion gets a plain fade.

const hero = document.getElementById("top");
const content = hero?.querySelector<HTMLElement>("[data-hero-content]");

if (hero && content) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const layers = gsap.utils.toArray<HTMLElement>("[data-depth]", hero);

  if (reduceMotion) {
    gsap.to(content, {
      opacity: 0.2,
      ease: "none",
      scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true },
    });
  } else {
    // Pin the hero, then zoom into the point where the thread starts while
    // the content fades. The zoom resolves into the Projects section.
    gsap
      .timeline({
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "+=150%",
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
        },
      })
      .to(content, { scale: 3.2, opacity: 0, yPercent: -8, transformOrigin: "50% 100%", ease: "power1.in" }, 0);

    // Three depths: doodles slowest, notes in the middle, the photo fastest.
    layers.forEach((layer) => {
      const depth = parseFloat(layer.dataset.depth ?? "0");
      gsap.to(layer, {
        y: () => -depth * 160,
        ease: "none",
        scrollTrigger: { trigger: hero, start: "top top", end: "+=150%", scrub: true },
      });
    });
  }

  // Pointer tilt for the photo, desktop only.
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const island = hero.querySelector<HTMLElement>(".sticker-island");
  if (fine && !reduceMotion && island) {
    const xTo = gsap.quickTo(island, "x", { duration: 0.6, ease: "power3" });
    const yTo = gsap.quickTo(island, "y", { duration: 0.6, ease: "power3" });
    hero.addEventListener("pointermove", (event) => {
      const r = hero.getBoundingClientRect();
      xTo(((event.clientX - r.left) / r.width - 0.5) * -14);
      yTo(((event.clientY - r.top) / r.height - 0.5) * -10);
    });
  }
}

ScrollTrigger.refresh();
