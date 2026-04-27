/* ===== NAV SCROLL ===== */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ===== MOBILE BURGER ===== */
const burger = document.getElementById('nav-burger');
const navLinks = document.getElementById('nav-links');
burger.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  burger.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', String(open));
});
document.addEventListener('click', e => {
  if (!e.target.closest('.nav')) {
    navLinks.classList.remove('open');
    burger.classList.remove('open');
  }
});

/* ===== SMOOTH SCROLL ===== */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    navLinks.classList.remove('open');
    burger.classList.remove('open');
    const top = target.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ===== STATS COUNTER ===== */
const statsRow = document.querySelector('.stats__grid');
if (statsRow) {
  new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.querySelectorAll('.stat__num[data-to]').forEach(el => {
        const to = parseFloat(el.dataset.to);
        const suffix = el.dataset.suffix || '';
        const dec = to % 1 !== 0 ? 1 : 0;
        const plusEl = el.querySelector('.stat__plus');
        const node = el.childNodes[0];
        if (!node) return;
        const t0 = performance.now(), dur = 1800;
        (function step(now) {
          const p = Math.min((now - t0) / dur, 1);
          const v = 1 - Math.pow(1 - p, 3);
          node.textContent = (v * to).toFixed(dec) + suffix;
          if (p < 1) requestAnimationFrame(step);
          else {
            node.textContent = to.toFixed(dec) + suffix;
            if (plusEl) el.appendChild(plusEl);
          }
        })(t0);
      });
      entry.target._obs?.unobserve(entry.target);
    });
  }, { threshold: 0.5 }).observe(statsRow);
}

/* ===== STAGGER OBSERVER (Bento Grid, Testimonials, Muc Dich) ===== */
function staggerObserve(containerSel, cardSel, delay = 110) {
  document.querySelectorAll(containerSel).forEach(container => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.querySelectorAll(cardSel).forEach((el, i) =>
          setTimeout(() => el.classList.add('bento-in'), i * delay)
        );
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.08 });
    obs.observe(container);
  });
}

staggerObserve('.batcuc__grid', '.batcuc__card', 90);
staggerObserve('.testimonials__grid', '.testi-card', 120);
staggerObserve('.mucdich__grid', '.mucdich__item', 100);

/* ===== GENERIC REVEAL ===== */
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    revealObs.unobserve(entry.target);
  });
}, { threshold: 0.08, rootMargin: '0px 0px 80px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

/* ===== 3D TILT – Ngũ Hành + Sim Preview ===== */
document.querySelectorAll('.nguhanh__card, .sim-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const rx = ((e.clientY - r.top - r.height / 2) / (r.height / 2)) * -8;
    const ry = ((e.clientX - r.left - r.width / 2) / (r.width / 2)) * 8;
    card.style.transform = `perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.04)`;
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});

/* ===== SIM PREVIEW DATA ===== */
const PREVIEW_SIMS = [
  { so: '0944489868', mang: 'Mobifone', ngu_hanh: 'Hỏa', menh: 'Sinh Khí', gia: 5680000, gia_goc: 6200000 },
  { so: '0932601616', mang: 'Viettel',  ngu_hanh: 'Kim',  menh: 'Thiên Y',  gia: 3200000, gia_goc: 3800000 },
  { so: '0985678868', mang: 'Viettel',  ngu_hanh: 'Thổ',  menh: 'Diên Niên',gia: 2800000, gia_goc: 3200000 },
  { so: '0703868686', mang: 'Vinaphone',ngu_hanh: 'Thủy', menh: 'Thiên Y',  gia: 4500000, gia_goc: 5000000 },
  { so: '0909696969', mang: 'Mobifone', ngu_hanh: 'Mộc',  menh: 'Sinh Khí', gia: 3800000, gia_goc: 4200000 },
  { so: '0776868686', mang: 'Viettel',  ngu_hanh: 'Kim',  menh: 'Phục Vị',  gia: 2500000, gia_goc: 2800000 },
];

const MANG_CLASS = {
  'Viettel': 'mang-viettel', 'Mobifone': 'mang-mobifone',
  'Vinaphone': 'mang-vinaphone', 'Vietnamobile': 'mang-vietnamobile', 'Gmobile': 'mang-gmobile'
};

function renderSimPreviews() {
  const grid = document.getElementById('sim-preview-grid');
  if (!grid) return;
  grid.innerHTML = PREVIEW_SIMS.map(s => `
    <article class="sim-card">
      <div class="sim-card__header">
        <span class="sim-card__number">${formatSimNumber(s.so)}</span>
        <span class="sim-card__mang ${MANG_CLASS[s.mang] || ''}">${s.mang}</span>
      </div>
      <div class="sim-card__tags">
        <span class="sim-tag sim-tag--menh">${s.menh}</span>
        <span class="sim-tag sim-tag--nhanh">Ngũ hành ${s.ngu_hanh}</span>
      </div>
      <div class="sim-card__footer">
        <div>
          <div class="sim-card__price">${formatVND(s.gia)}</div>
          <div class="sim-card__goc">${formatVND(s.gia_goc)}</div>
        </div>
        <a href="tel:09326016 16" class="sim-card__btn">Đặt ngay</a>
      </div>
    </article>
  `).join('');

  /* Re-apply tilt after render */
  document.querySelectorAll('.sim-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const rx = ((e.clientY - r.top - r.height / 2) / (r.height / 2)) * -8;
      const ry = ((e.clientX - r.left - r.width / 2) / (r.width / 2)) * 8;
      card.style.transform = `perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.04)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}

renderSimPreviews();

/* ===== CONTACT FORM ===== */
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = contactForm.querySelector('.form-submit');
    const alert = document.getElementById('contact-alert');
    btn.disabled = true;
    btn.textContent = 'Đang gửi...';
    const data = {
      ho_ten: contactForm.ho_ten.value.trim(),
      so_dien_thoai: contactForm.so_dien_thoai.value.trim(),
      noi_dung: contactForm.noi_dung.value.trim(),
    };
    const { error } = await window.db.from('hkp_contacts').insert([data]);
    btn.disabled = false;
    btn.textContent = 'Gửi Tin Nhắn';
    if (error) {
      alert.className = 'form-alert form-alert--error';
      alert.textContent = 'Có lỗi xảy ra, vui lòng liên hệ trực tiếp qua hotline.';
    } else {
      alert.className = 'form-alert form-alert--success';
      alert.textContent = 'Cảm ơn bạn! Chúng tôi sẽ liên hệ trong thời gian sớm nhất.';
      contactForm.reset();
    }
  });
}
