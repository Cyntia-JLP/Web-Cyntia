/* ═══════════════════════════════════════════════════════
   CYNTIA SIEM — auth.js
   Login · Registro · Validación · Modal
═══════════════════════════════════════════════════════ */

"use strict";

// ─── DEMO: Usuarios válidos (prototipo) ───────────────
// En producción: verificación en backend con hash + JWT
const DEMO_USERS = [
  { username: 'admin',           password: 'admin123',    name: 'Administrador' },
  { username: 'admin@cyntia.io', password: 'admin123',    name: 'Administrador' },
  { username: 'demo',            password: 'demo',        name: 'Usuario Demo'  },
  { username: 'demo@empresa.com', password: 'demo1234',   name: 'Demo User'     },
];

// ─── ELEMENTOS DOM ────────────────────────────────────
const overlay       = document.getElementById('authOverlay');
const modal         = document.getElementById('authModal');
const authClose     = document.getElementById('authClose');
const loginPanel    = document.getElementById('loginPanel');
const registerPanel = document.getElementById('registerPanel');
const goRegister    = document.getElementById('goRegister');
const goLogin       = document.getElementById('goLogin');

const loginForm     = document.getElementById('loginForm');
const loginError    = document.getElementById('loginError');

const registerForm  = document.getElementById('registerForm');
const registerError = document.getElementById('registerError');

const openLoginBtns = document.querySelectorAll('#openLogin, #mobileLogin');
const openRegBtn    = document.getElementById('openRegister');

// ─── ABRIR / CERRAR MODAL ─────────────────────────────
function openAuth(panel = 'login') {
  overlay?.classList.add('active');
  document.body.style.overflow = 'hidden';

  if (panel === 'register') {
    loginPanel?.classList.add('hidden');
    registerPanel?.classList.remove('hidden');
  } else {
    loginPanel?.classList.remove('hidden');
    registerPanel?.classList.add('hidden');
  }

  // Limpiar errores previos
  hideError(loginError);
  hideError(registerError);
  resetPassStrength();
}

function closeAuth() {
  overlay?.classList.remove('active');
  document.body.style.overflow = '';
  loginForm?.reset();
  registerForm?.reset();
  hideError(loginError);
  hideError(registerError);
  resetPassStrength();
}

// ─── RESETEAR INDICADOR DE CONTRASEÑA ─────────────────
function resetPassStrength() {
  const strengthDiv = document.getElementById('passStrength');
  const reqList     = document.getElementById('passRequirements');
  const fillBar     = document.getElementById('passStrengthFill');
  const textEl      = document.getElementById('passStrengthText');

  strengthDiv?.classList.remove('visible');
  reqList?.classList.remove('visible');
  if (fillBar) fillBar.className = 'pass-strength-fill';
  if (textEl) { textEl.textContent = ''; textEl.className = 'pass-strength-text'; }

  // Reset requirement icons
  document.querySelectorAll('#passRequirements li').forEach(li => {
    li.classList.remove('met');
    const icon = li.querySelector('.req-icon');
    if (icon) icon.textContent = '✗';
  });
}

// ─── MOSTRAR / OCULTAR ERRORES ────────────────────────
function showError(el) {
  if (!el) return;
  el.classList.add('show');
  // Quitar después de 5 segundos
  clearTimeout(el._hideTimer);
  el._hideTimer = setTimeout(() => hideError(el), 5000);
}

function hideError(el) {
  el?.classList.remove('show');
}

// ─── BOTONES DE APERTURA ──────────────────────────────
openLoginBtns.forEach(btn => {
  btn?.addEventListener('click', () => openAuth('login'));
});
openRegBtn?.addEventListener('click', () => openAuth('register'));

// ─── CERRAR ───────────────────────────────────────────
authClose?.addEventListener('click', closeAuth);

overlay?.addEventListener('click', e => {
  if (e.target === overlay) closeAuth();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && overlay?.classList.contains('active')) closeAuth();
});

// ─── CAMBIAR ENTRE LOGIN Y REGISTRO ───────────────────
goRegister?.addEventListener('click', e => {
  e.preventDefault();
  loginPanel?.classList.add('hidden');
  registerPanel?.classList.remove('hidden');
  hideError(loginError);
  loginForm?.reset();
});

goLogin?.addEventListener('click', e => {
  e.preventDefault();
  registerPanel?.classList.add('hidden');
  loginPanel?.classList.remove('hidden');
  hideError(registerError);
  registerForm?.reset();
});

// ─── VALIDACIÓN DE LOGIN ──────────────────────────────
loginForm?.addEventListener('submit', async e => {
  e.preventDefault();
  hideError(loginError);

  const username = document.getElementById('loginUser')?.value.trim();
  const password = document.getElementById('loginPass')?.value;

  if (!username || !password) {
    showError(loginError);
    return;
  }

  // Simular petición al servidor (delay visual)
  const submitBtn = loginForm.querySelector('button[type="submit"]');
  const originalText = submitBtn?.textContent;
  if (submitBtn) {
    submitBtn.textContent = 'Verificando...';
    submitBtn.disabled    = true;
  }

  await sleep(800);

  // Verificar credenciales
  const user = DEMO_USERS.find(u =>
    (u.username === username || u.username === username.toLowerCase()) &&
    u.password === password
  );

  if (user) {
    // ✅ Login correcto
    onLoginSuccess(user);
  } else {
    // ❌ Login fallido — mensaje exacto especificado
    loginError.textContent = 'Usuario y/o contraseña incorrectos';
    showError(loginError);
    document.getElementById('loginPass').value = '';
    document.getElementById('loginPass').focus();
  }

  if (submitBtn) {
    submitBtn.textContent = originalText;
    submitBtn.disabled    = false;
  }
});

// ─── VALIDACIÓN DE REGISTRO ───────────────────────────
registerForm?.addEventListener('submit', async e => {
  e.preventDefault();
  hideError(registerError);

  const name     = document.getElementById('regName')?.value.trim();
  const surname  = document.getElementById('regSurname')?.value.trim();
  const email    = document.getElementById('regEmail')?.value.trim();
  const password = document.getElementById('regPass')?.value;

  // Validaciones básicas
  if (!name || !surname || !email || !password) {
    registerError.textContent = 'Por favor, completa todos los campos';
    showError(registerError);
    return;
  }

  if (!isValidEmail(email)) {
    registerError.textContent = 'El formato del email no es válido';
    showError(registerError);
    return;
  }

  if (password.length < 8) {
    registerError.textContent = 'La contraseña debe tener al menos 8 caracteres';
    showError(registerError);
    return;
  }

  // Simular petición al servidor
  const submitBtn = registerForm.querySelector('button[type="submit"]');
  const originalText = submitBtn?.textContent;
  if (submitBtn) {
    submitBtn.textContent = 'Creando cuenta...';
    submitBtn.disabled    = true;
  }

  await sleep(900);

  // En el prototipo, el registro siempre tiene éxito
  onRegisterSuccess({ name, email });

  if (submitBtn) {
    submitBtn.textContent = originalText;
    submitBtn.disabled    = false;
  }
});

// ─── LOGIN EXITOSO ────────────────────────────────────
function onLoginSuccess(user) {
  closeAuth();
  showToast(`¡Bienvenido, ${user.name}! 🎉`, 'success');

  // Guardar sesión (solo prototipo)
  sessionStorage.setItem('cyntia_user', JSON.stringify({
    name:  user.name,
    login: new Date().toISOString()
  }));

  // Cambiar botones de nav (opcional)
  updateNavForLoggedUser(user.name);

  // Mostrar chatbot (ahora que hay sesión)
  if (typeof window._updateChatbotVisibility === 'function') {
    window._updateChatbotVisibility();
  }
}

// ─── REGISTRO EXITOSO ─────────────────────────────────
function onRegisterSuccess(user) {
  closeAuth();
  showToast(`¡Cuenta creada, ${user.name}! Revisa tu email para confirmar.`, 'success');
}

// ─── ACTUALIZAR NAV PARA USUARIO LOGUEADO ─────────────
function updateNavForLoggedUser(name) {
  const loginBtn = document.getElementById('openLogin');
  const regBtn   = document.getElementById('openRegister');

  if (loginBtn) {
    loginBtn.textContent = `👤 ${name}`;
    loginBtn.style.color = 'var(--blue)';
    loginBtn.removeEventListener('click', () => {});
    loginBtn.addEventListener('click', () => {
      sessionStorage.removeItem('cyntia_user');
      if (typeof window._updateChatbotVisibility === 'function') {
        window._updateChatbotVisibility();
      }
      window.location.reload();
    });
  }
  if (regBtn) {
    regBtn.textContent = 'Cerrar sesión';
    regBtn.addEventListener('click', () => {
      sessionStorage.removeItem('cyntia_user');
      if (typeof window._updateChatbotVisibility === 'function') {
        window._updateChatbotVisibility();
      }
      window.location.reload();
    });
  }
}

// ─── TOAST NOTIFICATIONS ──────────────────────────────
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  const colors = {
    success: { bg: 'rgba(115,191,105,0.15)', border: 'rgba(115,191,105,0.4)', text: '#73BF69' },
    error:   { bg: 'rgba(242,73,92,0.15)',   border: 'rgba(242,73,92,0.4)',   text: '#F2495C' },
    info:    { bg: 'rgba(126,200,216,0.15)', border: 'rgba(126,200,216,0.4)', text: 'var(--blue)' },
  };
  const c = colors[type] || colors.info;

  toast.style.cssText = `
    position: fixed;
    top: 88px;
    right: 24px;
    background: var(--surface);
    border: 1px solid ${c.border};
    border-left: 3px solid ${c.text};
    border-radius: 10px;
    padding: 14px 20px;
    font-family: var(--font);
    font-size: 0.875rem;
    color: ${c.text};
    z-index: 2000;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    max-width: 320px;
    animation: toast-in 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards;
  `;
  toast.textContent = message;

  // Inyectar keyframe si no existe
  if (!document.getElementById('toast-style')) {
    const style = document.createElement('style');
    style.id = 'toast-style';
    style.textContent = `
      @keyframes toast-in  { from { opacity:0; transform:translateX(24px); } to { opacity:1; transform:translateX(0); } }
      @keyframes toast-out { from { opacity:1; transform:translateX(0); }   to { opacity:0; transform:translateX(24px); } }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'toast-out 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ─── UTILIDADES ───────────────────────────────────────
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ─── PASSWORD STRENGTH CHECKER ────────────────────────
(function initPassStrength() {
  const passInput   = document.getElementById('regPass');
  const strengthDiv = document.getElementById('passStrength');
  const fillBar     = document.getElementById('passStrengthFill');
  const textEl      = document.getElementById('passStrengthText');
  const reqList     = document.getElementById('passRequirements');
  if (!passInput || !strengthDiv) return;

  const requirements = {
    length:  { el: document.getElementById('reqLength'),  test: p => p.length >= 8 },
    upper:   { el: document.getElementById('reqUpper'),   test: p => /[A-Z]/.test(p) },
    lower:   { el: document.getElementById('reqLower'),   test: p => /[a-z]/.test(p) },
    number:  { el: document.getElementById('reqNumber'),  test: p => /[0-9]/.test(p) },
    special: { el: document.getElementById('reqSpecial'), test: p => /[^A-Za-z0-9]/.test(p) },
  };

  passInput.addEventListener('input', () => {
    const val = passInput.value;

    if (val.length === 0) {
      strengthDiv.classList.remove('visible');
      reqList.classList.remove('visible');
      return;
    }

    strengthDiv.classList.add('visible');
    reqList.classList.add('visible');

    // Check each requirement
    let metCount = 0;
    for (const key in requirements) {
      const req = requirements[key];
      const passed = req.test(val);
      if (passed) metCount++;
      if (req.el) {
        req.el.classList.toggle('met', passed);
        const icon = req.el.querySelector('.req-icon');
        if (icon) icon.textContent = passed ? '✓' : '✗';
      }
    }

    // Determine strength level
    const levels = ['weak', 'fair', 'good', 'strong'];
    const labels = ['Débil', 'Regular', 'Buena', 'Fuerte'];
    let level;
    if (metCount <= 2)      level = 0;
    else if (metCount === 3) level = 1;
    else if (metCount === 4) level = 2;
    else                     level = 3;

    // Update bar
    fillBar.className = 'pass-strength-fill ' + levels[level];

    // Update text
    textEl.textContent = labels[level];
    textEl.className   = 'pass-strength-text ' + levels[level];
  });

  // Hide when switching panels
  document.getElementById('goLogin')?.addEventListener('click', () => {
    strengthDiv.classList.remove('visible');
    reqList.classList.remove('visible');
  });
})();

// ─── RESTAURAR SESIÓN ─────────────────────────────────
(function restoreSession() {
  const saved = sessionStorage.getItem('cyntia_user');
  if (!saved) return;
  try {
    const user = JSON.parse(saved);
    if (user?.name) updateNavForLoggedUser(user.name);
  } catch (_) {}
})();
