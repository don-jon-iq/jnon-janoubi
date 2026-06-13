/* =====================================================
   جنون جنوبي — animations.js
   Scroll reveals, 3D tilt, header state, marquee loop
   ===================================================== */

'use strict';

var Animations = (function () {

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Scroll reveals (IntersectionObserver) ----
  function initReveals() {
    var targets = document.querySelectorAll('.reveal');
    if (reducedMotion || !('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('in'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    targets.forEach(function (el) { observer.observe(el); });
  }

  // ---- Pointer-driven 3D tilt ----
  function initTilt() {
    if (reducedMotion || !window.matchMedia('(hover: hover)').matches) { return; }

    document.querySelectorAll('[data-tilt]').forEach(function (card) {
      var frame = null;

      card.addEventListener('pointermove', function (event) {
        if (frame) { return; }
        frame = window.requestAnimationFrame(function () {
          var rect = card.getBoundingClientRect();
          var x = (event.clientX - rect.left) / rect.width - 0.5;
          var y = (event.clientY - rect.top) / rect.height - 0.5;
          card.style.transform =
            'rotateY(' + (x * 7).toFixed(2) + 'deg) ' +
            'rotateX(' + (-y * 7).toFixed(2) + 'deg)';
          frame = null;
        });
      });

      card.addEventListener('pointerleave', function () {
        if (frame) { window.cancelAnimationFrame(frame); frame = null; }
        card.style.transform = '';
      });
    });
  }

  // ---- Header scrolled state ----
  function initHeader() {
    var header = document.getElementById('siteHeader');
    if (!header || !('IntersectionObserver' in window)) { return; }

    var sentinel = document.createElement('div');
    sentinel.style.cssText = 'position:absolute;top:80px;height:1px;width:1px;';
    document.body.prepend(sentinel);

    new IntersectionObserver(function (entries) {
      header.classList.toggle('is-scrolled', !entries[0].isIntersecting);
    }).observe(sentinel);
  }

  // ---- Seamless marquee (duplicate content) ----
  function initMarquee() {
    var track = document.getElementById('marqueeTrack');
    if (!track) { return; }
    var original = track.innerHTML;
    track.innerHTML = original + original + original + original;
  }

  function init() {
    initMarquee();
    initReveals();
    initTilt();
    initHeader();
  }

  return { init: init };

})();
