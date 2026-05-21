/* ============================================================
   TIETJEN ENTERPRISE — INTERACTIONS
   GSAP · ScrollTrigger · Lenis · SplitText · Custom Cursor
   ============================================================ */

(function () {
    'use strict';

    document.documentElement.classList.remove('no-js');

    // Wait for GSAP + plugins to be available (loaded via CDN with `defer`)
    function ready(fn) {
        if (document.readyState !== 'loading') return fn();
        document.addEventListener('DOMContentLoaded', fn);
    }

    function whenLoaded() {
        // ============ GSAP + ScrollTrigger ============
        const hasGSAP = typeof window.gsap !== 'undefined';
        const hasST = hasGSAP && typeof window.ScrollTrigger !== 'undefined';

        if (hasST) gsap.registerPlugin(ScrollTrigger);

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // ============ Anchor scroll (native, no Lenis) ============
        // Native scroll = instant frame budget. CSS `html { scroll-behavior: smooth }`
        // handles in-page anchors smoothly without a JS smooth-scroll lib.
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', e => {
                const href = link.getAttribute('href');
                if (href === '#' || href.length < 2) return;
                const target = document.querySelector(href);
                if (!target) return;
                e.preventDefault();
                const top = target.getBoundingClientRect().top + window.pageYOffset - 80;
                window.scrollTo({ top, behavior: 'smooth' });
            });
        });

        // ============ Nav scroll state ============
        const nav = document.getElementById('nav');
        const updateNav = () => nav && nav.classList.toggle('scrolled', window.scrollY > 60);
        updateNav();
        window.addEventListener('scroll', updateNav, { passive: true });

        // ============ Geneva clock ============
        const navTime = document.getElementById('navTime');
        function tick() {
            if (!navTime) return;
            const now = new Date();
            const geneva = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Zurich' }));
            const hh = String(geneva.getHours()).padStart(2, '0');
            const mm = String(geneva.getMinutes()).padStart(2, '0');
            navTime.textContent = `GENEVA — ${hh}:${mm}`;
        }
        tick();
        setInterval(tick, 30000);

        // ============ Custom cursor ============
        // Self-throttling: only RAF while the mouse is actually moving. When idle,
        // the loop halts so it doesn't compete with scroll for frame budget.
        const cursor = document.getElementById('cursor');
        const dot = document.getElementById('cursorDot');
        const supportsHover = window.matchMedia('(hover: hover)').matches;

        if (cursor && dot && supportsHover) {
            let mx = window.innerWidth / 2, my = window.innerHeight / 2;
            let cx = mx, cy = my;
            let dx = mx, dy = my;
            let rafId = null;
            let lastMove = 0;

            function loop() {
                cx += (mx - cx) * 0.22;
                cy += (my - cy) * 0.22;
                dx += (mx - dx) * 0.4;
                dy += (my - dy) * 0.4;
                cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`;
                dot.style.transform = `translate3d(${dx}px, ${dy}px, 0) translate(-50%, -50%)`;
                // Halt loop when we're close enough AND no movement in 250ms
                const settled = Math.abs(mx - cx) < 0.2 && Math.abs(my - cy) < 0.2;
                if (settled && performance.now() - lastMove > 250) {
                    rafId = null;
                } else {
                    rafId = requestAnimationFrame(loop);
                }
            }

            window.addEventListener('mousemove', e => {
                mx = e.clientX; my = e.clientY;
                lastMove = performance.now();
                if (rafId === null) rafId = requestAnimationFrame(loop);
            }, { passive: true });

            document.querySelectorAll('[data-cursor]').forEach(el => {
                const state = el.getAttribute('data-cursor');
                el.addEventListener('mouseenter', () => cursor.classList.add('is-' + state));
                el.addEventListener('mouseleave', () => cursor.classList.remove('is-' + state));
            });

            window.addEventListener('mouseout', e => {
                if (!e.relatedTarget) { cursor.style.opacity = '0'; dot.style.opacity = '0'; }
            });
            window.addEventListener('mouseover', () => {
                cursor.style.opacity = '1'; dot.style.opacity = '1';
            });
        }

        // ============ HERO entrance ============
        if (hasGSAP && !prefersReducedMotion) {
            // Hide initial state on JS-capable browsers
            gsap.set('.hero-eyebrow, .hero-line, .hero-sub, .hero-actions .btn, .hero-disciplines', {
                opacity: 0,
                y: 30,
            });
            gsap.set('.hero-corner', { opacity: 0, scale: 0.4 });

            const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

            tl.to('.hero-corner',       { opacity: 0.5, scale: 1,     duration: 0.7, stagger: 0.06 }, 0.1)
              .to('.hero-eyebrow',      { opacity: 1,   y: 0,         duration: 0.8 }, 0.2)
              .to('.hero-line',         { opacity: 1,   y: 0,         duration: 1.1, stagger: 0.14 }, 0.35)
              .to('.hero-sub',          { opacity: 1,   y: 0,         duration: 0.8 }, 0.9)
              .to('.hero-actions .btn', { opacity: 1,   y: 0,         duration: 0.7, stagger: 0.1  }, 1.1)
              .to('.hero-disciplines',  { opacity: 1,   y: 0,         duration: 0.8 }, 1.35);
        } else {
            // No JS / no GSAP / reduced motion → guarantee elements visible
            document.querySelectorAll('.hero-eyebrow, .hero-line, .hero-sub, .hero-actions .btn, .hero-disciplines')
                .forEach(el => { el.style.opacity = '1'; });
        }

        // ============ Section reveals ============
        if (hasST && !prefersReducedMotion) {
            gsap.utils.toArray('[data-reveal]').forEach((el, i) => {
                gsap.fromTo(el,
                    { y: 60, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 1.1,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: el,
                            start: 'top 85%',
                            toggleActions: 'play none none none',
                        },
                    }
                );
            });

            // Section-title gentle rise
            gsap.utils.toArray('.section-title').forEach(title => {
                gsap.fromTo(title,
                    { y: 40, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 1,
                        ease: 'power3.out',
                        scrollTrigger: { trigger: title, start: 'top 85%' },
                    }
                );
            });

            // Section-label flick
            gsap.utils.toArray('.section-label').forEach(label => {
                gsap.from(label, {
                    opacity: 0,
                    x: -16,
                    duration: 0.7,
                    ease: 'power2.out',
                    scrollTrigger: { trigger: label, start: 'top 90%' },
                });
            });

            // Hero video parallax removed — scrub-driven transforms on a 25MB
            // looping video cost too many paints per scroll event. The vignette
            // + tint already give the cinematic feel without movement.
        }

        // ============ FAQ accordion ============
        document.querySelectorAll('.faq-question').forEach(btn => {
            btn.addEventListener('click', () => {
                const item = btn.closest('.faq-item');
                const isActive = item.classList.contains('active');
                document.querySelectorAll('.faq-item.active').forEach(open => {
                    open.classList.remove('active');
                    const q = open.querySelector('.faq-question');
                    if (q) q.setAttribute('aria-expanded', 'false');
                });
                if (!isActive) {
                    item.classList.add('active');
                    btn.setAttribute('aria-expanded', 'true');
                }
            });
        });

        // ============ Magnetic CTA buttons ============
        if (supportsHover && !prefersReducedMotion) {
            document.querySelectorAll('.btn').forEach(btn => {
                btn.addEventListener('mousemove', e => {
                    const rect = btn.getBoundingClientRect();
                    const x = e.clientX - rect.left - rect.width / 2;
                    const y = e.clientY - rect.top - rect.height / 2;
                    btn.style.transform = `translate(${x * 0.15}px, ${y * 0.25}px)`;
                });
                btn.addEventListener('mouseleave', () => {
                    btn.style.transform = '';
                });
            });
        }

    } // whenLoaded

    // Boot — `defer` guarantees GSAP/Lenis are parsed before this script runs,
    // so we can call whenLoaded synchronously. (Wrapping in rAF was fragile —
    // background tabs / hidden iframes throttle rAF and the boot never fires.)
    ready(whenLoaded);

})();
