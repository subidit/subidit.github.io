// Things arrive as they come on screen: each statement's words come into
// focus one after another, labels and list items rise in, and the drawings
// pop together piece by piece. Everything here only adds classes; the
// motion itself is in style.css. With reduced motion, nothing is hidden.

(function () {
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Wrap each word in a span with its place in the sentence (--w). Plain
  // <em>s are walked into; any other element ("fonts", the scribble) counts
  // as one word, so its own styling stays whole.
  function split(root) {
    var n = 0;
    (function walk(parent) {
      Array.prototype.slice.call(parent.childNodes).forEach(function (node) {
        if (node.nodeType === 3) {
          var parts = node.textContent.split(/(\s+)/);
          var frag = document.createDocumentFragment();
          parts.forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            var span = document.createElement('span');
            span.className = 'word';
            span.style.setProperty('--w', n++);
            span.textContent = part;
            frag.appendChild(span);
          });
          parent.replaceChild(frag, node);
        } else if (node.nodeType === 1) {
          if (node.tagName === 'EM' && !node.className) { walk(node); return; }
          node.classList.add('word');
          node.style.setProperty('--w', n++);
        }
      });
    })(root);
  }

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

  document.querySelectorAll('.pane__big, .pane__lede').forEach(function (el) {
    split(el);
    el.classList.add('reveal');
    once.observe(el);
  });
  document.querySelectorAll('.pane .label, .thing .label, .specimen, .joke').forEach(function (el) {
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
