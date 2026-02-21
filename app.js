/* ============================================================
   AMPLIFYD Digital — Global Application Logic (optimiert)
   v2.0 — Performance, Security, Privacy
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* ── Nav Scroll ── */
  const nav    = document.querySelector('.nav');
  const toggle = document.getElementById('nav-toggle');
  const mobile = document.getElementById('nav-mobile');

  const onScroll = () => nav?.classList.toggle('scrolled', window.scrollY > 32);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── Mobile Menu ── */
  if (toggle && mobile && nav) {
    const openMenu = () => {
      mobile.classList.add('open');
      toggle.classList.add('active');
      nav.classList.add('menu-open');
      toggle.setAttribute('aria-expanded', 'true');
      document.documentElement.classList.add('lock-scroll');
    };
    const closeMenu = () => {
      mobile.classList.remove('open');
      toggle.classList.remove('active');
      nav.classList.remove('menu-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.documentElement.classList.remove('lock-scroll');
    };

    toggle.addEventListener('click', () =>
      mobile.classList.contains('open') ? closeMenu() : openMenu()
    );
    mobile.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

    // ESC key closes menu
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && mobile.classList.contains('open')) closeMenu();
    });
  }

  /* ── Smooth Anchor Scroll ── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (t) {
        e.preventDefault();
        t.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ── Intersection Observer: Scroll Reveal ── */
  const revealIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revealIO.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealIO.observe(el));

  /* ── Counter Animation ── */
  const countIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el       = e.target;
      const target   = parseFloat(el.dataset.count);
      const suffix   = el.dataset.suffix || '';
      const prefix   = el.dataset.prefix || '';
      const decimal  = String(target).includes('.');
      const dur      = 2000;
      const start    = performance.now();

      const step = now => {
        const p    = Math.min((now - start) / dur, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        const val  = ease * target;
        el.textContent = prefix + (decimal ? val.toFixed(1) : Math.round(val).toLocaleString('de-DE')) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      countIO.unobserve(el);
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('[data-count]').forEach(el => countIO.observe(el));

  /* ── Contact Form ── */
  const form = document.getElementById('contact-form');
  if (form) {
    const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

    const validate = inp => {
      const v = inp.value.trim();
      const isValid =
        (!inp.required || v) &&
        (inp.type !== 'email' || !v || isEmail(v));

      inp.classList.toggle('error', !isValid);
      inp.classList.toggle('valid', isValid && !!v);
      return isValid;
    };

    form.querySelectorAll('.form-input').forEach(inp => {
      inp.addEventListener('blur',  () => validate(inp));
      inp.addEventListener('input', () => { if (inp.classList.contains('error')) validate(inp); });
    });

    form.addEventListener('submit', async e => {
      e.preventDefault();

      let allValid = true;
      form.querySelectorAll('.form-input').forEach(i => { if (!validate(i)) allValid = false; });
      if (!allValid) return;

      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      btn.textContent  = 'Wird gesendet…';
      btn.disabled     = true;

      const payload = {
        name:    document.getElementById('c-name')?.value?.trim(),
        email:   document.getElementById('c-email')?.value?.trim(),
        company: document.getElementById('c-company')?.value?.trim(),
        service: document.getElementById('c-service')?.value,
        message: document.getElementById('c-msg')?.value?.trim(),
      };

      try {
        const res = await fetch('/.netlify/functions/contact', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(payload),
        });

        if (res.ok) {
          btn.textContent = '✓ Nachricht gesendet!';
          form.reset();
          form.querySelectorAll('.form-input').forEach(i => i.classList.remove('valid', 'error'));
        } else {
          btn.textContent = 'Fehler — bitte erneut versuchen';
        }
      } catch {
        btn.textContent = 'Netzwerkfehler — bitte per E-Mail schreiben';
      } finally {
        setTimeout(() => {
          btn.textContent = originalText;
          btn.disabled    = false;
        }, 5000);
      }
    });
  }

  /* ── Cookie Banner ── */
  const cookieBanner = document.getElementById('cookie-banner');
  const cookieKey    = 'amplifyd-cookies-v1';

  if (cookieBanner && !localStorage.getItem(cookieKey)) {
    setTimeout(() => cookieBanner.classList.add('show'), 1200);
  }

  const setCookie = val => {
    localStorage.setItem(cookieKey, val);
    cookieBanner?.classList.remove('show');
  };

  document.getElementById('cookie-accept')?.addEventListener('click', () => setCookie('accepted'));
  document.getElementById('cookie-decline')?.addEventListener('click', () => setCookie('declined'));

  /* ── Pricing Tabs ── */
  const pricingTabs   = document.querySelectorAll('[data-pricing-tab]');
  const pricingPanels = document.querySelectorAll('[data-pricing-panel]');

  pricingTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.pricingTab;

      pricingTabs.forEach(t => {
        t.classList.toggle('active', t === tab);
        t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
      });

      pricingPanels.forEach(p => {
        const show = p.dataset.pricingPanel === target;
        p.style.display = show ? 'grid' : 'none';
        p.classList.toggle('active', show);
      });
    });
  });

  /* ── Blog Category Filter ── */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const articles   = document.querySelectorAll('.article-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      articles.forEach(card => {
        const show = filter === 'all' || card.dataset.category === filter;
        if (show) {
          card.style.display = '';
          // Kleines rAF für smooth fade-in
          requestAnimationFrame(() => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(12px)';
            requestAnimationFrame(() => {
              card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            });
          });
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  /* ── Background Canvas Animation ── */
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;

  // Reduced motion: Animation komplett deaktivieren
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  let W, H, animId;

  const resize = () => {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  };
  resize();

  // Debounced resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  });

  const COLORS = ['#00f0ff', '#ff2d6b', '#7c3aed', '#ffffff'];

  /* Particles */
  class Particle {
    constructor(init = false) { this.reset(init); }
    reset(init = false) {
      this.x       = Math.random() * W;
      this.y       = init ? Math.random() * H : H + 10;
      this.size    = Math.random() * 1.8 + 0.4;
      this.speedY  = -(Math.random() * 0.5 + 0.15);
      this.speedX  = (Math.random() - 0.5) * 0.25;
      this.color   = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.opacity = Math.random() * 0.5 + 0.1;
      this.life    = 0;
      this.maxLife = Math.random() * 350 + 180;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.life++;
      if (this.life > this.maxLife || this.y < -10) this.reset();
    }
    draw() {
      const a = this.opacity * Math.sin((this.life / this.maxLife) * Math.PI);
      ctx.globalAlpha = a;
      ctx.fillStyle   = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /* Stream Lines */
  class StreamLine {
    constructor() { this.reset(true); }
    reset(init = false) {
      this.x       = Math.random() * W;
      this.y       = init ? Math.random() * H : -120;
      this.length  = Math.random() * 100 + 30;
      this.speed   = Math.random() * 2.5 + 0.8;
      this.opacity = Math.random() * 0.1 + 0.02;
      this.color   = Math.random() > 0.5 ? '#00f0ff' : '#ff2d6b';
    }
    update() {
      this.y += this.speed;
      if (this.y > H + this.length) this.reset();
    }
    draw() {
      const grad = ctx.createLinearGradient(this.x, this.y - this.length, this.x, this.y);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(1, this.color);
      ctx.globalAlpha  = this.opacity;
      ctx.strokeStyle  = grad;
      ctx.lineWidth    = 1;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y - this.length);
      ctx.lineTo(this.x, this.y);
      ctx.stroke();
    }
  }

  /* Network Nodes */
  class Node {
    constructor() {
      this.x     = Math.random() * W;
      this.y     = Math.random() * H;
      this.vx    = (Math.random() - 0.5) * 0.35;
      this.vy    = (Math.random() - 0.5) * 0.35;
      this.size  = Math.random() * 2 + 1;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    }
    update() {
      this.x += this.vx; this.y += this.vy;
      if (this.x < 0 || this.x > W) this.vx *= -1;
      if (this.y < 0 || this.y > H) this.vy *= -1;
    }
    draw() {
      // KEIN shadowBlur hier — zu teuer in Schleife
      ctx.globalAlpha = 0.45;
      ctx.fillStyle   = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /* Node Connections — optimiert: quadratischer Abstand, kein sqrt wenn unnötig */
  const CONNECT_DIST    = 160;
  const CONNECT_DIST_SQ = CONNECT_DIST * CONNECT_DIST;

  function drawConnections() {
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth   = 0.5;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx   = nodes[i].x - nodes[j].x;
        const dy   = nodes[i].y - nodes[j].y;
        const dSq  = dx * dx + dy * dy;
        if (dSq < CONNECT_DIST_SQ) {
          ctx.globalAlpha = (1 - Math.sqrt(dSq) / CONNECT_DIST) * 0.07;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }
  }

  // Weniger Elemente auf mobilen Geräten
  const isMobile    = window.innerWidth < 768;
  const particles   = Array.from({ length: isMobile ? 60  : 120 }, (_, i) => new Particle(i < (isMobile ? 60  : 120)));
  const streams     = Array.from({ length: isMobile ? 20  : 40  }, () => new StreamLine());
  const nodes       = Array.from({ length: isMobile ? 25  : 50  }, () => new Node());

  let time = 0;

  const animate = () => {
    animId = requestAnimationFrame(animate);
    ctx.clearRect(0, 0, W, H);
    time++;

    // shadowBlur NUR einmal setzen für sparsame glow-Effekte
    ctx.shadowBlur  = 0;
    ctx.shadowColor = 'transparent';

    streams.forEach(s => { s.update(); s.draw(); });
    drawConnections();
    nodes.forEach(n => { n.update(); n.draw(); });

    // Particles ohne shadowBlur
    particles.forEach(p => { p.update(); p.draw(); });

    // Pulsierende Ringe
    const cx = W / 2, cy = H / 2;
    ctx.shadowBlur = 0;
    for (let r = 0; r < 4; r++) {
      const phase  = (time * 0.007 + r * 0.25) % 1;
      const radius = phase * Math.max(W, H) * 0.75;
      ctx.globalAlpha = (1 - phase) * 0.045;
      ctx.strokeStyle = r % 2 === 0 ? '#00f0ff' : '#ff2d6b';
      ctx.lineWidth   = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  };

  // Animation pausieren wenn Tab unsichtbar (Performance)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animId);
    } else {
      animate();
    }
  });

  animate();
});