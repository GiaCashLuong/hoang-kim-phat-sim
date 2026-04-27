/* ===== NAV ===== */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 40), { passive: true });
const burger = document.getElementById('nav-burger');
const navLinks = document.getElementById('nav-links');
burger.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  burger.classList.toggle('open', open);
});

/* ===== STATE ===== */
const PAGE_SIZE = 12;
let allSims = [];
let filtered = [];
let currentPage = 1;

const MANG_CLASS = {
  'Viettel': 'mang-viettel', 'Mobifone': 'mang-mobifone',
  'Vinaphone': 'mang-vinaphone', 'Vietnamobile': 'mang-vietnamobile', 'Gmobile': 'mang-gmobile'
};

/* ===== LOAD FROM SUPABASE ===== */
async function loadSims() {
  const { data, error } = await window.db
    .from('hkp_sims')
    .select('*')
    .eq('trang_thai', 'con_hang')
    .order('created_at', { ascending: false });

  if (error || !data) {
    document.getElementById('sim-grid').innerHTML =
      '<p class="sim-empty">Không thể tải dữ liệu. Vui lòng thử lại sau.</p>';
    return;
  }
  allSims = data;
  applyFilter();
}

/* ===== FILTER ===== */
function applyFilter() {
  const so    = document.getElementById('filter-so').value.replace(/\D/g, '');
  const menh  = document.getElementById('filter-menh').value;
  const hanh  = document.getElementById('filter-hanh').value;
  const mang  = document.getElementById('filter-mang').value;
  const giaV  = document.getElementById('filter-gia').value;

  filtered = allSims.filter(s => {
    if (so && !s.so_sim.includes(so)) return false;
    if (menh && s.menh !== menh) return false;
    if (hanh && s.ngu_hanh !== hanh) return false;
    if (mang && s.nha_mang !== mang) return false;
    if (giaV) {
      const [lo, hi] = giaV.split('-').map(Number);
      if (s.gia < lo || s.gia > hi) return false;
    }
    return true;
  });

  currentPage = 1;
  renderPage();
}

/* ===== RENDER ===== */
function renderPage() {
  const grid  = document.getElementById('sim-grid');
  const count = document.getElementById('sim-count');
  const total = filtered.length;
  const start = (currentPage - 1) * PAGE_SIZE;
  const page  = filtered.slice(start, start + PAGE_SIZE);

  count.innerHTML = `Hiển thị <span>${start + 1}–${Math.min(start + PAGE_SIZE, total)}</span> / <span>${total}</span> sim`;

  if (page.length === 0) {
    grid.innerHTML = '<p class="sim-empty">Không tìm thấy sim phù hợp. Thử điều chỉnh bộ lọc.</p>';
    renderPagination(total);
    return;
  }

  grid.innerHTML = page.map(s => {
    const catTag = ['Thiên Y','Sinh Khí','Diên Niên','Phục Vị'].includes(s.menh)
      ? 'sim-tag--menh' : 'sim-tag--hung';
    const discount = s.gia_goc && s.gia_goc > s.gia
      ? `<div class="sim-card__goc">${formatVND(s.gia_goc)}</div>` : '';
    return `
      <article class="sim-card">
        <div class="sim-card__header">
          <span class="sim-card__number">${formatSimNumber(s.so_sim)}</span>
          <span class="sim-card__mang ${MANG_CLASS[s.nha_mang] || ''}">${s.nha_mang || ''}</span>
        </div>
        <div class="sim-card__tags">
          ${s.menh ? `<span class="sim-tag ${catTag}">${s.menh}</span>` : ''}
          ${s.ngu_hanh ? `<span class="sim-tag sim-tag--nhanh">Ngũ hành ${s.ngu_hanh}</span>` : ''}
        </div>
        ${s.mo_ta ? `<p style="font-size:.8rem;color:var(--muted);margin-bottom:.75rem;line-height:1.6">${s.mo_ta}</p>` : ''}
        <div class="sim-card__footer">
          <div>
            <div class="sim-card__price">${formatVND(s.gia)}</div>
            ${discount}
          </div>
          <a href="tel:0932601616" class="sim-card__btn">Đặt ngay</a>
        </div>
      </article>`;
  }).join('');

  /* 3D Tilt */
  document.querySelectorAll('.sim-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const rx = ((e.clientY - r.top  - r.height / 2) / (r.height / 2)) * -8;
      const ry = ((e.clientX - r.left - r.width  / 2) / (r.width  / 2)) *  8;
      card.style.transform = `perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.03)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });

  renderPagination(total);
}

function renderPagination(total) {
  const pages = Math.ceil(total / PAGE_SIZE);
  const pg = document.getElementById('pagination');
  if (pages <= 1) { pg.innerHTML = ''; return; }

  let html = '';
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || Math.abs(i - currentPage) <= 2) {
      html += `<button class="page-btn${i === currentPage ? ' active' : ''}" data-page="${i}" aria-label="Trang ${i}" ${i === currentPage ? 'aria-current="page"' : ''}>${i}</button>`;
    } else if (Math.abs(i - currentPage) === 3) {
      html += `<span style="color:var(--muted);display:flex;align-items:center;padding:0 .25rem">…</span>`;
    }
  }
  pg.innerHTML = html;
  pg.querySelectorAll('.page-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentPage = Number(btn.dataset.page);
      renderPage();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

/* ===== FILTER EVENTS ===== */
['filter-so','filter-menh','filter-hanh','filter-mang','filter-gia'].forEach(id => {
  const el = document.getElementById(id);
  el.addEventListener(id === 'filter-so' ? 'input' : 'change', applyFilter);
});

document.getElementById('filter-clear').addEventListener('click', () => {
  document.getElementById('filter-so').value = '';
  document.getElementById('filter-menh').value = '';
  document.getElementById('filter-hanh').value = '';
  document.getElementById('filter-mang').value = '';
  document.getElementById('filter-gia').value = '';
  applyFilter();
});

loadSims();
