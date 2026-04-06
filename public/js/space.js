/**
 * ═══════════════════════════════════════════════════════════════════════
 * KORANTIS — Space Atmosphere (Canvas Starfield)
 * ═══════════════════════════════════════════════════════════════════════
 * Starship traveling through space — NOT rain.
 *
 * Principles:
 *   • Stars are essentially static — space is vast and still
 *   • Movement is implied by what barely changes
 *   • Occasional "warp" pulse — very brief, subtle streak outward
 *   • Grid is the coordinate system receding into darkness
 *
 * Z-index:
 *   grid     → 0
 *   stars    → 1
 *   comets   → 2
 *   vignette → 3
 *   content  → 10+
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
     MOUSE — lerp-smoothed for parallax
     ────────────────────────────────────────────────────────────────── */

  var mouse = { x: 0, y: 0, lx: 0, ly: 0, active: false };
  var PARALLAX_LERP = 0.03;

  function onMouseMove(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  }

  function updateMouseLerp() {
    if (!mouse.active) return;
    mouse.lx += (mouse.x - mouse.lx) * PARALLAX_LERP;
    mouse.ly += (mouse.y - mouse.ly) * PARALLAX_LERP;
  }

  /* ──────────────────────────────────────────────────────────────────
     STAR — essentially static point of light

     Space is still. Stars don't fall. They barely exist.

     Layer 0 (far):  65% — 0.1-0.2px, opacity 0.02-0.04, static
     Layer 1 (mid):  25% — 0.2-0.4px, opacity 0.04-0.08, near-static
     Layer 2 (near): 10% — 0.4-0.7px, opacity 0.08-0.15, minimal drift

     The "travel" feeling comes from the grid and occasional warp pulse,
     NOT from constant particle motion.
     ────────────────────────────────────────────────────────────────── */

  function Star(canvasW, canvasH) {
    var r = Math.random();
    this.depth = r < 0.65 ? 0 : r < 0.9 ? 1 : 2;

    var depthConfig = [
      // Far: ghost points, essentially fixed
      { sizeMin: 0.1, sizeMax: 0.2,  opacityMin: 0.02, opacityMax: 0.04 },
      // Mid: barely visible, near-static
      { sizeMin: 0.2, sizeMax: 0.4,  opacityMin: 0.04, opacityMax: 0.08 },
      // Near: faintly present, minimal drift
      { sizeMin: 0.4, sizeMax: 0.7,  opacityMin: 0.08, opacityMax: 0.15 },
    ];

    var cfg = depthConfig[this.depth];

    this.x = Math.random() * canvasW;
    this.y = Math.random() * canvasH;
    this.size = cfg.sizeMin + Math.random() * (cfg.sizeMax - cfg.sizeMin);

    // Far and mid: completely static (no drift)
    // Near: extremely slow drift (ship's micro-adjustments)
    if (this.depth === 2) {
      this.driftX = (Math.random() - 0.5) * 0.003;
      this.driftY = (Math.random() - 0.5) * 0.002;
    } else {
      this.driftX = 0;
      this.driftY = 0;
    }

    this.baseOpacity = cfg.opacityMin + Math.random() * (cfg.opacityMax - cfg.opacityMin);
    this.opacity = this.baseOpacity;
    this.pulseSpeed = 0.0004 + Math.random() * 0.0008;
    this.pulsePhase = Math.random() * Math.PI * 2;

    // Parallax offset
    this.parallaxMul = this.depth === 0 ? 0.008 : this.depth === 1 ? 0.02 : 0.04;
    this.px = 0;
    this.py = 0;

    // Warp streak state
    this.streaking = false;
    this.streakLen = 0;

    // Pure white
    this.r = 255;
    this.g = 255;
    this.b = 255;
  }

  Star.prototype.update = function (dt, time) {
    // Near stars: extremely slow drift (barely noticeable)
    if (this.driftX !== 0 || this.driftY !== 0) {
      this.x += this.driftX * dt;
      this.y += this.driftY * dt;

      // Wrap
      if (this.x < -5) this.x = canvas.width + 5;
      if (this.x > canvas.width + 5) this.x = -5;
      if (this.y < -5) this.y = canvas.height + 5;
      if (this.y > canvas.height + 5) this.y = -5;
    }

    // Subtle opacity pulse (breathing)
    this.opacity = this.baseOpacity + Math.sin(time * this.pulseSpeed + this.pulsePhase) * 0.01;

    // Mouse parallax — very subtle, depth-dependent
    if (mouse.active) {
      var cx = mouse.lx - canvas.width * 0.5;
      var cy = mouse.ly - canvas.height * 0.5;
      this.px = cx * this.parallaxMul;
      this.py = cy * this.parallaxMul;
    } else {
      this.px *= 0.95;
      this.py *= 0.95;
    }

    // Warp streak reset
    if (this.streaking) {
      this.streaking = false;
    }
  };

  Star.prototype.draw = function (ctx) {
    var drawX = this.x + this.px;
    var drawY = this.y + this.py;

    // During warp: near stars streak outward from center
    if (this.streaking && this.depth === 2) {
      var centerX = canvas.width * 0.5;
      var centerY = canvas.height * 0.45;
      var dx = drawX - centerX;
      var dy = drawY - centerY;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 0) {
        var nx = dx / dist;
        var ny = dy / dist;
        var len = 8 + Math.random() * 6;
        ctx.beginPath();
        ctx.moveTo(drawX, drawY);
        ctx.lineTo(drawX + nx * len, drawY + ny * len);
        ctx.strokeStyle = 'rgba(200, 215, 255, ' + (this.opacity * 0.7) + ')';
        ctx.lineWidth = 0.7;
        ctx.lineCap = 'round';
        ctx.stroke();
      }
      return;
    }

    // Normal: static dot
    ctx.beginPath();
    ctx.arc(drawX, drawY, this.size, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, ' + this.opacity + ')';
    ctx.fill();
  };

  /* ──────────────────────────────────────────────────────────────────
     COMET — rare, diagonal streak, fade in → move → fade out
     ────────────────────────────────────────────────────────────────── */

  function Comet(canvasW, canvasH) {
    this.alive = false;
    this.canvasW = canvasW;
    this.canvasH = canvasH;
    this.nextSpawn = Math.random() * 8000 + 5000;
  }

  Comet.prototype.spawn = function () {
    var w = this.canvasW;
    var h = this.canvasH;

    // Spawn from edge, move diagonally across
    var side = Math.floor(Math.random() * 4);
    if (side === 0) { // top → bottom-right
      this.x = Math.random() * w * 0.5;
      this.y = -10;
      this.vx = 0.04 + Math.random() * 0.03;
      this.vy = 0.06 + Math.random() * 0.04;
    } else if (side === 1) { // left → bottom-right
      this.x = -10;
      this.y = Math.random() * h * 0.4;
      this.vx = 0.06 + Math.random() * 0.04;
      this.vy = 0.04 + Math.random() * 0.03;
    } else if (side === 2) { // right → bottom-left
      this.x = w + 10;
      this.y = Math.random() * h * 0.4;
      this.vx = -(0.04 + Math.random() * 0.03);
      this.vy = 0.05 + Math.random() * 0.04;
    } else { // top → bottom-left
      this.x = w * 0.5 + Math.random() * w * 0.5;
      this.y = -10;
      this.vx = -(0.04 + Math.random() * 0.03);
      this.vy = 0.05 + Math.random() * 0.04;
    }

    this.ax = 0;
    this.ay = 0;
    this.length = 20 + Math.random() * 20;
    this.opacity = 0;
    this.maxOpacity = 0.08 + Math.random() * 0.08; // very subtle
    this.phase = 'fade-in';
    this.fadeSpeed = 0.0003 + Math.random() * 0.0002;
    this.activeDuration = 4000 + Math.random() * 4000;
    this.activeTimer = 0;
    this.alive = true;
  };

  Comet.prototype.update = function (dt) {
    if (!this.alive) return;

    this.activeTimer += dt;

    if (this.phase === 'fade-in') {
      this.opacity += this.fadeSpeed * dt;
      if (this.opacity >= this.maxOpacity) {
        this.opacity = this.maxOpacity;
        this.phase = 'active';
      }
    } else if (this.phase === 'active') {
      if (this.activeTimer > this.activeDuration) {
        this.phase = 'fade-out';
      }
    } else if (this.phase === 'fade-out') {
      this.opacity -= this.fadeSpeed * dt * 1.5;
      if (this.opacity <= 0) {
        this.opacity = 0;
        this.alive = false;
      }
    }

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    var margin = 100;
    if (this.x < -margin || this.x > this.canvasW + margin ||
        this.y < -margin || this.y > this.canvasH + margin) {
      this.alive = false;
    }
  };

  Comet.prototype.draw = function (ctx) {
    if (!this.alive || this.opacity <= 0) return;

    var speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (speed < 0.0001) return;

    var nx = this.vx / speed;
    var ny = this.vy / speed;

    var tailX = this.x - nx * this.length;
    var tailY = this.y - ny * this.length;

    var grad = ctx.createLinearGradient(tailX, tailY, this.x, this.y);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    grad.addColorStop(0.6, 'rgba(255, 255, 255, ' + (this.opacity * 0.5) + ')');
    grad.addColorStop(1, 'rgba(255, 255, 255, ' + this.opacity + ')');

    ctx.beginPath();
    ctx.moveTo(tailX, tailY);
    ctx.lineTo(this.x, this.y);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 0.6;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  Comet.prototype.respawn = function (dt) {
    if (!this.alive) {
      this.nextSpawn -= dt;
      if (this.nextSpawn <= 0) {
        this.spawn();
        this.nextSpawn = 8000 + Math.random() * 10000; // 8-18s
      }
    }
  };

  /* ──────────────────────────────────────────────────────────────────
     WARP PULSE — brief moment of streaking, then stillness
     ────────────────────────────────────────────────────────────────── */

  var warp = {
    active: false,
    timer: 0,
    duration: 400,      // 0.4s streak
    nextWarp: 15000 + Math.random() * 10000  // 15-25s between
  };

  function triggerWarp(stars) {
    warp.active = true;
    warp.timer = 0;
    for (var i = 0; i < stars.length; i++) {
      if (stars[i].depth === 2) {
        stars[i].streaking = true;
      }
    }
  }

  /* ──────────────────────────────────────────────────────────────────
     MODULE STATE
     ────────────────────────────────────────────────────────────────── */

  var canvas, ctx;
  var stars = [];
  var comets = [];
  var animId = null;
  var lastTime = 0;

  // Few stars — space is empty
  var isTouch = isTouchDevice;
  var starCount = isTouch ? 10 : 14;
  var cometCount = isTouch ? 1 : 2;

  function resize() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function init() {
    try {
      if (document.querySelector('.korantis-space-canvas')) return;

      canvas = document.createElement('canvas');
      canvas.className = 'korantis-space-canvas';
      canvas.setAttribute('aria-hidden', 'true');
      document.body.appendChild(canvas);

      ctx = canvas.getContext('2d');
      if (!ctx) return;

      resize();

      // Create stars — static, not falling
      stars = [];
      for (var i = 0; i < starCount; i++) {
        stars.push(new Star(canvas.width, canvas.height));
      }
      stars.sort(function (a, b) { return a.depth - b.depth; });

      // Create comets
      comets = [];
      for (var j = 0; j < cometCount; j++) {
        comets.push(new Comet(canvas.width, canvas.height));
      }

      lastTime = performance.now();
      animId = requestAnimationFrame(loop);

      if (!isTouch) {
        window.addEventListener('mousemove', onMouseMove, { passive: true });
        mouse.lx = canvas.width * 0.5;
        mouse.ly = canvas.height * 0.5;
      }

      window.addEventListener('resize', debounce(resize, 200));
    } catch (e) {
      console.error('KORANTIS space init error:', e);
      cleanup();
    }
  }

  function loop(now) {
    try {
      if (!ctx || !canvas) return;

      var dt = Math.min(now - lastTime, 100);
      lastTime = now;

      updateMouseLerp();

      // Warp pulse system
      if (!warp.active) {
        warp.nextWarp -= dt;
        if (warp.nextWarp <= 0) {
          triggerWarp(stars);
        }
      } else {
        warp.timer += dt;
        if (warp.timer > warp.duration) {
          warp.active = false;
          warp.nextWarp = 15000 + Math.random() * 10000; // 15-25s
        }
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Stars — essentially static, brief warp streaks
      for (var i = 0; i < stars.length; i++) {
        stars[i].update(dt, now);
        stars[i].draw(ctx);
      }

      // Comets — rare diagonal streaks
      for (var j = 0; j < comets.length; j++) {
        comets[j].respawn(dt);
        comets[j].update(dt);
        comets[j].draw(ctx);
      }

      animId = requestAnimationFrame(loop);
    } catch (e) {
      console.error('KORANTIS space loop error:', e);
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

  /* ──────────────────────────────────────────────────────────────────
     GRID PARALLAX — scroll + mouse micro-shift
     ────────────────────────────────────────────────────────────────── */

  function initGridParallax() {
    var grid = document.querySelector('.korantis-atmosphere-grid');
    if (!grid) return;

    var scrollY = 0;
    var mouseGridX = 0, mouseGridY = 0;

    if (!isTouch) {
      window.addEventListener('mousemove', function (e) {
        var cx = e.clientX - window.innerWidth * 0.5;
        var cy = e.clientY - window.innerHeight * 0.5;
        mouseGridX = cx * 0.002;
        mouseGridY = cy * 0.002;
      }, { passive: true });
    }

    var ticking = false;

    function onScroll() {
      scrollY = window.scrollY;
      if (!ticking) {
        requestAnimationFrame(function () {
          var sy = scrollY * 0.005;
          grid.style.setProperty('--atmosphere-grid-scroll-y', (sy + mouseGridY) + 'px');
          grid.style.setProperty('--atmosphere-grid-scroll-x', mouseGridX + 'px');
          ticking = false;
        });
        ticking = true;
      }
    }

    function onGridMouseMove() {
      if (!ticking) {
        requestAnimationFrame(function () {
          var sy = scrollY * 0.005;
          grid.style.setProperty('--atmosphere-grid-scroll-y', (sy + mouseGridY) + 'px');
          grid.style.setProperty('--atmosphere-grid-scroll-x', mouseGridX + 'px');
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    if (!isTouch) {
      window.addEventListener('mousemove', onGridMouseMove, { passive: true });
    }
  }

  /* ──────────────────────────────────────────────────────────────────
     HERO MICRO-RESPONSE — subtle text shift with mouse
     ────────────────────────────────────────────────────────────────── */

  function initHeroParallax() {
    var hero = document.getElementById('hero-heading');
    if (!hero || isTouch) return;

    var targetX = 0, targetY = 0;
    var currentX = 0, currentY = 0;
    var HERO_LERP = 0.04;

    window.addEventListener('mousemove', function (e) {
      var cx = e.clientX - window.innerWidth * 0.5;
      var cy = e.clientY - window.innerHeight * 0.5;
      targetX = (cx / window.innerWidth) * 2;
      targetY = (cy / window.innerHeight) * 2;
    }, { passive: true });

    function animateHero() {
      currentX += (targetX - currentX) * HERO_LERP;
      currentY += (targetY - currentY) * HERO_LERP;

      if (Math.abs(currentX) > 0.01 || Math.abs(currentY) > 0.01) {
        hero.style.transform =
          'translate(' + currentX.toFixed(2) + 'px, ' + currentY.toFixed(2) + 'px)';
      }

      requestAnimationFrame(animateHero);
    }

    requestAnimationFrame(animateHero);
  }

  /* ──────────────────────────────────────────────────────────────────
     INIT ALL
     ────────────────────────────────────────────────────────────────── */

  function initAll() {
    init();
    initGridParallax();
    initHeroParallax();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  if (typeof window !== 'undefined') {
    window.KORANTIS_SPACE = {
      init: init,
      cleanup: cleanup,
    };
  }
})();
