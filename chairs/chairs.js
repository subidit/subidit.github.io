// A good chair: the gallery that scrolls sideways as you scroll down, chairs
// that draw themselves as they arrive, and a backrest you can recline.

(function () {
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // every line draws from 0 to 1, whatever its real length
  document.querySelectorAll('.chair .ln, .hl').forEach(function (p) { p.setAttribute('pathLength', '1'); });
  document.querySelector('.hero__chair').classList.add('is-drawn');

  /* ---------- Gallery ---------- */
  var gallery = document.getElementById('gallery');
  var track = document.getElementById('track');
  var chairs = [].slice.call(track.querySelectorAll('.chair'));
  var railYear = document.getElementById('rail-year'), railFill = document.getElementById('rail-fill');
  var travel = 0;
  function layout() {
    if (still) return;
    travel = Math.max(0, track.scrollWidth - window.innerWidth);
    gallery.style.height = (travel + window.innerHeight) + 'px';
    update();
  }
  function update() {
    var vw = window.innerWidth, p = 0;
    if (!still) {
      var r = gallery.getBoundingClientRect();
      var span = gallery.offsetHeight - window.innerHeight;
      p = span > 0 ? Math.max(0, Math.min(1, -r.top / span)) : 0;
      track.style.transform = 'translate3d(' + (-p * travel).toFixed(1) + 'px,0,0)';
      railFill.style.scale = p.toFixed(4) + ' 1';
    }
    // the chair nearest the middle names the year; any chair that's arrived draws itself
    var best = null, bestD = Infinity;
    for (var i = 0; i < chairs.length; i++) {
      var b = chairs[i].getBoundingClientRect();
      if (b.left < vw * .88 && b.right > 0) chairs[i].classList.add('is-drawn');
      var d = Math.abs(b.left + b.width / 2 - vw / 2);
      if (d < bestD) { bestD = d; best = chairs[i]; }
    }
    if (best) railYear.textContent = best.querySelector('.year').textContent;
  }
  var ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () { update(); ticking = false; });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  track.addEventListener('scroll', onScroll, { passive: true }); // reduced motion: the track scrolls itself
  var rt = 0;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(layout, 150); });
  layout();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
  if (still) { railFill.style.scale = '1 1'; update(); }

  /* ---------- Recline ---------- */
  var range = document.getElementById('recline');
  var out = document.getElementById('recline-out');
  var back = document.getElementById('backrest'), torso = document.getElementById('torso');
  var bar = document.getElementById('load-bar');
  var NOTES = [
    [95, 'Bolt upright. Hardest on the discs, and nobody sits like this for long.'],
    [104, 'Upright. Fine for writing by hand, for a while.'],
    [118, 'About 110°: the range the studies keep pointing to for long stretches.'],
    [128, 'Leaning back. Easy on the spine; bring the screen closer.'],
    [136, 'Lovely. Not much typing gets done from here.']
  ];
  function recline() {
    var a = +range.value;
    back.setAttribute('transform', 'rotate(' + (90 - a) + ')');
    torso.setAttribute('transform', 'rotate(' + ((90 - a) * .92).toFixed(1) + ')');
    var note = NOTES.filter(function (n) { return a <= n[0]; })[0][1];
    out.querySelector('b').textContent = a + '°';
    out.querySelector('span').textContent = note;
    range.setAttribute('aria-valuetext', a + ' degrees. ' + note);
    // relative only: upright highest, easing as you lean back
    bar.style.scale = (1 - (a - 90) / 45 * .55).toFixed(3) + ' 1';
  }
  range.addEventListener('input', recline);
  recline();

  /* ---------- Reveals ---------- */
  var rev = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -12% 0px' });
    rev.forEach(function (n) { io.observe(n); });
  } else rev.forEach(function (n) { n.classList.add('is-in'); });
})();
