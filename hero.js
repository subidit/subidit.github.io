// Hero confetti: small doodles scattered over the first screen. The cursor or
// a finger pushes them out of the way (they spin as they go), a click or tap
// throws the nearby ones outward, and springs bring every piece home again.
// Only transforms change, and the loop runs only while the hero is on screen.

(function () {
  var field = document.querySelector('.hero__bits');
  var hero = field && field.closest('.hero');
  if (!field || !hero) return;
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Shapes on a 40 × 40 grid, in one colour: a light wash plus an ink
  // outline printed a touch out of register, in the Miroodles way
  var SHAPES = {
    dot: '<circle cx="20" cy="20" r="13"/>',
    triangle: '<path d="M20 5 36 34H4Z"/>',
    heart: '<path d="M20 34C6 25 3 15 9 9.5c5-4.5 9.5-1.5 11 2.5 1.5-4 6-7 11-2.5 6 5.5 3 15.5-11 24.5Z"/>',
    diamond: '<path d="M20 3 37 20 20 37 3 20Z"/>',
    moon: '<path d="M4 16a16 16 0 0 0 32 0Z"/>',
    square: '<rect x="7" y="7" width="26" height="26" rx="4"/>'
  };
  var LINES = {
    squiggle: '<path d="M3 24c5-10 9 10 14 0s9 10 14 0 6-6 6-6"/>',
    cross: '<path d="M10 10 30 30M30 10 10 30"/>',
    spring: '<path d="M6 30c0-14 8-14 8-4s8 10 8-4 8-14 8 0"/>'
  };

  function shapeSvg(kind) {
    if (SHAPES[kind]) {
      return '<svg viewBox="0 0 40 40">' +
        '<g fill="currentColor" fill-opacity=".22">' + SHAPES[kind] + '</g>' +
        '<g fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" transform="translate(2.5 -2.5)">' + SHAPES[kind] + '</g>' +
        '</svg>';
    }
    return '<svg viewBox="0 0 40 40" fill="none" stroke-linecap="round" stroke-linejoin="round">' +
      '<g stroke="currentColor" stroke-opacity=".22" stroke-width="6">' + LINES[kind] + '</g>' +
      '<g stroke="currentColor" stroke-width="2.4" transform="translate(2 -2)">' + LINES[kind] + '</g>' +
      '</svg>';
  }

  // A seeded random, so the scatter is the same on every visit
  var seed = 7;
  function rand() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }

  var kinds = Object.keys(SHAPES).concat(Object.keys(LINES));
  var bits = [];
  var width = 0, height = 0;

  function build() {
    field.textContent = '';
    bits = [];
    seed = 7;
    var box = hero.getBoundingClientRect();
    width = box.width; height = box.height;
    var count = Math.round(Math.min(56, Math.max(22, (width * height) / 30000)));
    // Spread them over a jittered grid, so none clump and none leave holes
    var cols = Math.ceil(Math.sqrt(count * width / height));
    var rows = Math.ceil(count / cols);
    for (var n = 0; n < count; n++) {
      var c = n % cols, r = Math.floor(n / cols);
      var hx = (c + 0.15 + rand() * 0.7) / cols * width;
      var hy = (r + 0.15 + rand() * 0.7) / rows * height;
      var size = 24 + rand() * 40;
      var el = document.createElement('i');
      el.className = 'bit';
      el.style.setProperty('--size', size.toFixed(0) + 'px');
      el.style.setProperty('--delay', (rand() * 0.6).toFixed(2) + 's');
      el.innerHTML = shapeSvg(kinds[n % kinds.length]);
      rand(); // keeps the scatter where it was
      field.appendChild(el);
      bits.push({
        el: el, hx: hx - size / 2, hy: hy - size / 2,
        x: hx - size / 2, y: hy - size / 2, vx: 0, vy: 0,
        turn: rand() * 360, spin: 0, phase: rand() * 6.28
      });
    }
    draw(0);
  }

  var pointer = { x: -9999, y: -9999, on: false };
  function follow(clientX, clientY) {
    var box = hero.getBoundingClientRect();
    pointer.x = clientX - box.left;
    pointer.y = clientY - box.top;
    pointer.on = true;
  }
  function letGo() { pointer.on = false; }

  function burst(clientX, clientY) {
    var box = hero.getBoundingClientRect();
    var px = clientX - box.left, py = clientY - box.top;
    for (var i = 0; i < bits.length; i++) {
      var b = bits[i];
      var dx = b.x - px, dy = b.y - py;
      var d = Math.hypot(dx, dy) || 1;
      if (d < 360) {
        var push = (1 - d / 360) * 55;
        b.vx += dx / d * push;
        b.vy += dy / d * push;
        b.spin += (rand() - 0.5) * 40;
      }
    }
  }

  function draw(t) {
    for (var i = 0; i < bits.length; i++) {
      var b = bits[i];
      var bob = Math.sin(t * 0.0009 + b.phase) * 5;
      b.el.style.transform = 'translate3d(' + b.x.toFixed(1) + 'px,' + (b.y + bob).toFixed(1) + 'px,0) rotate(' + b.turn.toFixed(1) + 'deg)';
    }
  }

  var RADIUS = 210;
  function step(t) {
    for (var i = 0; i < bits.length; i++) {
      var b = bits[i];
      // springs pull each piece home
      b.vx += (b.hx - b.x) * 0.018;
      b.vy += (b.hy - b.y) * 0.018;
      // the pointer pushes pieces out of its way
      if (pointer.on) {
        var dx = b.x - pointer.x, dy = b.y - pointer.y;
        var d = Math.hypot(dx, dy) || 1;
        if (d < RADIUS) {
          var f = Math.pow(1 - d / RADIUS, 2) * 9;
          b.vx += dx / d * f;
          b.vy += dy / d * f;
          b.spin += (dx > 0 ? 1 : -1) * f * 0.8;
        }
      }
      b.vx *= 0.88; b.vy *= 0.88; b.spin *= 0.92;
      b.x += b.vx; b.y += b.vy;
      b.turn += b.spin + b.vx * 0.6;
    }
    draw(t);
  }

  var running = false, frame = 0;
  function loop(t) { step(t); frame = requestAnimationFrame(loop); }
  function start() { if (!running && !still) { running = true; frame = requestAnimationFrame(loop); } }
  function stop() { running = false; cancelAnimationFrame(frame); }

  build();
  var resizeTimer = 0;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      var box = hero.getBoundingClientRect();
      // phones resize the viewport as the address bar slides; ignore small changes
      if (Math.abs(box.width - width) > 40 || Math.abs(box.height - height) > 120) build();
    }, 200);
  });
  if (still) return;

  window.addEventListener('pointermove', function (e) { follow(e.clientX, e.clientY); }, { passive: true });
  window.addEventListener('touchmove', function (e) {
    if (e.touches[0]) follow(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });
  window.addEventListener('touchend', letGo, { passive: true });
  document.documentElement.addEventListener('pointerleave', letGo);
  hero.addEventListener('pointerdown', function (e) { follow(e.clientX, e.clientY); burst(e.clientX, e.clientY); });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries[0].isIntersecting ? start() : stop();
    }).observe(hero);
  } else {
    start();
  }
})();
