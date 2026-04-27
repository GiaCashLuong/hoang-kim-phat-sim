const PAGE_SIZE = 15;
let allSims = [];
let filtered = [];
let currentPage = 1;
let affiliateData = null;

const MANG_CLASS = {
  'Viettel': 'mang-viettel', 'Mobifone': 'mang-mobifone',
  'Vinaphone': 'mang-vinaphone', 'Vietnamobile': 'mang-vietnamobile', 'Gmobile': 'mang-gmobile'
};

/* ===== INIT ===== */
(async () => {
  const user = await requireAuth();
  if (!user) return;

  /* Load affiliate profile */
  const { data: aff } = await window.db
    .from('hkp_affiliates')
    .select('*')
    .eq('id', user.id)
    .single();

  affiliateData = aff;
  renderHeader(user, aff);

  if (aff?.trang_thai === 'active') {
    await loadSims();
  } else {
    document.getElementById('pending-notice').style.display = '';
    document.getElementById('sim-section').style.display = 'none';
  }
})();

/* ===== HEADER ===== */
function renderHeader(user, aff) {
  const name = user.user_metadata?.full_name || aff?.ho_ten || 'CTV';
  document.getElementById('dash-greeting').textContent = `Chào ${name}!`;

  const code = aff?.ma_ctv || '—';
  document.getElementById('ctv-code').textContent = code;

  const hongVND = aff?.tong_hoa_hong ? formatVND(aff.tong_hoa_hong) : '0₫';
  document.getElementById('stat-hoa-hong').textContent = hongVND;
  document.getElementById('stat-don').textContent = '—';
  document.getElementById('stat-ty-le').textContent = (aff?.hoa_hong_rate || 5) + '%';

  const status = aff?.trang_thai || 'pending';
  const badge  = { pending: 'pending', active: 'active', suspended: 'suspended' }[status] || 'pending';
  const label  = { pending: 'Chờ duyệt', active: 'Đang hoạt động', suspended: 'Tạm dừng' }[status];
  document.getElementById('stat-status-badge').innerHTML =
    `<span class="dash-status dash-status--${badge}">${label}</span>`;

  /* Copy link */
  document.getElementById('dash-code').addEventListener('click', () => {
    const link = `${window.location.origin}/simkinhdich/sim.html?ref=${code}`;
    navigator.clipboard?.writeText(link).then(() => {
      document.getElementById('ctv-code').textContent = 'Đã copy!';
      setTimeout(() => { document.getElementById('ctv-code').textContent = code; }, 2000);
    });
  });
}

/* ===== LOAD SIMS ===== */
async function loadSims() {
  const { data, error } = await window.db
    .from('hkp_sims')
    .select('*')
    .eq('trang_thai', 'con_hang')
    .order('created_at', { ascending: false });

  if (error || !data) {
    document.getElementById('d-sim-grid').innerHTML =
      '<p class="sim-empty">Không thể tải kho sim.</p>';
    return;
  }
  allSims = data;
  applyFilter();
}

/* ===== FILTER ===== */
function applyFilter() {
  const so   = document.getElementById('d-filter-so').value.replace(/\D/g, '');
  const hanh = document.getElementById('d-filter-hanh').value;
  const mang = document.getElementById('d-filter-mang').value;

  filtered = allSims.filter(s => {
    if (so && !s.so_sim.includes(so)) return false;
    if (hanh && s.ngu_hanh !== hanh) return false;
    if (mang && s.nha_mang !== mang) return false;
    return true;
  });

  currentPage = 1;
  renderPage();
}

['d-filter-hanh','d-filter-mang'].forEach(id =>
  document.getElementById(id).addEventListener('change', applyFilter)
);
document.getElementById('d-filter-so').addEventListener('input', applyFilter);

/* ===== RENDER ===== */
function renderPage() {
  const grid  = document.getElementById('d-sim-grid');
  const count = document.getElementById('d-sim-count');
  const total = filtered.length;
  const start = (currentPage - 1) * PAGE_SIZE;
  const page  = filtered.slice(start, start + PAGE_SIZE);

  count.innerHTML = `Hiển thị <span>${start + 1}–${Math.min(start + PAGE_SIZE, total)}</span> / <span>${total}</span> sim`;

  if (page.length === 0) {
    grid.innerHTML = '<p class="sim-empty">Không tìm thấy sim phù hợp.</p>';
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
        <div class="sim-card__footer">
          <div>
            <div class="sim-card__price">${formatVND(s.gia)}</div>
            ${discount}
          </div>
          <button class="sim-card__btn" onclick="copySimInfo('${s.so_sim}','${s.gia}')">Copy Thông Tin</button>
        </div>
      </article>`;
  }).join('');

  renderPagination(total);
}

function copySimInfo(so, gia) {
  const code = affiliateData?.ma_ctv || '';
  const text = `📱 Sim phong thủy: ${formatSimNumber(so)}\n💰 Giá: ${formatVND(Number(gia))}\n🔗 Đặt sim: Liên hệ hotline 0932.60.1616\n${code ? `Mã CTV: ${code}` : ''}`;
  navigator.clipboard?.writeText(text);
}
window.copySimInfo = copySimInfo;

function renderPagination(total) {
  const pages = Math.ceil(total / PAGE_SIZE);
  const pg = document.getElementById('d-pagination');
  if (pages <= 1) { pg.innerHTML = ''; return; }
  let html = '';
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || Math.abs(i - currentPage) <= 2) {
      html += `<button class="page-btn${i === currentPage ? ' active' : ''}" data-page="${i}">${i}</button>`;
    } else if (Math.abs(i - currentPage) === 3) {
      html += `<span style="color:var(--muted);display:flex;align-items:center">…</span>`;
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

/* ===== LOGOUT ===== */
document.getElementById('btn-logout').addEventListener('click', signOut);
