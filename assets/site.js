/* ============ SVC Tech AI — Mobile navigation toggle ============ */
(function () {
  function init() {
    var btn = document.getElementById('navToggle');
    var panel = document.getElementById('mobileNav');
    if (!btn || !panel) return;

    var iconOpen = document.getElementById('navIconOpen');
    var iconClose = document.getElementById('navIconClose');

    function setOpen(open) {
      panel.classList.toggle('hidden', !open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      if (iconOpen) iconOpen.classList.toggle('hidden', open);
      if (iconClose) iconClose.classList.toggle('hidden', !open);
      document.body.classList.toggle('overflow-hidden', open);
    }

    btn.addEventListener('click', function () {
      setOpen(panel.classList.contains('hidden'));
    });

    // Close after tapping a link
    panel.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setOpen(false); });
    });

    // Reset when growing back to desktop
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 1024) setOpen(false);
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setOpen(false);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

/* ============ Scroll-reveal + count-up animations ============ */
(function () {
  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count')) || 0;
    var isFloat = String(el.getAttribute('data-count')).indexOf('.') > -1;
    var duration = 1500;
    var startTime = null;

    function step(ts) {
      if (startTime === null) startTime = ts;
      var p = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      var val = target * eased;
      el.textContent = isFloat ? val.toFixed(1) : Math.round(val).toString();
      if (p < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = isFloat ? target.toFixed(1) : String(target);
      }
    }
    requestAnimationFrame(step);
  }

  function init() {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var reveals = document.querySelectorAll('.reveal');

    if (reduce || !('IntersectionObserver' in window)) {
      reveals.forEach(function (el) { el.classList.add('in'); });
      document.querySelectorAll('.count-up').forEach(function (el) {
        el.textContent = el.getAttribute('data-count');
      });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        e.target.querySelectorAll('.count-up').forEach(function (c) {
          if (!c.dataset.counted) { c.dataset.counted = '1'; animateCount(c); }
        });
        io.unobserve(e.target);
      });
    }, { threshold: 0.25, rootMargin: '0px 0px -8% 0px' });

    reveals.forEach(function (el) { io.observe(el); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
