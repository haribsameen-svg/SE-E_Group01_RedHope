/**
 * RED HOPE — Why Donate Blood? Page Interactivity
 * Handles mobile navigation, scroll-triggered count-up stats, card reveal
 * animations, the quick eligibility check, and smooth in-page anchor scrolling.
 */

(function () {
  "use strict";

  const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------------
     1. Mobile Hamburger Navigation Toggle
     ------------------------------------------------------------------------ */
  function initMobileNav() {
    const toggleBtn = document.querySelector(".nav-toggle");
    const navMenu = document.getElementById("primary-nav");

    if (!toggleBtn || !navMenu) {
      return;
    }

    function closeMenu() {
      navMenu.classList.remove("is-open");
      toggleBtn.setAttribute("aria-expanded", "false");
    }

    toggleBtn.addEventListener("click", function () {
      const isOpen = navMenu.classList.toggle("is-open");
      toggleBtn.setAttribute("aria-expanded", String(isOpen));
    });

    // Close menu when a link is selected on small screens
    navMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    // Close menu on Escape key or click outside
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && navMenu.classList.contains("is-open")) {
        closeMenu();
        toggleBtn.focus();
      }
    });

    document.addEventListener("click", function (event) {
      if (
        navMenu.classList.contains("is-open") &&
        !navMenu.contains(event.target) &&
        !toggleBtn.contains(event.target)
      ) {
        closeMenu();
      }
    });
  }

  /* ------------------------------------------------------------------------
     2. Impact Stats Count-Up Animation on Scroll
     ------------------------------------------------------------------------ */
  function animateCounter(element) {
    const targetRaw = element.getAttribute("data-target");
    if (!targetRaw) {
      return;
    }

    const target = Number(targetRaw);
    const prefix = element.getAttribute("data-prefix") || "";
    const suffix = element.getAttribute("data-suffix") || "";

    if (Number.isNaN(target) || prefersReducedMotion) {
      element.textContent = prefix + targetRaw + suffix;
      return;
    }

    const duration = 900;
    const startTime = performance.now();

    function step(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      // Ease out cubic for a smooth finish
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      element.textContent = prefix + current + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        element.textContent = prefix + target + suffix;
      }
    }

    requestAnimationFrame(step);
  }

  function initCountUpStats() {
    const statElements = document.querySelectorAll(".js-count-up");
    if (!statElements.length) {
      return;
    }

    if (!("IntersectionObserver" in window) || prefersReducedMotion) {
      statElements.forEach(animateCounter);
      return;
    }

    const observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.35 }
    );

    statElements.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ------------------------------------------------------------------------
     3. Fade-In on Scroll for Cards & Timeline Steps
     ------------------------------------------------------------------------ */
  function initScrollReveal() {
    const revealItems = document.querySelectorAll(".reveal");
    if (!revealItems.length) {
      return;
    }

    if (!("IntersectionObserver" in window) || prefersReducedMotion) {
      revealItems.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    const revealObserver = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -30px 0px" }
    );

    revealItems.forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  /* ------------------------------------------------------------------------
     4. "Am I Eligible?" Quick Guideline Check
     ------------------------------------------------------------------------ */
  function initEligibilityChecker() {
    const form = document.getElementById("eligibility-form");
    const ageInput = document.getElementById("donor-age");
    const weightInput = document.getElementById("donor-weight");
    const resultBox = document.getElementById("eligibility-result");

    if (!form || !ageInput || !weightInput || !resultBox) {
      return;
    }

    const DISCLAIMER =
      "Final eligibility is decided by the medical staff at the donation center.";

    function renderResult(isEligible, message) {
      resultBox.className =
        "wdb-eligibility-result is-visible " +
        (isEligible ? "is-eligible" : "is-not-eligible");

      resultBox.textContent = "";

      const msgEl = document.createElement("span");
      msgEl.textContent = message;

      const disclaimerEl = document.createElement("span");
      disclaimerEl.className = "wdb-eligibility-result__disclaimer";
      disclaimerEl.textContent = DISCLAIMER;

      resultBox.appendChild(msgEl);
      resultBox.appendChild(disclaimerEl);
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      const age = Number(ageInput.value);
      const weight = Number(weightInput.value);

      if (!ageInput.value || !weightInput.value || Number.isNaN(age) || Number.isNaN(weight) || age <= 0 || weight <= 0) {
        renderResult(
          false,
          "Please enter a valid age and weight (in kg) to check the basic guidelines."
        );
        return;
      }

      const meetsAge = age >= 18 && age <= 60;
      const meetsWeight = weight >= 50;

      if (meetsAge && meetsWeight) {
        renderResult(
          true,
          "Great news! Based on age (18–60) and weight (50 kg+), you appear to meet the basic donation guidelines, provided you are in good general health and have waited at least 3 months since any last donation."
        );
      } else {
        const reasons = [];
        if (!meetsAge) {
          reasons.push("typical donor age is 18 to 60 years");
        }
        if (!meetsWeight) {
          reasons.push("minimum donor weight is 50 kg");
        }

        renderResult(
          false,
          "You may not be eligible right now because " +
            reasons.join(" and ") +
            ". Thank you for caring about blood donation!"
        );
      }
    });
  }

  /* ------------------------------------------------------------------------
     5. Smooth Scroll for In-Page Anchor Links
     ------------------------------------------------------------------------ */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener("click", function (event) {
        const targetId = anchor.getAttribute("href");
        if (!targetId || targetId === "#") {
          return;
        }

        const targetEl = document.querySelector(targetId);
        if (!targetEl) {
          return;
        }

        event.preventDefault();
        targetEl.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          block: "start"
        });
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMobileNav();
    initCountUpStats();
    initScrollReveal();
    initEligibilityChecker();
    initSmoothScroll();
  });
})();
