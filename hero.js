// Hero ink currents: fine pen strokes drift across the paper on a slow,
// meandering current and part around the letters of the name like water
// around stones. Moving the cursor or a finger stirs the water, and a click
// or tap drops a blot of coloured ink that the current carries away. Drawn on
// one canvas, and only while the hero is on screen.

(function () {
  var field = document.querySelector('.hero__bits');
  var hero = field && field.closest('.hero');
  if (!field || !hero) return;
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  if (!ctx) return;
  field.appendChild(canvas);
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Plain ink, then the inks a click drops: the deep shade of each section
  var INK = ['43,34,26', '196,82,60', '58,132,82', '52,108,170', '134,80,164'];
  var BANDS = [0.10, 0.22, 0.42]; // oldest third of each trail to newest
  var TRAIL = 22;

  // The current: a steady drift to the right plus a few slow waves of a
  // stream function, so the flow meanders but never bunches up
  var waves = [];
  function makeWaves() {
    var s = Math.max(width, height);
    waves = [
      { l: 0.62, a: 0.30, w: 0.0050, p: 0.0 },
      { l: 0.38, a: 2.05, w: -0.0070, p: 1.7 },
      { l: 0.24, a: 4.10, w: 0.0090, p: 4.1 },
      { l: 0.15, a: 0.90, w: -0.0120, p: 2.6 }
    ].map(function (v) {
      var k = 2 * Math.PI / (v.l * s);
      return { kx: k * Math.cos(v.a), ky: k * Math.sin(v.a), amp: 0.75 / k, w: v.w, p: v.p };
    });
  }
  var DRIFT = 0.75;
  var flow = { x: 0, y: 0 };
  function current(x, y, t) {
    var vx = DRIFT, vy = 0;
    for (var i = 0; i < waves.length; i++) {
      var q = waves[i], c = q.amp * Math.cos(q.kx * x + q.ky * y + q.w * t + q.p);
      vx += c * q.ky;
      vy -= c * q.kx;
    }
    flow.x = vx; flow.y = vy;
  }

  // The name's letters as boxes around their ink, in hero coordinates. Each
  // letter's ink is measured once on a canvas, in ems from its baseline; where
  // the letter is now comes from a Range over it, which follows the wordmark's
  // scroll-driven move and scale.
  var logo = document.querySelector('.logo__text');
  var letters = [], ink = null, boxes = [];
  function measureInk() {
    var probe = document.createElement('canvas').getContext('2d');
    if (!probe || !logo) return;
    probe.font = '400 100px "EB Garamond"';
    var m = probe.measureText('H');
    ink = { asc: m.fontBoundingBoxAscent / 100, desc: m.fontBoundingBoxDescent / 100 };
    if (!ink.asc) { ink = null; return; }
    letters = [];
    var walker = document.createTreeWalker(logo, NodeFilter.SHOW_TEXT);
    for (var node; (node = walker.nextNode());) {
      for (var i = 0; i < node.length; i++) {
        var ch = node.data[i];
        if (/\s/.test(ch)) continue;
        var g = probe.measureText(ch), range = document.createRange();
        range.setStart(node, i); range.setEnd(node, i + 1);
        letters.push({
          range: range,
          left: g.actualBoundingBoxLeft / 100, right: g.actualBoundingBoxRight / 100,
          up: g.actualBoundingBoxAscent / 100, down: g.actualBoundingBoxDescent / 100
        });
      }
    }
  }
  function findLetters() {
    boxes.length = 0;
    if (!ink) return;
    var hb = hero.getBoundingClientRect();
    for (var i = 0; i < letters.length; i++) {
      var L = letters[i], r = L.range.getBoundingClientRect();
      if (!r.height) continue;
      var em = r.height / (ink.asc + ink.desc), base = r.top + ink.asc * em;
      var pad = Math.max(3, em * 0.03);
      boxes.push({
        l: r.left - L.left * em - hb.left - pad, r: r.left + L.right * em - hb.left + pad,
        t: base - L.up * em - hb.top - pad, b: base + L.down * em - hb.top + pad,
        m: Math.max(18, em * 0.22) // how far ahead the water feels the letter
      });
    }
  }
  function inside(x, y) {
    for (var j = 0; j < boxes.length; j++) {
      var q = boxes[j];
      if (x > q.l && x < q.r && y > q.t && y < q.b) return true;
    }
    return false;
  }

  // Near a letter the water stops flowing into it and slides along its side
  // instead, keeping its speed; anything already inside is put back outside
  var out = { x: 0, y: 0, vx: 0, vy: 0, hit: false };
  function steer(x, y, vx, vy) {
    out.hit = false;
    for (var j = 0; j < boxes.length; j++) {
      var q = boxes[j];
      var nx = Math.max(q.l, Math.min(x, q.r)), ny = Math.max(q.t, Math.min(y, q.b));
      var dx = x - nx, dy = y - ny, d = Math.sqrt(dx * dx + dy * dy);
      if (d >= q.m) continue;
      if (d < 2) out.hit = true;
      var ux, uy;
      if (d > 0) { ux = dx / d; uy = dy / d; }
      else {
        var toL = x - q.l, toR = q.r - x, toT = y - q.t, toB = q.b - y;
        var least = Math.min(toL, toR, toT, toB);
        ux = least === toL ? -1 : least === toR ? 1 : 0;
        uy = ux ? 0 : least === toT ? -1 : 1;
        x += ux * (least + 1); y += uy * (least + 1);
      }
      var vn = vx * ux + vy * uy;
      if (vn < 0) {
        var w = 1 - d / q.m; w = Math.sqrt(w);
        var tx = -uy, ty = ux, vt = vx * tx + vy * ty;
        if (vt < 0) { tx = -tx; ty = -ty; vt = -vt; }
        vx -= vn * ux * w; vy -= vn * uy * w;
        vx -= vn * tx * w * 0.8; vy -= vn * ty * w * 0.8; // vn < 0: speeds it along
      }
    }
    out.x = x; out.y = y; out.vx = vx; out.vy = vy;
  }

  // Each stream is a ring of its last TRAIL points. When its time is up it
  // stops moving and its tail catches up with its head, then it starts over.
  var streams = [], width = 0, height = 0, dpr = 1, clock = 0;
  function Stream() {
    this.xs = new Float32Array(TRAIL); this.ys = new Float32Array(TRAIL);
    this.spawn(true);
  }
  Stream.prototype.spawn = function (first) {
    var x, y, tries = 0;
    do {
      x = Math.random() * width; y = Math.random() * height;
      // new streams lean towards the upstream edge, so the left never runs dry
      if (!first && Math.random() < 0.3) x = Math.random() * width * 0.12;
    } while (inside(x, y) && ++tries < 8);
    this.x = x; this.y = y; this.vx = 0; this.vy = 0;
    this.head = 0; this.len = 1; this.xs[0] = x; this.ys[0] = y;
    this.life = first ? Math.random() * 520 : 260 + Math.random() * 520;
    this.dying = false;
    this.ink = 0;
  };
  Stream.prototype.step = function (t) {
    if (this.dying) {
      if (--this.len <= 0) this.spawn(false);
      return;
    }
    current(this.x, this.y, t);
    var vx = flow.x + this.vx, vy = flow.y + this.vy;
    if (pointer.on) {
      // the pointer drags the water along with it, strongest close by
      var dx = this.x - pointer.x, dy = this.y - pointer.y, d2 = dx * dx + dy * dy;
      if (d2 < STIR * STIR) {
        var f = 1 - Math.sqrt(d2) / STIR; f *= f;
        vx += pointer.vx * f * 0.55; vy += pointer.vy * f * 0.55;
      }
    }
    steer(this.x + vx, this.y + vy, vx, vy);
    this.x = out.x; this.y = out.y;
    this.vx *= 0.94; this.vy *= 0.94;
    this.head = (this.head + 1) % TRAIL;
    this.xs[this.head] = this.x; this.ys[this.head] = this.y;
    if (this.len < TRAIL) this.len++;
    if (out.hit || --this.life <= 0 || this.x < -40 || this.x > width + 40 || this.y < -40 || this.y > height + 40) this.dying = true;
  };

  function build() {
    var box = hero.getBoundingClientRect();
    width = box.width; height = box.height;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    makeWaves();
    findLetters();
    var count = Math.round(Math.min(900, Math.max(260, (width * height) / 1900)));
    streams = [];
    for (var i = 0; i < count; i++) streams.push(new Stream());
  }

  // Drawn in batches, one path per ink per third of the trail, so the
  // strokes thin out towards their tails without a stroke() per stream
  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (var c = 0; c < INK.length; c++) {
      ctx.lineWidth = c ? 1.7 : 1.1;
      for (var band = 0; band < BANDS.length; band++) {
        ctx.beginPath();
        var any = false;
        for (var i = 0; i < streams.length; i++) {
          var s = streams[i];
          if (s.ink !== c || s.len < 2) continue;
          var from = Math.floor((s.len - 1) * band / BANDS.length);
          var to = Math.floor((s.len - 1) * (band + 1) / BANDS.length);
          if (to <= from) continue;
          var start = s.head - (s.len - 1) + TRAIL;
          var k = (start + from) % TRAIL;
          ctx.moveTo(s.xs[k], s.ys[k]);
          for (var n = from + 1; n <= to; n++) {
            k = (start + n) % TRAIL;
            ctx.lineTo(s.xs[k], s.ys[k]);
          }
          any = true;
        }
        if (!any) continue;
        ctx.strokeStyle = 'rgba(' + INK[c] + ',' + (c ? Math.min(1, BANDS[band] * 2.4) : BANDS[band]) + ')';
        ctx.stroke();
      }
    }
  }

  function step() {
    clock++;
    findLetters();
    pointer.vx *= 0.85; pointer.vy *= 0.85;
    for (var i = 0; i < streams.length; i++) streams[i].step(clock);
    draw();
  }

  var STIR = 150;
  var pointer = { x: -9999, y: -9999, vx: 0, vy: 0, on: false };
  function follow(clientX, clientY) {
    var box = hero.getBoundingClientRect();
    var x = clientX - box.left, y = clientY - box.top;
    if (pointer.on) {
      pointer.vx += Math.max(-30, Math.min(30, x - pointer.x)) * 0.5;
      pointer.vy += Math.max(-30, Math.min(30, y - pointer.y)) * 0.5;
    }
    pointer.x = x; pointer.y = y; pointer.on = true;
  }
  function letGo() { pointer.on = false; pointer.vx = pointer.vy = 0; }

  // A click drops a blot of the next ink: nearby streams take its colour
  // and are pushed outward, as if the drop had just landed
  var nextInk = 1;
  function drop(clientX, clientY) {
    var box = hero.getBoundingClientRect();
    var px = clientX - box.left, py = clientY - box.top;
    var R = Math.min(130, Math.max(80, width * 0.08));
    for (var i = 0; i < streams.length; i++) {
      var s = streams[i];
      var dx = s.x - px, dy = s.y - py, d = Math.sqrt(dx * dx + dy * dy) || 1;
      if (d > R) continue;
      s.ink = nextInk;
      s.dying = false;
      s.life = Math.max(s.life, 300 + Math.random() * 300);
      var push = (1 - d / R) * 7;
      s.vx += dx / d * push; s.vy += dy / d * push;
    }
    var fresh = Math.round(R * 0.5);
    for (var f = 0; f < fresh; f++) {
      var a = Math.random() * 6.283, r = Math.sqrt(Math.random()) * R * 0.5;
      var x = px + Math.cos(a) * r, y = py + Math.sin(a) * r;
      if (inside(x, y)) continue;
      var t = streams[Math.floor(Math.random() * streams.length)];
      t.spawn(false);
      t.x = t.xs[t.head] = x; t.y = t.ys[t.head] = y;
      t.ink = nextInk;
      t.life = 300 + Math.random() * 300;
      t.vx = Math.cos(a) * (2 + r / R * 8); t.vy = Math.sin(a) * (2 + r / R * 8);
    }
    nextInk = nextInk % (INK.length - 1) + 1;
  }

  var running = false, frame = 0;
  function loop() { step(); frame = requestAnimationFrame(loop); }
  function start() { if (!running && !still) { running = true; frame = requestAnimationFrame(loop); } }
  function stop() { running = false; cancelAnimationFrame(frame); }

  // Reduced motion: let the current run unseen for a while, then show one
  // still frame of it
  function settleStill() {
    if (!still) return;
    for (var i = 0; i < 160; i++) { clock++; for (var j = 0; j < streams.length; j++) streams[j].step(clock); }
    draw();
  }

  build();
  settleStill();
  function inkReady() { measureInk(); findLetters(); if (still) { build(); settleStill(); } }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(inkReady); else inkReady();
  var resizeTimer = 0;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      var box = hero.getBoundingClientRect();
      // phones resize the viewport as the address bar slides; ignore small changes
      if (Math.abs(box.width - width) > 40 || Math.abs(box.height - height) > 120) { build(); settleStill(); }
    }, 200);
  });
  if (still) return;

  window.addEventListener('pointermove', function (e) { follow(e.clientX, e.clientY); }, { passive: true });
  window.addEventListener('touchmove', function (e) {
    if (e.touches[0]) follow(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });
  window.addEventListener('touchend', letGo, { passive: true });
  document.documentElement.addEventListener('pointerleave', letGo);
  hero.addEventListener('pointerdown', function (e) { follow(e.clientX, e.clientY); drop(e.clientX, e.clientY); });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries[0].isIntersecting ? start() : stop();
    }).observe(hero);
  } else {
    start();
  }
})();
