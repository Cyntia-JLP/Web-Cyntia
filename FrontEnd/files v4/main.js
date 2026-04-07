/* ═══════════════════════════════════════════════════════
   CYNTIA SIEM — main.js
   Partículas · Animaciones · Tema · Typewriter · Grafana Chart
═══════════════════════════════════════════════════════ */

"use strict";

// ─── TEMA DARK/LIGHT ───────────────────────────────────
(function initTheme() {
  const root   = document.documentElement;
  const toggle = document.getElementById('themeToggle');

  // Detectar preferencia del sistema
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const saved = localStorage.getItem('cyntia-theme');
  const initial = saved || (systemDark ? 'dark' : 'light');
  root.setAttribute('data-theme', initial);

  toggle?.addEventListener('click', () => {
    const current = root.getAttribute('data-theme');
    const next    = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('cyntia-theme', next);
    // Redibujar gráfico de Grafana cuando cambia el tema
    if (window._grafanaChartInit) window._grafanaChartInit();
  });

  // Escuchar cambios del sistema
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('cyntia-theme')) {
      root.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    }
  });
})();


// ─── PARTÍCULAS ───────────────────────────────────────
(function initParticles() {
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles = [];
  const COUNT = 70;
  const MAX_DIST = 120;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  function isDark() {
    return document.documentElement.getAttribute('data-theme') !== 'light';
  }

  for (let i = 0; i < COUNT; i++) {
    particles.push({
      x: Math.random() * 1000,
      y: Math.random() * 800,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.5 + 0.5
    });
  }

  // Mouse influence
  let mx = -999, my = -999;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const dark = isDark();
    const dotColor  = dark ? 'rgba(126,200,216,' : 'rgba(140,26,60,';
    const lineColor = dark ? 'rgba(126,200,216,' : 'rgba(140,26,60,';

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;

      // Mouse repulsion (gentle)
      const dx = p.x - mx;
      const dy = p.y - my;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 100) {
        p.x += dx / dist * 0.8;
        p.y += dy / dist * 0.8;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = dotColor + '0.6)';
      ctx.fill();
    });

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx*dx + dy*dy);
        if (d < MAX_DIST) {
          const alpha = (1 - d / MAX_DIST) * 0.3;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = lineColor + alpha + ')';
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
})();


// ─── CURSOR PERSONALIZADO ─────────────────────────────
(function initCursor() {
  const cursor   = document.getElementById('cursor');
  const follower = document.getElementById('cursorFollower');
  if (!cursor) return;

  let fx = 0, fy = 0;
  let cx = 0, cy = 0;
  let raf;

  document.addEventListener('mousemove', e => {
    cx = e.clientX;
    cy = e.clientY;
    cursor.style.left = cx + 'px';
    cursor.style.top  = cy + 'px';
  });

  function animateFollower() {
    fx += (cx - fx) * 0.14;
    fy += (cy - fy) * 0.14;
    follower.style.left = fx + 'px';
    follower.style.top  = fy + 'px';
    raf = requestAnimationFrame(animateFollower);
  }
  animateFollower();

  document.querySelectorAll('a, button, .btn, .feature-card, .pricing-card, .team-card, .step').forEach(el => {
    el.addEventListener('mouseenter', () => {
      follower.style.width  = '52px';
      follower.style.height = '52px';
      follower.style.opacity = '0.8';
      cursor.style.transform = 'translate(-50%,-50%) scale(0)';
    });
    el.addEventListener('mouseleave', () => {
      follower.style.width  = '32px';
      follower.style.height = '32px';
      follower.style.opacity = '0.5';
      cursor.style.transform = 'translate(-50%,-50%) scale(1)';
    });
  });
})();


// ─── SCROLL PROGRESS + NAVBAR ─────────────────────────
(function initScroll() {
  const bar    = document.getElementById('scrollProgress');
  const navbar = document.getElementById('navbar');

  window.addEventListener('scroll', () => {
    const max = document.body.scrollHeight - window.innerHeight;
    const pct = (window.scrollY / max) * 100;
    bar.style.width = pct + '%';

    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });
})();


// ─── MOBILE MENU ──────────────────────────────────────
(function initMobileMenu() {
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (!hamburger) return;

  hamburger.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', open);
  });

  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => mobileMenu.classList.remove('open'));
  });

  document.getElementById('mobileLogin')?.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    document.getElementById('authOverlay').classList.add('active');
  });
})();


// ─── REVEAL ON SCROLL ─────────────────────────────────
(function initReveal() {
  const items = document.querySelectorAll('[data-reveal]');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => entry.target.classList.add('revealed'), +delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  items.forEach(el => observer.observe(el));
})();


// ─── CONTADORES ANIMADOS ──────────────────────────────
(function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = +el.dataset.count;
      const suffix = el.dataset.suffix || '';
      const dur    = 1800;
      const start  = performance.now();

      function tick(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / dur, 1);
        // Ease out cubic
        const ease = 1 - Math.pow(1 - progress, 3);
        const val  = Math.floor(ease * target);
        el.textContent = val.toLocaleString('es') + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
})();


// ─── TYPEWRITER HERO ──────────────────────────────────
(function initTypewriter() {
  const el = document.getElementById('typewriter');
  if (!el) return;

  const phrases = ['inteligente', 'automatizada', 'proactiva', 'accesible'];
  let phraseIdx = 0, charIdx = 0, deleting = false;

  function type() {
    const phrase = phrases[phraseIdx];

    if (!deleting) {
      el.textContent = phrase.slice(0, ++charIdx);
      if (charIdx === phrase.length) {
        deleting = true;
        setTimeout(type, 2200);
        return;
      }
    } else {
      el.textContent = phrase.slice(0, --charIdx);
      if (charIdx === 0) {
        deleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        setTimeout(type, 400);
        return;
      }
    }
    setTimeout(type, deleting ? 55 : 90);
  }
  setTimeout(type, 800);
})();


// ─── MAGNETIC BUTTONS ─────────────────────────────────
(function initMagnetic() {
  document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width  / 2;
      const y = e.clientY - rect.top  - rect.height / 2;
      btn.style.transform = `translate(${x * 0.28}px, ${y * 0.28}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
})();


// ─── HOW IT WORKS STEPS ───────────────────────────────
(function initSteps() {
  const stepData = [
    {
      icon: '🖥️',
      title: 'Agentes Wazuh',
      desc: 'Agentes ligeros instalados en Windows, Linux y macOS que envían logs cifrados (TLS) al Wazuh Manager en la VLAN del SOC. Consumo inferior al 1% de CPU.',
      code: `<span class="code-comment"># Instalación del agente Wazuh</span><br>curl -sO https://packages.wazuh.com/4.x/apt/install.sh<br>sudo bash install.sh -a 192.168.20.10`
    },
    {
      icon: '📥',
      title: 'Wazuh + OpenSearch',
      desc: 'Wazuh Manager centraliza los eventos. OpenSearch los indexa para búsqueda instantánea. Grafana + Prometheus monitorizan CPU, RAM y red de toda la infraestructura.',
      code: `<span class="code-comment"># docker-compose.yml (lxc-soc-core)</span><br>services:<br>&nbsp;&nbsp;wazuh-manager:  # 1514/UDP, 55000/TCP<br>&nbsp;&nbsp;wazuh-indexer:  # OpenSearch 9200<br>&nbsp;&nbsp;wazuh-dashboard: # soc.cyntia.local`
    },
    {
      icon: '🧠',
      title: 'Detección Multicapa',
      desc: 'Suricata IDS analiza tráfico de red en vmbr0. Wazuh correlaciona eventos con reglas MITRE ATT&CK. OpenCanary despliega honeypots (SSH, HTTP, SMB, FTP, MySQL) como señuelos.',
      code: `<span class="code-comment"># Suricata + OpenCanary + Wazuh</span><br>suricata: IDS pasivo en vmbr0<br>opencanary: SSH:22 HTTP:8080 SMB:445<br>wazuh: correlación > 200 reglas MITRE`
    },
    {
      icon: '🔔',
      title: 'Respuesta Automática',
      desc: 'Playbooks de Wazuh Active Response: block_ip.py bloquea en nftables, isolate_host.py aísla vía API Proxmox, disable_ad_user.ps1 desactiva cuentas AD y create_ticket.py abre tickets.',
      code: `<span class="code-comment"># playbooks automáticos</span><br>action: block_ip(src=192.168.1.45)<br>action: isolate_host(proxmox_api)<br>action: create_ticket(portal_cyntia)`
    }
  ];

  const steps   = document.querySelectorAll('.step[data-step]');
  const svTitle = document.getElementById('svTitle');
  const svDesc  = document.getElementById('svDesc');
  const svIcon  = document.getElementById('svIcon');
  const svCode  = document.getElementById('svCode');
  const visual  = document.getElementById('stepVisual');

  function setStep(idx) {
    steps.forEach(s => s.classList.remove('active'));
    steps[idx]?.classList.add('active');

    const d = stepData[idx];
    if (!d || !svTitle || !visual) return;

    // Fade out
    visual.style.opacity = '0';
    visual.style.transform = 'translateY(10px)';

    setTimeout(() => {
      // Update content
      if (svIcon)  svIcon.textContent  = d.icon;
      if (svTitle) svTitle.textContent = d.title;
      if (svDesc)  svDesc.textContent  = d.desc;
      if (svCode)  svCode.innerHTML    = d.code;

      // Fade in
      visual.style.opacity   = '1';
      visual.style.transform = 'translateY(0)';
    }, 250);
  }

  if (visual) {
    visual.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
  }

  // Click handlers
  steps.forEach(step => {
    step.addEventListener('click', () => setStep(+step.dataset.step));
  });

  // Set initial step explicitly
  setStep(0);
})();


// ─── GRAFANA CHART (Canvas) ───────────────────────────
(function initGrafanaChart() {
  const canvas = document.getElementById('grafanaChart');
  if (!canvas) return;

  function isDark() {
    return document.documentElement.getAttribute('data-theme') !== 'light';
  }

  // Datos: últimas 12 horas (eventos por hora)
  const labels = ['02h','03h','04h','05h','06h','07h','08h','09h','10h','11h','12h','13h','14h'];
  const dataEvents = [12, 8, 6, 9, 22, 45, 78, 95, 88, 72, 68, 84, 91];
  const dataAlerts = [0,  1,  0,  1,  3,  5,  8,  12, 9,  7,  6,  10, 14];

  function drawChart() {
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    canvas.width  = W;
    canvas.height = H;

    const ctx  = canvas.getContext('2d');
    const dark = isDark();
    const PAD  = { top: 8, right: 12, bottom: 22, left: 30 };
    const cW = W - PAD.left - PAD.right;
    const cH = H - PAD.top  - PAD.bottom;

    ctx.clearRect(0, 0, W, H);

    const maxVal = Math.max(...dataEvents);
    const pts    = (data) => data.map((v, i) => ({
      x: PAD.left + (i / (data.length - 1)) * cW,
      y: PAD.top  + cH - (v / maxVal) * cH
    }));

    // Grid lines
    const gridColor = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
    const textColor = dark ? 'rgba(150,155,170,0.8)' : 'rgba(80,90,110,0.8)';
    for (let i = 0; i <= 4; i++) {
      const y = PAD.top + (cH / 4) * i;
      ctx.strokeStyle = gridColor;
      ctx.lineWidth   = 1;
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.moveTo(PAD.left, y);
      ctx.lineTo(PAD.left + cW, y);
      ctx.stroke();

      const val = Math.round(maxVal - (maxVal / 4) * i);
      ctx.fillStyle  = textColor;
      ctx.font       = '9px JetBrains Mono, monospace';
      ctx.textAlign  = 'right';
      ctx.fillText(val, PAD.left - 4, y + 3);
    }
    ctx.setLineDash([]);

    // X labels
    ctx.fillStyle  = textColor;
    ctx.font       = '8px JetBrains Mono, monospace';
    ctx.textAlign  = 'center';
    [0, 3, 6, 9, 12].forEach(i => {
      const x = PAD.left + (i / (dataEvents.length - 1)) * cW;
      ctx.fillText(labels[i], x, H - 4);
    });

    // Area fill — Events (blue)
    const evPts = pts(dataEvents);
    const evGrad = ctx.createLinearGradient(0, PAD.top, 0, PAD.top + cH);
    evGrad.addColorStop(0,   dark ? 'rgba(87,148,242,0.5)' : 'rgba(87,148,242,0.35)');
    evGrad.addColorStop(0.6, dark ? 'rgba(87,148,242,0.1)' : 'rgba(87,148,242,0.05)');
    evGrad.addColorStop(1,   'rgba(87,148,242,0)');

    ctx.beginPath();
    ctx.moveTo(evPts[0].x, PAD.top + cH);
    evPts.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(evPts[evPts.length-1].x, PAD.top + cH);
    ctx.closePath();
    ctx.fillStyle = evGrad;
    ctx.fill();

    // Line — Events
    ctx.beginPath();
    evPts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.strokeStyle = '#5794F2';
    ctx.lineWidth   = 1.8;
    ctx.stroke();

    // Area fill — Alerts (red)
    const alPts  = pts(dataAlerts);
    const alGrad = ctx.createLinearGradient(0, PAD.top, 0, PAD.top + cH);
    alGrad.addColorStop(0,   dark ? 'rgba(242,73,92,0.4)' : 'rgba(242,73,92,0.25)');
    alGrad.addColorStop(1,   'rgba(242,73,92,0)');

    ctx.beginPath();
    ctx.moveTo(alPts[0].x, PAD.top + cH);
    alPts.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(alPts[alPts.length-1].x, PAD.top + cH);
    ctx.closePath();
    ctx.fillStyle = alGrad;
    ctx.fill();

    ctx.beginPath();
    alPts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.strokeStyle = '#F2495C';
    ctx.lineWidth   = 1.4;
    ctx.stroke();

    // Dots at last point
    [[evPts, '#5794F2'], [alPts, '#F2495C']].forEach(([pts, col]) => {
      const last = pts[pts.length - 1];
      ctx.beginPath();
      ctx.arc(last.x, last.y, 3, 0, Math.PI * 2);
      ctx.fillStyle   = col;
      ctx.strokeStyle = dark ? '#181B1F' : '#fff';
      ctx.lineWidth   = 1.5;
      ctx.fill();
      ctx.stroke();
    });
  }

  // Expose for theme toggle redraw
  window._grafanaChartInit = drawChart;

  // Draw after DOM paint
  requestAnimationFrame(drawChart);
  window.addEventListener('resize', drawChart);
})();


// ─── TOGGLE CONTRASEÑA ────────────────────────────────
document.querySelectorAll('.toggle-pass').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = document.getElementById(btn.dataset.target);
    if (!input) return;
    input.type = input.type === 'password' ? 'text' : 'password';
    btn.textContent = input.type === 'password' ? '👁' : '🙈';
  });
});


// ─── SMOOTH SCROLL ────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});


// ─── FAQ ACCORDION ─────────────────────────────────
(function initFAQ() {
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');

      // Close all
      document.querySelectorAll('.faq-item.open').forEach(openItem => {
        openItem.classList.remove('open');
        openItem.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
      });

      // Toggle current
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
})();


// ─── EXTRAS MODULES ACCORDION ──────────────────────────
(function initExtras() {
  document.querySelectorAll('.extra-collapsible .extra-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.extra-collapsible');
      const isOpen = card.classList.contains('open');

      // Close all others
      document.querySelectorAll('.extra-collapsible.open').forEach(openCard => {
        openCard.classList.remove('open');
      });

      // Toggle clicked (open if was closed)
      if (!isOpen) {
        card.classList.add('open');
      }
    });
  });
})();


// ─── SCROLL TO TOP BUTTON ─────────────────────────────
(function initScrollTop() {
  const btn = document.getElementById('scrollTopBtn');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


// ─── COOKIE CONSENT ───────────────────────────────────
(function initCookieConsent() {
  const banner        = document.getElementById('cookieBanner');
  const acceptBtn     = document.getElementById('cookieAccept');
  const rejectBtn     = document.getElementById('cookieReject');
  const configBtn     = document.getElementById('cookieConfig');
  const configOverlay = document.getElementById('cookieConfigOverlay');
  const configClose   = document.getElementById('cookieConfigClose');
  const saveConfigBtn = document.getElementById('cookieSaveConfig');
  if (!banner) return;

  // Check if consent already given
  const consent = localStorage.getItem('cyntia_cookies');
  if (consent) return; // Already configured

  // Show banner after a small delay
  setTimeout(() => banner.classList.add('visible'), 1200);

  function hideBanner() {
    banner.classList.remove('visible');
  }

  acceptBtn?.addEventListener('click', () => {
    localStorage.setItem('cyntia_cookies', JSON.stringify({
      essential: true, analytics: true, functional: true,
      date: new Date().toISOString()
    }));
    hideBanner();
    showToast('Preferencias de cookies guardadas ✓', 'success');
  });

  rejectBtn?.addEventListener('click', () => {
    localStorage.setItem('cyntia_cookies', JSON.stringify({
      essential: true, analytics: false, functional: false,
      date: new Date().toISOString()
    }));
    hideBanner();
    showToast('Solo cookies esenciales activadas', 'info');
  });

  configBtn?.addEventListener('click', () => {
    configOverlay?.classList.remove('hidden');
    setTimeout(() => configOverlay?.classList.add('visible'), 10);
  });

  configClose?.addEventListener('click', () => {
    configOverlay?.classList.remove('visible');
    setTimeout(() => configOverlay?.classList.add('hidden'), 300);
  });

  configOverlay?.addEventListener('click', e => {
    if (e.target === configOverlay) {
      configOverlay.classList.remove('visible');
      setTimeout(() => configOverlay.classList.add('hidden'), 300);
    }
  });

  saveConfigBtn?.addEventListener('click', () => {
    const analytics  = document.getElementById('cookieAnalytics')?.checked || false;
    const functional = document.getElementById('cookieFunctional')?.checked || false;
    localStorage.setItem('cyntia_cookies', JSON.stringify({
      essential: true, analytics, functional,
      date: new Date().toISOString()
    }));
    configOverlay?.classList.remove('visible');
    setTimeout(() => configOverlay?.classList.add('hidden'), 300);
    hideBanner();
    showToast('Preferencias de cookies guardadas ✓', 'success');
  });
})();


// ─── CONTACT FORM ─────────────────────────────────────
(function initContactForm() {
  const form       = document.getElementById('contactForm');
  const successMsg = document.getElementById('contactSuccess');
  const errorMsg   = document.getElementById('contactError');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    successMsg?.classList.add('hidden');
    errorMsg?.classList.add('hidden');

    const name    = document.getElementById('contactName')?.value.trim();
    const surname = document.getElementById('contactSurname')?.value.trim();
    const email   = document.getElementById('contactEmail')?.value.trim();
    const message = document.getElementById('contactMessage')?.value.trim();

    if (!name || !surname || !email || !message) {
      errorMsg.textContent = 'Por favor, completa todos los campos';
      errorMsg.classList.remove('hidden');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errorMsg.textContent = 'El formato del email no es válido';
      errorMsg.classList.remove('hidden');
      return;
    }

    const btn = document.getElementById('contactSubmitBtn');
    const originalText = btn?.innerHTML;
    if (btn) {
      btn.innerHTML = 'Enviando...';
      btn.disabled = true;
    }

    // Simular envío al servidor (en producción: fetch a backend/PHP)
    await new Promise(r => setTimeout(r, 1000));

    // En prototipo, siempre éxito
    // En producción: enviar a backend que procese el email
    console.log('[Cyntia Contact]', { name, surname, email, message });

    successMsg?.classList.remove('hidden');
    form.reset();

    if (btn) {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }

    // Ocultar mensaje de éxito después de 6 segundos
    setTimeout(() => successMsg?.classList.add('hidden'), 6000);
  });
})();


// ─── FAQ QUESTION FORM ────────────────────────────────
(function initFaqForm() {
  const form       = document.getElementById('faqQuestionForm');
  const successMsg = document.getElementById('faqFormSuccess');
  const errorMsg   = document.getElementById('faqFormError');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    successMsg?.classList.add('hidden');
    errorMsg?.classList.add('hidden');

    const name     = document.getElementById('faqName')?.value.trim();
    const email    = document.getElementById('faqEmail')?.value.trim();
    const question = document.getElementById('faqQuestion')?.value.trim();

    if (!name || !email || !question) {
      errorMsg.textContent = 'Por favor, completa todos los campos';
      errorMsg.classList.remove('hidden');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errorMsg.textContent = 'El formato del email no es válido';
      errorMsg.classList.remove('hidden');
      return;
    }

    const btn = document.getElementById('faqSubmitBtn');
    const originalHTML = btn?.innerHTML;
    if (btn) {
      btn.innerHTML = 'Enviando...';
      btn.disabled = true;
    }

    // En producción: POST a /api/faq-question.php
    await new Promise(r => setTimeout(r, 1000));
    console.log('[Cyntia FAQ]', { name, email, question });

    successMsg?.classList.remove('hidden');
    form.reset();

    if (btn) {
      btn.innerHTML = originalHTML;
      btn.disabled = false;
    }

    setTimeout(() => successMsg?.classList.add('hidden'), 8000);
  });
})();


// ─── DEMO REQUIRES LOGIN ──────────────────────────────
(function initDemoAuth() {
  function isLoggedIn() {
    return !!sessionStorage.getItem('cyntia_user');
  }

  document.querySelectorAll('.demo-request-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      if (!isLoggedIn()) {
        e.preventDefault();
        // Show login modal with message
        if (typeof showToast === 'function') {
          showToast('Para solicitar una demo, primero inicia sesión o regístrate.', 'info');
        }
        // Open the auth modal
        if (typeof openAuth === 'function') {
          setTimeout(() => openAuth('login'), 600);
        }
        return false;
      }
      // If logged in, scroll to contact form
      const contactSection = document.getElementById('contacto');
      if (contactSection) {
        e.preventDefault();
        const top = contactSection.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
})();
