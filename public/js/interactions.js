/**
 * ═══════════════════════════════════════════════════════════════════════
 * KORANTIS — Micro-Interactions Engine (Lean)
 * ═══════════════════════════════════════════════════════════════════════
 * Removed: cursor light, floating particles, parallax depth
 * Kept:    scroll reveal, navbar scroll
 *
 * All features auto-initialize on DOMContentLoaded.
 * Set KORANTIS_NO_INTERACTIONS = true before this script to disable.
 * ═══════════════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  if (typeof window !== 'undefined' && window.KORANTIS_NO_INTERACTIONS) return;

  var isTouchDevice =
    typeof window !== 'undefined' &&
    ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  function throttle(fn, limit) {
    var inThrottle = false;
    return function () {
      var args = arguments;
      var context = this;
      if (!inThrottle) {
        fn.apply(context, args);
        inThrottle = true;
        setTimeout(function () {
          inThrottle = false;
        }, limit);
      }
    };
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   * SCROLL REVEAL (IntersectionObserver)
   * ──────────────────────────────────────────────────────────────────
   * Elements with class "korantis-reveal" fade in when scrolled into view.
   * Supports stagger delays via data-delay attribute (1-5).
   * SAFETY: 3s fallback timeout ensures content is never permanently hidden.
   * ═══════════════════════════════════════════════════════════════════
   */
  function initScrollReveal() {
    var reveals = document.querySelectorAll('.korantis-reveal');
    if (!reveals.length) return;

    var fallbackTimer = setTimeout(function () {
      for (var i = 0; i < reveals.length; i++) {
        if (!reveals[i].classList.contains('is-revealed')) {
          reveals[i].classList.add('is-revealed');
        }
      }
    }, 3000);

    if (!('IntersectionObserver' in window)) {
      for (var i = 0; i < reveals.length; i++) {
        reveals[i].classList.add('is-revealed');
      }
      clearTimeout(fallbackTimer);
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        for (var i = 0; i < entries.length; i++) {
          if (entries[i].isIntersecting) {
            entries[i].target.classList.add('is-revealed');
            observer.unobserve(entries[i].target);
          }
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    for (var j = 0; j < reveals.length; j++) {
      observer.observe(reveals[j]);
    }
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   * NAVBAR SCROLL BEHAVIOR
   * ──────────────────────────────────────────────────────────────────
   * Adds "is-scrolled" class to navbar when scroll > 50px.
   * Targets elements with class "korantis-nav".
   * ═══════════════════════════════════════════════════════════════════
   */
  function initNavbar() {
    var nav = document.querySelector('.korantis-nav');
    if (!nav) return;

    function onScroll() {
      if (window.scrollY > 50) {
        nav.classList.add('is-scrolled');
      } else {
        nav.classList.remove('is-scrolled');
      }
    }

    var throttled = throttle(onScroll, 16);
    window.addEventListener('scroll', throttled, { passive: true });
    onScroll();
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   * INITIALIZATION
   * ──────────────────────────────────────────────────────────────────
   * Order: reveal first, then navbar.
   * Wrapped in try/catch — any error disables effects but preserves site.
   * ═══════════════════════════════════════════════════════════════════
   */
  function init() {
    try {
      initScrollReveal();
      initNavbar();
    } catch (e) {
      console.error('KORANTIS interaction error:', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
