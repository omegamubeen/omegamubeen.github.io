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
  const stackCards = Array.from(document.querySelectorAll(".stack-pop-card"));

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
    if (!liveDistance) {
      return;
    }

    const min = Number(liveDistance.dataset.min || 1180);
    const max = Number(liveDistance.dataset.max || 1480);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let current = Number(liveDistance.dataset.value || 1284);

    const digitMarkup = Array.from({ length: 10 }, (_, digit) => `<i>${digit}</i>`).join("");
    const formatDigits = (value) => String(value).padStart(4, "0");

    liveDistance.innerHTML = `
      <i class="digit-reel"><i class="digit-track">${digitMarkup}</i></i>
      <i class="digit-static">,</i>
      <i class="digit-reel"><i class="digit-track">${digitMarkup}</i></i>
      <i class="digit-reel"><i class="digit-track">${digitMarkup}</i></i>
      <i class="digit-reel"><i class="digit-track">${digitMarkup}</i></i>
      <i class="distance-unit">km</i>
    `;

    const tracks = Array.from(liveDistance.querySelectorAll(".digit-track"));
    const renderDistance = (value) => {
      formatDigits(value).split("").forEach((digit, index) => {
        tracks[index].style.setProperty("--digit", digit);
      });
      liveDistance.setAttribute("aria-label", `${value.toLocaleString("en-US")} km`);
    };

    const randomDistance = () => {
      const drift = Math.round((Math.random() - 0.42) * 96);
      const next = Math.min(max, Math.max(min, current + drift));
      current = next === current ? Math.min(max, current + 17) : next;
      return current;
    };

    renderDistance(current);

    if (reduceMotion) {
      return;
    }

    window.setInterval(() => {
      renderDistance(randomDistance());
    }, 2600);
  }

  function startStackCards() {
    if (!stackCards.length) {
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const stacks = [
      { label: "Compose UI", icon: "bi bi-lightning-charge" },
      { label: "Kotlin Flow", icon: "bi bi-code-slash" },
      { label: "KMP shared", icon: "bi bi-intersect" },
      { label: "Payments", icon: "bi bi-credit-card" },
      { label: "Firebase", icon: "bi bi-fire" },
      { label: "Retrofit API", icon: "bi bi-cloud-arrow-down" },
      { label: "Coroutines", icon: "bi bi-diagram-3" },
      { label: "Material 3", icon: "bi bi-layers" },
      { label: "CI/CD", icon: "bi bi-terminal" },
      { label: "App speed", icon: "bi bi-speedometer2" },
      { label: "Play Store", icon: "bi bi-cloud-check" }
    ];
    const positions = [
      "stack-pos-top-left",
      "stack-pos-top-right",
      "stack-pos-mid-left",
      "stack-pos-mid-right",
      "stack-pos-bottom-left",
      "stack-pos-bottom-right"
    ];
    const positionSet = new Set(positions);

    const pick = (items, avoid = []) => {
      const blocked = Array.isArray(avoid) ? avoid : [avoid];
      const available = items.filter((item) => !blocked.includes(item));
      return available[Math.floor(Math.random() * available.length)];
    };

    const applyStack = (card, cardIndex, instant = false) => {
      const currentPosition = positions.find((position) => card.classList.contains(position));
      const occupiedPositions = stackCards
        .filter((item) => item !== card)
        .map((item) => positions.find((position) => item.classList.contains(position)))
        .filter(Boolean);
      const nextPosition = pick(positions, [currentPosition, ...occupiedPositions]);
      const nextStack = stacks[Math.floor(Math.random() * stacks.length)];

      const updateCard = () => {
        card.classList.forEach((className) => {
          if (positionSet.has(className)) {
            card.classList.remove(className);
          }
        });

        card.classList.add(nextPosition);
        card.querySelector("i").className = nextStack.icon;
        card.querySelector("span").textContent = nextStack.label;
        card.setAttribute("aria-label", nextStack.label);

        if (!instant) {
          card.classList.remove("is-swapping");
          card.classList.add("is-popping");
          window.setTimeout(() => card.classList.remove("is-popping"), 620);
        }
      };

      if (instant || reduceMotion) {
        updateCard();
        return;
      }

      card.classList.add("is-swapping");
      window.setTimeout(updateCard, 260 + cardIndex * 45);
    };

    stackCards.forEach((card, index) => {
      applyStack(card, index, true);

      if (!reduceMotion) {
        window.setInterval(() => {
          applyStack(card, index);
        }, 2600 + index * 950);
      }
    });
  }

  startDistanceTicker();
  startStackCards();
})();
