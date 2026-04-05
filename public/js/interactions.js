/**
 * ═══════════════════════════════════════════════════════════════════════
 * KORANTIS — Micro-Interactions Engine
 * ═══════════════════════════════════════════════════════════════════════
 * Standalone interaction JS. Zero dependencies. Safe to remove.
 *
 * All features auto-initialize on DOMContentLoaded.
 * Set KORANTIS_NO_INTERACTIONS = true before this script to disable.
 *
 * Performance: Uses requestAnimationFrame, passive listeners, and
 * IntersectionObserver. All heavy effects disabled on mobile/touch.
 * ═══════════════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  // ── Global override: set before this script loads to disable ──
  if (typeof window !== 'undefined' && window.KORANTIS_NO_INTERACTIONS) return;

  // ── Detect touch device — disable heavy effects ──
  var isTouchDevice =
    typeof window !== 'undefined' &&
    ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  // ── Throttle helper ──
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
   * FEATURE 1: Cursor Light
   * ──────────────────────────────────────────────────────────────────
   * A soft violet radial glow that follows the mouse with eased delay.
   * Uses requestAnimationFrame for smooth tracking. Zero re-renders.
   * Disabled on touch devices.
   * ═══════════════════════════════════════════════════════════════════
   */
  function initCursorLight() {
    if (isTouchDevice) return;

    var el = document.createElement('div');
    el.className = 'korantis-cursor-light';
    el.setAttribute('aria-hidden', 'true');
    document.body.appendChild(el);

    var targetX = 0,
      targetY = 0;
    var currentX = 0,
      currentY = 0;
    var isActive = false;
    var fadeTimer = null;
    var ease = 0.07; // Lower = slower, smoother tracking

    function animate() {
      var dx = targetX - currentX;
      var dy = targetY - currentY;

      // Smooth interpolation (lerp)
      currentX += dx * ease;
      currentY += dy * ease;

      // Only update DOM if movement is significant (>0.5px)
      if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
        el.style.left = currentX + 'px';
        el.style.top = currentY + 'px';
      }

      requestAnimationFrame(animate);
    }

    function onMouseMove(e) {
      targetX = e.clientX;
      targetY = e.clientY;

      // Activate on first move
      if (!isActive) {
        isActive = true;
        el.classList.add('is-active');
      }

      // Fade out after 2s of idle
      clearTimeout(fadeTimer);
      fadeTimer = setTimeout(function () {
        el.classList.remove('is-active');
        isActive = false;
      }, 2000);
    }

    function onMouseLeave() {
      el.classList.remove('is-active');
      isActive = false;
    }

    // Throttle mouse move to reduce CPU
    var throttledMove = throttle(onMouseMove, 8);

    window.addEventListener('mousemove', throttledMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);

    // Start the animation loop
    requestAnimationFrame(animate);

    // Cleanup reference
    el._korantisDispose = function () {
      window.removeEventListener('mousemove', throttledMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      clearTimeout(fadeTimer);
      el.remove();
    };
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   * FEATURE 2: Parallax Depth System
   * ──────────────────────────────────────────────────────────────────
   * Moves background grid and particle layers at different rates
   * based on scroll position. Max movement: 10-20px (very subtle).
   * NOTE: Uses CSS custom properties to avoid conflicting with React's
   * transform styles on the same elements.
   * ═══════════════════════════════════════════════════════════════════
   */
  function initParallax() {
    if (isTouchDevice) return;

    var gridEl = document.querySelector('.korantis-parallax-grid');
    var particlesEl = document.querySelector('.korantis-parallax-particles');

    if (!gridEl && !particlesEl) return;

    function onScroll() {
      var scrollY = window.scrollY;

      // Use CSS custom properties instead of overwriting transforms
      // This avoids conflict with React's inline transform styles
      if (gridEl) {
        gridEl.style.setProperty('--js-parallax-y', (scrollY * 0.015) + 'px');
      }
      if (particlesEl) {
        particlesEl.style.setProperty('--js-parallax-y', (scrollY * 0.01) + 'px');
      }
    }

    var throttledScroll = throttle(onScroll, 16); // ~60fps
    window.addEventListener('scroll', throttledScroll, { passive: true });

    // Initial call
    onScroll();
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   * FEATURE 3: Floating Particles (Canvas-based)
   * ──────────────────────────────────────────────────────────────────
   * Creates a canvas overlay with slowly drifting particles.
   * Each particle has random size, speed, and fade cycle.
   * Reacts to mouse proximity (brightens when cursor is near).
   * ═══════════════════════════════════════════════════════════════════
   */
  function initParticles() {
    if (isTouchDevice) return;

    // Check if particles already exist in DOM
    if (document.querySelector('.korantis-particles-canvas')) return;

    var canvas = document.createElement('canvas');
    canvas.className = 'korantis-particles-canvas';
    document.body.appendChild(canvas);

    var ctx = canvas.getContext('2d');
    var particles = [];
    var mouse = { x: -1000, y: -1000 };
    var PARTICLE_COUNT = 60;
    var PARTICLE_MAX_SPEED = 0.15; // Very slow drift

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function createParticle() {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.5 + 0.5,
        vx: (Math.random() - 0.5) * PARTICLE_MAX_SPEED,
        vy: (Math.random() - 0.5) * PARTICLE_MAX_SPEED,
        opacity: Math.random() * 0.4 + 0.1,
        fadeSpeed: Math.random() * 0.003 + 0.001,
        fadeDir: Math.random() > 0.5 ? 1 : -1,
      };
    }

    function init() {
      resize();
      particles = [];
      for (var i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(createParticle());
      }
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];

        // Drift
        p.x += p.vx;
        p.y += p.vy;

        // Fade cycle
        p.opacity += p.fadeSpeed * p.fadeDir;
        if (p.opacity > 0.5) p.fadeDir = -1;
        if (p.opacity < 0.05) p.fadeDir = 1;

        // Mouse proximity: brighten particles near cursor
        var dx = p.x - mouse.x;
        var dy = p.y - mouse.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        var proximityBoost = dist < 150 ? (1 - dist / 150) * 0.4 : 0;
        var displayOpacity = Math.min(1, p.opacity + proximityBoost);

        // Wrap around edges
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
        if (p.y < -10) p.y = canvas.height + 10;
        if (p.y > canvas.height + 10) p.y = -10;

        // Draw
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle =
          'rgba(200, 200, 210, ' + displayOpacity + ')';
        ctx.fill();
      }

      requestAnimationFrame(draw);
    }

    // Track mouse for proximity effect
    window.addEventListener(
      'mousemove',
      throttle(function (e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
      }, 16),
      { passive: true }
    );

    window.addEventListener('resize', resize);

    init();
    draw();

    // Dispose reference
    canvas._korantisDispose = function () {
      canvas.remove();
    };
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   * FEATURE 4: Button System
   * ──────────────────────────────────────────────────────────────────
   * Purely CSS-driven hover effects — NO DOM mutation to avoid
   * React hydration mismatch. The korantis-btn class in CSS handles
   * everything. This function is intentionally a no-op.
   * ═══════════════════════════════════════════════════════════════════
   */
  function initButtons() {
    // No DOM mutation — CSS handles all button hover effects.
    // Previously added data-korantis-btn attributes which caused
    // hydration mismatches with React SSR.
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   * FEATURE 5: Scroll Reveal (IntersectionObserver)
   * ──────────────────────────────────────────────────────────────────
   * Elements with class "korantis-reveal" fade in when scrolled into view.
   * Supports stagger delays via data-delay attribute (1-5).
   * SAFETY: 3s fallback timeout ensures content is never permanently hidden.
   * ═══════════════════════════════════════════════════════════════════
   */
  function initScrollReveal() {
    var reveals = document.querySelectorAll('.korantis-reveal');
    if (!reveals.length) return;

    // SAFETY FALLBACK: If observer never fires, show content after 3s
    var fallbackTimer = setTimeout(function () {
      for (var i = 0; i < reveals.length; i++) {
        if (!reveals[i].classList.contains('is-revealed')) {
          reveals[i].classList.add('is-revealed');
        }
      }
    }, 3000);

    if (!('IntersectionObserver' in window)) {
      // Fallback: show everything immediately
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
        rootMargin: '0px 0px -40px 0px', // Trigger slightly before visible
      }
    );

    for (var j = 0; j < reveals.length; j++) {
      observer.observe(reveals[j]);
    }
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   * FEATURE 6: Navbar Scroll Behavior
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
    onScroll(); // Initial check
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   * FEATURE 7: Form Input Enhancements
   * ──────────────────────────────────────────────────────────────────
   * Purely CSS-driven focus styling — NO DOM mutation to avoid
   * React hydration mismatch. The korantis-input class is applied
   * directly in React components.
   * ═══════════════════════════════════════════════════════════════════
   */
  function initFormInputs() {
    // No DOM mutation — CSS handles all input focus effects.
    // React already applies korantis-input class directly.
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   * INITIALIZATION
   * ──────────────────────────────────────────────────────────────────
   * All features auto-init on DOMContentLoaded.
   * Order matters: particles last (needs DOM layout).
   * Wrapped in try/catch — any error disables effects but preserves site.
   * ═══════════════════════════════════════════════════════════════════
   */
  function init() {
    try {
      initCursorLight();
      initScrollReveal();
      initButtons();
      initFormInputs();
      initNavbar();
      initParallax();
      initParticles();
    } catch (e) {
      console.error('KORANTIS interaction error:', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose dispose function for cleanup if needed
  window.KORANTIS_INTERACTIONS = {
    dispose: function () {
      document.querySelectorAll('[data-korantis-dispose]').forEach(function (el) {
        if (el._korantisDispose) el._korantisDispose();
      });
    },
  };
})();
