// Things arrive as they come on screen: each statement rises line by line
// with the scroll, labels and list items rise in, and the drawings pop
// together piece by piece. Apart from the lines, everything here only adds
// classes; the motion itself is in style.css. With reduced motion, nothing
// is hidden.

(function () {
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Statements rise line by line out of a mask, tied to the scroll, like a
  // responsive line split. Each word goes in a clipping .mask with the moving
  // .word inside; any element in the text ("fonts", the scribble, an <em>) and
  // punctuation glued to it share one word, so a line never breaks inside one.
  // Words are grouped into lines by where they sit, again on every resize.
  function split(root) {
    var n = 0, cur = null;
    var frag = document.createDocumentFragment();
    function word() {
      if (cur) return cur;
      var mask = document.createElement('span');
      mask.className = 'mask';
      cur = document.createElement('span');
      cur.className = 'word';
      cur.style.setProperty('--w', n++);
      mask.appendChild(cur);
      frag.appendChild(mask);
      return cur;
    }
    Array.prototype.slice.call(root.childNodes).forEach(function (node) {
      if (node.nodeType === 3) {
        node.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); cur = null; return; }
          word().appendChild(document.createTextNode(part));
        });
      } else {
        word().appendChild(node);
      }
    });
    root.textContent = '';
    root.appendChild(frag);
  }

  var texts = [];
  function layout() {
    var vh = window.innerHeight, y = window.scrollY;
    var max = document.documentElement.scrollHeight - vh;
    texts.forEach(function (t) {
      t.lines = [];
      var line = null;
      Array.prototype.forEach.call(t.el.querySelectorAll('.mask'), function (m) {
        var box = m.getBoundingClientRect();
        if (!line || box.top > line.top + box.height / 2) {
          line = { top: box.top, words: [], e: -1 };
          t.lines.push(line);
        }
        line.words.push(m);
      });
      t.lines.forEach(function (l, i) {
        // rises from the moment its top is near the bottom of the screen until
        // it is a third of the way up, or by the end of the page if that's sooner
        var top = l.top + y;
        l.end = Math.min(top - vh * 0.66, max);
        l.start = l.end - vh * 0.3;
        // lines already on screen when the page opens rise in by themselves
        l.shown = !t.played && l.top < vh;
        if (l.shown) l.words.forEach(function (m) {
          m.style.setProperty('--l', i);
          m.classList.add('is-load');
          m.addEventListener('animationend', function () { m.classList.remove('is-load'); }, { once: true });
        });
      });
      t.played = true;
    });
    update();
  }

  function update() {
    var y = window.scrollY;
    texts.forEach(function (t) {
      var all = true;
      t.lines.forEach(function (l) {
        var p = l.shown ? 1 : Math.min(1, Math.max(0, (y - l.start) / (l.end - l.start)));
        var e = 1 - Math.pow(1 - p, 3);
        if (e < 1) all = false;
        if (e === l.e) return;
        l.e = e;
        l.words.forEach(function (m) {
          m.firstChild.style.translate = e === 1 ? '' : '0 ' + ((1 - e) * 115).toFixed(2) + '%';
          m.classList.toggle('is-up', e === 1);
        });
      });
      if (all) t.el.classList.add('is-in');
    });
  }

  document.querySelectorAll('.pane__big, .pane__lede').forEach(function (el) {
    split(el);
    el.classList.add('lines');
    texts.push({ el: el, lines: [] });
  });
  layout();
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { ticking = false; update(); });
  }, { passive: true });
  var relayout = 0;
  window.addEventListener('resize', function () { clearTimeout(relayout); relayout = setTimeout(layout, 150); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);

  // Text arrives once and stays; drawings play again each time they return
  var once = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      once.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -12% 0px' });

  var drawIn = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) e.target.classList.add('is-in'); });
  }, { rootMargin: '0px 0px -20% 0px', threshold: 0.15 });
  // a drawing only resets once it is fully off screen, so it never vanishes in view
  var drawOut = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (!e.isIntersecting) e.target.classList.remove('is-in'); });
  });

  document.querySelectorAll('.pane .label, .thing section .label, .specimen, .joke').forEach(function (el) {
    el.classList.add('reveal');
    once.observe(el);
  });
  document.querySelectorAll('.pane__list').forEach(function (list) {
    Array.prototype.forEach.call(list.children, function (li, i) { li.style.setProperty('--n', i); });
    list.classList.add('reveal');
    once.observe(list);
  });
  document.querySelectorAll('.doodle').forEach(function (el) {
    el.classList.add('reveal');
    drawIn.observe(el);
    drawOut.observe(el);
  });
})();

// The footer's top edge is elastic: scrolling into it bends the edge with
// the scroll, and when the scroll stops it springs back flat, overshooting a
// little each way, like the footer bounce demo. The bend is filled with the
// colour of the section above when it dips into the footer, and with the
// footer's own paper when it bulges up over that section.
(function () {
  var footer = document.querySelector('.footer');
  var above = footer && footer.previousElementSibling;
  if (!footer || !above) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var UP = 48, DOWN = 160; // how far the edge may bulge up and dip down, in px
  var NS = 'http://www.w3.org/2000/svg';
  var svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'footer__edge');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('viewBox', '0 0 1000 ' + (UP + DOWN));
  svg.setAttribute('preserveAspectRatio', 'none');
  var path = document.createElementNS(NS, 'path');
  svg.appendChild(path);
  footer.insertBefore(svg, footer.firstChild);
  var dip = getComputedStyle(above).backgroundColor;
  var bulge = getComputedStyle(footer).backgroundColor;

  var bend = 0, speed = 0, last = window.scrollY, frame = 0;
  function render() {
    // a parabola through both corners, its middle `bend` px off the edge
    path.setAttribute('d', 'M0 ' + UP + 'Q500 ' + (UP + 2 * bend).toFixed(1) + ' 1000 ' + UP + 'Z');
    path.setAttribute('fill', bend > 0 ? dip : bulge);
  }
  function tick() {
    var y = window.scrollY, dy = y - last;
    last = y;
    var top = footer.getBoundingClientRect().top;
    // only while the edge itself is on screen does the scroll drag it
    if (top > 0 && top < window.innerHeight) speed += Math.max(-60, Math.min(60, dy)) * 0.12;
    speed += -bend * 0.05;   // the spring pulls it flat...
    speed *= 0.93;           // ...losing a little each swing, so it bounces
    bend = Math.max(-UP, Math.min(DOWN, bend + speed));
    render();
    if (dy === 0 && Math.abs(bend) < 0.2 && Math.abs(speed) < 0.2) {
      bend = speed = 0;
      render();
      frame = 0;
      return;
    }
    frame = requestAnimationFrame(tick);
  }
  window.addEventListener('scroll', function () {
    if (!frame) frame = requestAnimationFrame(tick);
  }, { passive: true });
  render();
})();
