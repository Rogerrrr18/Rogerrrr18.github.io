/* Minimal interactions for Roger Yang portfolio */

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* --- Mega name: auto-fit to viewport width --- */

const megaLetters = document.querySelectorAll(".mega-letter");
const megaName = document.querySelector(".mega-name");

function fitMegaName() {
  if (!megaName) return;
  const vw = window.innerWidth;
  // Start with a large size, measure, then scale
  let size = 200;
  megaName.style.fontSize = size + "px";
  let width = megaName.scrollWidth;
  // Scale so text fills the full viewport width
  const ratio = vw / width;
  megaName.style.fontSize = (size * ratio) + "px";
}

fitMegaName();
window.addEventListener("resize", fitMegaName);

if (!prefersReducedMotion && megaName) {
  // Mouse proximity: letters react to cursor distance
  megaName.addEventListener("pointermove", (e) => {
    const rect = megaName.getBoundingClientRect();

    megaLetters.forEach((letter) => {
      const letterRect = letter.getBoundingClientRect();
      const letterCenterX = letterRect.left + letterRect.width / 2;
      const letterCenterY = letterRect.top + letterRect.height / 2;
      const dx = e.clientX - letterCenterX;
      const dy = e.clientY - letterCenterY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = 300;
      const intensity = Math.max(0, 1 - dist / maxDist);

      // Subtle shift away from cursor + scale
      const pushX = -dx * intensity * 0.04;
      const pushY = -dy * intensity * 0.06;
      const scale = 1 + intensity * 0.05;
      const skew = dx * intensity * 0.008;

      letter.style.transform = `translate(${pushX}px, ${pushY}px) scale(${scale}) skewX(${skew}deg)`;
      letter.style.opacity = 1 - intensity * 0.15;
    });
  });

  megaName.addEventListener("pointerleave", () => {
    megaLetters.forEach((letter) => {
      letter.style.transform = "translate(0, 0) scale(1) skewX(0deg)";
      letter.style.opacity = 1;
    });
  });

  // Scroll parallax: letters spread apart on scroll
  let scrollRaf = null;
  const onScrollMega = () => {
    const scrollY = window.scrollY;
    const spread = Math.min(scrollY * 0.02, 8);

    megaLetters.forEach((letter, i) => {
      const center = (megaLetters.length - 1) / 2;
      const offset = (i - center) * spread;
      const currentTransform = letter.style.transform || "";
      // Only apply if no pointer interaction is active
      if (!currentTransform.includes("scale(1.")) {
        letter.style.transform = `translateX(${offset}px) translateY(${scrollY * 0.08}px)`;
        letter.style.opacity = Math.max(0.3, 1 - scrollY * 0.002);
      }
    });
    scrollRaf = null;
  };

  window.addEventListener("scroll", () => {
    if (!scrollRaf) scrollRaf = requestAnimationFrame(onScrollMega);
  }, { passive: true });
}

/* --- Cursor glow follow --- */

const cursorGlow = document.querySelector(".cursor-glow");

if (!prefersReducedMotion && cursorGlow) {
  let pointerX = window.innerWidth / 2;
  let pointerY = window.innerHeight / 2;
  let rafId = null;

  const paintGlow = () => {
    cursorGlow.style.left = `${pointerX}px`;
    cursorGlow.style.top = `${pointerY}px`;
    rafId = null;
  };

  window.addEventListener(
    "pointermove",
    (e) => {
      pointerX = e.clientX;
      pointerY = e.clientY;
      if (!rafId) rafId = requestAnimationFrame(paintGlow);
    },
    { passive: true }
  );
}

/* --- Scroll-based reveal --- */

const revealTargets = document.querySelectorAll(
  ".section-header, .work-item, .about-content, .belief-block, .gallery-grid, .film-row, .timeline-entry, .contact-link, .hero-intro, .hero-nav, .note-block, .research-card, .featured-paper, .paper-row, .perspective-grid article"
);

if (!prefersReducedMotion) {
  revealTargets.forEach((el) => el.classList.add("reveal-up"));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealTargets.forEach((el) => observer.observe(el));
} else {
  revealTargets.forEach((el) => el.classList.add("visible"));
}

/* --- Active nav highlight --- */

const navLinks = document.querySelectorAll(".hero-nav a");
const sections = Array.from(document.querySelectorAll("main .section[id], .hero-banner[id]"));

const updateActiveNav = () => {
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  const threshold = scrollTop + window.innerHeight * 0.35;
  let current = "home";

  for (const section of sections) {
    if (section.offsetTop <= threshold) {
      current = section.id;
    }
  }

  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (href) {
      link.classList.toggle("active", href === `#${current}`);
    }
  });
};

window.addEventListener("scroll", updateActiveNav, { passive: true });
updateActiveNav();

/* --- Lightbox --- */

const lightbox = document.querySelector("#lightbox");
const lightboxImage = document.querySelector(".lightbox-image");
const lightboxClose = document.querySelector(".lightbox-close");
const galleryImages = document.querySelectorAll(".gallery-item img, .film-card img");

if (lightbox && lightboxImage) {
  galleryImages.forEach((img) => {
    img.addEventListener("click", () => {
      lightboxImage.src = img.src;
      lightboxImage.alt = img.alt || "";
      lightbox.showModal();
    });
  });

  if (lightboxClose) {
    lightboxClose.addEventListener("click", () => lightbox.close());
  }

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) {
      lightbox.close();
    }
  });
}
