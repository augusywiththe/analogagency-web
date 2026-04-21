// ========================================
// ANALOG AGENCY — FUNNEL SCRIPTS
// ========================================

document.addEventListener('DOMContentLoaded', () => {

    // ---- NAV SCROLL EFFECT ----
    const nav = document.getElementById('nav');
    window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 60);
    });

    // ---- SMOOTH SCROLL FOR ANCHOR LINKS ----
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', e => {
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                e.preventDefault();
                const offset = 80;
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // ---- COUNTER ANIMATION ----
    const counters = document.querySelectorAll('.metric-number[data-target]');
    let countersDone = false;

    function animateCounters() {
        if (countersDone) return;
        counters.forEach(counter => {
            const target = +counter.dataset.target;
            const duration = 2000;
            const start = performance.now();

            function update(now) {
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);
                // ease out cubic
                const ease = 1 - Math.pow(1 - progress, 3);
                counter.textContent = Math.floor(target * ease);
                if (progress < 1) {
                    requestAnimationFrame(update);
                } else {
                    counter.textContent = target;
                }
            }
            requestAnimationFrame(update);
        });
        countersDone = true;
    }

    // trigger counters when hero metrics are visible
    const metricsEl = document.querySelector('.hero-metrics');
    if (metricsEl) {
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                animateCounters();
                observer.disconnect();
            }
        }, { threshold: 0.5 });
        observer.observe(metricsEl);
    }

    // ---- SCROLL REVEAL ANIMATIONS ----
    const revealElements = document.querySelectorAll(
        '.problem-card, .solution-card, .work-item, .process-step, .testimonial-card, .faq-item, .booking-form-wrapper, .booking-calendly, .section-label, .section-title, .section-desc'
    );

    revealElements.forEach(el => el.classList.add('reveal'));

    const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    revealElements.forEach(el => revealObserver.observe(el));

    // ---- FAQ ACCORDION ----
    document.querySelectorAll('.faq-question').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.closest('.faq-item');
            const isActive = item.classList.contains('active');

            // close all
            document.querySelectorAll('.faq-item.active').forEach(open => {
                open.classList.remove('active');
                open.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
            });

            // open clicked (if wasn't already open)
            if (!isActive) {
                item.classList.add('active');
                btn.setAttribute('aria-expanded', 'true');
            }
        });
    });

    // ---- CONTACT FORM HANDLING ----
    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', e => {
            e.preventDefault();

            const formData = new FormData(form);
            const data = Object.fromEntries(formData);

            // Log form data (replace with your backend endpoint)
            console.log('Form submitted:', data);

            // Show success state
            const wrapper = form.closest('.booking-form-wrapper');
            wrapper.innerHTML = `
                <div class="form-success">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48">
                        <path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <h3>Message Sent!</h3>
                    <p>We'll get back to you within 24 hours. In the meantime, feel free to book a call directly.</p>
                </div>
            `;
        });
    }

});
