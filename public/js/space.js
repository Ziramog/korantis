/**
 * ═══════════════════════════════════════════════════════════════════════
 * KORANTIS — Space Atmosphere (Canvas Starfield)
 * ═══════════════════════════════════════════════════════════════════════
 * 3-Layer Visual System:
 *   1. Grid    — structure (barely visible)
 *   2. Stars   — depth (calm, slow drift)
 *   3. Comets  — events (rare, diagonal, elegant)
 *
 * NO: rain, noise, chaos
 * YES: control, intelligence, precision
 * ═══════════════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  var isTouchDevice =
    typeof window !== 'undefined' &&
    ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  var prefersReducedMotion = false;
  try {
    prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (_) {}

  if (prefersReducedMotion) return;
  if (document.querySelector('.korantis-space-canvas')) return;

  /* ──────────────────────────────────────────────────────────────────
     CANVAS SETUP
     ────────────────────────────────────────────────────────────────── */

  var canvas = document.createElement('canvas');
  canvas.className = 'korantis-space-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas);

  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  var w = window.innerWidth;
  var h = window.innerHeight;
  canvas.width = w;
  canvas.height = h;

  /* ──────────────────────────────────────────────────────────────────
     LAYER 1 — THIN GRID (STRUCTURE)
     ────────────────────────────────────────────────────────────────── */

  function drawGrid(ctx, w, h, offsetX, offsetY) {
    var size = 60;

    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 0.5;

    for (var x = -size; x < w + size; x += size) {
      ctx.beginPath();
      ctx.moveTo(x + offsetX % size, 0);
      ctx.lineTo(x + offsetX % size, h);
      ctx.stroke();
    }

    for (var y = -size; y < h + size; y += size) {
      ctx.beginPath();
      ctx.moveTo(0, y + offsetY % size);
      ctx.lineTo(w, y + offsetY % size);
      ctx.stroke();
    }
  }

  /* ──────────────────────────────────────────────────────────────────
     LAYER 2 — STARFIELD (DEPTH)
     ────────────────────────────────────────────────────────────────── */

  var stars = [];

  function initStars() {
    stars = [];
    for (var i = 0; i < 140; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        speed: 0.05 + Math.random() * 0.25,
        size: Math.random() * 1.2,
        alpha: 0.2 + Math.random() * 0.4,
      });
    }
  }

  function updateStars() {
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      s.x += 0.1 * s.speed;
      s.y += 0.05 * s.speed;

      if (s.x > w) s.x = 0;
      if (s.y > h) s.y = 0;
    }
  }

  function drawStars() {
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(220,230,255,' + s.alpha + ')';
      ctx.fill();
    }
  }

  /* ──────────────────────────────────────────────────────────────────
     LAYER 3 — DIAGONAL COMETS (EVENTS)
     ────────────────────────────────────────────────────────────────── */

  var comets = [];

  function spawnComet() {
    if (Math.random() > 0.98) {
      comets.push({
        x: Math.random() * w,
        y: -50,
        vx: 2 + Math.random() * 2,
        vy: 3 + Math.random() * 3,
        length: 80 + Math.random() * 120,
      });
    }
  }

  function updateComets() {
    for (var i = comets.length - 1; i >= 0; i--) {
      var c = comets[i];
      c.x += c.vx;
      c.y += c.vy;

      // Remove off-screen comets
      if (c.x > w + 200 || c.y > h + 200 || c.x < -200 || c.y < -200) {
        comets.splice(i, 1);
      }
    }
  }

  function drawComets() {
    for (var i = 0; i < comets.length; i++) {
      var c = comets[i];

      var grad = ctx.createLinearGradient(
        c.x, c.y,
        c.x - c.vx * 20,
        c.y - c.vy * 20
      );

      grad.addColorStop(0, 'rgba(255,255,255,0.9)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');

      ctx.strokeStyle = grad;
      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.moveTo(c.x, c.y);
      ctx.lineTo(
        c.x - c.vx * c.length,
        c.y - c.vy * c.length
      );
      ctx.stroke();
    }
  }

  /* ──────────────────────────────────────────────────────────────────
     RESIZE
     ────────────────────────────────────────────────────────────────── */

  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;
    initStars();
    comets = [];
  }

  /* ──────────────────────────────────────────────────────────────────
     ANIMATION LOOP
     ────────────────────────────────────────────────────────────────── */

  var animId = null;

  function loop() {
    ctx.clearRect(0, 0, w, h);

    // Subtle scroll reaction
    var scrollOffset = window.scrollY * 0.05;

    // LAYER 1: Grid
    drawGrid(ctx, w, h, scrollOffset, scrollOffset * 0.3);

    // LAYER 2: Stars
    updateStars();
    drawStars();

    // LAYER 3: Comets
    spawnComet();
    updateComets();
    drawComets();

    animId = requestAnimationFrame(loop);
  }

  /* ──────────────────────────────────────────────────────────────────
     INIT
     ────────────────────────────────────────────────────────────────── */

  function init() {
    try {
      if (document.querySelector('.korantis-space-canvas')) return;

      initStars();

      window.addEventListener('resize', debounce(resize, 200));

      animId = requestAnimationFrame(loop);
    } catch (e) {
      console.error('KORANTIS space init error:', e);
      cleanup();
    }
  }

  function cleanup() {
    if (animId) {
      cancelAnimationFrame(animId);
      animId = null;
    }
    if (canvas && canvas.parentNode) {
      canvas.parentNode.removeChild(canvas);
    }
    canvas = null;
    ctx = null;
    stars = [];
    comets = [];
  }

  function debounce(fn, delay) {
    var timer = null;
    return function () {
      var args = arguments;
      var context = this;
      if (timer) clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(context, args);
      }, delay);
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  if (typeof window !== 'undefined') {
    window.KORANTIS_SPACE = {
      init: init,
      cleanup: cleanup,
    };
  }
})();
