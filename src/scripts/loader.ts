import { gsap } from "gsap";

// Washi-tape loader: tapes slap on, the name writes itself, the tapes peel
// away. Never blocks content for more than ~2.5s, and reduced motion gets a
// plain fade. Runs once per session (sessionStorage, try/catch).

const SEEN_KEY = "bj-loader-seen";
const el = document.getElementById("loader");

if (el) {
  let seen = false;
  try {
    seen = sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {}

  const finish = () => {
    el.hidden = true;
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {}
  };

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (seen) {
    finish();
  } else if (reduceMotion) {
    gsap.to(el, { opacity: 0, duration: 0.3, ease: "none", onComplete: finish });
  } else {
    const tapes = gsap.utils.toArray<HTMLElement>(".tape", el);
    const name = el.querySelector<HTMLElement>(".loader-name");

    const tl = gsap.timeline({ onComplete: finish });

    // 1. Tapes slap on diagonally, one after another, with an overshoot.
    tapes.forEach((tape, i) => {
      const r = parseFloat(getComputedStyle(tape).getPropertyValue("--r")) || 0;
      tl.fromTo(
        tape,
        { xPercent: i % 2 ? 120 : -120, rotate: r - 20, opacity: 0 },
        { xPercent: 0, rotate: r, opacity: 1, duration: 0.45, ease: "back.out(1.6)" },
        i * 0.3
      );
    });

    // 2. The name writes itself on top of the collage (clip wipe).
    if (name) {
      tl.fromTo(
        name,
        { clipPath: "inset(0 100% 0 0)", opacity: 1 },
        { clipPath: "inset(0 0% 0 0)", duration: 0.7, ease: "power1.inOut" },
        "+=0.15"
      );
    }

    // 3. Tapes peel off one by one, from the corner, like real tape.
    tl.to(
      tapes,
      {
        xPercent: 140,
        yPercent: -120,
        rotate: (i: number) => 30 + i * 6,
        duration: 0.55,
        ease: "power2.in",
        stagger: 0.07,
      },
      "+=0.2"
    ).to(el, { autoAlpha: 0, duration: 0.25, ease: "none" }, "-=0.1");

    // Hard cap: never hold the page past 2.5s, whatever the assets are doing.
    const cap = window.setTimeout(() => {
      if (tl.isActive() || tl.progress() < 1) tl.progress(1);
    }, 2500);
    tl.eventCallback("onComplete", () => {
      window.clearTimeout(cap);
      finish();
    });
  }
}
