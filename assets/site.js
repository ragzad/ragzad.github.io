// Progressive enhancement only: the page works fully without this file.
(function () {
  var doc = document.documentElement;

  // Theme toggle: dark by default, light if chosen; choice kept in localStorage
  var toggle = document.querySelector('.theme-toggle');
  var meta = document.querySelector('meta[name="theme-color"]');
  var sync = function () {
    var light = doc.getAttribute('data-theme') === 'light';
    toggle.setAttribute('aria-pressed', String(light));
    toggle.title = light ? 'Switch to dark mode' : 'Switch to light mode';
    if (meta) meta.setAttribute('content', light ? '#F6F2EA' : '#0C1719');
  };
  if (toggle) {
    sync();
    toggle.addEventListener('click', function () {
      var next = doc.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      doc.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      sync();
    });
  }
  var bar = document.getElementById('top-bar');
  var onScroll = function () { bar.classList.toggle('scrolled', window.scrollY > 8); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Highlight the nav link for the section in view
  var links = {};
  document.querySelectorAll('.top nav a[href^="#"]').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
  if ('IntersectionObserver' in window) {
    var navObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var a = links[e.target.id];
        if (a && e.isIntersecting) {
          Object.keys(links).forEach(function (k) { links[k].removeAttribute('aria-current'); });
          a.setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(links).forEach(function (id) { var s = document.getElementById(id); if (s) navObs.observe(s); });
  }

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) return;

  doc.classList.add('motion');
  requestAnimationFrame(function () { requestAnimationFrame(function () { doc.classList.add('loaded'); }); });

  // Fade sections in as they arrive
  var targets = document.querySelectorAll('.sec-head, .stats li, .feature, .card, .two-col > div, .contact-body');
  var revealObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); revealObs.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  targets.forEach(function (el, i) {
    el.classList.add('reveal');
    el.style.transitionDelay = (el.matches('.stats li, .card') ? (i % 4) * 90 : 0) + 'ms';
    revealObs.observe(el);
  });

  // Count the result figures up once, when they come into view
  var figs = document.querySelectorAll('.fig[data-count]');
  var countObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      countObs.unobserve(e.target);
      var el = e.target, end = +el.dataset.count, pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
      var final = el.textContent, t0 = null, dur = 1400;
      var step = function (t) {
        if (!t0) t0 = t;
        var p = Math.min((t - t0) / dur, 1), eased = 1 - Math.pow(1 - p, 3);
        el.textContent = pre + Math.round(end * eased) + suf;
        if (p < 1) requestAnimationFrame(step); else el.textContent = final;
      };
      requestAnimationFrame(step);
    });
  }, { threshold: 0.6 });
  figs.forEach(function (f) { countObs.observe(f); });
})();
