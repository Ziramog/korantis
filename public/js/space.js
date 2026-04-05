/**
 * ═══════════════════════════════════════════════════════════════════════
 * KORANTIS — Space Atmosphere (Canvas Particles)
 * ═══════════════════════════════════════════════════════════════════════
 * Subtle particle system with depth layers.
 *
 * Layers:
 *   1. Grid       — static + very slight scroll shift
 *   2. Particles  — 3 depth layers (far/mid/near), slow drift
 *   3. Content    — top layer
 *
 * Performance:
 *   • 20 particles on mobile, 35 on desktop
 *   • 3 comets on desktop, 2 on mobile
 *   • 3 distinct depth layers with contrast
 *   • Pure white only — no warm tints
 *   • requestAnimationFrame driven, capped dt
 *
 * Z-index:
 *   grid     → 0
 *   particles → 1
 *   comets   → 2
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
     PARTICLE — small drifting dots with depth layers

     3 distinct layers:
       Layer 0 (far)  — 50% of particles, tiny, very slow, dim
       Layer 1 (mid)  — 30% of particles, medium, slow
       Layer 2 (near) — 20% of particles, slightly larger, brighter
     ────────────────────────────────────────────────────────────────── */

  function Particle(canvasW, canvasH) {
    // 50% far, 30% mid, 20% near
    var r = Math.random();
    this.depth = r < 0.5 ? 0 : r < 0.8 ? 1 : 2;

    // Sharper contrast between layers
    var depthConfig = [
      { sizeMin: 0.2, sizeMax: 0.5, speedMul: 0.15, opacityMin: 0.03, opacityMax: 0.08 },
      { sizeMin: 0.4, sizeMax: 0.7, speedMul: 0.35, opacityMin: 0.06, opacityMax: 0.14 },
      { sizeMin: 0.6, sizeMax: 1.0, speedMul: 0.6,  opacityMin: 0.1,  opacityMax: 0.22 },
    ];

    var cfg = depthConfig[this.depth];

    this.x = Math.random() * canvasW;
    this.y = Math.random() * canvasH;
    this.size = cfg.sizeMin + Math.random() * (cfg.sizeMax - cfg.sizeMin);

    // Very slow drift
    this.vx = (Math.random() - 0.5) * 0.06 * cfg.speedMul;
    this.vy = (Math.random() - 0.5) * 0.05 * cfg.speedMul;

    this.baseOpacity = cfg.opacityMin + Math.random() * (cfg.opacityMax - cfg.opacityMin);
    this.opacity = this.baseOpacity;
    this.pulseSpeed = 0.0008 + Math.random() * 0.0015;
    this.pulsePhase = Math.random() * Math.PI * 2;

    // Pure white only
    this.r = 255;
    this.g = 255;
    this.b = 255;
  }

  Particle.prototype.update = function (dt, time) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    this.opacity = this.baseOpacity + Math.sin(time * this.pulseSpeed + this.pulsePhase) * 0.025;

    var margin = 10;
    if (this.x < -margin) this.x = canvas.width + margin;
    if (this.x > canvas.width + margin) this.x = -margin;
    if (this.y < -margin) this.y = canvas.height + margin;
    if (this.y > canvas.height + margin) this.y = -margin;
  };

  Particle.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle =
      'rgba(' + this.r + ',' + this.g + ',' + this.b + ',' + this.opacity + ')';
    ctx.fill();
  };

  /* ──────────────────────────────────────────────────────────────────
     COMET — directional white streak, diagonal/curved, fade in → move → fade out
     ────────────────────────────────────────────────────────────────── */

  function Comet(canvasW, canvasH) {
    this.alive = false;
    this.canvasW = canvasW;
    this.canvasH = canvasH;

    // Randomize initial spawn time — stagger comets
    this.nextSpawn = Math.random() * 5000 + 2000; // 2–7s before first
  }

  Comet.prototype.spawn = function () {
    var w = this.canvasW;
    var h = this.canvasH;

    // 1 in 6 comets is a "rare" longer, brighter comet
    var isRare = Math.random() < 0.17;

    // Random diagonal direction: mostly top-left → bottom-right
    var fromLeft = Math.random() < 0.6;
    var fromTop = Math.random() < 0.7;

    if (fromLeft && fromTop) {
      // Top-left → bottom-right (most common)
      this.x = -20 + Math.random() * w * 0.3;
      this.y = -20 + Math.random() * h * 0.2;
      this.vx = 0.08 + Math.random() * 0.05;
      this.vy = 0.05 + Math.random() * 0.04;
    } else if (fromLeft && !fromTop) {
      // Bottom-left → top-right
      this.x = -20 + Math.random() * w * 0.3;
      this.y = h * 0.6 + Math.random() * h * 0.3;
      this.vx = 0.07 + Math.random() * 0.05;
      this.vy = -(0.03 + Math.random() * 0.04);
    } else {
      // Top → bottom (vertical-ish)
      this.x = Math.random() * w;
      this.y = -20;
      this.vx = (Math.random() - 0.5) * 0.03;
      this.vy = 0.04 + Math.random() * 0.04;
    }

    // Smoother curve via gentle acceleration
    this.ax = (Math.random() - 0.5) * 0.00004;
    this.ay = (Math.random() - 0.5) * 0.00003;

    // Trail length: +30% vs previous (24-56px instead of 18-43px)
    this.length = isRare ? 50 + Math.random() * 30 : 24 + Math.random() * 32;
    this.opacity = 0;
    // Rare comets slightly brighter
    this.maxOpacity = isRare ? 0.3 + Math.random() * 0.1 : 0.12 + Math.random() * 0.12;
    this.phase = 'fade-in';
    this.fadeSpeed = 0.0003 + Math.random() * 0.0002;
    // Longer active duration for longer trail
    this.activeDuration = isRare ? 5000 + Math.random() * 4000 : 3000 + Math.random() * 3000;
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

    // Velocity with slight acceleration (curve)
    this.vx += this.ax * dt;
    this.vy += this.ay * dt;

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Kill if way off screen
    var margin = 100;
    if (this.x < -margin || this.x > this.canvasW + margin ||
        this.y < -margin || this.y > this.canvasH + margin) {
      this.alive = false;
    }
  };

  Comet.prototype.draw = function (ctx) {
    if (!this.alive || this.opacity <= 0) return;

    // Direction vector for streak
    var speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (speed < 0.0001) return;

    var nx = this.vx / speed;
    var ny = this.vy / speed;

    // Streak: line from tail to head
    var tailX = this.x - nx * this.length;
    var tailY = this.y - ny * this.length;

    // Gradient along streak for trailing fade
    var grad = ctx.createLinearGradient(tailX, tailY, this.x, this.y);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    grad.addColorStop(0.6, 'rgba(255, 255, 255, ' + (this.opacity * 0.5) + ')');
    grad.addColorStop(1, 'rgba(255, 255, 255, ' + this.opacity + ')');

    ctx.beginPath();
    ctx.moveTo(tailX, tailY);
    ctx.lineTo(this.x, this.y);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 0.8;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  Comet.prototype.respawn = function (dt) {
    if (!this.alive) {
      this.nextSpawn -= dt;
      if (this.nextSpawn <= 0) {
        this.spawn();
        // Reduced frequency: 6–14s gap between comets
        this.nextSpawn = 6000 + Math.random() * 8000;
      }
    }
  };

  /* ──────────────────────────────────────────────────────────────────
     MODULE STATE
     ────────────────────────────────────────────────────────────────── */

  var canvas, ctx;
  var particles = [];
  var comets = [];
  var animId = null;
  var lastTime = 0;

  var isTouch = isTouchDevice;
  var particleCount = isTouch ? 20 : 35;
  var cometCount = isTouch ? 2 : 3;

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

      // Create particles
      particles = [];
      for (var i = 0; i < particleCount; i++) {
        particles.push(new Particle(canvas.width, canvas.height));
      }
      particles.sort(function (a, b) { return a.depth - b.depth; });

      // Create comets (staggered spawn times)
      comets = [];
      for (var j = 0; j < cometCount; j++) {
        comets.push(new Comet(canvas.width, canvas.height));
      }

      lastTime = performance.now();
      animId = requestAnimationFrame(loop);

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

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update & draw particles
      for (var i = 0; i < particles.length; i++) {
        particles[i].update(dt, now);
        particles[i].draw(ctx);
      }

      // Update & draw comets
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
    particles = [];
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
     GRID PARALLAX — subtle scroll-based shift
     ────────────────────────────────────────────────────────────────── */

  function initGridParallax() {
    var grid = document.querySelector('.korantis-atmosphere-grid');
    if (!grid) return;

    var ticking = false;

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(function () {
          var y = window.scrollY * 0.005;
          grid.style.setProperty('--atmosphere-grid-scroll-y', y + 'px');
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  function initAll() {
    init();
    initGridParallax();
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
