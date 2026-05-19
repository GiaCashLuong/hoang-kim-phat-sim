/* === Custom Cursor Context-Aware — vanilla JS === */
(function () {
  'use strict';

  const tier = window.__deviceTier || 'high';
  const isTouchOnly = !window.matchMedia('(hover: hover)').matches;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Skip on touch devices entirely
  if (tier !== 'high' || isTouchOnly) return;

  // Create cursor element
  const cursor = document.createElement('div');
  cursor.className = 'custom-cursor';
  const inner = document.createElement('div');
  inner.className = 'custom-cursor__inner';
  cursor.appendChild(inner);
  document.body.appendChild(cursor);
  document.body.classList.add('has-custom-cursor');

  // === Position tracking with lerp ===
  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;
  const lerpFactor = reducedMotion ? 1 : 0.2;
  let raf = null;

  document.addEventListener('pointermove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!raf) animate();
  }, { passive: true });

  function animate() {
    cursorX += (mouseX - cursorX) * lerpFactor;
    cursorY += (mouseY - cursorY) * lerpFactor;

    // Adjust for cursor center (size / 2)
    const isImage = cursor.classList.contains('is-image');
    const offset = isImage ? 40 : 12; // half of 80px or 24px

    cursor.style.transform = `translate3d(${cursorX - offset}px, ${cursorY - offset}px, 0)`;

    // Continue if mouse still moving (lerp not yet reached target)
    if (Math.abs(mouseX - cursorX) > 0.1 || Math.abs(mouseY - cursorY) > 0.1) {
      raf = requestAnimationFrame(animate);
    } else {
      raf = null;
    }
  }

  // === Context detection ===
  const linkSelector = 'a, button, [data-magnetic], [role="button"]';
  const imageSelector = 'img, picture, [data-cursor-image]';
  const textInputSelector = 'input, textarea, [contenteditable="true"]';

  document.addEventListener('mouseover', (e) => {
    const target = e.target;
    cursor.classList.remove('is-link', 'is-image', 'is-text');
    inner.textContent = '';

    if (target.matches(textInputSelector) || target.closest(textInputSelector)) {
      cursor.classList.add('is-text');
      return;
    }

    if (target.matches(imageSelector) || target.closest(imageSelector)) {
      const labelHost = target.closest('[data-cursor-text]') || target.matches('[data-cursor-text]') ? target : null;
      cursor.classList.add('is-image');
      if (labelHost) {
        inner.textContent = labelHost.dataset.cursorText || 'XEM';
      }
      return;
    }

    if (target.matches(linkSelector) || target.closest(linkSelector)) {
      cursor.classList.add('is-link');
      const labelHost = target.closest('[data-cursor-text]');
      if (labelHost) {
        // For links with custom label, could use is-image style — skip for now
      }
      return;
    }
  });

  // Hide cursor when leaving viewport
  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
  });
})();
