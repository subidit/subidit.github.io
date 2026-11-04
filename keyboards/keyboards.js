// Mechanical keyboards: a 60% board that follows your real keyboard (or your
// taps), three switch sounds synthesised with WebAudio, a force curve with a
// dot that rides it on every press, and a switch that comes apart as you
// scroll.

(function () {
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var body = document.body;

  /* ---------- Layout ---------- */
  // [code, legend, width, kind, character typed by a tap]
  var ROWS = [
    [['Escape', 'Esc', 1, 'hot'], ['Digit1', '1'], ['Digit2', '2'], ['Digit3', '3'], ['Digit4', '4'], ['Digit5', '5'], ['Digit6', '6'], ['Digit7', '7'], ['Digit8', '8'], ['Digit9', '9'], ['Digit0', '0'], ['Minus', '-'], ['Equal', '='], ['Backspace', 'Back', 2, 'mod']],
    [['Tab', 'Tab', 1.5, 'mod'], ['KeyQ', 'Q'], ['KeyW', 'W'], ['KeyE', 'E'], ['KeyR', 'R'], ['KeyT', 'T'], ['KeyY', 'Y'], ['KeyU', 'U'], ['KeyI', 'I'], ['KeyO', 'O'], ['KeyP', 'P'], ['BracketLeft', '['], ['BracketRight', ']'], ['Backslash', '\\', 1.5, 'mod']],
    [['CapsLock', 'Caps', 1.75, 'mod'], ['KeyA', 'A'], ['KeyS', 'S'], ['KeyD', 'D'], ['KeyF', 'F'], ['KeyG', 'G'], ['KeyH', 'H'], ['KeyJ', 'J'], ['KeyK', 'K'], ['KeyL', 'L'], ['Semicolon', ';'], ['Quote', "'"], ['Enter', 'Enter', 2.25, 'hot']],
    [['ShiftLeft', 'Shift', 2.25, 'mod'], ['KeyZ', 'Z'], ['KeyX', 'X'], ['KeyC', 'C'], ['KeyV', 'V'], ['KeyB', 'B'], ['KeyN', 'N'], ['KeyM', 'M'], ['Comma', ','], ['Period', '.'], ['Slash', '/'], ['ShiftRight', 'Shift', 2.75, 'mod']],
    [['ControlLeft', 'Ctrl', 1.25, 'mod'], ['MetaLeft', 'Win', 1.25, 'mod'], ['AltLeft', 'Alt', 1.25, 'mod'], ['Space', '', 6.25, 'alpha'], ['AltRight', 'Alt', 1.25, 'mod'], ['MetaRight', 'Fn', 1.25, 'mod'], ['ContextMenu', 'Menu', 1.25, 'mod'], ['ControlRight', 'Ctrl', 1.25, 'mod']]
  ];
  var ALIAS = { Backquote: 'Escape', OSLeft: 'MetaLeft', OSRight: 'MetaRight', IntlBackslash: 'ShiftLeft', NumpadEnter: 'Enter' };
  var board = document.getElementById('board');
  var keys = {};
  ROWS.forEach(function (row) {
    var r = document.createElement('div'); r.className = 'row';
    row.forEach(function (k) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'key k-' + (k[3] || 'alpha');
      b.style.setProperty('--w', k[2] || 1);
      if (k[1].length > 1) b.setAttribute('data-small', '');
      b.setAttribute('aria-label', k[0] === 'Space' ? 'Space' : k[1]);
      b.tabIndex = -1;
      b.innerHTML = '<span>' + k[1].replace('&', '&amp;').replace('<', '&lt;') + '</span>';
      b.dataset.code = k[0];
      r.appendChild(b);
      keys[k[0]] = { el: b, legend: k[1], wide: (k[2] || 1) > 3 };
    });
    board.appendChild(r);
  });

  /* ---------- Typed line ---------- */
  var typed = document.getElementById('typed'), text = '';
  function type(ch) {
    if (ch === '\b') text = text.slice(0, -1);
    else text = (text + ch).slice(-90);
    typed.textContent = text;
  }

  /* ---------- Sound ---------- */
  var ac = null, out = null, noise = null, soundOn = true;
  function audio() {
    if (ac) return ac;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ac = new AC();
    var comp = ac.createDynamicsCompressor();
    out = ac.createGain(); out.gain.value = .55;
    out.connect(comp); comp.connect(ac.destination);
    noise = ac.createBuffer(1, ac.sampleRate * .5, ac.sampleRate);
    var d = noise.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return ac;
  }
  function burst(t, type, freq, q, gain, decay) {
    var src = ac.createBufferSource(); src.buffer = noise;
    var f = ac.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    var g = ac.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + .001);
    g.gain.exponentialRampToValueAtTime(.0001, t + decay);
    src.connect(f); f.connect(g); g.connect(out);
    src.start(t, Math.random() * .3); src.stop(t + decay + .02);
  }
  function tone(t, type, freq, gain, decay) {
    var o = ac.createOscillator(); o.type = type; o.frequency.setValueAtTime(freq, t);
    o.frequency.exponentialRampToValueAtTime(freq * .7, t + decay);
    var g = ac.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + .002);
    g.gain.exponentialRampToValueAtTime(.0001, t + decay);
    o.connect(g); g.connect(out); o.start(t); o.stop(t + decay + .02);
  }
  // the bottom-out: a dull knock of plastic on plastic
  function thock(t, p, gain) {
    burst(t, 'bandpass', 1100 * p, 1.1, gain * .9, .05);
    burst(t, 'lowpass', 500 * p, .7, gain * .6, .07);
    tone(t, 'sine', 170 * p, gain * .5, .07);
  }
  function click(t, gain) {
    burst(t, 'bandpass', 4200 + Math.random() * 600, 4, gain, .014);
    tone(t, 'square', 2600, gain * .05, .008);
  }
  function play(code, down) {
    if (!soundOn || !audio()) return;
    if (ac.state === 'suspended') ac.resume();
    var t = ac.currentTime + .005;
    var wide = keys[code] && keys[code].wide;
    var p = (wide ? .72 : 1) * (.94 + Math.random() * .12);
    var sw = body.getAttribute('data-switch');
    if (down) {
      if (sw === 'tactile') { burst(t, 'bandpass', 1900, 2, .22, .018); thock(t + .012, p, .85); }
      else if (sw === 'clicky') { click(t, .75); thock(t + .018, p, .7); }
      else thock(t, p, .9);
      if (wide) thock(t + .009, p * 1.3, .25); // the stabiliser rattles a little
    } else {
      if (sw === 'clicky') click(t, .35);
      burst(t, 'bandpass', 1700 * p, 1.4, .28, .035);
    }
  }
  var soundBtn = document.getElementById('sound');
  soundBtn.addEventListener('click', function () {
    soundOn = !soundOn;
    soundBtn.setAttribute('aria-pressed', String(soundOn));
  });

  /* ---------- Switch choice ---------- */
  document.querySelectorAll('input[name=sw]').forEach(function (r) {
    r.addEventListener('change', function () { body.setAttribute('data-switch', r.value); });
  });

  /* ---------- Force curves ---------- */
  var X0 = 40, X1 = 380, Y0 = 250, YK = 2.7; // 0-4 mm across, cN up
  function fx(mm) { return X0 + (X1 - X0) * mm / 4; }
  function fy(cn) { return Y0 - Math.min(80, cn) * YK; }
  function wall(d) { return Math.max(0, d - 3.82) * 420; }
  function gauss(d, c, s) { return Math.exp(-Math.pow((d - c) / s, 2)); }
  var CURVES = {
    linear: function (d) { return 34 + 7.5 * d + wall(d); },
    tactile: function (d) { return 30 + 6 * d + 24 * gauss(d, .75, .32) - 6 * gauss(d, 1.35, .3) + wall(d); },
    clicky: function (d) { return 32 + 6 * d + 30 * (d < 1.65 ? gauss(d, 1.65, .42) : gauss(d, 1.65, .06)) + wall(d); }
  };
  var curve = document.getElementById('curve');
  var grid = curve.querySelector('.grid');
  for (var gy = 0; gy <= 80; gy += 20) {
    var ln = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    ln.setAttribute('x1', X0); ln.setAttribute('x2', X1); ln.setAttribute('y1', fy(gy)); ln.setAttribute('y2', fy(gy));
    grid.appendChild(ln);
  }
  var act = curve.querySelector('.actuate');
  act.setAttribute('x1', fx(2)); act.setAttribute('x2', fx(2));
  curve.querySelectorAll('.lbl')[0].setAttribute('x', fx(2) + 6);
  Object.keys(CURVES).forEach(function (k) {
    var d = '';
    for (var mm = 0; mm <= 4.0001; mm += .02) d += (mm ? 'L' : 'M') + fx(mm).toFixed(1) + ' ' + fy(CURVES[k](mm)).toFixed(1);
    curve.querySelector('.c--' + k).setAttribute('d', d);
  });
  var dot = curve.querySelector('.dot');
  var travel = 0, travelTo = 0, travelFrom = 0, tStart = 0, tDur = 1;
  function placeDot() {
    var f = CURVES[body.getAttribute('data-switch')];
    dot.setAttribute('cx', fx(travel).toFixed(1));
    dot.setAttribute('cy', fy(f(travel)).toFixed(1));
  }
  var dotRaf = 0;
  function moveDot(to, dur) {
    travelFrom = travel; travelTo = to; tStart = performance.now(); tDur = still ? 1 : dur;
    if (!dotRaf) dotRaf = requestAnimationFrame(stepDot);
  }
  function stepDot(now) {
    var p = Math.min(1, (now - tStart) / tDur);
    var e = 1 - Math.pow(1 - p, 3);
    travel = travelFrom + (travelTo - travelFrom) * e;
    placeDot();
    dotRaf = p < 1 ? requestAnimationFrame(stepDot) : 0;
  }
  placeDot();
  document.querySelectorAll('input[name=sw]').forEach(function (r) { r.addEventListener('change', placeDot); });

  /* ---------- Pressing ---------- */
  var held = {};
  function press(code) {
    var k = keys[code];
    if (!k || held[code]) return;
    held[code] = true;
    k.el.classList.add('is-down');
    play(code, true);
    moveDot(4, 70);
  }
  function release(code) {
    var k = keys[code];
    if (!k || !held[code]) return;
    held[code] = false;
    k.el.classList.remove('is-down');
    play(code, false);
    if (!Object.keys(held).some(function (c) { return held[c]; })) moveDot(0, 180);
  }

  var heroInView = true;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { heroInView = es[0].isIntersecting; }, { threshold: .15 }).observe(document.querySelector('.deck'));
  }
  window.addEventListener('keydown', function (e) {
    if (!heroInView || e.target.closest('input, textarea, select, [contenteditable]')) return;
    var code = ALIAS[e.code] || e.code;
    if (!keys[code]) return;
    if (!e.metaKey && !e.ctrlKey && !e.altKey && (code === 'Space' || code === 'Quote' || code === 'Slash' || code === 'Backspace')) e.preventDefault();
    if (e.repeat) return;
    press(code);
    if (e.metaKey || e.ctrlKey) return;
    if (code === 'Backspace') type('\b');
    else if (code === 'Enter') type(' ↵ ');
    else if (e.key && e.key.length === 1) type(e.key);
  });
  window.addEventListener('keyup', function (e) { release(ALIAS[e.code] || e.code); });
  window.addEventListener('blur', function () { Object.keys(held).forEach(release); });

  board.addEventListener('pointerdown', function (e) {
    var b = e.target.closest('.key');
    if (!b) return;
    e.preventDefault();
    var code = b.dataset.code, k = keys[code];
    press(code);
    if (code === 'Backspace') type('\b');
    else if (code === 'Space') type(' ');
    else if (code === 'Enter') type(' ↵ ');
    else if (k.legend.length === 1) type(k.legend.toLowerCase());
    var up = function () { release(code); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up); };
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  });

  /* ---------- Exploded switch ---------- */
  var section = document.querySelector('.explode');
  var groups = {};
  document.querySelectorAll('#exploded .p').forEach(function (g) { groups[g.getAttribute('data-p')] = g; });
  // how far each part moves to put the switch back together
  var HOME = { cap: 96, stem: 74, top: 10, spring: -44, bottom: -128 };
  function explode() {
    var r = section.getBoundingClientRect(), vh = window.innerHeight;
    var e = Math.max(0, Math.min(1, (vh * .55 - r.top) / (vh * .8)));
    e = e < .5 ? 4 * e * e * e : 1 - Math.pow(-2 * e + 2, 3) / 2;
    for (var k in HOME) groups[k].setAttribute('transform', 'translate(0 ' + (HOME[k] * (1 - e)).toFixed(1) + ')');
  }
  var items = document.querySelectorAll('.parts li');
  if ('IntersectionObserver' in window) {
    var po = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        var name = en.target.getAttribute('data-p');
        items.forEach(function (li) { li.classList.toggle('on', li === en.target); });
        for (var k in groups) groups[k].classList.toggle('on', k === name);
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    items.forEach(function (li) { po.observe(li); });
  }
  if (still) { for (var k in HOME) groups[k].setAttribute('transform', ''); }
  else {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () { explode(); ticking = false; });
    }, { passive: true });
    explode();
  }

  /* ---------- Reveals ---------- */
  var rev = document.querySelectorAll('.reveal, .reveal-line');
  if ('IntersectionObserver' in window) {
    var ro = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); ro.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -12% 0px' });
    rev.forEach(function (n) { ro.observe(n); });
  } else rev.forEach(function (n) { n.classList.add('is-in'); });
})();
