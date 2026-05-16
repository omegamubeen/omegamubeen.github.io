(function () {
  "use strict";

  const body = document.body;
  const topbar = document.querySelector("#topbar");
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = Array.from(document.querySelectorAll(".nav-menu a"));
  const backToTop = document.querySelector(".back-to-top");
  const revealItems = Array.from(document.querySelectorAll(".reveal"));
  const parallaxItems = Array.from(document.querySelectorAll("[data-parallax]"));
  const liveDistance = document.querySelector(".live-distance");

  if (navToggle) {
    navToggle.addEventListener("click", () => {
      const isOpen = body.classList.toggle("nav-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.innerHTML = isOpen ? '<i class="bi bi-x"></i>' : '<i class="bi bi-list"></i>';
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      body.classList.remove("nav-open");
      if (navToggle) {
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.innerHTML = '<i class="bi bi-list"></i>';
      }
    });
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.14,
    rootMargin: "0px 0px -8% 0px"
  });

  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index % 6, 5) * 70}ms`;
    revealObserver.observe(item);
  });

  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  function updateNavigation() {
    const y = window.scrollY;

    if (topbar) {
      topbar.classList.toggle("is-scrolled", y > 10);
    }

    if (backToTop) {
      backToTop.classList.toggle("active", y > 520);
    }

    let activeId = sections[0] ? sections[0].id : "";
    sections.forEach((section) => {
      const offset = section.offsetTop - 180;
      if (y >= offset) {
        activeId = section.id;
      }
    });

    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${activeId}`);
    });
  }

  function updateParallax() {
    const viewportMid = window.scrollY + window.innerHeight / 2;

    parallaxItems.forEach((item) => {
      const speed = Number(item.dataset.parallax || 0.08);
      const rect = item.getBoundingClientRect();
      const itemMid = window.scrollY + rect.top + rect.height / 2;
      const distance = (viewportMid - itemMid) * speed;
      item.style.setProperty("--parallax-y", `${distance.toFixed(2)}px`);
      item.style.translate = `0 ${distance.toFixed(2)}px`;
    });
  }

  let ticking = false;

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateNavigation();
        updateParallax();
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  window.addEventListener("load", () => {
    updateNavigation();
    updateParallax();
  });

  function startDistanceTicker() {
    if (!liveDistance || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const min = Number(liveDistance.dataset.min || 1180);
    const max = Number(liveDistance.dataset.max || 1480);
    let current = 1284;

    const formatDistance = (value) => `${value.toLocaleString("en-US")} km`;
    const randomDistance = () => {
      const drift = Math.round((Math.random() - 0.42) * 96);
      const next = Math.min(max, Math.max(min, current + drift));
      current = next === current ? Math.min(max, current + 17) : next;
      return current;
    };

    window.setInterval(() => {
      liveDistance.classList.remove("is-ticking");
      void liveDistance.offsetWidth;
      liveDistance.classList.add("is-ticking");
      window.setTimeout(() => {
        liveDistance.textContent = formatDistance(randomDistance());
      }, 190);
    }, 2600);
  }

  startDistanceTicker();
})();
