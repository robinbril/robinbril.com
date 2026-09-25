// ==========================================
// PRELOADER ANIMATION
// ==========================================
function startPreloader() {
    const preloader = document.getElementById('preloader');
    const progressBar = document.getElementById('progress-bar');
    const progressPercentage = document.getElementById('progress-percentage');
    const cmdEl = document.getElementById('preloader-cmd');
    const CMD = 'portfolio.render()';

    if (!preloader) return;

    // If already faded out, don't restart
    if (preloader.classList.contains('fade-out')) return;

    let progress = 0;
    const duration = 700; // quick code-editor reveal, then fade
    const intervalTime = 16;
    const steps = duration / intervalTime;
    const increment = 100 / steps;

    const removePreloader = () => {
        preloader.classList.add('fade-out');
        setTimeout(() => {
            preloader.remove();
        }, 350);
    };

    const interval = setInterval(() => {
        progress += increment;

        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);

            if (progressBar) progressBar.style.width = '100%';
            if (progressPercentage) progressPercentage.textContent = '100%';

            setTimeout(removePreloader, 240);
        } else {
            if (progressBar) progressBar.style.width = `${progress}%`;
            if (progressPercentage) progressPercentage.textContent = `${Math.floor(progress)}%`;
        }
        if (cmdEl) {
            const chars = Math.ceil((progress / 100) * CMD.length);
            cmdEl.textContent = CMD.slice(0, chars);
        }
    }, intervalTime);

    // Safety fallback
    setTimeout(() => {
        if (document.body.contains(preloader)) {
            clearInterval(interval);
            removePreloader();
        }
    }, duration + 5000);
}

// Start immediately if DOM is ready, otherwise wait for DOMContentLoaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startPreloader);
} else {
    startPreloader();
}

if (window.lucide) lucide.createIcons();

// ==========================================
// CURSOR GLOW EFFECT
// ==========================================
const cursorGlow = document.querySelector('.cursor-glow');

document.addEventListener('mousemove', (e) => {
    if (!cursorGlow) return;

    const x = e.clientX;
    const y = e.clientY;

    cursorGlow.style.left = x + 'px';
    cursorGlow.style.top = y + 'px';
});

// ==========================================
// BUTTON HOVER SOUNDS
// ==========================================
let audioContext;

function getAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    return audioContext;
}

function playHoverSound() {
    const context = getAudioContext();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.frequency.value = 500;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.08, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.1);

    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.1);
}

const interactiveElements = document.querySelectorAll(`
    .btn-primary,
    .btn-secondary,
    .project-card,
    .nav-links a:not(.btn-primary),
    .theme-toggle-btn,
    .stat-pill,
    .glow-card
`);

interactiveElements.forEach(element => {
    element.addEventListener('mouseenter', () => {
        playHoverSound();
    });
});

// ==========================================
// EMAIL REVEAL TOGGLE
// ==========================================
const contactFormTrigger = document.querySelector('.contact-form-trigger');
const emailReveal = document.getElementById('email-reveal');

if (contactFormTrigger && emailReveal) {
    contactFormTrigger.addEventListener('click', (e) => {
        e.preventDefault();
        emailReveal.classList.toggle('hidden');
        playHoverSound();
    });
}

// ==========================================
// THEME TOGGLE
// ==========================================
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

const applyTheme = (theme) => {
    const isLight = theme === 'light';
    document.documentElement.dataset.theme = theme;
    body.classList.add('theme-switching');
    body.classList.toggle('light-theme', isLight);
    body.classList.toggle('dark-theme', !isLight);
    window.setTimeout(() => body.classList.remove('theme-switching'), 180);
};

// Dark theme is always the default on page load.
applyTheme('dark');

themeToggle?.addEventListener('click', () => {
    const nextTheme = body.classList.contains('dark-theme') ? 'light' : 'dark';
    applyTheme(nextTheme);
    lucide.createIcons();
});

// ==========================================
// MOBILE MENU TOGGLE
// ==========================================
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('is-open');
        mobileMenuBtn.setAttribute('aria-expanded', String(isOpen));
    });

    // Close menu when any link is tapped
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('is-open');
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
        });
    });
}

// ==========================================
// SCROLL SPY FOR ACTIVE NAV LINK
// ==========================================
const sections = document.querySelectorAll('section');
const navItems = document.querySelectorAll('.nav-links a');

const observerOptions = {
    root: null,
    rootMargin: '-80px 0px -80% 0px',
    threshold: 0
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navItems.forEach(item => {
                if (item.classList.contains('btn-primary')) return;
                item.style.color = '';
                item.classList.remove('is-active');
                if (item.getAttribute('href') === `#${id}`) {
                    item.classList.add('is-active');
                }
            });
        }
    });
}, observerOptions);

sections.forEach(section => {
    observer.observe(section);
});

// Scroll fade-in animation disabled - caused text to appear to jump on scroll/filter.

// ==========================================
// SMOOTH SCROLL WITH OFFSET FOR NAV
// ==========================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            const navHeight = 80;
            const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });

            // Close mobile menu if open
            if (window.innerWidth <= 768 && navLinks.style.display === 'flex') {
                navLinks.style.display = 'none';
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
            }
        }
    });
});

// ==========================================
// AI PORTFOLIO FILTER FUNCTIONALITY
// ==========================================
const filterButtons = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.ai-project-card');

if (filterButtons.length > 0 && projectCards.length > 0) {
    const projectsGrid = document.querySelector('.ai-projects-grid');
    const showMoreBtn = document.getElementById('showMoreProjects');
    const VISIBLE_LIMIT = 6;
    let currentFilter = 'agents';
    let isExpanded = false;

    const applyFilter = () => {
        const matches = [];
        projectCards.forEach((card) => {
            const categories = (card.getAttribute('data-category') || '').split(' ');
            if (categories.includes(currentFilter)) {
                matches.push(card);
                card.style.display = '';
                card.classList.remove('hidden');
            } else {
                card.style.display = 'none';
                card.classList.add('hidden');
            }
        });

        if (!isExpanded) {
            matches.forEach((card, i) => {
                if (i >= VISIBLE_LIMIT) {
                    card.style.display = 'none';
                    card.classList.add('hidden');
                }
            });
        }

        if (showMoreBtn) {
            if (matches.length > VISIBLE_LIMIT) {
                showMoreBtn.style.display = 'flex';
                const btnText = showMoreBtn.querySelector('span');
                if (btnText) {
                    const lang = (window.portfolioI18n && window.portfolioI18n.getLang()) || 'nl';
                    if (isExpanded) {
                        btnText.textContent = lang === 'en' ? 'Show less' : 'Toon minder';
                    } else {
                        btnText.textContent = lang === 'en'
                            ? `Show all ${matches.length}`
                            : `Toon alle ${matches.length}`;
                    }
                }
                showMoreBtn.classList.toggle('expanded', isExpanded);
            } else {
                showMoreBtn.style.display = 'none';
            }
        }
    };

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.getAttribute('data-filter');
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentFilter = filter;
            isExpanded = false;
            applyFilter();
            playHoverSound();
        });
    });

    if (showMoreBtn) {
        showMoreBtn.addEventListener('click', () => {
            isExpanded = !isExpanded;
            applyFilter();
        });
    }

    applyFilter();
}

// ==========================================
// NEURAL NETWORK BACKGROUND ANIMATION
// ==========================================
function initNeuralNetwork() {
    const canvas = document.getElementById('neural-network');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationFrame;

    // Set canvas size
    function resizeCanvas() {
        const hero = document.querySelector('.hero');
        if (hero) {
            canvas.width = hero.offsetWidth;
            canvas.height = hero.offsetHeight;
        }
    }

    resizeCanvas();
    window.addEventListener('resize', () => {
        resizeCanvas();
        initParticles();
    });

    // Particle class
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.radius = Math.random() * 2 + 1;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Bounce off edges
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        }

        draw() {
            const isDarkTheme = !document.body.classList.contains('light-theme');
            const particleColor = isDarkTheme
                ? 'rgba(0, 255, 157, 0.6)'
                : 'rgba(220, 38, 38, 0.4)';

            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = particleColor;
            ctx.fill();
        }
    }

    // Initialize particles
    function initParticles() {
        particles = [];
        const particleCount = Math.min(Math.floor(canvas.width / 15), 100);
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }

    // Draw connections
    function drawConnections() {
        const isDarkTheme = !document.body.classList.contains('light-theme');
        const maxDistance = 150;

        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < maxDistance) {
                    const opacity = (1 - distance / maxDistance) * 0.3;
                    const lineColor = isDarkTheme
                        ? `rgba(0, 255, 157, ${opacity})`
                        : `rgba(220, 38, 38, ${opacity})`;

                    ctx.beginPath();
                    ctx.strokeStyle = lineColor;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }

    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });

        drawConnections();

        animationFrame = requestAnimationFrame(animate);
    }

    // Start animation
    initParticles();
    animate();

    // Stop animation on page unload
    window.addEventListener('beforeunload', () => {
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
        }
    });
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) lucide.createIcons();
});

// Show-more toggle is now handled inside the filter block above.

// ==========================================
// WARP MODE - hold SPACE to engage hyperspace
// ==========================================
(() => {
    const container = document.getElementById('warp-canvas');
    if (!container) return;

    let warpActive = false;
    let engine3d = null;
    let mode = null;

    let canvas2d = null;
    let ctx = null;
    let raf2d = null;
    let stars = [];
    let speed2d = 8;
    let dpr = Math.max(1, window.devicePixelRatio || 1);
    const STAR_COUNT = 900;
    const Z_FAR = 2000;
    const FOCAL = 340;
    let mouseX = 0;
    let mouseY = 0;
    let pulsePhase = 0;

    const hudVel = document.getElementById('hud-velocity');
    const hudStatus = document.getElementById('hud-status');

    const updateHud = (speedNorm) => {
        if (hudVel) {
            const c = speedNorm * 0.96 + 0.03;
            hudVel.textContent = c.toFixed(2) + ' c';
        }
        if (hudStatus) {
            if (speedNorm < 0.15) hudStatus.textContent = 'SPOOLING DRIVE...';
            else if (speedNorm < 0.4) hudStatus.textContent = 'ACCELERATION NOMINAL';
            else if (speedNorm < 0.7) hudStatus.textContent = 'BREAKING ATMOSPHERE';
            else hudStatus.textContent = 'WARP STABLE - TRAJECTORY LOCKED';
        }
    };

    const detectMode = () => {
        if (mode) return mode;
        try {
            const c = document.createElement('canvas');
            const gl = c.getContext('webgl2');
            const desktop = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
            mode = (gl && desktop) ? '3d' : '2d';
            if (gl) { const ext = gl.getExtension('WEBGL_lose_context'); if (ext) ext.loseContext(); }
        } catch (e) { mode = '2d'; }
        return mode;
    };

    let preloaded = false;
    const preload = () => {
        if (preloaded || detectMode() !== '3d') return;
        preloaded = true;
        import('./warp-3d.js').then(m => {
            engine3d = new m.WormholeEngine(container);
            engine3d.onFrame = updateHud;
        }).catch(() => { mode = '2d'; });
    };
    document.addEventListener('mousemove', preload, { once: true });
    document.addEventListener('scroll', preload, { once: true });

    const ensure2d = () => {
        if (canvas2d) return;
        canvas2d = document.createElement('canvas');
        canvas2d.style.cssText = 'position:absolute;inset:0';
        container.appendChild(canvas2d);
        ctx = canvas2d.getContext('2d');
    };

    const resize2d = () => {
        if (!canvas2d) return;
        dpr = Math.max(1, window.devicePixelRatio || 1);
        canvas2d.width = Math.floor(window.innerWidth * dpr);
        canvas2d.height = Math.floor(window.innerHeight * dpr);
        canvas2d.style.width = window.innerWidth + 'px';
        canvas2d.style.height = window.innerHeight + 'px';
    };
    window.addEventListener('resize', resize2d);

    const seedStars = () => {
        stars = [];
        for (let i = 0; i < STAR_COUNT; i++) {
            stars.push({
                x: (Math.random() - 0.5) * 2600,
                y: (Math.random() - 0.5) * 2600,
                z: Math.random() * Z_FAR,
                pz: 0,
                tint: Math.random(),
                size: 0.5 + Math.random() * 1.6,
                layer: Math.random(),
            });
        }
    };

    let last2dTs = 0;
    let smx2d = 0;
    let smy2d = 0;
    const SPEED2D_MIN = 950;   // units/sec
    const SPEED2D_MAX = 5400;
    const STAR_COUNT_SMOOTH = 900;

    const tick2d = (ts) => {
        if (!warpActive || !canvas2d) return;
        if (!last2dTs) last2dTs = ts;
        let dt = (ts - last2dTs) / 1000;
        last2dTs = ts;
        if (dt > 1 / 30) dt = 1 / 30;
        if (dt < 0) dt = 0;

        /* smooth mouse + exponential accel (frame independent) */
        const ma = 1 - Math.exp(-12 * dt);
        smx2d += (mouseX - smx2d) * ma;
        smy2d += (mouseY - smy2d) * ma;
        speed2d += (SPEED2D_MAX - speed2d) * (1 - Math.exp(-3.8 * dt));

        const w = canvas2d.width;
        const h = canvas2d.height;
        const focal = FOCAL * dpr;
        const parallaxX = smx2d * 18 * dpr;
        const parallaxY = smy2d * 14 * dpr;
        const cx = w / 2 + parallaxX;
        const cy = h * 0.5 + parallaxY;

        /* lighter trail so motion feels continuous, not strobing */
        ctx.fillStyle = 'rgba(7, 17, 31, 0.22)';
        ctx.fillRect(0, 0, w, h);

        const intensity = Math.min(1, (speed2d - SPEED2D_MIN) / (SPEED2D_MAX - SPEED2D_MIN));
        pulsePhase += dt * 1.1;
        const pulse = 0.5 + 0.5 * Math.sin(pulsePhase * 2.1);
        const coreStr = intensity * (0.85 + pulse * 0.15);
        const coreR = Math.hypot(w, h) * 0.72;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
        grad.addColorStop(0, `rgba(255,255,255,${0.18 + coreStr * 0.32})`);
        grad.addColorStop(0.08, `rgba(232,255,246,${0.16 + coreStr * 0.26})`);
        grad.addColorStop(0.25, `rgba(180,220,230,${0.14 + coreStr * 0.2})`);
        grad.addColorStop(0.5, `rgba(140,180,210,${0.1 + coreStr * 0.14})`);
        grad.addColorStop(0.8, `rgba(120,160,200,${0.06 + coreStr * 0.08})`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        const burstStr = intensity;
        const burstR = (50 + burstStr * 120) * dpr * (0.9 + pulse * 0.15);
        const burst = ctx.createRadialGradient(cx, cy, 0, cx, cy, burstR);
        burst.addColorStop(0, `rgba(255,255,255,${0.3 + burstStr * 0.5})`);
        burst.addColorStop(0.25, `rgba(232,255,246,${0.12 + burstStr * 0.3})`);
        burst.addColorStop(0.6, `rgba(46,242,160,${burstStr * 0.18})`);
        burst.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = burst;
        ctx.fillRect(0, 0, w, h);

        const step = speed2d * dt;
        ctx.lineCap = 'round';
        for (let i = 0; i < stars.length; i++) {
            const s = stars[i];
            s.pz = s.z;
            s.z -= step;
            if (s.z < 1) {
                s.x = (Math.random() - 0.5) * 2600;
                s.y = (Math.random() - 0.5) * 2600;
                s.z = Z_FAR;
                s.pz = Z_FAR;
                continue;
            }
            const sx = (s.x / s.z) * focal + cx;
            const sy = (s.y / s.z) * focal + cy;
            const psx = (s.x / s.pz) * focal + cx;
            const psy = (s.y / s.pz) * focal + cy;
            const t = 1 - s.z / Z_FAR;
            const farFade = s.layer < 0.3 ? 0.55 : 1;
            const alpha = Math.min(1, (t * 1.8 + 0.1) * farFade);
            const lw = (t * 2.6 + 0.3) * s.size * dpr * farFade;

            if (s.tint < 0.84) ctx.strokeStyle = `rgba(232,240,250,${alpha})`;
            else if (s.tint < 0.92) ctx.strokeStyle = `rgba(180,210,235,${alpha * 0.95})`;
            else if (s.tint < 0.97) ctx.strokeStyle = `rgba(120,200,180,${alpha * 0.85})`;
            else ctx.strokeStyle = `rgba(138,124,255,${alpha * 0.85})`;
            ctx.lineWidth = lw;

            ctx.beginPath();
            ctx.moveTo(psx, psy);
            ctx.lineTo(sx, sy);
            ctx.stroke();

            if (t > 0.6) {
                ctx.fillStyle = ctx.strokeStyle;
                ctx.beginPath();
                ctx.arc(sx, sy, lw * 0.65, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        updateHud(Math.min(1, (speed2d - SPEED2D_MIN) / (SPEED2D_MAX - SPEED2D_MIN)));
        raf2d = requestAnimationFrame(tick2d);
    };

    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        if (engine3d) engine3d.setMouse(mouseX, mouseY);
    });

    const isTypingTarget = (el) => {
        if (!el) return false;
        const tag = el.tagName;
        return tag === 'INPUT' || tag === 'TEXTAREA' || el.isContentEditable;
    };
    const isSpace = (e) => e.code === 'Space' || e.key === ' ' || e.keyCode === 32;
    const NAV_HEIGHT = 80;

    const STOPS = [
        { id: 'about',      label: 'OVER MIJ' },
        { id: 'projects',   label: 'PROJECTEN' },
        { id: 'experience', label: 'ERVARING' },
        { id: 'skills',     label: 'SKILLS' },
        { id: 'contact',    label: 'CONTACT' }
    ];
    const STOP_MS = 760;
    const FADE_MS = 110;
    let stopTimer = null;
    let stopIdx = 0;

    const renderStop = (idx, instant) => {
        const stops = document.querySelectorAll('.warp-stop');
        stops.forEach((el, i) => {
            el.classList.remove('is-active', 'is-past');
            if (i < idx) el.classList.add('is-past');
            if (i === idx) el.classList.add('is-active');
        });
        const big = document.getElementById('hud-big-destination');
        if (!big) return;
        const paint = () => {
            big.textContent = STOPS[idx].label;
            big.style.opacity = '1';
        };
        if (instant) { paint(); }
        else {
            big.style.opacity = '0';
            setTimeout(paint, FADE_MS);
        }
    };

    const scrollToSection = (id) => {
        const target = document.getElementById(id);
        if (!target) return;
        const y = target.getBoundingClientRect().top + window.pageYOffset - NAV_HEIGHT - 16;
        window.scrollTo({ top: y, behavior: 'smooth' });
    };

    const activate = () => {
        if (warpActive) return;
        warpActive = true;
        document.body.classList.add('xray');

        stopIdx = 0;
        renderStop(0, true);
        clearInterval(stopTimer);
        stopTimer = setInterval(() => {
            stopIdx = (stopIdx + 1) % STOPS.length;
            renderStop(stopIdx, false);
        }, STOP_MS);

        if (detectMode() === '3d' && engine3d) {
            engine3d.activate();
            return;
        }

        ensure2d();
        resize2d();
        speed2d = SPEED2D_MIN;
        last2dTs = 0;
        smx2d = mouseX;
        smy2d = mouseY;
        seedStars();
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas2d.width, canvas2d.height);
        cancelAnimationFrame(raf2d);
        raf2d = requestAnimationFrame(tick2d);

        if (detectMode() === '3d' && !engine3d && !preloaded) {
            preload();
        }
    };

    const deactivate = () => {
        if (!warpActive) return;
        warpActive = false;
        const dest = STOPS[stopIdx];
        clearInterval(stopTimer);
        stopTimer = null;
        document.body.classList.remove('xray');

        if (engine3d) engine3d.deactivate();
        cancelAnimationFrame(raf2d);

        if (hudStatus) hudStatus.textContent = 'ARRIVAL: ' + dest.label;
        scrollToSection(dest.id);

        if (canvas2d && ctx) {
            let n = 0;
            const decay = () => {
                n++;
                ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
                ctx.fillRect(0, 0, canvas2d.width, canvas2d.height);
                if (n < 6) requestAnimationFrame(decay);
                else ctx.clearRect(0, 0, canvas2d.width, canvas2d.height);
            };
            decay();
        }
    };

    document.addEventListener('keydown', (e) => {
        if (!isSpace(e)) return;
        if (isTypingTarget(e.target)) return;
        e.preventDefault();
        if (e.repeat) return;
        activate();
    });

    document.addEventListener('keyup', (e) => {
        if (!isSpace(e)) return;
        deactivate();
    });

    window.addEventListener('blur', deactivate);
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) deactivate();
    });
    document.addEventListener('mouseleave', deactivate);
})();

// ==========================================
// TERMINAL AI INTERFACE (embedded in contact)
// ==========================================
(() => {
    const embed = document.getElementById('terminal-embed');
    const body = document.getElementById('terminal-body');
    const form = document.getElementById('terminal-form');
    const input = document.getElementById('terminal-input');
    const chips = document.querySelectorAll('.terminal-chip');

    if (!embed || !body || !form || !input) return;

    const escape = (s) => s.replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));

    const print = (type, text, href) => {
        const line = document.createElement('div');
        line.className = `terminal-line terminal-line--${type}`;
        if (type === 'link' && href) {
            line.innerHTML = `<a href="${escape(href)}" target="_blank" rel="noopener noreferrer">${escape(text)}</a>`;
        } else {
            line.textContent = text;
        }
        body.appendChild(line);
        body.scrollTop = body.scrollHeight;
    };

    let typingTimer = null;
    const typePrint = (type, text, done) => {
        const line = document.createElement('div');
        line.className = `terminal-line terminal-line--${type}`;
        body.appendChild(line);
        let i = 0;
        clearInterval(typingTimer);
        typingTimer = setInterval(() => {
            line.textContent = text.slice(0, ++i);
            body.scrollTop = body.scrollHeight;
            if (i >= text.length) {
                clearInterval(typingTimer);
                if (done) done();
            }
        }, 12);
    };

    const commands = {
        help: () => {
            print('system', 'Available commands:');
            print('muted', '  linkedin  →  open LinkedIn profiel');
            print('muted', '  whatsapp  →  open WhatsApp chat');
            print('muted', '  email     →  toon email-adres');
            print('muted', '  call      →  plan een call (email)');
            print('muted', '  about     →  korte bio');
            print('muted', '  stack     →  tech stack');
            print('muted', '  clear     →  wis terminal');
        },
        linkedin: () => {
            print('system', 'Opening LinkedIn...');
            const url = 'https://www.linkedin.com/in/robin-bril/';
            print('link', '→ ' + url, url);
            window.open(url, '_blank', 'noopener,noreferrer');
        },
        whatsapp: () => {
            print('system', 'Opening WhatsApp chat...');
            const url = 'https://wa.me/31640446732';
            print('link', '→ ' + url, url);
            window.open(url, '_blank', 'noopener,noreferrer');
        },
        call: () => {
            print('system', 'Stuur een mail dan plannen we een call in.');
            const url = 'mailto:robin.bril@gmail.com?subject=Call%20plannen&body=Hi%20Robin%2C%0A%0AIk%20wil%20graag%20een%20call%20plannen.%0A%0AGroet%2C';
            print('link', '→ Plan call via robin.bril@gmail.com', url);
            window.location.href = url;
        },
        email: () => {
            print('system', 'Email: robin.bril@gmail.com');
            print('link', '→ mailto:robin.bril@gmail.com', 'mailto:robin.bril@gmail.com');
        },
        about: () => {
            print('system', 'Robin Bril - AI Engineer, Amsterdam.');
            print('system', 'Bouwt AI-systemen die zelfstandig taken uitvoeren binnen bedrijven.');
            print('system', '7+ productie-agents, 14+ MCP-servers, open-source claude-harness.');
        },
        stack: () => {
            print('system', 'Stack: Python, C#/.NET, TypeScript, Rust, SvelteKit,');
            print('system', '       Kubernetes (AKS), Azure, MCP, Claude/OpenAI, RAG, RBAC.');
        },
        clear: () => {
            body.innerHTML = '';
            boot();
        }
    };

    const run = (raw) => {
        const cmd = raw.trim().toLowerCase();
        if (!cmd) return;
        print('user', raw);
        const fn = commands[cmd];
        if (fn) {
            fn();
        } else {
            print('error', `command not found: ${cmd}`);
            print('muted', 'type "help" voor beschikbare commando\'s');
        }
    };

    let booted = false;
    const boot = () => {
        if (booted) return;
        booted = true;
        typePrint('system', 'Robin Bril AI Protocol initialized...', () => {
            typePrint('system', 'Ready for inquiries. Available: AI engineering, agentic systems, enterprise AI.', () => {
                typePrint('system', 'Klik een chip hieronder of typ "help" voor alle commando\'s.');
            });
        });
    };

    // Boot when terminal scrolls into view
    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    boot();
                    io.disconnect();
                }
            });
        }, { threshold: 0.2 });
        io.observe(embed);
    } else {
        boot();
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const v = input.value;
        input.value = '';
        run(v);
    });

    // Chip click: pulse the chip, autotype command into chat (~500ms), then execute
    let chipBusy = false;
    chips.forEach((chip) => {
        chip.addEventListener('click', () => {
            if (chipBusy) return;
            const cmd = chip.getAttribute('data-cmd');
            if (!cmd) return;
            chipBusy = true;

            // Pulse the chip
            chip.classList.remove('terminal-chip--press');
            void chip.offsetWidth;
            chip.classList.add('terminal-chip--press');

            // Animate typing into a user line inside the chat
            const line = document.createElement('div');
            line.className = 'terminal-line terminal-line--user terminal-line--typing';
            body.appendChild(line);
            body.scrollTop = body.scrollHeight;

            const totalMs = 1000;
            const stepMs = Math.max(40, Math.floor(totalMs / cmd.length));
            let i = 0;
            const typer = setInterval(() => {
                line.textContent = cmd.slice(0, ++i);
                body.scrollTop = body.scrollHeight;
                if (i >= cmd.length) {
                    clearInterval(typer);
                    line.classList.remove('terminal-line--typing');
                    // Hold a beat so the typed word is readable, then execute
                    setTimeout(() => {
                        const fn = commands[cmd];
                        if (fn) fn();
                        else print('error', `command not found: ${cmd}`);
                        chipBusy = false;
                    }, 250);
                }
            }, stepMs);
        });
    });
})();

// ==========================================
// SCROLL REVEAL - premium fade-in on scroll
// Respects prefers-reduced-motion
// ==========================================
(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const targets = [
        '.section-header',
        '.about-content > *',
        '.featured-project',
        '.ai-project-card',
        '.timeline-item',
        '.cert-item',
        '.stat-item',
        '.skill-category',
        '.testimonial-compact',
        '.contact-card',
        '.contact-terminal-wrap'
    ];

    const elements = document.querySelectorAll(targets.join(', '));
    if (!elements.length) return;

    // Tag each element with reveal class + stagger index within its parent grid
    const gridMap = new Map();
    elements.forEach((el) => {
        el.classList.add('reveal');
        const grid = el.parentElement;
        if (!grid) return;
        const key = grid;
        if (!gridMap.has(key)) gridMap.set(key, 0);
        const idx = gridMap.get(key);
        el.style.setProperty('--reveal-index', String(idx));
        gridMap.set(key, idx + 1);
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -60px 0px'
    });

    elements.forEach((el) => observer.observe(el));
})();

// ==========================================
// STAT COUNTER ANIMATION - count up on first view
// ==========================================
(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const stats = document.querySelectorAll('.stat-number[data-count]');
    if (!stats.length) return;

    const animate = (el) => {
        const target = parseInt(el.dataset.count, 10) || 0;
        const suffix = el.dataset.suffix || '';
        if (prefersReduced) {
            el.textContent = target + suffix;
            return;
        }
        const duration = 1400;
        const start = performance.now();
        const ease = (t) => 1 - Math.pow(1 - t, 3);

        const step = (now) => {
            const t = Math.min(1, (now - start) / duration);
            const value = Math.round(target * ease(t));
            el.textContent = value + (t === 1 ? suffix : '');
            if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                animate(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.4 });

    stats.forEach((el) => observer.observe(el));
})();


// ==========================================
// TERMINAL AUTOPROMPT - types example commands in the placeholder
// to teach discoverability. Stops once user interacts.
// ==========================================
(() => {
    const input = document.getElementById('terminal-input');
    if (!input) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const examples = ['help', 'linkedin', 'whatsapp', 'book call', 'email'];
    let exampleIdx = 0;
    let charIdx = 0;
    let phase = 'typing'; // typing | hold | erasing
    let stopped = false;
    let timer = null;

    const stop = () => {
        stopped = true;
        clearTimeout(timer);
        input.placeholder = 'Enter command...';
    };

    input.addEventListener('focus', stop, { once: true });
    input.addEventListener('input', stop, { once: true });

    let observerStarted = false;
    const startTyping = () => {
        if (observerStarted || stopped) return;
        observerStarted = true;

        const step = () => {
            if (stopped) return;
            const word = examples[exampleIdx];
            if (phase === 'typing') {
                charIdx++;
                input.placeholder = 'try: ' + word.slice(0, charIdx);
                if (charIdx >= word.length) {
                    phase = 'hold';
                    timer = setTimeout(step, 1400);
                    return;
                }
                timer = setTimeout(step, 90 + Math.random() * 40);
            } else if (phase === 'hold') {
                phase = 'erasing';
                timer = setTimeout(step, 60);
            } else {
                charIdx--;
                input.placeholder = 'try: ' + word.slice(0, Math.max(0, charIdx));
                if (charIdx <= 0) {
                    exampleIdx = (exampleIdx + 1) % examples.length;
                    phase = 'typing';
                    timer = setTimeout(step, 500);
                    return;
                }
                timer = setTimeout(step, 35);
            }
        };
        timer = setTimeout(step, 800);
    };

    // Start when the terminal section enters viewport
    const wrap = input.closest('.contact-terminal-wrap') || input.closest('.terminal-window');
    if (wrap && 'IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach((e) => {
                if (e.isIntersecting) {
                    startTyping();
                    io.disconnect();
                }
            });
        }, { threshold: 0.4 });
        io.observe(wrap);
    } else {
        startTyping();
    }
})();
(function () {
    'use strict';

    function init() {
        var navbar = document.querySelector('.navbar');
        if (!navbar) return;

        var sectionIds = ['about', 'projects', 'experience', 'skills', 'contact'];
        var sections = sectionIds
            .map(function (id) { return document.getElementById(id); })
            .filter(Boolean);

        var linkMap = {};
        sectionIds.forEach(function (id) {
            var link = navbar.querySelector('a[href="#' + id + '"]');
            if (link) linkMap[id] = link;
        });

        var headerOffset = 80;

        function setCurrent(id) {
            Object.keys(linkMap).forEach(function (key) {
                linkMap[key].classList.toggle('is-current', key === id);
            });
        }

        if (sections.length && 'IntersectionObserver' in window) {
            var visible = new Map();
            var io = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        visible.set(entry.target.id, entry.intersectionRatio);
                    } else {
                        visible.delete(entry.target.id);
                    }
                });

                var best = null;
                var bestRatio = 0;
                visible.forEach(function (ratio, id) {
                    if (ratio > bestRatio) {
                        bestRatio = ratio;
                        best = id;
                    }
                });
                if (best) setCurrent(best);
            }, {
                rootMargin: '-' + headerOffset + 'px 0px -55% 0px',
                threshold: [0, 0.25, 0.5, 0.75, 1]
            });

            sections.forEach(function (s) { io.observe(s); });
        }

        var ticking = false;
        function onScroll() {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(function () {
                navbar.classList.toggle('scrolled', window.scrollY > 40);
                ticking = false;
            });
        }
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();

        navbar.addEventListener('click', function (e) {
            var link = e.target.closest('a[href^="#"]');
            if (!link || !navbar.contains(link)) return;
            var href = link.getAttribute('href');
            if (!href || href.length < 2) return;

            var target = document.getElementById(href.slice(1));
            if (!target) return;

            e.preventDefault();
            var rect = target.getBoundingClientRect();
            var y = window.scrollY + rect.top - headerOffset + 1;
            window.scrollTo({ top: y, behavior: 'smooth' });
        });

        var menuBtn = navbar.querySelector('.mobile-menu-btn');
        var navLinks = navbar.querySelector('.nav-links');
        if (menuBtn && navLinks) {
            menuBtn.addEventListener('click', function () {
                var open = navLinks.classList.toggle('is-open');
                menuBtn.classList.toggle('is-open', open);
                menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
/* 05 - Terminal interface upgrade: discoverability + tab-complete + auto-typer
 *
 * Self-contained IIFE. Idempotent and defensive.
 * Reads optional data-commands attribute on #terminal-embed (comma-separated).
 * Falls back to a built-in command list otherwise.
 *
 * Public surface (window.__terminalEnhance) is exposed only for debugging.
 */
(function () {
    'use strict';

    if (window.__terminalEnhanceLoaded) return;
    window.__terminalEnhanceLoaded = true;

    var run = function () {
        try {
            var input = document.getElementById('terminal-input');
            var form = document.getElementById('terminal-form');
            var embed = document.getElementById('terminal-embed');
            var body = document.getElementById('terminal-body');
            if (!input || !form || !embed) return;

            var prefersReduced = false;
            try {
                prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            } catch (_) {}

            /* ---------- Command list ---------- */
            var fallbackCommands = ['help', 'linkedin', 'whatsapp', 'email', 'call', 'about', 'stack', 'github', 'available', 'clear'];
            var dataAttr = embed.getAttribute('data-commands');
            var commands = dataAttr
                ? dataAttr.split(',').map(function (s) { return s.trim().toLowerCase(); }).filter(Boolean)
                : fallbackCommands.slice();

            var cyclePlaceholders = ['help', 'linkedin', 'email', 'github', 'available'];

            /* ---------- DOM scaffolding ---------- */
            var inputRow = form;
            inputRow.classList.add('has-enhance');

            // Wrap input so we can layer a ghost behind it
            var originalParent = input.parentNode;
            var wrap = document.createElement('span');
            wrap.className = 'terminal-input-wrap';
            originalParent.insertBefore(wrap, input);
            wrap.appendChild(input);

            var ghost = document.createElement('span');
            ghost.className = 'terminal-ghost';
            ghost.setAttribute('aria-hidden', 'true');
            ghost.innerHTML = '<span class="term-ghost-typed"></span><span class="term-ghost-suffix"></span><span class="term-ghost-tab">TAB</span>';
            wrap.appendChild(ghost);
            var ghostTyped = ghost.querySelector('.term-ghost-typed');
            var ghostSuffix = ghost.querySelector('.term-ghost-suffix');
            var ghostTab = ghost.querySelector('.term-ghost-tab');
            ghost.style.display = 'none';

            // Blinking caret after the prompt $ when input is empty + unfocused
            var caret = document.createElement('span');
            caret.className = 'terminal-caret';
            caret.setAttribute('aria-hidden', 'true');
            var promptEl = form.querySelector('.terminal-input-prompt');
            if (promptEl && promptEl.parentNode) {
                promptEl.parentNode.insertBefore(caret, promptEl.nextSibling);
            }

            // Pulsing prompt hint underneath the input row
            var hint = document.createElement('div');
            hint.className = 'terminal-prompt-hint';
            hint.innerHTML = 'type <kbd>help</kbd> <kbd>&#x21B5;</kbd> for all commands &middot; <kbd>TAB</kbd> to autocomplete';
            if (form.parentNode) form.parentNode.appendChild(hint);

            /* ---------- Placeholder cycler ---------- */
            var cycleIdx = 0;
            var cycleTimer = null;
            var stoppedCycle = false;
            var DEFAULT_PLACEHOLDER = 'Enter command...';

            var setPlaceholder = function (text) {
                try { input.placeholder = text; } catch (_) {}
            };

            var stopCycle = function () {
                if (stoppedCycle) return;
                stoppedCycle = true;
                if (cycleTimer) { clearTimeout(cycleTimer); cycleTimer = null; }
            };

            var tickCycle = function () {
                if (stoppedCycle || prefersReduced) return;
                var word = cyclePlaceholders[cycleIdx % cyclePlaceholders.length];
                setPlaceholder('try: ' + word);
                cycleIdx++;
                cycleTimer = setTimeout(tickCycle, 2500);
            };

            /* ---------- Tab-complete ghost ---------- */
            var findCompletion = function (value) {
                var v = (value || '').toLowerCase();
                if (!v) return null;
                for (var i = 0; i < commands.length; i++) {
                    if (commands[i] !== v && commands[i].indexOf(v) === 0) return commands[i];
                }
                return null;
            };

            var updateGhost = function () {
                try {
                    var raw = input.value;
                    var completion = findCompletion(raw);
                    if (!completion) {
                        ghost.style.display = 'none';
                        return;
                    }
                    ghostTyped.textContent = raw;
                    ghostSuffix.textContent = completion.slice(raw.length);
                    ghostTab.style.display = '';
                    ghost.style.display = '';
                } catch (_) {
                    ghost.style.display = 'none';
                }
            };

            /* ---------- Help echo fallback ---------- */
            // If the existing handler already prints "Available commands:",
            // we detect it and skip. Otherwise we print our own list.
            var printLine = function (type, text) {
                if (!body) return;
                try {
                    var line = document.createElement('div');
                    line.className = 'terminal-line terminal-line--' + type;
                    line.textContent = text;
                    body.appendChild(line);
                    body.scrollTop = body.scrollHeight;
                } catch (_) {}
            };

            /* ---------- Input state tracking ---------- */
            var syncRowState = function () {
                if (input.value && input.value.length > 0) {
                    inputRow.classList.add('has-value');
                } else {
                    inputRow.classList.remove('has-value');
                }
            };

            input.addEventListener('focus', function () {
                inputRow.classList.add('is-focused');
                stopCycle();
                setPlaceholder("type 'help' for options");
                if (hint && hint.classList) hint.classList.add('is-hidden');
            });

            input.addEventListener('blur', function () {
                inputRow.classList.remove('is-focused');
            });

            input.addEventListener('input', function () {
                stopCycle();
                syncRowState();
                updateGhost();
            });

            input.addEventListener('keydown', function (e) {
                if (e.key === 'Tab' && !e.shiftKey) {
                    var completion = findCompletion(input.value);
                    if (completion) {
                        e.preventDefault();
                        input.value = completion;
                        syncRowState();
                        updateGhost();
                    }
                    return;
                }
                if (e.key === 'Escape') {
                    ghost.style.display = 'none';
                }
            });

            form.addEventListener('submit', function () {
                var raw = (input.value || '').trim().toLowerCase();
                if (raw !== 'help') return;
                setTimeout(function () {
                    try {
                        if (!body) return;
                        var lastLines = body.querySelectorAll('.terminal-line');
                        var recent = lastLines[lastLines.length - 1];
                        var alreadyHandled = recent && /available commands/i.test(recent.textContent || '');
                        if (alreadyHandled) return;
                        printLine('system', 'Available commands:');
                        commands.forEach(function (c) {
                            printLine('muted', '  ' + c);
                        });
                    } catch (_) {}
                }, 30);
            });

            /* ---------- Auto-typer on first viewport entry ---------- */
            var typedAlready = false;
            var runAutoTyper = function () {
                if (typedAlready) return;
                typedAlready = true;
                if (prefersReduced) {
                    setPlaceholder("try: help");
                    return;
                }
                stopCycle();
                embed.classList.add('is-typing');
                var sample = 'help';
                var idx = 0;
                var typeStep = function () {
                    if (idx > sample.length) {
                        setTimeout(function () {
                            setPlaceholder(DEFAULT_PLACEHOLDER);
                            embed.classList.remove('is-typing');
                            embed.classList.add('is-typed');
                            stoppedCycle = false;
                            cycleIdx = 0;
                            cycleTimer = setTimeout(tickCycle, 1200);
                        }, 900);
                        return;
                    }
                    setPlaceholder('try: ' + sample.slice(0, idx));
                    idx++;
                    setTimeout(typeStep, 110 + Math.random() * 50);
                };
                typeStep();
            };

            if ('IntersectionObserver' in window) {
                try {
                    var io = new IntersectionObserver(function (entries) {
                        for (var i = 0; i < entries.length; i++) {
                            if (entries[i].isIntersecting) {
                                runAutoTyper();
                                io.disconnect();
                                break;
                            }
                        }
                    }, { threshold: 0.4 });
                    io.observe(embed);
                } catch (_) {
                    runAutoTyper();
                }
            } else {
                runAutoTyper();
            }

            syncRowState();

            window.__terminalEnhance = {
                commands: commands,
                stopCycle: stopCycle,
                cycle: tickCycle
            };
        } catch (err) {
            // Swallow: enhancement is non-critical
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run, { once: true });
    } else {
        run();
    }
})();
/* =============================================================================
 * 08 - Animations script additions
 * Self-contained IIFE. No globals. No dependencies.
 *
 * Responsibilities:
 *  - Observe sections/hero with data-reveal; add .in-view at 15% visibility
 *  - Track mouse position over tilt cards; write --mx --my custom properties
 *    (normalised range -1..1) for CSS-only consumption
 *  - rAF-throttled mousemove handler
 *  - Respects prefers-reduced-motion
 *
 * =============================================================================
 */

(function () {
    "use strict";

    var supportsIO = typeof window.IntersectionObserver === "function";
    var prefersReduced = window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function markAllVisible() {
        var nodes = document.querySelectorAll("[data-reveal]");
        for (var i = 0; i < nodes.length; i++) {
            nodes[i].classList.add("in-view");
        }
    }

    if (prefersReduced) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", markAllVisible, { once: true });
        } else {
            markAllVisible();
        }
        return;
    }

    /* ---------------------------------------------------------------------
       1. Scroll reveal - auto-tag every <section> + .hero with data-reveal
       --------------------------------------------------------------------- */

    function tagRevealTargets() {
        var targets = document.querySelectorAll("section.section, section.hero, .hero");
        for (var i = 0; i < targets.length; i++) {
            if (!targets[i].hasAttribute("data-reveal")) {
                targets[i].setAttribute("data-reveal", "");
            }
        }
        return targets;
    }

    function initRevealObserver() {
        var targets = tagRevealTargets();
        if (!targets.length) return;

        if (!supportsIO) {
            for (var j = 0; j < targets.length; j++) {
                targets[j].classList.add("in-view");
            }
            return;
        }

        var io = new IntersectionObserver(function (entries) {
            for (var i = 0; i < entries.length; i++) {
                var entry = entries[i];
                if (entry.isIntersecting) {
                    entry.target.classList.add("in-view");
                    io.unobserve(entry.target);
                }
            }
        }, {
            threshold: 0.15,
            rootMargin: "0px 0px -5% 0px"
        });

        for (var k = 0; k < targets.length; k++) {
            io.observe(targets[k]);
        }
    }

    /* ---------------------------------------------------------------------
       2. Card tilt - mousemove sets --mx / --my (range -1..1)
       --------------------------------------------------------------------- */

    function initCardTilt() {
        var cards = document.querySelectorAll(".ai-project-card, .featured-project");
        if (!cards.length) return;
        if (!("requestAnimationFrame" in window)) return;

        var hoverable = window.matchMedia &&
            window.matchMedia("(hover: hover) and (pointer: fine)").matches;
        if (!hoverable) return;

        var rafId = null;
        var pending = null;

        function applyTilt() {
            rafId = null;
            if (!pending) return;
            var card = pending.card;
            var rect = pending.rect;

            var relX = (pending.x - rect.left) / rect.width;
            var relY = (pending.y - rect.top) / rect.height;
            var mx = (relX - 0.5) * 2;
            var my = (relY - 0.5) * 2;

            if (mx < -1) mx = -1; else if (mx > 1) mx = 1;
            if (my < -1) my = -1; else if (my > 1) my = 1;

            card.style.setProperty("--mx", mx.toFixed(3));
            card.style.setProperty("--my", my.toFixed(3));
            pending = null;
        }

        function onMove(e) {
            var card = e.currentTarget;
            pending = {
                card: card,
                rect: card.getBoundingClientRect(),
                x: e.clientX,
                y: e.clientY
            };
            if (rafId === null) {
                rafId = window.requestAnimationFrame(applyTilt);
            }
        }

        function onLeave(e) {
            var card = e.currentTarget;
            if (rafId !== null) {
                window.cancelAnimationFrame(rafId);
                rafId = null;
            }
            pending = null;
            card.style.setProperty("--mx", "0");
            card.style.setProperty("--my", "0");
        }

        for (var i = 0; i < cards.length; i++) {
            cards[i].addEventListener("mousemove", onMove, { passive: true });
            cards[i].addEventListener("mouseleave", onLeave, { passive: true });
        }
    }

    /* ---------------------------------------------------------------------
       Boot
       --------------------------------------------------------------------- */

    function boot() {
        try { initRevealObserver(); } catch (e) { /* non-critical */ }
        try { initCardTilt(); } catch (e) { /* non-critical */ }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot, { once: true });
    } else {
        boot();
    }
})();
/* =========================================================================
   15 - Footer / CTA script additions
   - Scroll-to-top toggle + smooth scroll
   - Optional GitHub repos rendering when [data-github-repos] exists
   IIFE, idempotent, no-throw.
   ============================================================= */

(function () {
    'use strict';

    if (window.__rb_footerCtaInit) return;
    window.__rb_footerCtaInit = true;

    function safe(fn) {
        try { fn(); } catch (e) { /* swallow */ }
    }

    /* ---------- Scroll-to-top ---------- */

    function initScrollToTop() {
        var btn = document.querySelector('.scroll-to-top');
        if (!btn) return;

        var threshold = 600;
        var ticking = false;

        function update() {
            var y = window.scrollY || window.pageYOffset || 0;
            btn.classList.toggle('is-visible', y > threshold);
            ticking = false;
        }

        function onScroll() {
            if (ticking) return;
            ticking = true;
            window.requestAnimationFrame(update);
        }

        btn.addEventListener('click', function (e) {
            e.preventDefault();
            var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
        });

        window.addEventListener('scroll', onScroll, { passive: true });
        update();
    }

    /* ---------- GitHub repos ---------- */

    function escapeHtml(str) {
        return String(str == null ? '' : str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function renderRepos(container, repos) {
        if (!repos || !repos.length) {
            container.innerHTML = '<div class="gh-repos__empty">Geen publieke repos beschikbaar.</div>';
            return;
        }

        var html = repos.map(function (repo) {
            var name = escapeHtml(repo.name || '');
            var url = escapeHtml(repo.html_url || '#');
            var desc = escapeHtml(repo.description || 'Geen omschrijving.');
            var stars = typeof repo.stargazers_count === 'number' ? repo.stargazers_count : 0;
            return '' +
                '<a class="gh-repo" href="' + url + '" target="_blank" rel="noopener noreferrer">' +
                '  <div class="gh-repo__head">' +
                '    <span class="gh-repo__name">' + name + '</span>' +
                '    <span class="gh-repo__stars"><i data-lucide="star"></i>' + stars + '</span>' +
                '  </div>' +
                '  <p class="gh-repo__desc">' + desc + '</p>' +
                '</a>';
        }).join('');

        container.innerHTML = html;

        if (window.lucide && typeof window.lucide.createIcons === 'function') {
            safe(function () { window.lucide.createIcons(); });
        }
    }

    function hideContainer(container) {
        if (!container) return;
        container.style.display = 'none';
    }

    function initGithubRepos() {
        var container = document.querySelector('[data-github-repos]');
        if (!container) return;

        var user = container.getAttribute('data-github-repos') || 'robinbril';
        var url = 'https://api.github.com/users/' +
            encodeURIComponent(user) +
            '/repos?sort=updated&per_page=3';

        if (typeof fetch !== 'function') {
            hideContainer(container);
            return;
        }

        fetch(url, { headers: { 'Accept': 'application/vnd.github+json' } })
            .then(function (res) {
                if (!res || !res.ok) throw new Error('gh-api-' + (res && res.status));
                return res.json();
            })
            .then(function (data) {
                if (!Array.isArray(data)) { hideContainer(container); return; }
                var repos = data.filter(function (r) { return r && !r.fork; }).slice(0, 3);
                renderRepos(container, repos);
            })
            .catch(function () {
                hideContainer(container);
            });
    }

    function init() {
        safe(initScrollToTop);
        safe(initGithubRepos);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();
