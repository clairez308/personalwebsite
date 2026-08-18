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
