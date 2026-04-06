/**
 * ═══════════════════════════════════════════════════════════════════════
 * KORANTIS — Grid Background (Premium)
 * ═══════════════════════════════════════════════════════════════════════
 * Hierarchy: major lines every 4th, distance fade, micro breathing.
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
  var time = 0;

  /* ──────────────────────────────────────────────────────────────────
     DRAW
     ────────────────────────────────────────────────────────────────── */

  function drawGrid() {
    ctx.clearRect(0, 0, w, h);

    var size = 100;
    var centerX = w / 2;
    var centerY = h / 2;
    var pulse = Math.sin(time) * 0.003;

    // Vertical lines
    for (var x = 0; x < w; x += size) {
      var dist = Math.abs(x + offsetX - centerX) / w;
      var isMajor = x % (size * 4) === 0;
      var base = isMajor ? 0.03 : 0.015;
      var lw = isMajor ? 0.8 : 0.4;
      var opacity = base + (1 - dist) * (0.015 + pulse);

      ctx.strokeStyle = 'rgba(255,255,255,' + opacity + ')';
      ctx.lineWidth = lw;

      ctx.beginPath();
      ctx.moveTo(x + offsetX, 0);
      ctx.lineTo(x + offsetX, h);
      ctx.stroke();
    }

    // Horizontal lines
    for (var y = 0; y < h; y += size) {
      var distY = Math.abs(y + offsetY - centerY) / h;
      var isMajorY = y % (size * 4) === 0;
      var baseY = isMajorY ? 0.03 : 0.015;
      var lwY = isMajorY ? 0.8 : 0.4;
      var opacityY = baseY + (1 - distY) * (0.015 + pulse);

      ctx.strokeStyle = 'rgba(255,255,255,' + opacityY + ')';
      ctx.lineWidth = lwY;

      ctx.beginPath();
      ctx.moveTo(0, y + offsetY);
      ctx.lineTo(w, y + offsetY);
      ctx.stroke();
    }

    // Soft center fade
    var gradient = ctx.createRadialGradient(
      w / 2, h / 2, 0,
      w / 2, h / 2, w * 0.9
    );
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.4)');
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
    time += 0.01;
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
