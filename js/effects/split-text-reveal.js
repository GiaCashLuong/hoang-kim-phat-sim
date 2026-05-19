/* === Split-Text Reveal — auto-degrade Gold/Silver/Bronze ===
   Requires GSAP + SplitText for Gold/Silver tiers.
   Falls back to CSS Bronze if vendor missing or device low.
*/
(function () {
  'use strict';

  const headings = document.querySelectorAll('[data-split]');
  if (headings.length === 0) return;

  // === Tier detection ===
  const tier = window.__deviceTier || 'high'; // from _tier-detect.js
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Bronze fallback path
  const applyBronze = () => {
    headings.forEach(h => {
      h.classList.add('split-bronze');
      h.style.visibility = 'visible';
    });
  };

  // Reduced motion → Bronze
  if (reducedMotion) {
    headings.forEach(h => h.style.visibility = 'visible');
    return;
  }

  // No GSAP / SplitText → Bronze
  if (typeof gsap === 'undefined' || typeof SplitText === 'undefined') {
    console.warn('[split-text-reveal] GSAP/SplitText not loaded — using Bronze fallback');
    applyBronze();
    return;
  }

  // Low device → Bronze (cheaper than even SplitText init)
  if (tier === 'low') {
    applyBronze();
    return;
  }

  // === Gold (PC) / Silver (mobile-mid) ===
  const splitMode = tier === 'high' ? 'chars' : 'words';
  const stagger = tier === 'high'
    ? (parseInt(headings[0].dataset.splitStagger) || 30) / 1000
    : 0.08;

  headings.forEach(h => {
    h.classList.add(splitMode === 'chars' ? 'split-by-char' : 'split-by-word');

    const split = new SplitText(h, {
      type: splitMode === 'chars' ? 'chars,words' : 'words',
      charsClass: 'char',
      wordsClass: 'word'
    });

    h.classList.add('split-ready');
    h.style.visibility = 'visible';

    const direction = h.dataset.splitDirection || 'sequence';
    const targets = splitMode === 'chars' ? split.chars : split.words;

    // IntersectionObserver — only animate when in viewport
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();

      gsap.to(targets, {
        y: 0,
        opacity: 1,
        duration: 0.6,
        ease: 'power3.out',
        stagger: direction === 'random'
          ? { each: stagger, from: 'random' }
          : stagger
      });
    }, { rootMargin: '-10% 0px' });
    io.observe(h);
  });
})();
