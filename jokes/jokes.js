// A joke that lands: a spotlight that follows you, a joke you can flip
// between its two readings, and a room that judges your timing.

(function () {
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Spotlight ---------- */
  var hero = document.getElementById('stage');
  var spot = hero.querySelector('.spot');
  var cur = { x: .3, y: .45 }, target = { x: .3, y: .45 }, pointer = false, running = false, onScreen = true;
  setTimeout(function () { spot.classList.add('is-on'); }, 250);
  hero.addEventListener('pointermove', function (e) {
    var r = hero.getBoundingClientRect();
    target.x = (e.clientX - r.left) / r.width; target.y = (e.clientY - r.top) / r.height;
    pointer = e.pointerType === 'mouse';
    if (still) { cur.x = target.x; cur.y = target.y; paint(); }
  });
  hero.addEventListener('pointerleave', function () { pointer = false; });
  function paint() {
    spot.style.setProperty('--x', (cur.x * 100).toFixed(2) + '%');
    spot.style.setProperty('--y', (cur.y * 100).toFixed(2) + '%');
  }
  function loop(t) {
    if (!pointer) {
      // with nobody steering, the operator lets the light wander over the act
      target.x = .32 + Math.sin(t / 2600) * .14;
      target.y = .46 + Math.sin(t / 1900) * .1;
    }
    cur.x += (target.x - cur.x) * .08; cur.y += (target.y - cur.y) * .08;
    paint();
    if (onScreen) requestAnimationFrame(loop); else running = false;
  }
  function start() { if (!running && !still) { running = true; requestAnimationFrame(loop); } }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { onScreen = es[0].isIntersecting; if (onScreen) start(); }).observe(hero);
  }
  paint(); start();

  /* ---------- The joke with two readings ---------- */
  var specimen = document.getElementById('specimen'), pivot = document.getElementById('pivot');
  var readings = specimen.querySelectorAll('.reading');
  pivot.addEventListener('click', function () {
    var flipped = specimen.classList.toggle('is-flipped');
    readings[0].classList.toggle('is-on', !flipped);
    readings[1].classList.toggle('is-on', flipped);
  });

  /* ---------- The room ---------- */
  var JOKES = [
    ["I'm reading a book about anti-gravity.", "It's impossible to put down."],
    ["I used to hate facial hair,", "but then it grew on me."],
    ["Why don't scientists trust atoms?", "They make up everything."],
    ["I asked the librarian if they had any books on paranoia.", "She whispered, “They're right behind you.”"],
    ["What do you call a fake noodle?", "An impasta."],
    ["I'm on a seafood diet.", "I see food, and I eat it."]
  ];
  var setupEl = document.getElementById('setup'), punchEl = document.getElementById('punch');
  var verdict = document.getElementById('verdict'), go = document.getElementById('go');
  var crowd = document.getElementById('crowd');
  var heads = [];
  var n = Math.max(12, Math.min(26, Math.round(crowd.offsetWidth / 34)));
  for (var i = 0; i < n; i++) {
    var h = document.createElement('i');
    h.className = 'head';
    h.style.setProperty('--s', (30 + Math.random() * 16).toFixed(0) + 'px');
    h.style.marginBottom = (-Math.random() * 14).toFixed(0) + 'px';
    crowd.appendChild(h); heads.push(h);
  }
  function laugh(level) {
    // 0 nothing, 1 a few chuckles, 2 most of the room, 3 everyone
    if (still || !heads[0].animate) return;
    var share = [0, .3, .7, 1][level], lift = [0, 4, 7, 10][level], times = [0, 3, 5, 7][level];
    heads.forEach(function (h) {
      if (Math.random() > share) return;
      var d = 180 + Math.random() * 90;
      h.animate([{ translate: '0 0' }, { translate: '0 -' + (lift * (.7 + Math.random() * .6)).toFixed(1) + 'px' }, { translate: '0 0' }],
        { duration: d, iterations: times, delay: Math.random() * 260, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' });
    });
  }
  function cough() {
    if (still || !heads[0].animate) return;
    var h = heads[Math.floor(Math.random() * heads.length)];
    h.animate([{ translate: '0 0' }, { translate: '0 3px' }, { translate: '0 0' }], { duration: 160, iterations: 2 });
  }

  var order = JOKES.map(function (_, i) { return i; }).sort(function () { return Math.random() - .5; });
  var turn = 0, state = 'idle', readyAt = 0, timer = 0, joke = null;
  function tell() {
    joke = JOKES[order[turn++ % order.length]];
    punchEl.textContent = ''; punchEl.classList.remove('is-in');
    verdict.textContent = ''; verdict.classList.remove('is-in');
    var words = joke[0].split(' ');
    setupEl.innerHTML = words.map(function (w, i) { return '<span class="w" style="--i:' + i + '">' + w.replace(/</g, '&lt;') + '</span>'; }).join(' ');
    state = 'setup'; go.disabled = true; go.textContent = '…';
    var wait = still ? 0 : words.length * 70 + 500;
    setTimeout(function () {
      state = 'waiting'; readyAt = performance.now();
      go.disabled = false; go.dataset.state = 'punch'; go.textContent = 'Punchline';
      go.focus({ preventScroll: true });
      timer = setTimeout(function () { if (state === 'waiting') deliver(true); }, 3600);
    }, wait);
  }
  function deliver(tooLate) {
    clearTimeout(timer);
    var pause = (performance.now() - readyAt) / 1000;
    punchEl.textContent = joke[1];
    void punchEl.offsetWidth; punchEl.classList.add('is-in');
    var line, level;
    if (tooLate) { line = 'Somebody coughed. You lost them.'; level = 0; cough(); }
    else if (pause < .35) { line = 'Too quick. You stepped on your own laugh.'; level = 1; }
    else if (pause < .7) { line = 'A touch quick, but they got it.'; level = 2; }
    else if (pause < 1.6) { line = 'That’s the beat. Perfect.'; level = 3; }
    else { line = 'A little long. They were starting to wonder.'; level = 1; }
    setTimeout(function () { laugh(level); }, still ? 0 : 240);
    verdict.innerHTML = '<b>Your pause: ' + (tooLate ? 'too long' : pause.toFixed(2) + ' s') + '</b>' + line;
    void verdict.offsetWidth; verdict.classList.add('is-in');
    state = 'done'; go.dataset.state = ''; go.textContent = 'Another one';
  }
  go.addEventListener('click', function () {
    if (state === 'waiting') deliver(false);
    else if (state === 'idle' || state === 'done') tell();
  });

  /* ---------- Reveals ---------- */
  var rev = document.querySelectorAll('.reveal, .reveal-one');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -12% 0px' });
    rev.forEach(function (r) { io.observe(r); });
  } else rev.forEach(function (r) { r.classList.add('is-in'); });
})();
