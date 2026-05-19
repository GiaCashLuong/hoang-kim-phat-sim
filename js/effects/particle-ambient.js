/* === Particle Ambient — vanilla canvas drift === */
(function () {
  'use strict';

  const canvas = document.querySelector('[data-particle-ambient]');
  if (!canvas) return;

  const tier = window.__deviceTier || 'high';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Bronze tier — remove canvas entirely
  if (reducedMotion || tier === 'low') {
    canvas.remove();
    return;
  }

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  // Config from data attributes
  const baseCount = parseInt(canvas.dataset.particleCount) || 50;
  const count = tier === 'mid' ? Math.floor(baseCount * 0.4) : baseCount; // Silver tier: 40% count
  const color = canvas.dataset.particleColor || '255,255,255';
  const speed = parseFloat(canvas.dataset.particleSpeed) || 0.3;
  const sizeMin = parseFloat(canvas.dataset.particleSizeMin) || 0.5;
  const sizeMax = parseFloat(canvas.dataset.particleSizeMax) || 2.5;
  const baseOpacity = parseFloat(canvas.dataset.particleOpacity) || 0.5;

  let width, height;
  let particles = [];
  let raf = null;
  let isVisible = true;

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);
  }

  function createParticle() {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * speed,
      vy: (Math.random() - 0.5) * speed * 0.5, // slower vertical
      size: Math.random() * (sizeMax - sizeMin) + sizeMin,
      opacity: Math.random() * baseOpacity + 0.1
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: count }, createParticle);
    animate();
  }

  function animate() {
    if (!isVisible) return;
    ctx.clearRect(0, 0, width, height);

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      // Wrap edges
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;
      if (p.y < -10) p.y = height + 10;
      if (p.y > height + 10) p.y = -10;

      ctx.fillStyle = `rgba(${color}, ${p.opacity})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });

    raf = requestAnimationFrame(animate);
  }

  // Pause on tab hidden — save battery
  document.addEventListener('visibilitychange', () => {
    isVisible = !document.hidden;
    if (isVisible && !raf) animate();
    else if (raf) {
      cancelAnimationFrame(raf);
      raf = null;
    }
  });

  // Resize handler — debounced
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resize();
      // Reposition out-of-bounds particles
      particles.forEach(p => {
        if (p.x > width) p.x = Math.random() * width;
        if (p.y > height) p.y = Math.random() * height;
      });
    }, 200);
  }, { passive: true });

  init();
})();
