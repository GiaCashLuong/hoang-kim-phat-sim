/* === Scroll Scrubbing — Platinum tier with GSAP ScrollTrigger === */
(function () {
  'use strict';

  const sections = document.querySelectorAll('[data-scrub]');
  if (sections.length === 0) return;

  const tier = window.__deviceTier || 'high';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Skip on mobile / low / reduced — no degradation tier (just native scroll)
  if (tier !== 'high' || reducedMotion) {
    sections.forEach(s => {
      const target = s.querySelector('.scrub-target');
      if (target) target.style.opacity = '1';
      s.querySelectorAll('[data-scrub-stage]').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
    });
    return;
  }

  // Vendor check
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.warn('[scroll-scrubbing] GSAP/ScrollTrigger not loaded — skipping effect');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  sections.forEach(section => {
    const effect = section.dataset.scrubEffect || 'zoom';
    const distance = section.dataset.scrubDistance || '100%';
    const pin = section.dataset.scrubPin !== 'false';
    const target = section.querySelector('.scrub-target');
    if (!target) return;

    if (effect === 'zoom') {
      target.classList.add('scrub-effect-zoom');
      const scaleTo = parseFloat(section.dataset.scrubScale) || 1.4;
      gsap.to(target, {
        scale: scaleTo,
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: `+=${distance}`,
          scrub: 1,
          pin: pin,
          anticipatePin: 1
        }
      });
    } else if (effect === 'fade-stages' || effect === 'text-reveal-stages') {
      const stages = section.querySelectorAll('[data-scrub-stage]');
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: `+=${distance}`,
          scrub: 1,
          pin: pin,
          anticipatePin: 1
        }
      });
      stages.forEach((stage, i) => {
        tl.to(stage, { opacity: 1, y: 0, duration: 0.5 }, i * 0.5);
        if (i < stages.length - 1) {
          tl.to(stage, { opacity: 0, y: -20, duration: 0.5 }, (i + 1) * 0.5);
        }
      });
    } else if (effect === 'horizontal-pan') {
      const inner = target.querySelector('.scrub-pan-inner') || target;
      gsap.to(inner, {
        xPercent: -100 * (inner.children.length - 1),
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: `+=${distance}`,
          scrub: 1,
          pin: pin
        }
      });
    }
  });
})();
