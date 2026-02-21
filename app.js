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

    /* --- Background Animation --- */
    const initBg = () => {
        const canvas = document.getElementById('bgCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        let W, H;
        const resize = () => {
            W = canvas.width = window.innerWidth;
            H = canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        const COLORS = ['#00f0ff', '#ff2d6b', '#7c3aed', '#ffffff'];

        class Particle {
            constructor(init = false) { this.reset(init); }
            reset(init = false) {
                this.x = Math.random() * W;
                this.y = init ? Math.random() * H : H + 10;
                this.size = Math.random() * 1.8 + 0.4;
                this.speedY = -(Math.random() * 0.5 + 0.15);
                this.speedX = (Math.random() - 0.5) * 0.25;
                this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
                this.opacity = Math.random() * 0.5 + 0.1;
                this.life = 0;
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
                ctx.save();
                ctx.globalAlpha = a;
                ctx.fillStyle = this.color;
                ctx.shadowBlur = 10;
                ctx.shadowColor = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        class StreamLine {
            constructor() { this.reset(true); }
            reset(init = false) {
                this.x = Math.random() * W;
                this.y = init ? Math.random() * H : -120;
                this.length = Math.random() * 100 + 30;
                this.speed = Math.random() * 2.5 + 0.8;
                this.opacity = Math.random() * 0.12 + 0.02;
                this.color = Math.random() > 0.5 ? '#00f0ff' : '#ff2d6b';
            }
            update() {
                this.y += this.speed;
                if (this.y > H + this.length) this.reset();
            }
            draw() {
                const grad = ctx.createLinearGradient(this.x, this.y - this.length, this.x, this.y);
                grad.addColorStop(0, 'transparent');
                grad.addColorStop(1, this.color);
                ctx.save();
                ctx.globalAlpha = this.opacity;
                ctx.strokeStyle = grad;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(this.x, this.y - this.length);
                ctx.lineTo(this.x, this.y);
                ctx.stroke();
                ctx.restore();
            }
        }

        class Node {
            constructor() {
                this.x = Math.random() * W;
                this.y = Math.random() * H;
                this.vx = (Math.random() - 0.5) * 0.35;
                this.vy = (Math.random() - 0.5) * 0.35;
                this.size = Math.random() * 2 + 1;
                this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                if (this.x < 0 || this.x > W) this.vx *= -1;
                if (this.y < 0 || this.y > H) this.vy *= -1;
            }
            draw() {
                ctx.save();
                ctx.globalAlpha = 0.45;
                ctx.fillStyle = this.color;
                ctx.shadowBlur = 12;
                ctx.shadowColor = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        const nodes = Array.from({ length: 55 }, () => new Node());

        function drawConnections() {
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dx = nodes[i].x - nodes[j].x;
                    const dy = nodes[i].y - nodes[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 160) {
                        ctx.save();
                        ctx.globalAlpha = (1 - dist / 160) * 0.07;
                        ctx.strokeStyle = '#00f0ff';
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(nodes[i].x, nodes[i].y);
                        ctx.lineTo(nodes[j].x, nodes[j].y);
                        ctx.stroke();
                        ctx.restore();
                    }
                }
            }
        }

        const particles = Array.from({ length: 130 }, () => new Particle(true));
        const streams = Array.from({ length: 45 }, () => new StreamLine());

        let time = 0;
        const animate = () => {
            ctx.clearRect(0, 0, W, H);
            time++;

            streams.forEach(s => { s.update(); s.draw(); });
            drawConnections();
            nodes.forEach(n => { n.update(); n.draw(); });
            particles.forEach(p => { p.update(); p.draw(); });

            const cx = W / 2, cy = H / 2;
            for (let r = 0; r < 4; r++) {
                const phase = (time * 0.007 + r * 0.25) % 1;
                const radius = phase * Math.max(W, H) * 0.75;
                const alpha = (1 - phase) * 0.045;
                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.strokeStyle = r % 2 === 0 ? '#00f0ff' : '#ff2d6b';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(cx, cy, radius, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            }

            requestAnimationFrame(animate);
        };
        animate();
    };
    initBg();

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
