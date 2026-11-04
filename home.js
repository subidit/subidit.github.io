// Home page, sections two and three.
// The press: a word set in metal sorts (backwards, as type always was), in
// one of three fonts from the same typeface, printed the right way round.
// The things: each row opens onto its page's world on hover, or on a touch
// screen when it reaches the middle of the screen.

(function () {
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- The press ---------- */
  var press = document.getElementById('press');
  if (press) {
    var input = document.getElementById('press-input');
    var sorts = document.getElementById('sorts');
    var print = document.getElementById('print');
    var go = document.getElementById('press-go');
    var cases = press.querySelectorAll('[data-case]');
    var face = 'regular', shown = '';
    var STYLE = { regular: 'font-style:normal;font-weight:400', italic: 'font-style:italic;font-weight:400', bold: 'font-style:normal;font-weight:700' };
    function clean(v) { return v.replace(/[^A-Za-z0-9&?!.,'’ -]/g, '').slice(0, 9); }
    function esc(c) { return c === ' ' ? '&nbsp;' : c.replace('&', '&amp;'); }

    // Only sorts that changed drop in; the rest stay put in the stick
    function set(animate) {
      var word = clean(input.value);
      if (word !== input.value) input.value = word;
      var html = '';
      for (var i = 0; i < word.length; i++) {
        var fresh = animate && (i >= shown.length || word[i] !== shown[i]);
        html += '<i class="sort' + (fresh ? ' is-new' : '') + '" style="--i:' + (fresh ? i - Math.min(i, shown.length) : 0) + ';' + STYLE[face] + '"><span>' + esc(word[i]) + '</span></i>';
      }
      sorts.innerHTML = html;
      shown = word;
    }
    function pull() {
      var word = clean(input.value) || ' ';
      press.classList.add('is-pressing');
      setTimeout(function () {
        press.classList.remove('is-pressing');
        // a hand press never inks evenly: each letter a little lighter or darker, a hair off true
        print.innerHTML = word.split('').map(function (c, i) {
          return '<span style="--i:' + i + ';--o:' + (.78 + Math.random() * .22).toFixed(2) + ';--r:' + ((Math.random() - .5) * 1.4).toFixed(2) + 'deg">' + esc(c) + '</span>';
        }).join('');
        print.setAttribute('style', STYLE[face]);
        print.classList.remove('is-fresh'); void print.offsetWidth; print.classList.add('is-fresh');
      }, still ? 0 : 130);
    }
    input.addEventListener('input', function () { set(true); });
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); pull(); } });
    go.addEventListener('click', pull);
    cases.forEach(function (b) {
      b.addEventListener('click', function () {
        face = b.getAttribute('data-case');
        cases.forEach(function (c) { c.setAttribute('aria-checked', String(c === b)); });
        shown = ''; set(true); pull();
      });
    });
    // arrow keys move between the three cases, as a radio group should
    press.querySelector('.press__cases').addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      var list = [].slice.call(cases), i = list.indexOf(document.activeElement);
      if (i < 0) return;
      var next = list[(i + (e.key === 'ArrowRight' ? 1 : list.length - 1)) % list.length];
      next.focus(); next.click(); e.preventDefault();
    });

    // The first time it comes into view, the word is set letter by letter and printed
    set(false);
    print.textContent = '';
    var demo = function () { shown = ''; set(true); setTimeout(pull, still ? 0 : 60 * input.value.length + 450); };
    if ('IntersectionObserver' in window) {
      var seen = new IntersectionObserver(function (es) {
        if (es[0].isIntersecting) { seen.disconnect(); setTimeout(demo, still ? 0 : 500); }
      }, { threshold: .5 });
      seen.observe(press);
    } else demo();
  }

  /* ---------- The things ---------- */
  var list = document.querySelector('#things .pane__list');
  if (!list) return;
  var rows = [].slice.call(list.querySelectorAll('a[data-world]'));
  function open(row) { rows.forEach(function (r) { r.classList.toggle('is-world', r === row); }); }

  // fetch the five faces once the section is near, so the first hover isn't a fallback
  var loaded = false;
  function loadFaces() {
    if (loaded || !document.fonts || !document.fonts.load) return;
    loaded = true;
    ['400 1em "Bodoni Moda"', 'italic 400 1em "Instrument Serif"', '800 1em "Bricolage Grotesque"', '800 1em "Archivo"', '600 1em "Fraunces"'].forEach(function (f) { document.fonts.load(f); });
  }

  var hover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  rows.forEach(function (r) {
    r.addEventListener('focus', function () { open(r); });
    r.addEventListener('blur', function () { open(null); });
    if (hover) {
      r.addEventListener('pointerenter', function () { open(r); });
      r.addEventListener('pointerleave', function () { open(null); });
    }
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { if (es[0].isIntersecting) loadFaces(); }, { rootMargin: '100% 0px' }).observe(list);
    if (!hover) {
      // on touch screens, whichever row crosses the middle of the screen opens
      var mid = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) open(e.target);
          else if (e.target.classList.contains('is-world')) e.target.classList.remove('is-world');
        });
      }, { rootMargin: '-46% 0px -46% 0px' });
      rows.forEach(function (r) { mid.observe(r); });
    }
  } else loadFaces();
})();
