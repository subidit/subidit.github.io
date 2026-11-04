// Fountain pens: a writing pad with four nibs and four inks, the nib anatomy
// list, and reveals. An italic nib is modelled as a short straight edge held
// at a fixed angle: each movement sweeps that edge, so the stroke is thick
// when you pull across the edge and hairline when you pull along it. Fresh
// ink is drawn wet and dries over a moment; iron gall goes on pale and
// darkens over several seconds, as it oxidises.

(function () {
  var root = document.documentElement;
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Reveals ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -12% 0px' });
    reveals.forEach(function (r) { io.observe(r); });
  } else reveals.forEach(function (r) { r.classList.add('is-in'); });

  /* ---------- Anatomy ---------- */
  var nibSvg = document.querySelector('.anatomy__nib');
  var items = document.querySelectorAll('.anatomy__list li');
  function focusPart(name) {
    nibSvg.classList.toggle('is-focus', !!name);
    nibSvg.querySelectorAll('.part').forEach(function (p) { p.classList.toggle('on', p.getAttribute('data-p') === name); });
    items.forEach(function (li) { li.classList.toggle('on', li.getAttribute('data-p') === name); });
  }
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  items.forEach(function (li) {
    var name = li.getAttribute('data-p'), btn = li.querySelector('button');
    btn.addEventListener('click', function () { focusPart(li.classList.contains('on') && !fine ? null : name); });
    btn.addEventListener('focus', function () { focusPart(name); });
    if (fine) li.addEventListener('pointerenter', function () { focusPart(name); });
  });
  document.querySelector('.anatomy__list').addEventListener('pointerleave', function () { if (fine) focusPart(null); });

  /* ---------- Inks ---------- */
  // accent: the page colour; wet/dry: fresh and dried ink; pool: where the
  // nib slows down, ink collects darker
  var INKS = {
    iron:    { accent: '#2a3a63', wet: [118, 140, 178], dry: [26, 29, 42], pool: .25, dryTime: 9000 },
    oxblood: { accent: '#6e1f2a', wet: [150, 44, 58],   dry: [104, 28, 40], pool: .3, dryTime: 1400 },
    sepia:   { accent: '#6b4a2b', wet: [140, 100, 62],  dry: [98, 66, 38],  pool: .3, dryTime: 1400 },
    teal:    { accent: '#1c5b5a', wet: [34, 120, 118],  dry: [22, 84, 84],  pool: .3, dryTime: 1400 }
  };
  var ink = INKS.iron;
  document.querySelectorAll('input[name=ink]').forEach(function (r) {
    r.addEventListener('change', function () { ink = INKS[r.value]; root.style.setProperty('--ink', ink.accent); });
  });

  /* ---------- Nibs ---------- */
  var NIBS = {
    fine:   { edge: 0, round: 1.6 },
    stub:   { edge: 7, round: 2.2, angle: 30 },
    italic: { edge: 13, round: .9, angle: 40 },
    flex:   { edge: 0, round: 1.4, flex: 8 }
  };
  var nib = NIBS.italic;
  document.querySelectorAll('input[name=nib]').forEach(function (r) {
    r.addEventListener('change', function () { nib = NIBS[r.value]; });
  });

  /* ---------- Pad ---------- */
  var paper = document.querySelector('.pad__paper');
  var canvas = document.getElementById('pad'), ctx = canvas.getContext('2d');
  var dryCanvas = document.createElement('canvas'), dry = dryCanvas.getContext('2d');
  var hint = document.getElementById('pad-hint');
  var W = 0, H = 0, dpr = 1;
  function size() {
    var r = paper.getBoundingClientRect();
    var old = null;
    if (W) { old = document.createElement('canvas'); old.width = dryCanvas.width; old.height = dryCanvas.height; old.getContext('2d').drawImage(dryCanvas, 0, 0); }
    W = r.width; H = r.height; dpr = Math.min(2, window.devicePixelRatio || 1);
    [canvas, dryCanvas].forEach(function (c) { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); });
    if (old) dry.drawImage(old, 0, 0);
    render(performance.now());
  }

  var wet = [];          // segments still drying
  var last = null, flexW = 1.4, written = false;
  function mix(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  function rgb(c) { return 'rgb(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ')'; }

  function addSegment(x0, y0, x1, y1, speed, pressure) {
    var dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy);
    if (len < .01) return;
    // slow strokes pool darker
    var pool = Math.max(0, Math.min(1, 1 - speed / 1.6)) * ink.pool;
    var seg = { t: performance.now(), ink: ink, pool: pool, poly: null, w: 0, x0: x0, y0: y0, x1: x1, y1: y1 };
    if (nib.edge) {
      var a = nib.angle * Math.PI / 180, hx = Math.cos(a) * nib.edge / 2, hy = -Math.sin(a) * nib.edge / 2;
      // overlap neighbours by half a pixel: the ink is opaque, and the overlap
      // hides the anti-aliased seam between sweeps
      var ox = dx / len * .5, oy = dy / len * .5;
      var ax = x0 - ox, ay = y0 - oy, bx = x1 + ox, by = y1 + oy;
      seg.poly = [ax + hx, ay + hy, bx + hx, by + hy, bx - hx, by - hy, ax - hx, ay - hy];
      seg.w = nib.round;
    } else if (nib.flex) {
      // pressure from a stylus, or slowness from a mouse or finger, spreads the tines
      var target = pressure ? 1.2 + pressure * nib.flex : 1.2 + Math.max(0, 1 - speed / 1.2) * nib.flex * .8;
      flexW += (target - flexW) * .18;
      seg.w = flexW;
    } else seg.w = nib.round;
    wet.push(seg);
  }

  function colourAt(seg, now) {
    var k = Math.min(1, (now - seg.t) / seg.ink.dryTime);
    k = Math.round((1 - Math.pow(1 - k, 2)) * 40) / 40;
    var c = mix(seg.ink.wet, seg.ink.dry, k);
    return rgb(mix(c, [0, 0, 0], Math.round(seg.pool * 24) / 24));
  }
  // Segments of one colour and width are filled as one path, so adjacent
  // sweeps merge instead of leaving hairline seams between them
  function paint(c, segs, now) {
    var groups = {}, keys = [];
    for (var i = 0; i < segs.length; i++) {
      var s = segs[i], col = colourAt(s, now), key = col + s.w.toFixed(1);
      var g = groups[key];
      if (!g) { g = groups[key] = { col: col, w: s.w, poly: new Path2D(), line: new Path2D(), any: false }; keys.push(key); }
      if (s.poly) {
        var p = s.poly;
        g.poly.moveTo(p[0], p[1]); g.poly.lineTo(p[2], p[3]); g.poly.lineTo(p[4], p[5]); g.poly.lineTo(p[6], p[7]); g.poly.closePath();
        g.any = true;
      }
      g.line.moveTo(s.x0, s.y0); g.line.lineTo(s.x1, s.y1);
    }
    c.lineCap = 'round'; c.lineJoin = 'round';
    for (var j = 0; j < keys.length; j++) {
      var q = groups[keys[j]];
      c.fillStyle = c.strokeStyle = q.col;
      if (q.any) c.fill(q.poly);
      c.lineWidth = q.w; c.stroke(q.line);
    }
  }

  var raf = 0;
  function render(now) {
    // segments that have dried are painted once onto the dry layer
    dry.setTransform(dpr, 0, 0, dpr, 0, 0);
    var keep = [], done = [];
    for (var i = 0; i < wet.length; i++) (now - wet[i].t >= wet[i].ink.dryTime ? done : keep).push(wet[i]);
    if (done.length) paint(dry, done, now);
    wet = keep;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(dryCanvas, 0, 0);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    paint(ctx, wet, now);
    raf = wet.length ? requestAnimationFrame(render) : 0;
  }
  function kick() { if (!raf) raf = requestAnimationFrame(render); }

  function pos(e) { var r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top, t: e.timeStamp, p: e.pointerType === 'pen' ? e.pressure : 0 }; }
  function stroke(pt) {
    if (!last) { last = pt; return; }
    var dist = Math.hypot(pt.x - last.x, pt.y - last.y);
    var dt = Math.max(1, pt.t - last.t);
    var speed = dist / dt; // px per ms
    var steps = Math.max(1, Math.ceil(dist / 1.5));
    for (var i = 0; i < steps; i++) {
      var a = i / steps, b = (i + 1) / steps;
      addSegment(last.x + (pt.x - last.x) * a, last.y + (pt.y - last.y) * a, last.x + (pt.x - last.x) * b, last.y + (pt.y - last.y) * b, speed, pt.p);
    }
    last = pt;
    kick();
  }
  canvas.addEventListener('pointerdown', function (e) {
    e.preventDefault();
    canvas.setPointerCapture(e.pointerId);
    last = null; flexW = 1.4;
    stroke(pos(e));
    if (!written) { written = true; hint.classList.add('is-gone'); }
  });
  canvas.addEventListener('pointermove', function (e) {
    if (!canvas.hasPointerCapture(e.pointerId)) return;
    var evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    for (var i = 0; i < evs.length; i++) stroke(pos(evs[i]));
  });
  function lift() { last = null; }
  canvas.addEventListener('pointerup', lift);
  canvas.addEventListener('pointercancel', lift);

  document.getElementById('pad-clear').addEventListener('click', function () {
    var clear = function () {
      wet = []; dry.setTransform(1, 0, 0, 1, 0, 0); dry.clearRect(0, 0, dryCanvas.width, dryCanvas.height);
      render(performance.now());
      canvas.style.opacity = '';
    };
    if (still) return clear();
    canvas.style.transition = 'opacity .35s cubic-bezier(0.23, 1, 0.32, 1)';
    canvas.style.opacity = '0';
    setTimeout(clear, 360);
  });

  size();
  var rt = 0;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(size, 150); });
})();
