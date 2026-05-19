/* === Loading Choreography — auto-degrade Platinum/Mid/skip === */
(function () {
  'use strict';

  const overlay = document.getElementById('page-load-overlay');
  if (!overlay) return;

  const tier = window.__deviceTier || 'high';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const oncePerSession = overlay.dataset.oncePerSession !== 'false';
  const direction = overlay.dataset.sweepDirection || 'up';

  // Already shown this session — remove + skip
  if (oncePerSession && sessionStorage.getItem('page-load-shown') === '1') {
    overlay.remove();
    document.body.classList.add('page-loaded');
    return;
  }

  // Reduced motion or low device — skip choreography
  if (reducedMotion || tier === 'low') {
    overlay.remove();
    document.body.classList.add('page-loaded');
    return;
  }

  // Apply sweep direction class
  overlay.classList.add(`sweep-${direction}`);
  document.body.classList.add('page-loading');

  // Sequence: hold → reveal logo → hold → sweep → reveal content → cleanup
  requestAnimationFrame(() => {
    // Frame 1: trigger logo reveal
    overlay.classList.add('is-active');

    // After 800ms: start sweep + reveal content
    setTimeout(() => {
      overlay.classList.add('is-leaving');
      document.body.classList.remove('page-loading');
      document.body.classList.add('page-loaded');

      // After sweep completes: remove overlay from DOM
      setTimeout(() => {
        overlay.remove();
      }, 900);

      // Mark session shown
      if (oncePerSession) {
        sessionStorage.setItem('page-load-shown', '1');
      }
    }, 800);
  });
})();
