/* === Device Tier Detection — load FIRST in effect script chain ===
   Sets window.__deviceTier = 'high' | 'mid' | 'low'
   Sets <html> class: tier-high | tier-mid | tier-low
   Other effect scripts read these to decide degradation level.
*/
(function () {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isPC = window.matchMedia('(min-width: 1024px)').matches;
  const memory = navigator.deviceMemory || 8;
  const cores = navigator.hardwareConcurrency || 8;
  const isTouchOnly = !window.matchMedia('(hover: hover)').matches;

  let tier = 'low';

  if (reducedMotion) {
    tier = 'low';
  } else if (isPC || (memory >= 4 && cores >= 4 && !isTouchOnly)) {
    tier = 'high';
  } else if (memory >= 4 && cores >= 4) {
    tier = 'mid';
  } else {
    tier = 'low';
  }

  document.documentElement.classList.add(`tier-${tier}`);
  window.__deviceTier = tier;

  // Optional: log for debugging in dev
  if (location.hostname === 'localhost') {
    console.log(`[tier-detect] tier=${tier}, memory=${memory}GB, cores=${cores}, isPC=${isPC}, touchOnly=${isTouchOnly}, reducedMotion=${reducedMotion}`);
  }
})();
