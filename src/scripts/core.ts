import "./pencil.ts";

// Loaded on every page from BaseLayout. Kept small on purpose: no GSAP or
// Lenis here, so the case study page doesn't pay for them.

// 1. Scroll reveal. Elements with .reveal fade in once, then stay visible.
const revealEls = document.querySelectorAll<HTMLElement>(".reveal");
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    },
    { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
  );
  revealEls.forEach((el) => revealObserver.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("visible"));
}

// 2. Footer: year and local time (kept from the old footer).
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());
const timeEl = document.getElementById("local-time");
if (timeEl) {
  const updateTime = () => {
    const now = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: "America/Vancouver",
    }).format(new Date());
    timeEl.textContent = `It's ${now} where I am, in Vancouver`;
  };
  updateTime();
  setInterval(updateTime, 30000);
}

// 3. Back to top: appears after a screen of scrolling, scrolls smoothly up.
const toTop = document.querySelector<HTMLButtonElement>("[data-to-top]");
if (toTop) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const update = () => toTop.classList.toggle("is-visible", window.scrollY > window.innerHeight * 0.8);
  window.addEventListener("scroll", update, { passive: true });
  update();
  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }));
}
