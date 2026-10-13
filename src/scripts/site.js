// Light / dark switch. The head script has already set data-theme before
// first paint; this wires up the button and remembers the choice. Until the
// visitor picks one, the page follows their system setting.
const themeToggle = document.getElementById("theme-toggle");
if (themeToggle) {
  const root = document.documentElement;
  const isDark = () => root.dataset.theme === "dark";
  const syncToggle = () => themeToggle.setAttribute("aria-checked", String(isDark()));
  syncToggle();

  // Grow the new theme out from the button when the browser supports View
  // Transitions. Otherwise, or with reduced motion, it just swaps.
  const setTheme = (next, x, y) => {
    const apply = () => {
      root.dataset.theme = next;
      syncToggle();
    };
    if (!document.startViewTransition || reduceMotion) {
      apply();
      return;
    }
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const transition = document.startViewTransition(apply);
    transition.ready.then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 650, easing: "cubic-bezier(0.4, 0, 0.2, 1)", pseudoElement: "::view-transition-new(root)" }
      );
    });
  };

  themeToggle.addEventListener("click", () => {
    const next = isDark() ? "light" : "dark";
    const rect = themeToggle.getBoundingClientRect();
    setTheme(next, rect.left + rect.width / 2, rect.top + rect.height / 2);
    try {
      localStorage.setItem("theme", next);
    } catch (e) {}
  });

  // No saved choice yet: keep up with the system setting as it changes.
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    let saved = null;
    try {
      saved = localStorage.getItem("theme");
    } catch (err) {}
    if (!saved) {
      root.dataset.theme = e.matches ? "dark" : "light";
      syncToggle();
    }
  });
}

// Footer year
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// A little proof someone's actually running this thing
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

// Type out the hero greeting. The full text is already in the markup so it
// reads fine with JS off or on first paint; this just clears and retypes it.
// Runs after the boot sequence (below) finishes, if there is one.
const typedEl = document.getElementById("hero-typed");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function startHeroTyping(delay = 300) {
  if (!typedEl || reduceMotion) return;
  const fullText = typedEl.textContent;
  typedEl.textContent = "";
  let i = 0;
  const typeNext = () => {
    typedEl.textContent = fullText.slice(0, i);
    i++;
    if (i <= fullText.length) setTimeout(typeNext, 55);
  };
  setTimeout(typeNext, delay);
}

// Boot sequence: a terminal-style boot log that plays once per browser
// session before the hero appears. Visible-by-default in CSS so there's no
// flash-of-hero if this script is slow to run; this only ever hides it.
const bootOverlay = document.getElementById("boot-overlay");
if (bootOverlay) {
  const alreadyBooted = sessionStorage.getItem("booted") === "1";

  const dismissBoot = () => {
    bootOverlay.classList.add("hidden");
    setTimeout(() => bootOverlay.remove(), 400);
  };

  if (reduceMotion || alreadyBooted) {
    dismissBoot();
    startHeroTyping(100);
  } else {
    sessionStorage.setItem("booted", "1");
    const lines = Array.from(bootOverlay.querySelectorAll(".boot-line"));
    const cursor = document.createElement("span");
    cursor.className = "boot-cursor";

    const typeLine = (line, onDone) => {
      const fullText = line.dataset.text;
      const textEl = line.querySelector(".boot-text");
      line.appendChild(cursor);
      let i = 0;
      const step = () => {
        textEl.textContent = fullText.slice(0, i);
        i++;
        if (i <= fullText.length) setTimeout(step, 18);
        else onDone();
      };
      step();
    };

    const runLines = (index) => {
      if (index >= lines.length) {
        cursor.remove();
        setTimeout(dismissBoot, 350);
        setTimeout(() => startHeroTyping(0), 500);
        return;
      }
      typeLine(lines[index], () => setTimeout(() => runLines(index + 1), 180));
    };

    setTimeout(() => runLines(0), 200);
  }
} else {
  startHeroTyping(300);
}

// Scroll-reveal
const revealEls = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
  );

  revealEls.forEach((el) => observer.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("visible"));
}

// Reading-progress line at the top of the page
const progressEl = document.querySelector(".scroll-progress");
if (progressEl) {
  let ticking = false;
  const updateProgress = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressEl.style.width = `${pct}%`;
    ticking = false;
  };
  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(updateProgress);
      ticking = true;
    }
  });
  updateProgress();
}

// Nav picks up a background and shadow once you've actually scrolled past it
const navEl = document.querySelector(".site-nav");
if (navEl) {
  const updateNav = () => {
    navEl.classList.toggle("scrolled", window.scrollY > 8);
  };
  window.addEventListener("scroll", updateNav, { passive: true });
  updateNav();
}

// Back-to-top button, shows up once you've scrolled far enough that
// getting back to the nav links isn't a quick scroll anymore.
const backToTopEl = document.getElementById("back-to-top");
if (backToTopEl) {
  const updateBackToTop = () => {
    backToTopEl.classList.toggle("visible", window.scrollY > 600);
  };
  window.addEventListener("scroll", updateBackToTop, { passive: true });
  updateBackToTop();

  backToTopEl.addEventListener("click", () => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });
}

// Field Notes: "see more" only shows up if the text is actually clamped.
document.querySelectorAll(".note-toggle").forEach((btn) => {
  const body = btn.previousElementSibling;
  if (!body) return;
  requestAnimationFrame(() => {
    if (body.scrollHeight <= body.clientHeight + 2) {
      btn.hidden = true;
      return;
    }
    btn.addEventListener("click", () => {
      const expanded = body.classList.toggle("expanded");
      btn.textContent = expanded ? "See less" : "See more";
    });
  });
});

// Each post's photos live in their own inline carousel, clicked through
// with the arrows or dots rather than opening a separate modal.
document.querySelectorAll(".note-carousel").forEach((carousel) => {
  const track = carousel.querySelector(".note-carousel-track");
  const slides = carousel.querySelectorAll(".note-carousel-slide");
  const dots = carousel.querySelectorAll(".note-carousel-dot");
  const prevBtn = carousel.querySelector(".note-carousel-prev");
  const nextBtn = carousel.querySelector(".note-carousel-next");
  let index = 0;

  const goTo = (i) => {
    index = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((dot, di) => dot.classList.toggle("active", di === index));
  };

  prevBtn?.addEventListener("click", () => goTo(index - 1));
  nextBtn?.addEventListener("click", () => goTo(index + 1));
  dots.forEach((dot, di) => dot.addEventListener("click", () => goTo(di)));
});

// Everything below is cursor-driven, so it only makes sense on a device
// with an actual pointer and someone who isn't asking for less motion.
const wantsMotion =
  window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (wantsMotion) {
  // Cursor-following glow on the dark sections
  document.querySelectorAll(".spotlight").forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty("--mx", `${x}%`);
      el.style.setProperty("--my", `${y}%`);
    });
  });

  // Buttons that lean toward the cursor.
  // The rect is cached on mouseenter, not re-measured on every move, because
  // the element itself is what's moving. Re-querying getBoundingClientRect()
  // mid-drag makes the hitbox slide out from under the cursor and misfires
  // mouseleave before you ever reach the edge.
  document.querySelectorAll(".magnetic").forEach((el) => {
    const strength = 0.3;
    let rect = null;
    el.addEventListener("mouseenter", () => {
      rect = el.getBoundingClientRect();
      el.classList.remove("magnetic-reset");
    });
    el.addEventListener("mousemove", (e) => {
      if (!rect) rect = el.getBoundingClientRect();
      const dx = (e.clientX - rect.left - rect.width / 2) * strength;
      const dy = (e.clientY - rect.top - rect.height / 2) * strength;
      el.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    el.addEventListener("mouseleave", () => {
      el.classList.add("magnetic-reset");
      el.style.transform = "translate(0, 0)";
      rect = null;
    });
  });

  // Cards that tilt toward wherever the cursor is. Same cached-rect approach.
  document.querySelectorAll(".tilt-card").forEach((el) => {
    const maxTilt = 6;
    let rect = null;
    el.addEventListener("mouseenter", () => {
      rect = el.getBoundingClientRect();
      el.classList.remove("tilt-reset");
    });
    el.addEventListener("mousemove", (e) => {
      if (!rect) rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      const rx = (-py * maxTilt).toFixed(2);
      const ry = (px * maxTilt).toFixed(2);
      el.style.transform = `perspective(1200px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-3px) translateZ(4px)`;
    });
    el.addEventListener("mouseleave", () => {
      el.classList.add("tilt-reset");
      el.style.transform = "perspective(1200px) rotateX(0) rotateY(0) translateY(0) translateZ(0)";
      rect = null;
    });
  });

  // Hero parallax: the blobs drift opposite the cursor, the photo drifts
  // toward it, so the two layers read as sitting at different depths.
  const heroEl = document.querySelector(".hero");
  const heroBlobs = document.querySelector(".hero-blobs");
  const heroPhoto = document.querySelector(".hero-photo-parallax");
  if (heroEl && (heroBlobs || heroPhoto)) {
    heroEl.addEventListener("mousemove", (e) => {
      const rect = heroEl.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      if (heroBlobs) heroBlobs.style.transform = `translate(${px * -50}px, ${py * -35}px)`;
      if (heroPhoto) heroPhoto.style.transform = `translate(${px * 16}px, ${py * 12}px)`;
    });
    heroEl.addEventListener("mouseleave", () => {
      if (heroBlobs) heroBlobs.style.transform = "translate(0, 0)";
      if (heroPhoto) heroPhoto.style.transform = "translate(0, 0)";
    });
  }
}

// For anyone who checks the console before the About section
console.log(
  "%cHey.",
  "font-family: Georgia, serif; font-style: italic; font-size: 20px; color: #3730a3;"
);
console.log(
  "%cI wrote every line of copy and CSS on this site myself, so if you're poking around in here we probably think alike. Say hi: clairezhang838@gmail.com",
  "font-family: sans-serif; font-size: 12px; color: #58585f;"
);
