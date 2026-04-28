// ===== CONFIG =====
let API_BASE = '';

// ===== STATE =====
const state = {
  user: null,
  token: null,
  clockInterval: null,
};

// ===== HELPERS =====

function $(sel) { return document.querySelector(sel); }

function getToken() {
  return localStorage.getItem('pro_token');
}

function getUser() {
  const raw = localStorage.getItem('pro_user');
  try { return raw ? JSON.parse(raw) : null; } catch { return null; }
}

function saveSession(token, user) {
  localStorage.setItem('pro_token', token);
  localStorage.setItem('pro_user', JSON.stringify(user));
  state.token = token;
  state.user = user;
}

function clearSession() {
  localStorage.removeItem('pro_token');
  localStorage.removeItem('pro_user');
  state.token = null;
  state.user = null;
}

function showToast(message, type = 'info', duration = 3500) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || icons.info}</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'none';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(40px)';
    toast.style.transition = 'all .2s ease';
    setTimeout(() => toast.remove(), 200);
  }, duration);
}

function showSpinner() {
  let el = document.getElementById('spinner-overlay');
  if (!el) {
    el = document.createElement('div');
    el.id = 'spinner-overlay';
    el.className = 'spinner-overlay';
    el.innerHTML = '<div class="spinner"></div>';
    document.body.appendChild(el);
  }
}

function hideSpinner() {
  const el = document.getElementById('spinner-overlay');
  if (el) el.remove();
}

async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : parts[0].slice(0, 2).toUpperCase();
}

// ===== ROUTING =====

function navigate(page) {
  if (state.clockInterval) { clearInterval(state.clockInterval); state.clockInterval = null; }
  const app = document.getElementById('app');
  app.innerHTML = '';

  if (page === 'login') {
    renderLogin();
  } else if (page === 'home') {
    renderHome();
  }
}

function init() {
  state.token = getToken();
  state.user = getUser();

  if (state.token && state.user) {
    navigate('home');
  } else {
    navigate('login');
  }
}

// ===== LOGIN PAGE =====

function renderLogin() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="login-page">
      <!-- Visual side -->
      <div class="login-visual">
        <div class="floating-shapes">
          <div class="shape shape-1"></div>
          <div class="shape shape-2"></div>
          <div class="shape shape-3"></div>
        </div>
        <div class="login-visual-content">
          <div class="login-visual-logo">
            <div class="icon">P</div>
            <div class="name">Simple App</div>
          </div>
          <h2>Solusi Digital untuk Bisnis Modern</h2>
          <p>Platform terpercaya yang membantu bisnis Anda tumbuh lebih cepat dengan teknologi dan layanan kelas dunia.</p>
          <ul class="feature-list">
            <li><span class="check">✓</span> Layanan profesional & terpercaya</li>
            <li><span class="check">✓</span> Dashboard analitik real-time</li>
            <li><span class="check">✓</span> Keamanan data tingkat enterprise</li>
            <li><span class="check">✓</span> Dukungan 24/7 siap membantu</li>
          </ul>
        </div>
      </div>

      <!-- Form side -->
      <div class="login-form-side">
        <div class="login-card">
          <div class="login-header">
            <h1>Selamat Datang</h1>
            <p>Masuk ke akun Anda atau daftar untuk memulai</p>
          </div>

          <div class="auth-tabs">
            <button class="auth-tab active" id="tab-login" onclick="switchTab('login')">Masuk</button>
            <button class="auth-tab" id="tab-register" onclick="switchTab('register')">Daftar</button>
          </div>

          <!-- Login form -->
          <form class="login-form" id="form-login" onsubmit="handleLogin(event)">
            <div class="form-group">
              <label class="form-label" for="login-email">Email</label>
              <div class="input-wrapper">
                <span class="input-icon">
                  <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </span>
                <input type="email" id="login-email" class="form-input" placeholder="nama@email.com" autocomplete="email" required />
              </div>
              <span class="field-error hidden" id="login-email-err"></span>
            </div>

            <div class="form-group">
              <label class="form-label" for="login-password">Password</label>
              <div class="input-wrapper">
                <span class="input-icon">
                  <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input type="password" id="login-password" class="form-input" placeholder="Masukkan password" autocomplete="current-password" required />
                <button type="button" class="toggle-password" onclick="togglePassword('login-password', this)">
                  <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
              </div>
              <span class="field-error hidden" id="login-password-err"></span>
            </div>

            <button type="submit" class="btn btn-primary btn-full btn-lg" id="login-submit">
              Masuk ke Akun
            </button>
          </form>

          <!-- Register form -->
          <form class="login-form hidden" id="form-register" onsubmit="handleRegister(event)">
            <div class="form-group">
              <label class="form-label" for="reg-name">Nama Lengkap</label>
              <div class="input-wrapper">
                <span class="input-icon">
                  <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </span>
                <input type="text" id="reg-name" class="form-input" placeholder="Nama lengkap Anda" autocomplete="name" required />
              </div>
              <span class="field-error hidden" id="reg-name-err"></span>
            </div>

            <div class="form-group">
              <label class="form-label" for="reg-email">Email</label>
              <div class="input-wrapper">
                <span class="input-icon">
                  <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </span>
                <input type="email" id="reg-email" class="form-input" placeholder="nama@email.com" autocomplete="email" required />
              </div>
              <span class="field-error hidden" id="reg-email-err"></span>
            </div>

            <div class="form-group">
              <label class="form-label" for="reg-password">Password</label>
              <div class="input-wrapper">
                <span class="input-icon">
                  <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input type="password" id="reg-password" class="form-input" placeholder="Min. 6 karakter" autocomplete="new-password" required />
                <button type="button" class="toggle-password" onclick="togglePassword('reg-password', this)">
                  <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
              </div>
              <span class="field-error hidden" id="reg-password-err"></span>
            </div>

            <div class="form-group">
              <label class="form-label" for="reg-confirm">Konfirmasi Password</label>
              <div class="input-wrapper">
                <span class="input-icon">
                  <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input type="password" id="reg-confirm" class="form-input" placeholder="Ulangi password" autocomplete="new-password" required />
                <button type="button" class="toggle-password" onclick="togglePassword('reg-confirm', this)">
                  <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
              </div>
              <span class="field-error hidden" id="reg-confirm-err"></span>
            </div>

            <button type="submit" class="btn btn-primary btn-full btn-lg" id="register-submit">
              Buat Akun
            </button>
          </form>
        </div>
      </div>
    </div>
  `;
}

function switchTab(tab) {
  const loginForm = document.getElementById('form-login');
  const registerForm = document.getElementById('form-register');
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');

  if (tab === 'login') {
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
  } else {
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
    tabLogin.classList.remove('active');
    tabRegister.classList.add('active');
  }
}

function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  const isHidden = input.type === 'password';
  input.type = isHidden ? 'text' : 'password';
  btn.innerHTML = isHidden
    ? `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </svg>`
    : `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>`;
}

function setFieldError(id, message) {
  const el = document.getElementById(id);
  const input = el && el.previousElementSibling && el.previousElementSibling.querySelector('input');
  if (el) { el.textContent = message; el.classList.remove('hidden'); }
  if (input) input.classList.add('error');
}

function clearFieldErrors(prefix) {
  ['email', 'password', 'name', 'confirm'].forEach(f => {
    const err = document.getElementById(`${prefix}-${f}-err`);
    const inputWrapper = err && err.previousElementSibling;
    const input = inputWrapper && inputWrapper.querySelector('input');
    if (err) { err.textContent = ''; err.classList.add('hidden'); }
    if (input) input.classList.remove('error');
  });
}

async function handleLogin(e) {
  e.preventDefault();
  clearFieldErrors('login');

  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  let valid = true;
  if (!email) { setFieldError('login-email-err', 'Email wajib diisi.'); valid = false; }
  if (!password) { setFieldError('login-password-err', 'Password wajib diisi.'); valid = false; }
  if (!valid) return;

  const btn = document.getElementById('login-submit');
  btn.disabled = true;
  btn.textContent = 'Memverifikasi...';
  showSpinner();

  try {
    const { ok, data } = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (ok) {
      saveSession(data.token, data.user);
      showToast(`Selamat datang kembali, ${data.user.name}!`, 'success');
      setTimeout(() => navigate('home'), 400);
    } else {
      showToast(data.message || 'Login gagal.', 'error');
      setFieldError('login-email-err', data.message || 'Email atau password salah.');
    }
  } catch {
    showToast('Tidak dapat terhubung ke server. Pastikan backend berjalan.', 'error');
  } finally {
    hideSpinner();
    btn.disabled = false;
    btn.textContent = 'Masuk ke Akun';
  }
}

async function handleRegister(e) {
  e.preventDefault();
  clearFieldErrors('reg');

  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const confirm = document.getElementById('reg-confirm').value;

  let valid = true;
  if (!name) { setFieldError('reg-name-err', 'Nama wajib diisi.'); valid = false; }
  if (!email) { setFieldError('reg-email-err', 'Email wajib diisi.'); valid = false; }
  if (!password) { setFieldError('reg-password-err', 'Password wajib diisi.'); valid = false; }
  else if (password.length < 6) { setFieldError('reg-password-err', 'Password minimal 6 karakter.'); valid = false; }
  if (password !== confirm) { setFieldError('reg-confirm-err', 'Konfirmasi password tidak cocok.'); valid = false; }
  if (!valid) return;

  const btn = document.getElementById('register-submit');
  btn.disabled = true;
  btn.textContent = 'Mendaftarkan...';
  showSpinner();

  try {
    const { ok, data } = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });

    if (ok) {
      saveSession(data.token, data.user);
      showToast(`Selamat datang, ${data.user.name}! Akun berhasil dibuat.`, 'success');
      setTimeout(() => navigate('home'), 400);
    } else {
      showToast(data.message || 'Pendaftaran gagal.', 'error');
      if (data.message && data.message.toLowerCase().includes('email')) {
        setFieldError('reg-email-err', data.message);
      }
    }
  } catch {
    showToast('Tidak dapat terhubung ke server. Pastikan backend berjalan.', 'error');
  } finally {
    hideSpinner();
    btn.disabled = false;
    btn.textContent = 'Buat Akun';
  }
}

// ===== HOME PAGE =====

function renderHome() {
  const user = getUser();
  if (!user) { navigate('login'); return; }

  const initials = getInitials(user.name);
  const app = document.getElementById('app');

  app.innerHTML = `
    <!-- Navbar -->
    <nav class="navbar">
      <a class="navbar-brand" href="#">
        <span class="brand-name">Simple<span>App</span></span>
      </a>
      <div class="navbar-actions">
        <div class="user-badge">
          <div class="user-avatar">${initials}</div>
          <span class="user-name-nav">${user.name}</span>
        </div>
        <button class="btn btn-ghost btn-sm" onclick="handleLogout()">
          <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Keluar
        </button>
      </div>
    </nav>

    <div class="home-page">
      <!-- Hero -->
      <div class="home-hero">
        <div class="floating-shapes">
          <div class="shape shape-1"></div>
          <div class="shape shape-2"></div>
          <div class="shape shape-3"></div>
        </div>
        <div class="hero-inner">
          <div class="hero-text">
            <div class="hero-greeting">
              <div class="hero-greeting-dot"></div>
              <span id="time-greeting">Selamat Pagi</span>
            </div>
            <h1 class="hero-title">
              Halo, <span class="highlight">${user.name.split(' ')[0]}</span>!<br />
              Siap Produktif Hari Ini?
            </h1>
            <p class="hero-sub">
              Selamat datang kembali di Simple App Portal. Semua yang Anda butuhkan untuk mengelola bisnis ada di sini.
            </p>
            <div class="hero-actions">
              <button class="btn btn-white btn-lg">
                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                Mulai Sekarang
              </button>
              <button class="btn btn-white-outline btn-lg">Lihat Panduan</button>
            </div>
          </div>

          <!-- Clock widget -->
          <div class="clock-widget">
            <div class="clock-date" id="clock-date">—</div>
            <div class="clock-time">
              <span id="clock-hm">--:--</span><span class="clock-separator">:</span><span class="clock-seconds" id="clock-s">--</span>
            </div>
            <div class="clock-day" id="clock-day">—</div>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="home-content">

        <!-- Welcome card -->
        <div class="welcome-card">
          <div class="welcome-avatar">${initials}</div>
          <div class="welcome-text">
            <h2>Selamat datang, ${user.name}!</h2>
            <p>Anda berhasil masuk ke Simple App Portal. Akun Anda aktif dan semua layanan siap digunakan. Nikmati kemudahan mengelola bisnis Anda bersama kami.</p>
          </div>
          <div class="welcome-actions">
            <button class="btn btn-primary btn-sm">Kelola Profile</button>
            <button class="btn btn-outline btn-sm">Bantuan</button>
          </div>
        </div>
      </div>
    </div>

    <footer class="page-footer">
      © 2026 Simple App. Semua hak dilindungi. Solusi Laboratorium Terpercaya di Indonesia.
    </footer>
  `;

  startClock();
  updateGreeting();
}

function startClock() {
  function tick() {
    const now = new Date();
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    const hm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const s = String(now.getSeconds()).padStart(2, '0');
    const dateStr = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
    const dayStr = days[now.getDay()];

    const elHm = document.getElementById('clock-hm');
    const elS = document.getElementById('clock-s');
    const elDate = document.getElementById('clock-date');
    const elDay = document.getElementById('clock-day');

    if (elHm) elHm.textContent = hm;
    if (elS) elS.textContent = s;
    if (elDate) elDate.textContent = dateStr;
    if (elDay) elDay.textContent = dayStr;
  }

  tick();
  state.clockInterval = setInterval(tick, 1000);
}

function updateGreeting() {
  const hour = new Date().getHours();
  let greeting = 'Selamat Pagi';
  if (hour >= 12 && hour < 15) greeting = 'Selamat Siang';
  else if (hour >= 15 && hour < 18) greeting = 'Selamat Sore';
  else if (hour >= 18) greeting = 'Selamat Malam';

  const el = document.getElementById('time-greeting');
  if (el) el.textContent = greeting;
}

function handleLogout() {
  if (state.clockInterval) { clearInterval(state.clockInterval); state.clockInterval = null; }
  clearSession();
  showToast('Anda berhasil keluar.', 'info');
  setTimeout(() => navigate('login'), 300);
}

// ===== BOOT =====
document.addEventListener('DOMContentLoaded', async () => {
  const res = await fetch('/config');
  const cfg = await res.json();
  API_BASE = cfg.API_BASE;
  init();
});
