// Watches: a live dial, a working movement you can slow down, four seconds
// hands at different beat rates, and two small counts that light up as they
// come on screen. One animation loop drives everything visible.

(function () {
  var NS = 'http://www.w3.org/2000/svg';
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function el(name, attrs, parent) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function easeOut(p) { return 1 - Math.pow(1 - p, 4); }
  function easeInOut(p) { return p < .5 ? 8 * p * p * p * p : 1 - Math.pow(-2 * p + 2, 4) / 2; }

  /* ---------- Hero dial ---------- */
  var ticks = document.getElementById('dial-ticks');
  for (var i = 0; i < 60; i++) {
    var hour = i % 5 === 0;
    var g = el('g', { transform: 'rotate(' + i * 6 + ')', style: '--i:' + i }, ticks);
    el('line', hour ? { class: 'tick tick--hour', x1: 0, x2: 0, y1: -176, y2: i === 0 ? -146 : -152 } : { class: 'tick', x1: 0, x2: 0, y1: -178, y2: -170 }, g);
    if (hour) el('circle', { class: 'lume-dot', cx: 0, cy: -138, r: i === 0 ? 4.2 : 3.2 }, g);
  }
  var hands = { h: document.getElementById('hand-h'), m: document.getElementById('hand-m'), s: document.getElementById('hand-s') };
  var born = performance.now();
  function drawDial(now) {
    var d = new Date();
    var ms = d.getSeconds() * 1000 + d.getMilliseconds();
    // eight steps a second, like a 28,800 beat movement
    var sec = still ? d.getSeconds() : Math.floor(ms / 125) / 8;
    var min = d.getMinutes() + ms / 60000;
    var hr = (d.getHours() % 12) + min / 60;
    var p = still ? 1 : easeOut(Math.min(1, (now - born - 500) / 1400));
    if (p < 0) p = 0;
    hands.h.setAttribute('transform', 'rotate(' + (hr * 30 * p).toFixed(2) + ')');
    hands.m.setAttribute('transform', 'rotate(' + (min * 6 * p).toFixed(2) + ')');
    hands.s.setAttribute('transform', 'rotate(' + (sec * 6 * p).toFixed(2) + ')');
  }

  /* ---------- The movement ---------- */
  function gearPath(r, n, depth) {
    var d = '', step = Math.PI * 2 / n;
    for (var i = 0; i < n; i++) {
      var a = i * step, pts = [[r - depth, a], [r, a + step * .22], [r, a + step * .48], [r - depth, a + step * .7]];
      for (var j = 0; j < 4; j++) {
        var x = Math.cos(pts[j][1]) * pts[j][0], y = Math.sin(pts[j][1]) * pts[j][0];
        d += (i === 0 && j === 0 ? 'M' : 'L') + x.toFixed(2) + ' ' + y.toFixed(2);
      }
    }
    return d + 'Z';
  }
  function wheel(parent, cx, cy, r, teeth, spokes, pinion) {
    var at = el('g', { transform: 'translate(' + cx + ' ' + cy + ')' }, parent);
    var spin = el('g', {}, at);
    el('path', { class: 'metal', d: gearPath(r, teeth, Math.max(3, r * .07)) }, spin);
    el('circle', { class: 'edge', r: r * .78 }, spin);
    el('circle', { class: 'edge', r: r * .2 }, spin);
    for (var i = 0; i < spokes; i++) {
      var a = i * Math.PI * 2 / spokes;
      el('line', { class: 'edge', x1: Math.cos(a) * r * .2, y1: Math.sin(a) * r * .2, x2: Math.cos(a) * r * .78, y2: Math.sin(a) * r * .78 }, spin);
    }
    if (pinion) el('path', { class: 'metal', d: gearPath(pinion, 8, 3) }, spin);
    el('circle', { class: 'jewel', r: 3 }, at);
    return spin;
  }

  var mv = document.getElementById('movement');
  var parts = {
    power: document.getElementById('p-power'), train: document.getElementById('p-train'),
    escapement: document.getElementById('p-escapement'), balance: document.getElementById('p-balance')
  };

  // Barrel, with its coiled mainspring showing through
  var barrel = wheel(parts.power, 150, 150, 95, 72, 0, 0);
  var coil = '';
  for (var t = 0; t <= 7 * Math.PI * 2; t += .15) {
    var rr = 16 + t * 1.38;
    coil += (t === 0 ? 'M' : 'L') + (Math.cos(t) * rr).toFixed(1) + ' ' + (Math.sin(t) * rr).toFixed(1);
  }
  el('path', { class: 'edge', d: coil }, barrel);

  var center = wheel(parts.train, 226, 226, 70, 64, 4, 12);
  var third = wheel(parts.train, 300, 262, 55, 60, 4, 12);
  var fourth = wheel(parts.train, 330, 320, 50, 60, 4, 10);
  el('line', { class: 'sec', x1: 0, y1: 8, x2: 0, y2: -42 }, fourth);

  // Escape wheel: fifteen ratchet teeth
  var escAt = el('g', { transform: 'translate(385 348)' }, parts.escapement);
  var esc = el('g', {}, escAt);
  var ed = '';
  for (var k = 0; k < 15; k++) {
    var a0 = k * Math.PI * 2 / 15, s = Math.PI * 2 / 15;
    var pts = [[21, a0], [31, a0 + s * .18], [29, a0 + s * .34], [21, a0 + s * .62]];
    for (var q = 0; q < 4; q++) ed += (k === 0 && q === 0 ? 'M' : 'L') + (Math.cos(pts[q][1]) * pts[q][0]).toFixed(2) + ' ' + (Math.sin(pts[q][1]) * pts[q][0]).toFixed(2);
  }
  el('path', { class: 'metal', d: ed + 'Z' }, esc);
  el('circle', { class: 'edge', r: 16 }, esc);
  for (var sp = 0; sp < 4; sp++) {
    var sa = sp * Math.PI / 2;
    el('line', { class: 'edge', x1: Math.cos(sa) * 5, y1: Math.sin(sa) * 5, x2: Math.cos(sa) * 16, y2: Math.sin(sa) * 16 }, esc);
  }
  el('path', { class: 'metal', d: gearPath(9, 7, 2.5) }, esc);
  el('circle', { class: 'jewel', r: 2.4 }, escAt);

  // Pallet fork, pointing from the escape wheel to the balance
  var pivot = [408, 402];
  var base = Math.atan2(470 - pivot[1], 440 - pivot[0]) * 180 / Math.PI - 90;
  var forkAt = el('g', { transform: 'translate(' + pivot.join(' ') + ') rotate(' + base.toFixed(2) + ')' }, parts.escapement);
  var fork = el('g', {}, forkAt);
  el('path', { class: 'metal', d: 'M-30 -22 L30 -22 L30 -16 L4 -14 L3 56 L8 58 L8 66 L3 64 L-3 64 L-8 66 L-8 58 L-3 56 L-4 -14 L-30 -16 Z' }, fork);
  el('rect', { class: 'jewel', x: -25, y: -34, width: 5, height: 13, rx: 1 }, fork);
  el('rect', { class: 'jewel', x: 20, y: -34, width: 5, height: 13, rx: 1 }, fork);
  el('circle', { class: 'jewel', r: 2.4 }, forkAt);

  // Balance wheel and hairspring
  var balAt = el('g', { transform: 'translate(440 470)' }, parts.balance);
  var hair = el('path', { class: 'hairspring', d: '' }, balAt);
  var bal = el('g', {}, balAt);
  el('circle', { class: 'metal', r: 80, 'stroke-width': 1.2, fill: 'none', style: 'fill:none;stroke-width:9' }, bal);
  el('circle', { class: 'edge', r: 84.5 }, bal);
  el('circle', { class: 'edge', r: 75.5 }, bal);
  for (var bs = 0; bs < 3; bs++) {
    var ba = bs * Math.PI * 2 / 3 - Math.PI / 2;
    el('line', { class: 'edge', x1: Math.cos(ba) * 8, y1: Math.sin(ba) * 8, x2: Math.cos(ba) * 76, y2: Math.sin(ba) * 76, 'stroke-width': 2.4 }, bal);
  }
  for (var sc = 0; sc < 8; sc++) {
    var sca = sc * Math.PI / 4;
    el('circle', { class: 'metal', cx: Math.cos(sca) * 80, cy: Math.sin(sca) * 80, r: 3.2 }, bal);
  }
  el('circle', { class: 'jewel', cx: 0, cy: -13, r: 2.6 }, bal); // the roller jewel the fork kicks
  el('circle', { class: 'jewel', r: 3 }, balAt);
  function hairspring(angle) {
    // the spiral winds and unwinds a little as the balance swings
    var d = '', twist = angle * Math.PI / 180 * .5;
    for (var t = 0; t <= 9 * Math.PI * 2; t += .2) {
      var r = 7 + t * .45, a = t + twist * (1 - t / (9 * Math.PI * 2));
      d += (t === 0 ? 'M' : 'L') + (Math.cos(a) * r).toFixed(1) + ' ' + (Math.sin(a) * r).toFixed(1);
    }
    return d;
  }

  var sim = 0, speed = 1 / 8;
  function drawMovement() {
    var phi = sim * 2 * Math.PI * 4; // four full swings a second
    var balAngle = 220 * Math.sin(phi);
    var n = Math.floor(phi / Math.PI), fr = phi / Math.PI - n;
    var prog = easeOut(Math.min(1, fr / .16));
    var target = (n % 2 ? 1 : -1) * 9;
    var forkAngle = -target + 2 * target * prog;
    var E = (n + prog) * 12;
    bal.setAttribute('transform', 'rotate(' + balAngle.toFixed(2) + ')');
    hair.setAttribute('d', hairspring(balAngle));
    fork.setAttribute('transform', 'rotate(' + forkAngle.toFixed(2) + ')');
    esc.setAttribute('transform', 'rotate(' + E.toFixed(2) + ')');
    fourth.setAttribute('transform', 'rotate(' + (-E / 16).toFixed(3) + ')');
    third.setAttribute('transform', 'rotate(' + (E / 16 / 7.5).toFixed(3) + ')');
    center.setAttribute('transform', 'rotate(' + (-E / 16 / 60).toFixed(4) + ')');
    barrel.setAttribute('transform', 'rotate(' + (E / 16 / 60 / 8).toFixed(5) + ')');
  }

  var range = document.getElementById('speed'), out = document.getElementById('speed-out');
  function setSpeed() {
    var v = +range.value;
    speed = Math.pow(2, -6 + 6 * v / 100);
    var label = speed > .97 ? 'Actual speed' : '1/' + Math.round(1 / speed) + ' speed';
    out.textContent = label;
    range.setAttribute('aria-valuetext', label);
  }
  range.value = 50;
  range.addEventListener('input', setSpeed);
  setSpeed();

  // Highlight the part each step is about
  var steps = document.querySelectorAll('.step');
  if ('IntersectionObserver' in window) {
    var stepObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        steps.forEach(function (s) { s.classList.toggle('is-active', s === e.target); });
        mv.setAttribute('data-active', e.target.getAttribute('data-part'));
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach(function (s) { stepObs.observe(s); });
  }
  steps[0].classList.add('is-active');

  /* ---------- Four seconds hands ---------- */
  var minis = [].map.call(document.querySelectorAll('.mini svg'), function (svg) {
    el('circle', { class: 'rim', r: 46 }, svg);
    for (var i = 0; i < 60; i++) {
      el('line', { class: i % 5 ? 't' : 't t5', x1: 0, x2: 0, y1: -43, y2: i % 5 ? -40 : -37, transform: 'rotate(' + i * 6 + ')' }, svg);
    }
    var hand = el('line', { class: 'h', x1: 0, y1: 8, x2: 0, y2: -38 }, svg);
    el('circle', { r: 2.2, fill: 'var(--lume)' }, svg);
    return { hand: hand, beats: +svg.getAttribute('data-beats') };
  });
  function drawMinis(now) {
    var t = still ? 10 : now / 1000;
    for (var i = 0; i < minis.length; i++) {
      var b = minis[i].beats;
      minis[i].hand.setAttribute('transform', 'rotate(' + (Math.floor(t * b) / b * 6).toFixed(2) + ')');
    }
  }

  /* ---------- Rubies and people ---------- */
  var jewels = document.querySelector('.jewels');
  for (var j = 0; j < 17; j++) { var r = document.createElement('i'); r.style.setProperty('--i', j); jewels.appendChild(r); }
  var people = document.getElementById('people');
  for (var p = 0; p < 90; p++) {
    var dot = document.createElement('i');
    if (p >= 33) { dot.className = 'gone'; dot.style.setProperty('--k', 89 - p); }
    people.appendChild(dot);
  }

  /* ---------- Reveal on scroll ---------- */
  var visible = { dial: true, movement: false, beats: false };
  if ('IntersectionObserver' in window) {
    var rev = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); rev.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -15% 0px' });
    document.querySelectorAll('.reveal').forEach(function (s) { rev.observe(s); });
    var watch = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { visible[e.target.getAttribute('data-v')] = e.isIntersecting; });
    });
    document.querySelector('.dial').setAttribute('data-v', 'dial');
    document.querySelector('.movement').setAttribute('data-v', 'movement');
    document.querySelector('.beats').setAttribute('data-v', 'beats');
    ['.dial', '.movement', '.beats'].forEach(function (s) { watch.observe(document.querySelector(s)); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (s) { s.classList.add('is-in'); });
    visible.movement = visible.beats = true;
  }

  /* ---------- One loop ---------- */
  drawDial(performance.now());
  drawMovement();
  drawMinis(performance.now());
  if (still) {
    // a clock still tells the time: once a second, no sweep
    setInterval(function () { drawDial(performance.now()); }, 1000);
    document.querySelector('.speed').hidden = true;
    return;
  }
  var last = performance.now();
  function loop(now) {
    var dt = Math.min(.1, (now - last) / 1000); last = now;
    sim += dt * speed;
    if (visible.dial) drawDial(now);
    if (visible.movement) drawMovement();
    if (visible.beats) drawMinis(now);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
