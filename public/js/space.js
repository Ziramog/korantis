/**
 * ═══════════════════════════════════════════════════════════════════════
 * KORANTIS — Grid Background (Minimal)
 * ═══════════════════════════════════════════════════════════════════════
 * Single canvas. Thin grid. Center fade. Micro parallax.
 * NO stars. NO particles. NO comets. NO noise.
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

  if (document.getElementById('grid-bg')) return;

  /* ──────────────────────────────────────────────────────────────────
     CANVAS
     ────────────────────────────────────────────────────────────────── */

  var canvas = document.createElement('canvas');
  canvas.id = 'grid-bg';
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:-1;pointer-events:none;';
  document.body.prepend(canvas);

  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  var w = window.innerWidth;
  var h = window.innerHeight;
  canvas.width = w;
  canvas.height = h;

  var offsetX = 0;
  var offsetY = 0;

  /* ──────────────────────────────────────────────────────────────────
     DRAW
     ────────────────────────────────────────────────────────────────── */

  function drawGrid() {
    ctx.clearRect(0, 0, w, h);

    var size = 80;

    ctx.strokeStyle = 'rgba(255,255,255,0.035)';
    ctx.lineWidth = 0.5;

    // Vertical lines
    for (var x = 0; x < w; x += size) {
      ctx.beginPath();
      ctx.moveTo(x + offsetX, 0);
      ctx.lineTo(x + offsetX, h);
      ctx.stroke();
    }

    // Horizontal lines
    for (var y = 0; y < h; y += size) {
      ctx.beginPath();
      ctx.moveTo(0, y + offsetY);
      ctx.lineTo(w, y + offsetY);
      ctx.stroke();
    }

    // Center fade (depth)
    var gradient = ctx.createRadialGradient(
      w / 2, h / 2, 0,
      w / 2, h / 2, w * 0.7
    );
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.6)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
  }

  /* ──────────────────────────────────────────────────────────────────
     EVENTS
     ────────────────────────────────────────────────────────────────── */

  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;
  }

  if (!isTouchDevice && !prefersReducedMotion) {
    window.addEventListener('mousemove', function (e) {
      offsetX = (e.clientX - w / 2) * 0.01;
      offsetY = (e.clientY - h / 2) * 0.01;
    }, { passive: true });
  }

  window.addEventListener('resize', function () {
    resize();
  });

  /* ──────────────────────────────────────────────────────────────────
     LOOP
     ────────────────────────────────────────────────────────────────── */

  var animId = null;

  function animate() {
    drawGrid();
    animId = requestAnimationFrame(animate);
  }

  resize();
  animate();

  /* ──────────────────────────────────────────────────────────────────
     CLEANUP
     ────────────────────────────────────────────────────────────────── */

  if (typeof window !== 'undefined') {
    window.KORANTIS_GRID = {
      cleanup: function () {
        if (animId) cancelAnimationFrame(animId);
        if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
        canvas = null;
        ctx = null;
      }
    };
  }
})();
