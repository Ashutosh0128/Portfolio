/**
 * Ashutosh Patil — Portfolio Script
 * Features: Nav scroll, GSAP reveal animations, project filter,
 * GitHub contribution grid, clipboard copy, toast alerts,
 * contact form with draft caching, scroll-to-top, project image sliders.
 */

document.addEventListener('DOMContentLoaded', () => {

    // Register GSAP ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    // ==========================================
    // 1. Navigation — Scroll State & Mobile Menu
    // ==========================================
    const siteHeader = document.getElementById('site-header');
    const navToggle = document.getElementById('nav-toggle');
    const navMobile = document.getElementById('nav-mobile');
    const navLinks = document.querySelectorAll('#nav-links a, .footer-nav a');
    const mobileNavLinks = document.querySelectorAll('.nav-mobile-link');

    // Scroll: add scrolled class to header
    const handleHeaderScroll = () => {
        if (window.scrollY > 24) {
            siteHeader.classList.add('scrolled');
        } else {
            siteHeader.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', handleHeaderScroll, { passive: true });
    handleHeaderScroll();

    // Mobile hamburger toggle
    if (navToggle && navMobile) {
        navToggle.addEventListener('click', () => {
            const isOpen = navMobile.classList.toggle('open');
            navToggle.classList.toggle('open', isOpen);
            navToggle.setAttribute('aria-expanded', String(isOpen));
        });

        // Close mobile nav when a link is clicked
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMobile.classList.remove('open');
                navToggle.classList.remove('open');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!siteHeader.contains(e.target) && navMobile.classList.contains('open')) {
                navMobile.classList.remove('open');
                navToggle.classList.remove('open');
                navToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // ==========================================
    // 2. Scroll Progress Bar
    // ==========================================
    const scrollProgressBar = document.getElementById('scroll-progress-bar');

    const updateScrollProgress = () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        if (scrollProgressBar) scrollProgressBar.style.width = `${pct}%`;
    };

    window.addEventListener('scroll', updateScrollProgress, { passive: true });

    // ==========================================
    // 3. Active Nav Link Tracking
    // ==========================================
    const sections = document.querySelectorAll('section[id]');
    const desktopNavLinks = document.querySelectorAll('#nav-links a[href^="#"]');

    const updateActiveNav = () => {
        const scrollY = window.scrollY + 100;
        let currentId = '';

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            if (scrollY >= top && scrollY < top + height) {
                currentId = section.getAttribute('id');
            }
        });

        desktopNavLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === `#${currentId}`) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    };

    window.addEventListener('scroll', updateActiveNav, { passive: true });

    // ==========================================
    // 4. GSAP Hero Entrance
    // ==========================================
    const heroTimeline = gsap.timeline({ delay: 0.1 });

    heroTimeline.fromTo('.hero-availability',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }
    );

    heroTimeline.fromTo('.hero-name',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' },
        '-=0.5'
    );

    heroTimeline.fromTo('.hero-role, .hero-desc, .hero-open',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', stagger: 0.1 },
        '-=0.6'
    );

    heroTimeline.fromTo('.hero-actions',
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' },
        '-=0.4'
    );

    heroTimeline.fromTo('.hero-photo-frame',
        { scale: 0.95, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.0, ease: 'power3.out' },
        '-=1.0'
    );

    heroTimeline.fromTo('.hero-scroll',
        { opacity: 0 },
        { opacity: 1, duration: 0.6, ease: 'power2.out' },
        '-=0.3'
    );

    // ==========================================
    // 5. GSAP ScrollTrigger Section Reveals
    // ==========================================
    const revealElements = document.querySelectorAll('.reveal-fade-up, .reveal-fade-left, .reveal-fade-right');

    revealElements.forEach(el => {
        let xOffset = 0;
        let yOffset = 0;

        if (el.classList.contains('reveal-fade-up')) yOffset = 32;
        if (el.classList.contains('reveal-fade-left')) xOffset = -32;
        if (el.classList.contains('reveal-fade-right')) xOffset = 32;

        gsap.fromTo(el,
            { opacity: 0, x: xOffset, y: yOffset },
            {
                scrollTrigger: {
                    trigger: el,
                    start: 'top 90%',
                    toggleActions: 'play none none none'
                },
                opacity: 1,
                x: 0,
                y: 0,
                duration: 0.9,
                ease: 'power3.out'
            }
        );
    });

    // ==========================================
    // 6. Project Filter
    // ==========================================
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');

            projectCards.forEach(card => {
                const category = card.getAttribute('data-category');
                const show = filter === 'all' || category === filter;

                if (show) {
                    card.style.display = 'flex';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = '';
                    }, 30);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.97)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 280);
                }
            });
        });
    });

    // ==========================================
    // 7. Project Image Sliders
    // ==========================================
    const initProjectSliders = () => {
        const sliderContainers = document.querySelectorAll('.project-slider-container');

        sliderContainers.forEach(container => {
            const slider = container.querySelector('.project-slider');
            const slides = container.querySelectorAll('.slide');
            const prevBtn = container.querySelector('.slider-control.prev');
            const nextBtn = container.querySelector('.slider-control.next');
            const dots = container.querySelectorAll('.slider-dots .dot');

            if (!slider || slides.length === 0) return;

            let currentIndex = 0;
            const total = slides.length;

            const updateSlider = () => {
                slider.style.transform = `translateX(-${currentIndex * 100}%)`;
                dots.forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));
            };

            const next = () => { currentIndex = (currentIndex + 1) % total; updateSlider(); };
            const prev = () => { currentIndex = (currentIndex - 1 + total) % total; updateSlider(); };

            if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); next(); resetAutoplay(); });
            if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); prev(); resetAutoplay(); });

            dots.forEach(dot => {
                dot.addEventListener('click', (e) => {
                    e.stopPropagation();
                    currentIndex = parseInt(dot.getAttribute('data-index')) || 0;
                    updateSlider();
                    resetAutoplay();
                });
            });

            let autoplay = setInterval(next, 4500);

            const resetAutoplay = () => {
                clearInterval(autoplay);
                autoplay = setInterval(next, 4500);
            };

            container.addEventListener('mouseenter', () => clearInterval(autoplay));
            container.addEventListener('mouseleave', () => { autoplay = setInterval(next, 4500); });
        });
    };

    initProjectSliders();

    // ==========================================
    // 8. GitHub Contribution Grid
    // ==========================================
    const calendarGrid = document.getElementById('github-calendar-grid');
    if (calendarGrid) {
        const totalDays = 53 * 7;

        for (let i = 0; i < totalDays; i++) {
            const day = document.createElement('div');
            day.classList.add('calendar-day');

            const r = Math.random();
            if (r > 0.88) day.classList.add('lvl-4');
            else if (r > 0.75) day.classList.add('lvl-3');
            else if (r > 0.55) day.classList.add('lvl-2');
            else if (r > 0.35) day.classList.add('lvl-1');
            else day.classList.add('lvl-0');

            calendarGrid.appendChild(day);
        }
    }

    // ==========================================
    // 9. Toast Notifications
    // ==========================================
    const toastContainer = document.getElementById('toast-container');

    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        const icon = type === 'success' ? 'fa-circle-check' : 'fa-circle-info';
        toast.innerHTML = `
            <i class="fa-solid ${icon}"></i>
            <span class="toast-message">${message}</span>
        `;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    }

    // ==========================================
    // 10. Clipboard Copy Buttons
    // ==========================================
    const copyButtons = document.querySelectorAll('.copy-btn');
    copyButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const text = btn.getAttribute('data-clipboard');
            if (!text) return;

            navigator.clipboard.writeText(text)
                .then(() => showToast(`Copied to clipboard!`))
                .catch(() => showToast('Could not copy.', 'info'));
        });
    });

    // ==========================================
    // 11. Contact Form — Draft Caching & Submit
    // ==========================================
    const contactForm = document.getElementById('contact-form');
    const submitBtn = document.getElementById('form-submit-btn');
    const formFields = ['form-name', 'form-email', 'form-subject', 'form-message'];

    // Restore drafts
    formFields.forEach(id => {
        const input = document.getElementById(id);
        if (!input) return;
        const cached = localStorage.getItem(`draft_${id}`);
        if (cached) input.value = cached;
        input.addEventListener('input', () => {
            localStorage.setItem(`draft_${id}`, input.value);
        });
    });

    if (contactForm && submitBtn) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const btnText = submitBtn.querySelector('.btn-text');
            const btnIcon = submitBtn.querySelector('i');
            const originalText = btnText.textContent;
            const originalIcon = btnIcon.className;

            btnText.textContent = 'Sending...';
            btnIcon.className = 'fa-solid fa-spinner fa-spin';
            submitBtn.disabled = true;

            setTimeout(() => {
                showToast('Message sent successfully. Thank you!');

                contactForm.reset();
                formFields.forEach(id => localStorage.removeItem(`draft_${id}`));

                btnText.textContent = originalText;
                btnIcon.className = originalIcon;
                submitBtn.disabled = false;
            }, 1600);
        });
    }

    // ==========================================
    // 12. Scroll-to-top Button with SVG Progress
    // ==========================================
    const scrollToTopBtn = document.getElementById('scroll-to-top-btn');
    const progressPath = document.querySelector('.progress-circle path');

    if (scrollToTopBtn && progressPath) {
        const pathLength = progressPath.getTotalLength();
        progressPath.style.strokeDasharray = `${pathLength} ${pathLength}`;
        progressPath.style.strokeDashoffset = pathLength;

        const updateScrollTopBtn = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;

            scrollToTopBtn.classList.toggle('visible', scrollTop > 300);

            const progress = pathLength - (docHeight > 0 ? (scrollTop * pathLength) / docHeight : 0);
            progressPath.style.strokeDashoffset = progress;
        };

        window.addEventListener('scroll', updateScrollTopBtn, { passive: true });
        updateScrollTopBtn();

        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

});
