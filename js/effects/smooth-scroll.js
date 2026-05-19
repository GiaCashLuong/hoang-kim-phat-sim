/* === Smooth Scroll (Lenis) — site-wide init === */
(function () {
  'use strict';

  const tier = window.__deviceTier || 'high';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Disable on mobile / low / reduced — native scroll preferred
  if (tier !== 'high' || reducedMotion) {
    return;
  }

  // Vendor check
  if (typeof Lenis === 'undefined') {
    console.warn('[smooth-scroll] Lenis not loaded — falling back to native scroll');
    return;
  }

  // Init Lenis (configurable per project mood — agent picks duration)
  const lenis = new Lenis({
    duration: 1.2,                                              // adjust per mood
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),  // smooth ease-out
    smoothWheel: true,
    smoothTouch: false,                                         // KEEP false
    wheelMultiplier: 1,
    touchMultiplier: 2,
    infinite: false
  });

  // RAF loop
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Expose globally so other effects (ScrollTrigger) can hook
  window.__lenis = lenis;

  // Smooth-scroll anchor links
  document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        lenis.scrollTo(target, {
          offset: -80, // account for fixed nav
          duration: 1.5
        });
      }
    });
  });

  // ScrollTrigger integration (auto-detect)
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }
})();
