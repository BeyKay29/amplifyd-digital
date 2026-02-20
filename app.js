/* ============================================================
   AMPLIFYD Digital — Global Application Logic
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    /* --- Nav Scroll --- */
    const nav = document.querySelector('.nav');
    const onScroll = () => {
        nav?.classList.toggle('scrolled', window.scrollY > 32);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const toggle = document.getElementById('nav-toggle');
    const mobile = document.getElementById('nav-mobile');
    const root = document.documentElement;
    if (toggle && mobile && nav) {
        toggle.addEventListener('click', () => {
            const open = mobile.classList.toggle('open');
            toggle.classList.toggle('active', open);
            nav.classList.toggle('menu-open', open);
            if (open) {
                root.classList.add('lock-scroll');
                document.body.classList.add('lock-scroll');
            } else {
                root.classList.remove('lock-scroll');
                document.body.classList.remove('lock-scroll');
            }
        });
        mobile.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
            mobile.classList.remove('open');
            toggle.classList.remove('active');
            nav.classList.remove('menu-open');
            root.classList.remove('lock-scroll');
            document.body.classList.remove('lock-scroll');
        }));
    }

    /* --- Smooth Anchor Scroll --- */
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const t = document.querySelector(a.getAttribute('href'));
            if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
        });
    });

    /* --- Intersection Observer: Reveal --- */
    const io = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));

    /* --- Counter Animation --- */
    const counters = document.querySelectorAll('[data-count]');
    const countIO = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (!e.isIntersecting) return;
            const el = e.target;
            const target = parseFloat(el.dataset.count);
            const suffix = el.dataset.suffix || '';
            const prefix = el.dataset.prefix || '';
            const isDecimal = String(target).includes('.');
            const dur = 2000;
            const start = performance.now();
            const step = now => {
                const p = Math.min((now - start) / dur, 1);
                const ease = 1 - Math.pow(1 - p, 3);
                const val = ease * target;
                el.textContent = prefix + (isDecimal ? val.toFixed(1) : Math.round(val).toLocaleString('de-DE')) + suffix;
                if (p < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
            countIO.unobserve(el);
        });
    }, { threshold: 0.3 });
    counters.forEach(el => countIO.observe(el));

    /* --- Form Validation --- */
    const form = document.getElementById('contact-form');
    if (form) {
        const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        const validate = inp => {
            const v = inp.value.trim();
            if (inp.required && !v) { inp.classList.add('error'); inp.classList.remove('valid'); return false; }
            if (inp.type === 'email' && v && !isEmail(v)) { inp.classList.add('error'); inp.classList.remove('valid'); return false; }
            if (v) { inp.classList.remove('error'); inp.classList.add('valid'); }
            return true;
        };
        form.querySelectorAll('.form-input').forEach(inp => {
            inp.addEventListener('blur', () => validate(inp));
            inp.addEventListener('input', () => { if (inp.classList.contains('error')) validate(inp); });
        });
        form.addEventListener('submit', e => {
            e.preventDefault();
            let ok = true;
            form.querySelectorAll('.form-input').forEach(i => { if (!validate(i)) ok = false; });
            if (ok) {
                const btn = form.querySelector('.btn');
                btn.textContent = '✓ Nachricht gesendet!';
                btn.style.pointerEvents = 'none';
                setTimeout(() => { btn.textContent = 'Nachricht senden'; btn.style.pointerEvents = ''; }, 3000);
                form.reset();
                form.querySelectorAll('.form-input').forEach(i => i.classList.remove('valid'));
            }
        });
    }



    /* --- Cookie Banner --- */
    const cookie = document.getElementById('cookie-banner');
    if (cookie && !localStorage.getItem('amplifyd-cookies')) {
        setTimeout(() => cookie.classList.add('show'), 1200);
    }
    document.getElementById('cookie-accept')?.addEventListener('click', () => {
        localStorage.setItem('amplifyd-cookies', 'accepted');
        cookie.classList.remove('show');
    });
    document.getElementById('cookie-decline')?.addEventListener('click', () => {
        localStorage.setItem('amplifyd-cookies', 'declined');
        cookie.classList.remove('show');
    });

    /* --- Pricing Toggle (if exists) --- */
    const tabs = document.querySelectorAll('[data-pricing-tab]');
    const panels = document.querySelectorAll('[data-pricing-panel]');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.pricingTab;
            tabs.forEach(t => t.classList.toggle('active', t === tab));
            panels.forEach(p => {
                p.style.display = p.dataset.pricingPanel === target ? 'grid' : 'none';
            });
        });
    });
});
