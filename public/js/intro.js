/**
 * ═══════════════════════════════════════════════════════════════════════
 * KORANTIS — Mathematical K Construction (SVG)
 * ═══════════════════════════════════════════════════════════════════════
 * The letter K is constructed from 3 mathematical functions:
 *
 *   1. Vertical stem:  x = c          (drawn top→bottom, 0.8s)
 *   2. Upper diagonal:  y =  a(x - x₀) (drawn center→out, 1.2s)
 *   3. Lower diagonal:  y = -a(x - x₀) (drawn center→out, 1.2s)
 *
 * Sequence:
 *   vertical draws → diagonals grow outward → 0.3s pause → micro-jitter
 *   settle → fade out → hero fades in
 *
 * Style: thin white lines, minimal glow, black background, no color.
 * ═══════════════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  var prefersReducedMotion = false;
  try {
    prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (_) {}

  if (prefersReducedMotion) return;

  /* ── K geometry constants ──────────────────────────────────────────
     ViewBox: 200 × 240 (portrait — K fits naturally)
     Vertical stem at x = 55, from y = 20 to y = 220
     Junction point: (55, 120) — center of stem
     Upper diagonal: goes to (160, 25)
     Lower diagonal: goes to (160, 215)
     Slope a ≈ (120 - 25) / (160 - 55) ≈ 0.905
  */

  var VIEW_W = 200;
  var VIEW_H = 240;
  var STEM_X = 55;
  var STEM_TOP = 20;
  var STEM_BOT = 220;
  var JUNCTION_Y = 120;
  var UPPER_END = { x: 160, y: 25 };
  var LOWER_END = { x: 160, y: 215 };
  var JUNCTION = { x: STEM_X, y: JUNCTION_Y };

  // SVG namespace
  var NS = 'http://www.w3.org/2000/svg';

  /**
   * Create path data for a straight line between two points.
   */
  function linePath(x1, y1, x2, y2) {
    return 'M ' + x1.toFixed(2) + ' ' + y1.toFixed(2) +
           ' L ' + x2.toFixed(2) + ' ' + y2.toFixed(2);
  }

  /**
   * Create and inject the K SVG.
   * Returns { svg, paths: [vertical, upper, lower], lengths: [...] }
   */
  function createKSvg(container) {
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + VIEW_W + ' ' + VIEW_H);
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'Mathematical K construction');

    // Approach scale: start slightly zoomed out
    svg.style.transform = 'scale(0.92)';
    svg.style.transformOrigin = 'center center';
    svg.style.transition = 'transform 1.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';

    // Size on screen
    var size = Math.min(280, window.innerWidth * 0.35);
    svg.style.width = size + 'px';
    svg.style.height = (size * VIEW_H / VIEW_W) + 'px';

    // Three paths
    var vPath = document.createElementNS(NS, 'path');
    vPath.setAttribute('d', linePath(STEM_X, STEM_TOP, STEM_X, STEM_BOT));
    vPath.setAttribute('class', 'korantis-intro-curve');

    var uPath = document.createElementNS(NS, 'path');
    uPath.setAttribute('d', linePath(JUNCTION.x, JUNCTION.y, UPPER_END.x, UPPER_END.y));
    uPath.setAttribute('class', 'korantis-intro-curve');

    var lPath = document.createElementNS(NS, 'path');
    lPath.setAttribute('d', linePath(JUNCTION.x, JUNCTION.y, LOWER_END.x, LOWER_END.y));
    lPath.setAttribute('class', 'korantis-intro-curve');

    container.appendChild(svg);
    svg.appendChild(vPath);
    svg.appendChild(uPath);
    svg.appendChild(lPath);

    var vLen = vPath.getTotalLength();
    var uLen = uPath.getTotalLength();
    var lLen = lPath.getTotalLength();

    // Initialize stroke animation state — all hidden
    [vPath, uPath, lPath].forEach(function (p) {
      p.style.strokeDasharray = String(p.getTotalLength());
      p.style.strokeDashoffset = String(p.getTotalLength());
      p.style.opacity = '0';
    });

    // Trigger approach
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        svg.style.transform = 'scale(1)';
      });
    });

    return {
      svg: svg,
      vPath: vPath, vLen: vLen,
      uPath: uPath, uLen: uLen,
      lPath: lPath, lLen: lLen,
    };
  }

  /**
   * Easing: ease-out cubic
   */
  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  /**
   * Micro-jitter: small random offsets that decay exponentially.
   * Creates "stabilizing / intelligence forming" feel.
   */
  function applyMicroJitter(pathEl, duration, startTime) {
    var elapsed = Date.now() - startTime;
    if (elapsed >= duration) {
      pathEl.style.transform = '';
      return false;
    }

    var decay = Math.exp(-elapsed / (duration * 0.4));
    var jitterAmt = 0.8 * decay; // max 0.8px, decays fast

    var dx = (Math.random() - 0.5) * jitterAmt * 2;
    var dy = (Math.random() - 0.5) * jitterAmt * 2;

    pathEl.style.transform = 'translate(' + dx.toFixed(2) + 'px, ' + dy.toFixed(2) + 'px)';
    return true;
  }

  /**
   * Animate the K construction sequence.
   */
  function animateK(overlay, kParts, onComplete) {
    var vPath = kParts.vPath, vLen = kParts.vLen;
    var uPath = kParts.uPath, uLen = kParts.uLen;
    var lPath = kParts.lPath, lLen = kParts.lLen;

    var VERTICAL_DURATION = 800;   // 0.8s vertical stem
    var DIAGONAL_DURATION = 1200;  // 1.2s diagonals
    var JITTER_DURATION = 400;     // 0.4s micro-jitter settle
    var PAUSE_DELAY = 300;         // 0.3s pause after draw
    var FADE_DURATION = 600;       // 0.6s fade out
    var OVERLAY_FADE = 700;

    var phase1Start = null;

    // ── Phase 1: Draw vertical stem ──
    function drawVertical(ts) {
      if (!phase1Start) phase1Start = ts;
      var elapsed = ts - phase1Start;
      var progress = Math.min(elapsed / VERTICAL_DURATION, 1);
      var eased = easeOutCubic(progress);

      vPath.style.opacity = String(0.6 + eased * 0.3);
      vPath.style.strokeDashoffset = String(vLen * (1 - eased));

      if (progress < 1) {
        requestAnimationFrame(drawVertical);
      } else {
        // Vertical done → move to diagonals
        vPath.style.strokeDashoffset = '0';
        vPath.style.opacity = '0.9';
        drawDiagonals();
      }
    }

    // ── Phase 2: Draw diagonals simultaneously ──
    function drawDiagonals() {
      var diagStart = performance.now();

      function diagFrame() {
        var now = performance.now();
        var elapsed = now - diagStart;
        var progress = Math.min(elapsed / DIAGONAL_DURATION, 1);
        var eased = easeOutCubic(progress);

        uPath.style.opacity = String(0.4 + eased * 0.5);
        lPath.style.opacity = String(0.4 + eased * 0.5);
        uPath.style.strokeDashoffset = String(uLen * (1 - eased));
        lPath.style.strokeDashoffset = String(lLen * (1 - eased));

        if (progress < 1) {
          requestAnimationFrame(diagFrame);
        } else {
          // All drawn → micro-jitter settle
          uPath.style.strokeDashoffset = '0';
          lPath.style.strokeDashoffset = '0';
          uPath.style.opacity = '0.9';
          lPath.style.opacity = '0.9';

          startJitter();
        }
      }

      requestAnimationFrame(diagFrame);
    }

    // ── Phase 3: Micro-jitter → stabilize ──
    function startJitter() {
      var jitterStart = Date.now();

      function jitterFrame() {
        var stillJittering = false;
        stillJittering = applyMicroJitter(vPath, JITTER_DURATION, jitterStart);
        stillJittering = applyMicroJitter(uPath, JITTER_DURATION, jitterStart) || stillJittering;
        stillJittering = applyMicroJitter(lPath, JITTER_DURATION, jitterStart) || stillJittering;

        if (stillJittering) {
          requestAnimationFrame(jitterFrame);
        } else {
          // Settled → pause → fade
          setTimeout(function () {
            fadeCurve();
          }, PAUSE_DELAY);
        }
      }

      requestAnimationFrame(jitterFrame);
    }

    // ── Phase 4: Fade curves, then fade overlay ──
    function fadeCurve() {
      var allPaths = [vPath, uPath, lPath];
      allPaths.forEach(function (p) {
        p.style.transition = 'opacity ' + FADE_DURATION + 'ms ease-out';
        p.style.opacity = '0';
      });

      setTimeout(function () {
        fadeOverlay();
      }, FADE_DURATION);
    }

    function fadeOverlay() {
      overlay.classList.add('is-fading');
      overlay.style.transitionDuration = OVERLAY_FADE + 'ms';

      setTimeout(function () {
        overlay.classList.add('is-hidden');

        try {
          if (overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
          }
        } catch (_) {}

        if (onComplete && typeof onComplete === 'function') {
          onComplete();
        }

        try {
          window.dispatchEvent(new CustomEvent('korantis:intro-done'));
        } catch (_) {}
      }, OVERLAY_FADE);
    }

    // Start the sequence
    requestAnimationFrame(drawVertical);
  }

  /**
   * Public initializer.
   * Looks for container with id="korantis-intro-svg-container".
   * If not found, does nothing (React component handles it).
   */
  function initIntro() {
    try {
      var container = document.getElementById('korantis-intro-svg-container');
      if (!container) return;

      var overlay = document.createElement('div');
      overlay.className = 'korantis-intro-overlay';
      overlay.setAttribute('aria-hidden', 'true');

      // KORANTIS label (small, above the K)
      var label = document.createElement('div');
      label.className = 'korantis-intro-label';
      label.setAttribute('aria-label', 'KORANTIS');
      var letters = 'KORANTIS'.split('');
      for (var i = 0; i < letters.length; i++) {
        var span = document.createElement('span');
        span.className = 'letter';
        span.textContent = letters[i];
        span.style.animationDelay = (0.08 * i) + 's';
        label.appendChild(span);
      }
      overlay.appendChild(label);

      var kParts = createKSvg(overlay);

      setTimeout(function () {
        animateK(overlay, kParts, function () {});
      }, 300);

      document.body.appendChild(overlay);
    } catch (e) {
      console.error('KORANTIS intro error:', e);
      try {
        window.dispatchEvent(new CustomEvent('korantis:intro-done'));
      } catch (_) {}
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initIntro);
  } else {
    initIntro();
  }

  if (typeof window !== 'undefined') {
    window.KORANTIS_INTRO = { init: initIntro };
  }
})();
