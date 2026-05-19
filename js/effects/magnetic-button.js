/* === Magnetic Button — Gold/Silver/Bronze auto-degrade ===
   Vanilla JS, no deps. ~1KB minified.
   Triggers on any element with [data-magnetic].
*/
(function () {
  'use strict';

  // === Tier detection ===
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lowMemory = (navigator.deviceMemory || 8) < 4;
  const lowCores = (navigator.hardwareConcurrency || 8) < 4;
  const isLowDevice = lowMemory || lowCores;

  // Bronze tier — bail out cleanly, CSS :hover handles it
  if (reducedMotion || isLowDevice) {
    document.documentElement.classList.add(isLowDevice ? 'device-low' : 'device-reduced');
    document.querySelectorAll('[data-magnetic]').forEach(el => el.classList.add('is-bronze'));
    return;
  }

  // === Setup per-button ===
  const buttons = document.querySelectorAll('[data-magnetic]');
  if (buttons.length === 0) return;

  let pointerType = null; // detected on first event

  buttons.forEach(btn => {
    const strength = parseFloat(btn.dataset.magneticStrength) || 0.35;
    const range = parseFloat(btn.dataset.magneticRange) || 80;
    let raf = null;
    let inRange = false;

    // Touch handler — Silver tier (tap-scale)
    btn.addEventListener('touchstart', () => {
      btn.classList.add('is-tap-active');
    }, { passive: true });
    btn.addEventListener('touchend', () => {
      btn.classList.remove('is-tap-active');
    }, { passive: true });

    // Pointer handler — detect mouse vs touch on first move, then route
    const onPointerMove = (e) => {
      if (!pointerType) pointerType = e.pointerType;

      // Only mouse/pen get magnetic — touch already handled above
      if (pointerType === 'touch') return;

      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);

      if (dist > range) {
        if (inRange) {
          inRange = false;
          btn.classList.remove('is-magnetic-active');
          btn.style.transform = '';
        }
        return;
      }

      inRange = true;
      btn.classList.add('is-magnetic-active');

      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const tx = dx * strength;
        const ty = dy * strength;
        btn.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      });
    };

    const onPointerLeave = () => {
      inRange = false;
      btn.classList.remove('is-magnetic-active');
      btn.style.transform = '';
    };

    // Listen on document so we catch cursor approaching, not just inside btn
    // Throttled — only listens when btn is in viewport (IntersectionObserver gate)
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        document.addEventListener('pointermove', onPointerMove, { passive: true });
      } else {
        document.removeEventListener('pointermove', onPointerMove);
        onPointerLeave();
      }
    }, { rootMargin: '100px' });
    io.observe(btn);
  });
})();
