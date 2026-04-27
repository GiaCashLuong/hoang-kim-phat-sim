/* ===== REDIRECT IF LOGGED IN ===== */
(async () => {
  const user = await getUser();
  if (user) window.location.href = 'dashboard.html';
})();

/* ===== TABS ===== */
const tabLogin    = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');
const formLogin   = document.getElementById('form-login');
const formReg     = document.getElementById('form-register');

tabLogin.addEventListener('click', () => {
  tabLogin.classList.add('active');    tabLogin.setAttribute('aria-selected','true');
  tabRegister.classList.remove('active'); tabRegister.setAttribute('aria-selected','false');
  formLogin.style.display = '';
  formReg.style.display   = 'none';
});

tabRegister.addEventListener('click', () => {
  tabRegister.classList.add('active');  tabRegister.setAttribute('aria-selected','true');
  tabLogin.classList.remove('active');  tabLogin.setAttribute('aria-selected','false');
  formReg.style.display   = '';
  formLogin.style.display = 'none';
});

/* ===== HELPERS ===== */
function showAlert(id, msg, type) {
  const el = document.getElementById(id);
  el.className = `auth-alert form-alert--${type}`;
  el.textContent = msg;
  el.style.display = 'block';
}

/* ===== LOGIN ===== */
formLogin.addEventListener('submit', async e => {
  e.preventDefault();
  const btn = document.getElementById('btn-login');
  btn.disabled = true; btn.textContent = 'Đang đăng nhập...';

  const { error } = await window.db.auth.signInWithPassword({
    email: document.getElementById('login-email').value.trim(),
    password: document.getElementById('login-password').value,
  });

  btn.disabled = false; btn.textContent = 'Đăng Nhập';
  if (error) {
    showAlert('alert-login', 'Email hoặc mật khẩu không đúng. Vui lòng thử lại.', 'error');
  } else {
    window.location.href = 'dashboard.html';
  }
});

/* ===== REGISTER ===== */
formReg.addEventListener('submit', async e => {
  e.preventDefault();
  const btn  = document.getElementById('btn-register');
  const name = document.getElementById('reg-name').value.trim();
  const phone= document.getElementById('reg-phone').value.trim();
  const email= document.getElementById('reg-email').value.trim();
  const pass = document.getElementById('reg-password').value;

  btn.disabled = true; btn.textContent = 'Đang gửi...';

  const { data, error } = await window.db.auth.signUp({
    email,
    password: pass,
    options: { data: { full_name: name } },
  });

  if (error) {
    btn.disabled = false; btn.textContent = 'Gửi Đơn Đăng Ký';
    showAlert('alert-register', error.message || 'Đăng ký thất bại. Vui lòng thử lại.', 'error');
    return;
  }

  /* Create affiliate profile */
  if (data?.user) {
    const code = 'HKP' + Math.random().toString(36).slice(2,7).toUpperCase();
    await window.db.from('hkp_affiliates').insert([{
      id: data.user.id, ho_ten: name, so_dien_thoai: phone, ma_ctv: code,
    }]);
  }

  btn.disabled = false; btn.textContent = 'Gửi Đơn Đăng Ký';
  showAlert('alert-register',
    'Đăng ký thành công! Kiểm tra email để xác nhận tài khoản. Chúng tôi sẽ xét duyệt CTV trong 1–2 ngày làm việc.',
    'success'
  );
  formReg.reset();
});

/* ===== FORGOT PASSWORD ===== */
document.getElementById('forgot-link').addEventListener('click', async e => {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  if (!email) { showAlert('alert-login', 'Vui lòng nhập email trước.', 'error'); return; }
  await window.db.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + '/simkinhdich/auth.html',
  });
  showAlert('alert-login', 'Email đặt lại mật khẩu đã được gửi. Kiểm tra hộp thư của bạn.', 'success');
});
