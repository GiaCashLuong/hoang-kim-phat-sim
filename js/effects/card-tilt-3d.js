/* === 3D Card Tilt — auto-degrade Gold/Silver/Bronze === */
(function () {
  'use strict';

  const cards = document.querySelectorAll('[data-tilt]');
  if (cards.length === 0) return;

  const tier = window.__deviceTier || 'high';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchOnly = !window.matchMedia('(hover: hover)').matches;

  // Bronze tier path
  if (reducedMotion || tier === 'low') {
    cards.forEach(c => c.classList.add('tilt-bronze'));
    return;
  }

  // Silver tier — touch devices, tap-scale
  if (isTouchOnly || tier === 'mid') {
    cards.forEach(card => {
      card.addEventListener('touchstart', () => card.classList.add('tilt-tap-active'), { passive: true });
      card.addEventListener('touchend', () => card.classList.remove('tilt-tap-active'), { passive: true });
    });
    return;
  }

  // Gold tier — full 3D tilt with shadow follow
  cards.forEach(card => {
    const maxAngle = parseFloat(card.dataset.tiltMax) || 10;
    const perspective = parseFloat(card.dataset.tiltPerspective) || 1000;
    let raf = null;

    const onMove = (e) => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);  // -1 → 1
      const dy = (e.clientY - cy) / (rect.height / 2); // -1 → 1

      const rotX = -dy * maxAngle;
      const rotY = dx * maxAngle;

      // Shadow opposite direction for depth
      const shadowX = -dx * 20;
      const shadowY = -dy * 20 + 16; // slight downward bias

      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        card.style.transform = `perspective(${perspective}px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(0)`;
        card.style.boxShadow = `${shadowX}px ${shadowY}px 40px -8px rgba(0, 0, 0, 0.3)`;
      });
    };

    const onLeave = () => {
      if (raf) cancelAnimationFrame(raf);
      card.style.transform = '';
      card.style.boxShadow = '';
    };

    // IntersectionObserver gate — only listen when in viewport
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        card.addEventListener('mousemove', onMove, { passive: true });
        card.addEventListener('mouseleave', onLeave);
      } else {
        card.removeEventListener('mousemove', onMove);
        card.removeEventListener('mouseleave', onLeave);
        onLeave();
      }
    }, { rootMargin: '50px' });
    io.observe(card);
  });
})();
