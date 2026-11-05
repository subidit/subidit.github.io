// Home page, sections two and three.
// The letter: a glyph from EB Garamond, the site's own typeface, traced from
// its real outline, inked, and its parts named.
// The things: each row opens onto its page's world on hover, or on a touch
// screen when it reaches the middle of the screen.

(function () {
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- A letter, taken apart ---------- */
  // Outlines are EB Garamond's own (weight 400), in font units: 1000 to the
  // em, y up from the baseline. Each part: [name, x, y of the point on the
  // curve, side the label sits on, label height].
  var GLYPHS = {"g":{"d":"M195 -290Q110 -290 60.5 -257.5Q11 -225 11 -170Q11 -144 19.0 -126.0Q27 -108 44 -95Q58 -83 81.5 -64.5Q105 -46 130 -26L172 -28Q124 -59 105.0 -87.0Q86 -115 86 -155Q86 -195 121.5 -222.5Q157 -250 209 -250Q268 -250 304 -223Q329 -204 343.0 -173.5Q357 -143 357 -109Q357 -87 341.5 -72.5Q326 -58 293.0 -49.0Q260 -40 207 -37Q113 -30 76.5 -12.0Q40 6 40 44Q40 54 45.5 62.5Q51 71 63 81Q86 99 97.0 107.5Q108 116 113.5 122.0Q119 128 124 137L158 120Q136 112 121.0 98.5Q106 85 106 74Q106 60 121.0 49.5Q136 39 165.0 33.0Q194 27 236 24Q328 19 373.0 -6.0Q418 -31 418 -77Q418 -116 398.5 -153.5Q379 -191 347.0 -222.0Q315 -253 275.5 -271.5Q236 -290 195 -290ZM207 141Q245 141 270.0 179.5Q295 218 295 275Q295 304 281.5 329.5Q268 355 246.5 370.5Q225 386 200 386Q177 386 156.5 369.5Q136 353 123.5 327.0Q111 301 111 270Q111 235 124.0 205.5Q137 176 159.0 158.5Q181 141 207 141ZM201 106Q160 106 123.0 127.0Q86 148 62.5 182.5Q39 217 39 258Q39 305 63.5 340.5Q88 376 128.0 396.0Q168 416 213 416Q242 416 263.5 408.5Q285 401 306 395Q330 388 344.0 386.5Q358 385 373 385Q385 385 403.0 386.5Q421 388 428 388Q441 388 441 373Q441 364 431 354Q426 349 423 349H396Q369 349 366 341Q365 337 363.5 329.5Q362 322 361.0 313.0Q360 304 360 295Q360 244 338.0 201.0Q316 158 280.0 132.0Q244 106 201 106Z","adv":435.0},"a":{"d":"M117 -14Q99 -14 80.5 0.0Q62 14 49.5 34.0Q37 54 37 72Q37 104 54.0 122.0Q71 140 108 155L210 197Q230 205 233.5 211.0Q237 217 238 237L240 301Q241 327 225.5 346.0Q210 365 181 365Q166 365 151.0 360.0Q136 355 126 347Q120 343 118.0 335.0Q116 327 116 318Q116 314 116.5 309.0Q117 304 117 300Q117 295 104.5 286.5Q92 278 76.5 271.5Q61 265 51 265Q46 265 43.0 267.5Q40 270 40 274Q40 290 50.5 308.5Q61 327 80 343Q103 364 130.0 380.0Q157 396 183.0 405.0Q209 414 229 414Q265 414 288.5 388.5Q312 363 311 325L306 85Q305 64 315.5 51.0Q326 38 342 38Q367 38 379 49Q384 54 387 54Q392 54 395.0 51.0Q398 48 398 43Q398 32 387 21Q371 5 352.5 -4.5Q334 -14 318 -14Q272 -14 245 38H242Q209 11 179.0 -1.5Q149 -14 117 -14ZM164 34Q184 34 198.0 40.5Q212 47 223 58Q228 63 231.5 71.5Q235 80 236 99L238 148Q239 159 237.0 164.0Q235 169 229 169Q227 169 222.0 168.0Q217 167 209 164Q156 145 135.5 124.5Q115 104 115 87Q115 61 130.5 47.5Q146 34 164 34Z","adv":399.0},"R":{"d":"M637 -21Q609 -21 584.0 -16.5Q559 -12 538.0 0.0Q517 12 499 33Q475 63 453.0 90.5Q431 118 406.5 154.0Q382 190 347 246Q332 271 304 285Q282 296 260.5 300.5Q239 305 225 306Q217 307 213.5 301.0Q210 295 210 286V110Q210 78 225.0 54.5Q240 31 277 24Q294 21 302.0 17.0Q310 13 310 6Q310 0 302.0 -2.5Q294 -5 281 -5Q254 -5 239.5 -3.0Q225 -1 213.5 0.5Q202 2 183 2Q158 2 138.5 0.5Q119 -1 99.5 -3.0Q80 -5 53 -5Q40 -5 32.0 -2.5Q24 0 24 6Q24 18 57 24Q95 31 112.5 47.0Q130 63 130 100V526Q130 564 126.5 583.5Q123 603 110.5 611.0Q98 619 69 622Q52 624 44.0 629.5Q36 635 36 642Q36 648 44.0 650.5Q52 653 65 653Q92 653 105.5 653.0Q119 653 131.0 652.5Q143 652 163 652Q182 652 197.0 653.5Q212 655 230.5 656.0Q249 657 278 657Q388 657 445.5 616.0Q503 575 503 493Q503 448 485.0 415.5Q467 383 440.0 361.0Q413 339 385 325Q381 324 381.5 320.5Q382 317 385 312Q416 265 444.5 223.0Q473 181 507.0 141.0Q541 101 588 58Q614 35 641.0 30.0Q668 25 703 25Q718 25 718 14Q718 -1 703.0 -8.5Q688 -16 669.0 -18.5Q650 -21 637 -21ZM263 329Q309 329 342.5 350.0Q376 371 394.5 405.0Q413 439 413 477Q413 518 402.5 552.0Q392 586 360.5 606.5Q329 627 266 627Q234 627 224.0 606.5Q214 586 212 534Q211 509 210.5 466.5Q210 424 210 364Q210 339 224.0 334.0Q238 329 263 329Z","adv":713.0},"&":{"d":"M212 -15Q161 -15 121.5 3.5Q82 22 60.0 54.0Q38 86 38 127Q38 207 85.5 258.0Q133 309 205 342L225 351L210 367Q201 378 185.5 394.0Q170 410 157.5 432.5Q145 455 145 484Q145 519 165.5 545.0Q186 571 218.0 585.0Q250 599 284 599Q327 599 355.0 579.5Q383 560 397.0 531.5Q411 503 411 477Q412 439 384.0 411.0Q356 383 306 365L292 360L305 346Q343 305 374.0 275.0Q405 245 435 201L447 183L465 202Q489 228 514.5 260.0Q540 292 557.5 318.5Q575 345 575 352Q575 358 567.5 368.0Q560 378 547 380Q545 381 540.0 385.0Q535 389 535 391Q535 399 544.5 400.5Q554 402 557 402Q560 402 574.5 401.0Q589 400 605.0 398.5Q621 397 628 397Q643 397 661.0 400.5Q679 404 695.5 408.0Q712 412 724 412Q726 412 731.0 409.0Q736 406 736 403Q736 397 727.0 391.0Q718 385 711 384Q688 383 669.0 373.5Q650 364 638 353Q634 350 615.0 330.0Q596 310 569.5 282.5Q543 255 518.0 228.0Q493 201 476.0 183.0Q459 165 459 165L476 141Q508 95 539.0 67.5Q570 40 608 40Q629 40 648.5 44.0Q668 48 686 58Q690 60 694.5 61.5Q699 63 703 63Q710 63 712.5 60.5Q715 58 715 51Q715 43 694.0 27.0Q673 11 643.5 -2.0Q614 -15 586 -15Q549 -15 524.0 -2.5Q499 10 478.5 35.5Q458 61 432 101L419 122L413 116Q382 82 353.5 52.0Q325 22 292.0 3.5Q259 -15 212 -15ZM238 50Q288 50 324.5 71.0Q361 92 398 131L407 140L395 159Q370 197 332.5 236.0Q295 275 252 321L240 334L219 326Q173 308 150.5 280.5Q128 253 121.5 221.5Q115 190 115 160Q115 114 149.0 82.0Q183 50 238 50ZM279 376 292 382Q320 395 333.5 423.5Q347 452 347 482Q347 517 330.5 545.0Q314 573 279 573Q249 573 226.0 554.5Q203 536 203 509Q203 489 207.0 473.0Q211 457 224.0 439.0Q237 421 263 393Z","adv":756.0}};
  var LETTERS = {
    g: { parts: [['ear', 418, 368, 'R', 520], ['bowl', 64, 280, 'L', 330], ['link', 108, 112, 'L', 120], ['loop', 382, -150, 'R', -150]],
         note: '<b>g</b>, with two storeys: a bowl on top, a loop below, the link between, and an ear on the side. Most sans serifs make do with one storey.' },
    a: { parts: [['terminal', 46, 284, 'L', 340], ['bowl', 40, 70, 'L', 70], ['stem', 308, 250, 'R', 300], ['tail', 392, 44, 'R', 40]],
         note: '<b>a</b>, double-storey. Handwriting and most italics keep only the bowl.' },
    R: { parts: [['serif', 30, 8, 'L', -60], ['stem', 132, 420, 'L', 440], ['bowl', 504, 500, 'R', 560], ['leg', 520, 150, 'R', 150]],
         note: '<b>R</b>. The leg is where a typeface shows off; Garamond’s strides out and lands on a flick.' },
    '&': { parts: [['loop', 158, 520, 'L', 560], ['bowl', 38, 190, 'L', 190], ['arm', 724, 396, 'R', 470], ['tail', 726, 42, 'R', 30]],
         note: '<b>&amp;</b>, the Latin <i>et</i> written fast for two thousand years. Squint and the e and the t are still in there.' }
  };
  var METRICS = [['cap height', 650], ['x-height', 400], ['baseline', 0], ['descender', -290]];
  var anatomy = document.getElementById('anatomy');
  if (anatomy) {
    var NS = 'http://www.w3.org/2000/svg';
    var svg = anatomy.querySelector('svg');
    var gMetrics = svg.querySelector('.anatomy__metrics'), gGlyph = svg.querySelector('.anatomy__glyph');
    var gParts = svg.querySelector('.anatomy__parts'), gHalo = svg.querySelector('.anatomy__halo');
    var cap = document.getElementById('anatomy-cap');
    var picks = anatomy.querySelectorAll('[data-l]');
    var X0 = -330, X1 = 1090, LEFT = -36, RIGHT = 800;
    function node(name, attrs, parent) {
      var n = document.createElementNS(NS, name);
      for (var k in attrs) n.setAttribute(k, attrs[k]);
      if (parent) parent.appendChild(n);
      return n;
    }
    METRICS.forEach(function (m, k) {
      var g = node('g', { class: 'metric', style: '--k:' + k }, gMetrics);
      node('line', { x1: X0, x2: X1, y1: -m[1], y2: -m[1] }, g);
      node('text', { x: X0, y: -m[1] - 12 }, g).textContent = m[0];
    });

    var current = null, timer = 0, auto = !still, drawTimer = 0;
    function show(ch) {
      current = ch;
      var L = LETTERS[ch], G = GLYPHS[ch], tx = (760 - G.adv) / 2;
      picks.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-l') === ch)); });
      gGlyph.innerHTML = ''; gParts.innerHTML = ''; gHalo.innerHTML = '';
      node('path', { d: G.d, pathLength: 1, transform: 'translate(' + tx + ' 0) scale(1 -1)' }, gGlyph);
      L.parts.forEach(function (p, k) {
        var ax = p[1] + tx, ay = -p[2], ly = -p[4], left = p[3] === 'L';
        var lx = left ? LEFT : RIGHT, bend = left ? LEFT + 20 : RIGHT - 20;
        var halo = node('circle', { class: 'halo', cx: ax, cy: ay, r: 72 }, gHalo);
        var g = node('g', { class: 'part', tabindex: 0, role: 'img', 'aria-label': p[0], style: '--k:' + k }, gParts);
        node('path', { class: 'part__lead', pathLength: 1, d: 'M' + ax + ' ' + ay + ' L' + bend + ' ' + ly + ' L' + (left ? lx + 6 : lx - 6) + ' ' + ly }, g);
        node('circle', { class: 'part__dot', cx: ax, cy: ay, r: 9 }, g);
        var t = node('text', { class: 'part__label', x: left ? lx - 6 : lx + 6, y: ly + 16, 'text-anchor': left ? 'end' : 'start' }, g);
        t.textContent = p[0];
        var on = function () { halo.classList.add('is-on'); g.classList.add('is-on'); };
        var off = function () { halo.classList.remove('is-on'); g.classList.remove('is-on'); };
        g.addEventListener('pointerenter', on); g.addEventListener('pointerleave', off);
        g.addEventListener('focus', on); g.addEventListener('blur', off);
      });
      cap.innerHTML = L.note;
      if (still) return;
      anatomy.classList.remove('is-drawing', 'is-drawn'); void anatomy.offsetWidth;
      anatomy.classList.add('is-drawing');
      clearTimeout(drawTimer);
      drawTimer = setTimeout(function () { anatomy.classList.add('is-drawn'); }, 3200);
    }
    function go(ch) {
      if (still) return show(ch);
      anatomy.classList.add('is-leaving');
      setTimeout(function () { anatomy.classList.remove('is-leaving'); show(ch); }, 200);
    }
    picks.forEach(function (b) {
      b.addEventListener('click', function () { auto = false; clearInterval(timer); go(b.getAttribute('data-l')); });
    });
    // while it's on screen and nobody has picked one, it turns to the next letter now and then
    var order = ['g', 'a', 'R', '&'];
    function cycle() { go(order[(order.indexOf(current) + 1) % order.length]); }
    var started = false;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        var vis = es[0].isIntersecting;
        if (vis && !started) { started = true; show('g'); }
        clearInterval(timer);
        if (vis && auto) timer = setInterval(cycle, 8000);
      }, { threshold: .35 }).observe(anatomy);
    } else show('g');
    if (still) show('g');
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
