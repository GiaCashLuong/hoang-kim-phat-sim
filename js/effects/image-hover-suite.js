/* === Image Parallax Soft — Gold variant only ===
   Other 4 variants are pure CSS, no JS needed.
*/
(function () {
  'use strict';

  const elements = document.querySelectorAll('.img-parallax-soft');
  if (elements.length === 0) return;

  const tier = window.__deviceTier || 'high';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchOnly = !window.matchMedia('(hover: hover)').matches;

  // Disable on reduced-motion / mid-low / touch-only
  if (reducedMotion || tier !== 'high' || isTouchOnly) return;

  elements.forEach(container => {
    const img = container.querySelector('img');
    if (!img) return;

    const strength = parseFloat(container.dataset.parallaxStrength) || 15;
    let raf = null;

    const onMove = (e) => {
      const rect = container.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / rect.width;
      const dy = (e.clientY - cy) / rect.height;
      // Inverse direction — image moves OPPOSITE cursor for parallax
      const tx = -dx * strength;
      const ty = -dy * strength;

      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        img.style.transform = `scale(1.06) translate3d(${tx}px, ${ty}px, 0)`;
      });
    };

    const onLeave = () => {
      if (raf) cancelAnimationFrame(raf);
      img.style.transform = '';
    };

    // Only listen when container in viewport (perf)
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        container.addEventListener('mousemove', onMove, { passive: true });
        container.addEventListener('mouseleave', onLeave);
      } else {
        container.removeEventListener('mousemove', onMove);
        container.removeEventListener('mouseleave', onLeave);
        onLeave();
      }
    }, { rootMargin: '50px' });
    io.observe(container);
  });
})();
