/**
 * ═══════════════════════════════════════════════════════════════════════
 * KORANTIS — Space Atmosphere (Interactive Canvas Particles)
 * ═══════════════════════════════════════════════════════════════════════
 * Subtle particle system that responds to the user.
 *
 * Space design:
 *   • Few particles — space is mostly empty
 *   • 2-3 "anchor" particles — spatial reference points
 *   • Extreme depth contrast — far barely exists, near barely noticed
 *   • Grid fades toward edges — coordinate system recedes
 *
 * Behavior:
 *   • Mouse parallax — layers shift subtly with cursor
 *   • Particle repulsion — near cursor, particles gently shift
 *   • Comet awareness — occasional comet biases toward mouse direction
 *   • Grid micro-parallax — barely moves with mouse
 *
 * Performance:
 *   • 12 particles on mobile, 18 on desktop
 *   • 3 comets on desktop, 2 on mobile
 *   • requestAnimationFrame + lerp smoothing
 *   • No touch effects on mobile
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
     MOUSE — lerp-smoothed position for reactive behavior
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
     PARTICLE — small drifting dots with extreme depth contrast

     Layer 0 (far):  60% — barely visible, 0.2-0.3px, ghost opacity
     Layer 1 (mid):  25% — almost invisible, 0.3-0.5px
     Layer 2 (near): 15% — faintly visible, 0.5-0.8px

     Space is mostly empty. What exists should feel meaningful.
     ────────────────────────────────────────────────────────────────── */

  var REPEL_RADIUS = 80;
  var REPEL_FORCE = 0.3;

  function Particle(canvasW, canvasH) {
    var r = Math.random();
    this.depth = r < 0.6 ? 0 : r < 0.85 ? 1 : 2;

    var depthConfig = [
      // Far: barely there, almost lost in void
      { sizeMin: 0.15, sizeMax: 0.3,  speedMul: 0.1,  opacityMin: 0.02, opacityMax: 0.05, parallaxMul: 0.01  },
      // Mid: almost invisible
      { sizeMin: 0.3,  sizeMax: 0.5,  speedMul: 0.25, opacityMin: 0.04, opacityMax: 0.1,  parallaxMul: 0.025 },
      // Near: faintly visible, closest thing to "present"
      { sizeMin: 0.5,  sizeMax: 0.8,  speedMul: 0.45, opacityMin: 0.08, opacityMax: 0.18, parallaxMul: 0.05  },
    ];

    var cfg = depthConfig[this.depth];

    this.x = Math.random() * canvasW;
    this.y = Math.random() * canvasH;
    this.size = cfg.sizeMin + Math.random() * (cfg.sizeMax - cfg.sizeMin);

    // Extremely slow drift
    this.vx = (Math.random() - 0.5) * 0.04 * cfg.speedMul;
    this.vy = (Math.random() - 0.5) * 0.03 * cfg.speedMul;

    this.baseOpacity = cfg.opacityMin + Math.random() * (cfg.opacityMax - cfg.opacityMin);
    this.opacity = this.baseOpacity;
    this.pulseSpeed = 0.0006 + Math.random() * 0.001;
    this.pulsePhase = Math.random() * Math.PI * 2;

    // Parallax offset (mouse reactive)
    this.parallaxMul = cfg.parallaxMul;
    this.px = 0;
    this.py = 0;

    // Pure white only
    this.r = 255;
    this.g = 255;
    this.b = 255;

    // 1 in 8 particles is an "anchor" — slightly more visible reference point
    this.isAnchor = Math.random() < 0.125;
    if (this.isAnchor) {
      this.baseOpacity *= 2.0;
      this.opacity = this.baseOpacity;
      this.size *= 1.3;
    }
  }

  Particle.prototype.update = function (dt, time) {
    // Natural drift
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Opacity pulse
    this.opacity = this.baseOpacity + Math.sin(time * this.pulseSpeed + this.pulsePhase) * 0.015;

    // Mouse parallax (different per depth layer)
    if (mouse.active) {
      var cx = mouse.lx - canvas.width * 0.5;
      var cy = mouse.ly - canvas.height * 0.5;
      this.px = cx * this.parallaxMul;
      this.py = cy * this.parallaxMul;
    } else {
      this.px *= 0.95;
      this.py *= 0.95;
    }

    // Repulsion near cursor
    if (mouse.active) {
      var dx = this.x - mouse.x;
      var dy = this.y - mouse.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < REPEL_RADIUS && dist > 0) {
        var force = (1 - dist / REPEL_RADIUS) * REPEL_FORCE;
        this.vx += (dx / dist) * force * 0.01;
        this.vy += (dy / dist) * force * 0.01;
        // Dampen back to natural speed
        var maxDrift = 0.06;
        var spd = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (spd > maxDrift) {
          this.vx = (this.vx / spd) * maxDrift;
          this.vy = (this.vy / spd) * maxDrift;
        }
      }
    }

    // Wrap around edges
    var margin = 10;
    if (this.x < -margin) this.x = canvas.width + margin;
    if (this.x > canvas.width + margin) this.x = -margin;
    if (this.y < -margin) this.y = canvas.height + margin;
    if (this.y > canvas.height + margin) this.y = -margin;
  };

  Particle.prototype.draw = function (ctx) {
    var drawX = this.x + this.px;
    var drawY = this.y + this.py;
    ctx.beginPath();
    ctx.arc(drawX, drawY, this.size, 0, Math.PI * 2);
    ctx.fillStyle =
      'rgba(' + this.r + ',' + this.g + ',' + this.b + ',' + this.opacity + ')';
    ctx.fill();
  };

  /* ──────────────────────────────────────────────────────────────────
     COMET — directional white streak, fade in → move → fade out
     ────────────────────────────────────────────────────────────────── */

  function Comet(canvasW, canvasH) {
    this.alive = false;
    this.canvasW = canvasW;
    this.canvasH = canvasH;
    this.nextSpawn = Math.random() * 5000 + 3000;
  }

  Comet.prototype.spawn = function () {
    var w = this.canvasW;
    var h = this.canvasH;
    var isRare = Math.random() < 0.17;
    var useMouseBias = mouse.active && Math.random() < 0.25;

    if (useMouseBias) {
      var edge = Math.floor(Math.random() * 4);
      if (edge === 0) {
        this.x = Math.random() * w;
        this.y = -10;
      } else if (edge === 1) {
        this.x = w + 10;
        this.y = Math.random() * h;
      } else if (edge === 2) {
        this.x = Math.random() * w;
        this.y = h + 10;
      } else {
        this.x = -10;
        this.y = Math.random() * h;
      }

      var targetX = mouse.lx + (Math.random() - 0.5) * 300;
      var targetY = mouse.ly + (Math.random() - 0.5) * 300;
      var angle = Math.atan2(targetY - this.y, targetX - this.x);
      var speed = 0.06 + Math.random() * 0.04;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
    } else {
      var fromLeft = Math.random() < 0.6;
      var fromTop = Math.random() < 0.7;

      if (fromLeft && fromTop) {
        this.x = -20 + Math.random() * w * 0.3;
        this.y = -20 + Math.random() * h * 0.2;
        this.vx = 0.08 + Math.random() * 0.05;
        this.vy = 0.05 + Math.random() * 0.04;
      } else if (fromLeft && !fromTop) {
        this.x = -20 + Math.random() * w * 0.3;
        this.y = h * 0.6 + Math.random() * h * 0.3;
        this.vx = 0.07 + Math.random() * 0.05;
        this.vy = -(0.03 + Math.random() * 0.04);
      } else {
        this.x = Math.random() * w;
        this.y = -20;
        this.vx = (Math.random() - 0.5) * 0.03;
        this.vy = 0.04 + Math.random() * 0.04;
      }
    }

    this.ax = (Math.random() - 0.5) * 0.00004;
    this.ay = (Math.random() - 0.5) * 0.00003;

    this.length = isRare ? 50 + Math.random() * 30 : 24 + Math.random() * 32;
    this.opacity = 0;
    this.maxOpacity = isRare ? 0.3 + Math.random() * 0.1 : 0.12 + Math.random() * 0.12;
    this.phase = 'fade-in';
    this.fadeSpeed = 0.0003 + Math.random() * 0.0002;
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

    this.vx += this.ax * dt;
    this.vy += this.ay * dt;

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
    ctx.lineWidth = 0.8;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  Comet.prototype.respawn = function (dt) {
    if (!this.alive) {
      this.nextSpawn -= dt;
      if (this.nextSpawn <= 0) {
        this.spawn();
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

  // Reduced counts — space is mostly empty
  var isTouch = isTouchDevice;
  var particleCount = isTouch ? 12 : 18;
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

      particles = [];
      for (var i = 0; i < particleCount; i++) {
        particles.push(new Particle(canvas.width, canvas.height));
      }
      particles.sort(function (a, b) { return a.depth - b.depth; });

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

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (var i = 0; i < particles.length; i++) {
        particles[i].update(dt, now);
        particles[i].draw(ctx);
      }

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
