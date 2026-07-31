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

        // The nav slot used to run a live clock pinned to a Swiss timezone. That
        // borrowed a maison's authority, which is the opposite of the heritage
        // angle: these brands are independent and their own origin is the asset.
        // The slot is static markup now, so there is nothing left to tick.

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

        // ============ Hero video: attach after load ============
        // The clip is ~24MB. Leaving it in the markup meant it competed with
        // first paint; the poster covers the gap and the source lands later.
        const heroVideo = document.querySelector('.hero-video[data-src]');
        if (heroVideo && !prefersReducedMotion) {
            const attachHero = () => {
                heroVideo.src = heroVideo.dataset.src;
                heroVideo.load();
                heroVideo.play().catch(() => { /* poster stays; no autoplay allowed */ });
            };
            if (document.readyState === 'complete') setTimeout(attachHero, 250);
            else window.addEventListener('load', () => setTimeout(attachHero, 250));
        }

        // ============ Reel: click-to-play covers ============
        // Nothing in the reel downloads until a visitor asks for it.
        document.querySelectorAll('.work-play').forEach(btn => {
            const item = btn.closest('.work-item');
            const video = item && item.querySelector('video[data-src]');
            if (!video) return;

            btn.addEventListener('click', () => {
                if (!video.src) {
                    video.src = video.dataset.src;
                    video.load();
                }
                video.play().then(() => {
                    item.classList.add('is-playing');
                    if (typeof gtag === 'function') {
                        const title = item.querySelector('h3');
                        gtag('event', 'work_play', {
                            work_title: title ? title.textContent.trim() : 'unknown'
                        });
                    }
                }).catch(() => {});
            });
        });

        // ============ Brief form ============
        // Paste the free key from web3forms.com here. While it is the placeholder
        // the form degrades to an email draft instead of silently failing.
        const WEB3FORMS_KEY = '0f6114a5-157f-43f8-ae6f-12cf0d306cf4';
        const CONTACT_EMAIL = 'wolftietjen@gmail.com';

        const briefForm = document.getElementById('briefForm');
        const formStatus = document.getElementById('formStatus');

        if (briefForm) {
            const setError = (field, msg) => {
                const wrap = field.closest('.field');
                wrap.classList.toggle('has-error', Boolean(msg));
                const slot = wrap.querySelector('.field-error');
                if (slot) slot.textContent = msg || '';
            };

            const validate = () => {
                let ok = true;
                briefForm.querySelectorAll('input:not([name="botcheck"]):not([type="hidden"]), textarea').forEach(f => {
                    const v = f.value.trim();
                    let msg = '';
                    if (!v) msg = 'This one is required.';
                    else if (f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
                        msg = 'That email does not look right.';
                    }
                    if (msg) ok = false;
                    setError(f, msg);
                });
                return ok;
            };

            briefForm.querySelectorAll('input:not([type="hidden"]), textarea').forEach(f => {
                f.addEventListener('input', () => setError(f, ''));
            });

            briefForm.addEventListener('submit', async e => {
                e.preventDefault();
                formStatus.className = 'form-status';
                // Honeypot tripped → pretend success, drop the message.
                if (briefForm.querySelector('[name="botcheck"]').checked) {
                    briefForm.reset();
                    formStatus.textContent = 'Sent. I reply within one business day.';
                    formStatus.classList.add('is-ok');
                    return;
                }

                if (!validate()) {
                    formStatus.textContent = 'Check the highlighted fields.';
                    formStatus.classList.add('is-bad');
                    return;
                }

                const data = Object.fromEntries(new FormData(briefForm).entries());
                const submit = briefForm.querySelector('.form-submit');

                // No key yet → hand the message to their mail client rather than
                // dropping it into a void.
                if (WEB3FORMS_KEY === 'YOUR_ACCESS_KEY_HERE') {
                    const subject = encodeURIComponent(`Brief from ${data.brand}`);
                    const body = encodeURIComponent(
                        `Name: ${data.name}\nBrand: ${data.brand}\nEmail: ${data.email}\n\n${data.message}`
                    );
                    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
                    formStatus.textContent = 'Opening your email app.';
                    return;
                }

                submit.setAttribute('disabled', '');
                formStatus.textContent = 'Sending.';

                try {
                    const res = await fetch('https://api.web3forms.com/submit', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                        body: JSON.stringify({
                            access_key: WEB3FORMS_KEY,
                            subject: `Brief from ${data.brand}`,
                            ...data
                        })
                    });
                    const json = await res.json();
                    if (!json.success) throw new Error(json.message || 'failed');

                    briefForm.reset();
                    formStatus.textContent = 'Sent. I reply within one business day.';
                    formStatus.classList.add('is-ok');
                    if (typeof gtag === 'function') {
                        gtag('event', 'generate_lead', { method: 'brief_form' });
                    }
                } catch (err) {
                    formStatus.textContent = `That did not send. Email me at ${CONTACT_EMAIL}.`;
                    formStatus.classList.add('is-bad');
                } finally {
                    submit.removeAttribute('disabled');
                }
            });
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
