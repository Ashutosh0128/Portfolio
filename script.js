/**
 * Ashutosh Patil Portfolio Core Interactions Script
 * Features: Viewport Reveal Observers, Dynamic Text Typing, Project Grid Filter, 
 * Simulated GitHub Calendar Grid, Toast Warnings & Copy triggers, Form Caching, Scroll Rings.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Register GSAP ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    // ==========================================
    // Preloader Progress & Staggered Hero Entrance
    // ==========================================
    const preloader = document.getElementById('preloader');
    const preloaderBar = document.querySelector('.preloader-bar');
    const preloaderPercent = document.querySelector('.preloader-percent');
    
    let loaderProgress = 0;
    let isWindowLoaded = false;
    
    const updateLoader = () => {
        if (loaderProgress < 100) {
            // Speed up if window is loaded, else simulate progress
            const increment = isWindowLoaded ? 8 : Math.random() * 2.5 + 0.8;
            loaderProgress = Math.min(100, loaderProgress + increment);
            
            if (preloaderBar) preloaderBar.style.width = `${loaderProgress}%`;
            if (preloaderPercent) preloaderPercent.textContent = `${Math.floor(loaderProgress)}%`;
            
            if (loaderProgress < 100) {
                requestAnimationFrame(updateLoader);
            } else {
                // End loading and animate out
                setTimeout(exitPreloader, 300);
            }
        }
    };

    const exitPreloader = () => {
        if (!preloader) return;
        
        // GSAP fade out preloader
        gsap.to(preloader, {
            opacity: 0,
            duration: 0.8,
            ease: "power2.out",
            onComplete: () => {
                preloader.style.visibility = "hidden";
                // Trigger hero section animations after preloader is gone
                animateHeroEntrance();
            }
        });
    };

    const animateHeroEntrance = () => {
        const heroTimeline = gsap.timeline();
        
        heroTimeline.fromTo(".badge-recruiter", 
            { y: 30, opacity: 0 }, 
            { y: 0, opacity: 1, duration: 0.8, ease: "power4.out" }
        );
        
        heroTimeline.fromTo(".hero-title", 
            { y: 40, opacity: 0 }, 
            { y: 0, opacity: 1, duration: 1.0, ease: "power4.out" },
            "-=0.6"
        );
        
        heroTimeline.fromTo(".hero-subtitle", 
            { y: 30, opacity: 0 }, 
            { y: 0, opacity: 1, duration: 0.8, ease: "power4.out" },
            "-=0.6"
        );
        
        heroTimeline.fromTo(".hero-tagline", 
            { y: 20, opacity: 0 }, 
            { y: 0, opacity: 1, duration: 0.8, ease: "power4.out" },
            "-=0.6"
        );
        
        heroTimeline.fromTo(".hero-stats", 
            { y: 20, opacity: 0 }, 
            { y: 0, opacity: 1, duration: 0.8, ease: "power4.out" },
            "-=0.6"
        );
        
        heroTimeline.fromTo(".hero-actions .btn", 
            { y: 20, opacity: 0 }, 
            { y: 0, opacity: 1, duration: 0.8, ease: "power4.out", stagger: 0.1 },
            "-=0.6"
        );
        
        heroTimeline.fromTo(".hero-visual", 
            { scale: 0.92, opacity: 0 }, 
            { scale: 1, opacity: 1, duration: 1.2, ease: "power4.out" },
            "-=1.2"
        );
    };

    // Start loader simulation
    requestAnimationFrame(updateLoader);

    // Track window load event
    window.addEventListener('load', () => {
        isWindowLoaded = true;
    });

    // ==========================================
    // Custom Trailing Cursor Logic (Lerp Physics)
    // ==========================================
    const cursorDot = document.getElementById('custom-cursor-dot');
    const cursorCircle = document.getElementById('custom-cursor-circle');
    
    let mouse = { x: -100, y: -100 };
    let dotPos = { x: -100, y: -100 };
    let circlePos = { x: -100, y: -100 };
    
    const lerp = (start, end, amt) => (1 - amt) * start + amt * end;
    
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
    
    const updateCursor = () => {
        dotPos.x = lerp(dotPos.x, mouse.x, 0.35);
        dotPos.y = lerp(dotPos.y, mouse.y, 0.35);
        
        circlePos.x = lerp(circlePos.x, mouse.x, 0.15);
        circlePos.y = lerp(circlePos.y, mouse.y, 0.15);
        
        if (cursorDot) {
            cursorDot.style.left = `${dotPos.x}px`;
            cursorDot.style.top = `${dotPos.y}px`;
        }
        
        if (cursorCircle) {
            cursorCircle.style.left = `${circlePos.x}px`;
            cursorCircle.style.top = `${circlePos.y}px`;
        }
        
        requestAnimationFrame(updateCursor);
    };
    
    if (window.matchMedia('(pointer: fine)').matches) {
        requestAnimationFrame(updateCursor);
        
        const hoverables = document.querySelectorAll('a, button, [role="button"], input, textarea, select, .dock-item, .card, .magic-bento-card');
        hoverables.forEach(el => {
            el.addEventListener('mouseenter', () => {
                if (cursorCircle) cursorCircle.classList.add('hovered');
            });
            el.addEventListener('mouseleave', () => {
                if (cursorCircle) cursorCircle.classList.remove('hovered');
            });
        });
        
        window.addEventListener('mousedown', () => {
            if (cursorCircle) cursorCircle.classList.add('click');
        });
        
        window.addEventListener('mouseup', () => {
            if (cursorCircle) cursorCircle.classList.remove('click');
        });
    } else {
        if (cursorDot) cursorDot.style.display = 'none';
        if (cursorCircle) cursorCircle.style.display = 'none';
    }

    // ==========================================
    // Magnetic Button Interactions (GSAP Spring)
    // ==========================================
    if (window.matchMedia('(pointer: fine)').matches) {
        const magnetics = document.querySelectorAll('.btn, .social-link-btn, .link-circle-btn, .dock-item');
        magnetics.forEach(el => {
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                gsap.to(el, {
                    x: x * 0.35,
                    y: y * 0.35,
                    duration: 0.3,
                    ease: "power2.out"
                });
                
                const icon = el.querySelector('i');
                if (icon) {
                    gsap.to(icon, {
                        x: x * 0.15,
                        y: y * 0.15,
                        duration: 0.3,
                        ease: "power2.out"
                    });
                }
            });
            
            el.addEventListener('mouseleave', () => {
                gsap.to(el, {
                    x: 0,
                    y: 0,
                    duration: 0.6,
                    ease: "elastic.out(1, 0.5)"
                });
                
                const icon = el.querySelector('i');
                if (icon) {
                    gsap.to(icon, {
                        x: 0,
                        y: 0,
                        duration: 0.6,
                        ease: "elastic.out(1, 0.5)"
                    });
                }
            });
        });
    }

    // ==========================================
    // 1. Navigation Scroll Progress & Tracking Mechanics
    // ==========================================
    const scrollProgressBar = document.getElementById('scroll-progress-bar');
    const sections = document.querySelectorAll('section');

    // Scroll percentage tracker
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        
        // Progress bar indicator
        if (scrollProgressBar) {
            scrollProgressBar.style.width = `${scrollPercent}%`;
        }

        // Active link tracking
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120; // Offset matches top position + padding
            const sectionHeight = section.offsetHeight;
            if (scrollTop >= sectionTop && scrollTop < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        if (currentSectionId) {
            updateActiveNav(currentSectionId);
        }
    });

    function updateActiveNav(activeId) {
        // Application Dock items update
        const dockItems = document.querySelectorAll('.dock-item');
        dockItems.forEach(item => {
            if (item.getAttribute('href') === `#${activeId}`) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    // ==========================================
    // 3. Multi-Phrase Text Typing (Hero Title)
    // ==========================================
    const typingElement = document.getElementById('typing-text');
    if (typingElement) {
        const phrases = [
            "Full Stack Developer",
            "Django Backend Expert",
            "React & UI Architect",
            "Python Specialist"
        ];
        
        let phraseIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typingSpeed = 100;

        const type = () => {
            const currentPhrase = phrases[phraseIndex];
            
            if (isDeleting) {
                // Delete characters
                typingElement.textContent = currentPhrase.substring(0, charIndex - 1);
                charIndex--;
                typingSpeed = 50; // Erase faster
            } else {
                // Type characters
                typingElement.textContent = currentPhrase.substring(0, charIndex + 1);
                charIndex++;
                typingSpeed = 120; // Standard typing pace
            }

            // Word finished typing
            if (!isDeleting && charIndex === currentPhrase.length) {
                isDeleting = true;
                typingSpeed = 2000; // Pause at full word
            } 
            // Word finished erasing
            else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                phraseIndex = (phraseIndex + 1) % phrases.length; // Rotate phrase
                typingSpeed = 400; // Pause before typing new word
            }

            setTimeout(type, typingSpeed);
        };

        // Start typing routine
        setTimeout(type, 1000);
    }

    // ==========================================
    // 4. GSAP ScrollTrigger Entrance Animations
    // ==========================================
    const revealElements = document.querySelectorAll('.reveal-fade-up, .reveal-fade-left, .reveal-fade-right');
    const skillBars = document.querySelectorAll('.progress-fill');

    revealElements.forEach(el => {
        let xOffset = 0;
        let yOffset = 0;
        if (el.classList.contains('reveal-fade-up')) yOffset = 45;
        if (el.classList.contains('reveal-fade-left')) xOffset = -45;
        if (el.classList.contains('reveal-fade-right')) xOffset = 45;

        gsap.fromTo(el, 
            { 
                opacity: 0, 
                x: xOffset, 
                y: yOffset 
            }, 
            {
                scrollTrigger: {
                    trigger: el,
                    start: "top 88%",
                    toggleActions: "play none none none"
                },
                opacity: 1,
                x: 0,
                y: 0,
                duration: 1.2,
                ease: "power4.out",
                onComplete: () => {
                    if (el.id === 'skills') {
                        animateSkillBars();
                    }
                }
            }
        );
    });

    const skillsSection = document.getElementById('skills');
    if (skillsSection) {
        ScrollTrigger.create({
            trigger: skillsSection,
            start: "top 80%",
            onEnter: animateSkillBars
        });
    }

    function animateSkillBars() {
        skillBars.forEach(bar => {
            const val = bar.getAttribute('style').match(/--skill-value:\s*(\d+)%/);
            if (val && val[1]) {
                gsap.to(bar, {
                    width: `${val[1]}%`,
                    duration: 1.5,
                    ease: "power4.out"
                });
            }
        });
    }

    // ==========================================
    // 5. Interactive Project Grid Filtering
    // ==========================================
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Toggle active filter button
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            projectCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                
                if (filterValue === 'all' || cardCategory === filterValue) {
                    // Show item with transition
                    card.style.display = 'flex';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    // Hide item with transition
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.9)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 350); // Timeout fits CSS smooth transition duration
                }
            });
        });
    });

    // ==========================================
    // 6. Interactive GitHub Contribution Grid
    // ==========================================
    const calendarGrid = document.getElementById('github-calendar-grid');
    if (calendarGrid) {
        const totalDays = 53 * 7; // 371 days in a github matrix
        
        // Generate mockup active commit frequency
        for (let i = 0; i < totalDays; i++) {
            const dayCell = document.createElement('div');
            dayCell.classList.add('calendar-day');
            
            // Randomly weight commitment frequencies
            const randomVal = Math.random();
            let commitLevel = 'lvl-0';
            
            if (randomVal > 0.88) {
                commitLevel = 'lvl-4'; // Extra dark green glow
            } else if (randomVal > 0.75) {
                commitLevel = 'lvl-3'; // Active green
            } else if (randomVal > 0.55) {
                commitLevel = 'lvl-2'; // Moderate green
            } else if (randomVal > 0.35) {
                commitLevel = 'lvl-1'; // Light green
            }
            
            dayCell.classList.add(commitLevel);
            
            // Add custom visual tooltip for hover state
            const commitsCount = commitLevel === 'lvl-0' ? 'No' : 
                               commitLevel === 'lvl-1' ? '1-2' :
                               commitLevel === 'lvl-2' ? '3-4' :
                               commitLevel === 'lvl-3' ? '5-7' : '8+';
            
            dayCell.setAttribute('title', `${commitsCount} contributions on Day ${i + 1}`);
            calendarGrid.appendChild(dayCell);
        }
    }

    // ==========================================
    // 7. Clipboard copy & custom toast alerts
    // ==========================================
    const copyButtons = document.querySelectorAll('.copy-btn');
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
        
        // Auto remove toast
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => {
                toast.remove();
            }, 400);
        }, 3000);
    }

    copyButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const copyText = btn.getAttribute('data-clipboard');
            if (copyText) {
                navigator.clipboard.writeText(copyText)
                    .then(() => {
                        showToast(`Copied "${copyText}" to clipboard!`);
                    })
                    .catch(() => {
                        showToast('Failed to copy to clipboard.', 'info');
                    });
            }
        });
    });

    // ==========================================
    // 8. Contact Form Handling & Input Caching
    // ==========================================
    const contactForm = document.getElementById('contact-form');
    const submitBtn = document.getElementById('form-submit-btn');

    // Retrieve cached values if user reloads mid-draft
    const formFields = ['form-name', 'form-email', 'form-subject', 'form-message'];
    formFields.forEach(fieldId => {
        const input = document.getElementById(fieldId);
        if (input) {
            // Restore from localStorage
            const cachedVal = localStorage.getItem(`draft_${fieldId}`);
            if (cachedVal) {
                input.value = cachedVal;
            }
            
            // Cache on keyup
            input.addEventListener('keyup', () => {
                localStorage.setItem(`draft_${fieldId}`, input.value);
            });
        }
    });

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Change button state to loading
            const btnText = submitBtn.querySelector('.btn-text');
            const btnIcon = submitBtn.querySelector('i');
            
            const originalText = btnText.textContent;
            const originalIconClass = btnIcon.className;

            // Loading state
            btnText.textContent = "Sending Message...";
            btnIcon.className = "fa-solid fa-spinner fa-spin";
            submitBtn.style.pointerEvents = "none";
            submitBtn.style.opacity = "0.8";

            // Simulate form submission delay
            setTimeout(() => {
                showToast("Thank you! Your message has been sent successfully.");
                
                // Clear inputs and localStorage caches
                contactForm.reset();
                formFields.forEach(fieldId => {
                    localStorage.removeItem(`draft_${fieldId}`);
                });

                // Reset button state
                btnText.textContent = originalText;
                btnIcon.className = originalIconClass;
                submitBtn.style.pointerEvents = "";
                submitBtn.style.opacity = "";
            }, 1800);
        });
    }

    // ==========================================
    // 9. Scroll to Top Indicator Circular Path
    // ==========================================
    const scrollToTopBtn = document.getElementById('scroll-to-top-btn');
    const progressPath = document.querySelector('.progress-circle path');
    
    if (scrollToTopBtn && progressPath) {
        const pathLength = progressPath.getTotalLength();
        
        progressPath.style.strokeDasharray = `${pathLength} ${pathLength}`;
        progressPath.style.strokeDashoffset = pathLength;

        const updateScrollProgress = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            
            // Toggle visibility of the button
            if (scrollTop > 300) {
                scrollToTopBtn.classList.add('visible');
            } else {
                scrollToTopBtn.classList.remove('visible');
            }

            // Update SVG circle stroke offset mapping to page scroll height
            const progress = pathLength - (scrollTop * pathLength) / docHeight;
            progressPath.style.strokeDashoffset = progress;
        };

        window.addEventListener('scroll', updateScrollProgress);
        
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
        
        // Initial call
        updateScrollProgress();
    }

    // ==========================================
    // 10. Application Dock Magnification Logic (React Bits Inspired)
    // ==========================================
    const dockOuter = document.getElementById('portfolio-dock');
    const dockPanel = dockOuter ? dockOuter.querySelector('.dock-panel') : null;
    const dockItems = dockOuter ? dockOuter.querySelectorAll('.dock-item') : [];

    if (dockOuter && dockPanel && dockItems.length > 0) {
        // Read responsive variables on load
        const initialRootStyle = getComputedStyle(document.documentElement);
        const initialBaseItemSize = parseInt(initialRootStyle.getPropertyValue('--dock-item-size')) || 50;
        const lerpFactor = 0.12; // Easing constant for spring physics

        // Initialize state for each dock item
        const itemsState = Array.from(dockItems).map((item, index) => ({
            element: item,
            index: index,
            currentSize: initialBaseItemSize,
            targetSize: initialBaseItemSize
        }));

        let mouseX = Infinity;
        let isHovered = false;

        // Mouse listeners to track position and active state
        dockPanel.addEventListener('mousemove', (e) => {
            isHovered = true;
            mouseX = e.clientX;
        });

        dockPanel.addEventListener('mouseleave', () => {
            isHovered = false;
            mouseX = Infinity;
        });

        const animateDock = () => {
            const viewportCenter = window.innerWidth / 2;
            const totalItems = itemsState.length;
            
            // Read responsive size variables dynamically from root styling on each frame
            const rootStyle = getComputedStyle(document.documentElement);
            const baseItemSize = parseInt(rootStyle.getPropertyValue('--dock-item-size')) || 50;
            const gap = parseInt(rootStyle.getPropertyValue('--dock-gap')) || 12;

            // Proportioned settings for magnification scale
            const magnification = baseItemSize === 50 ? 70 : 50; 
            const distance = baseItemSize === 50 ? 150 : 100; // tighter tracking distance for mobile width

            const totalUnscaledWidth = totalItems * baseItemSize + (totalItems - 1) * gap;
            const unscaledStart = viewportCenter - totalUnscaledWidth / 2;

            itemsState.forEach(state => {
                if (isHovered && mouseX !== Infinity) {
                    // Calculate the unscaled center to prevent dynamic layout feedback jitter
                    const unscaledCenterX = unscaledStart + state.index * (baseItemSize + gap) + baseItemSize / 2;
                    const distX = mouseX - unscaledCenterX;

                    if (Math.abs(distX) < distance) {
                        // Apply cosine interpolation for smooth magnification
                        const factor = Math.cos((distX / distance) * (Math.PI / 2));
                        state.targetSize = baseItemSize + (magnification - baseItemSize) * factor;
                    } else {
                        state.targetSize = baseItemSize;
                    }
                } else {
                    state.targetSize = baseItemSize;
                }

                // Interpolate scale for smooth spring-like feel
                state.currentSize += (state.targetSize - state.currentSize) * lerpFactor;

                // Update DOM styles
                state.element.style.width = `${state.currentSize}px`;
                state.element.style.height = `${state.currentSize}px`;
            });

            requestAnimationFrame(animateDock);
        };

        // Start requestAnimationFrame loop
        animateDock();
    }

    // ==========================================
    // Project Card Image Slider
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
            const totalSlides = slides.length;
            
            const updateSlider = () => {
                slider.style.transform = `translateX(-${currentIndex * 100}%)`;
                
                dots.forEach((dot, index) => {
                    if (index === currentIndex) {
                        dot.classList.add('active');
                    } else {
                        dot.classList.remove('active');
                    }
                });
            };
            
            const showNextSlide = () => {
                currentIndex = (currentIndex + 1) % totalSlides;
                updateSlider();
            };
            
            const showPrevSlide = () => {
                currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
                updateSlider();
            };
            
            if (nextBtn) {
                nextBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    showNextSlide();
                    resetAutoplay();
                });
            }
            
            if (prevBtn) {
                prevBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    showPrevSlide();
                    resetAutoplay();
                });
            }
            
            dots.forEach(dot => {
                dot.addEventListener('click', (e) => {
                    e.stopPropagation();
                    currentIndex = parseInt(dot.getAttribute('data-index')) || 0;
                    updateSlider();
                    resetAutoplay();
                });
            });
            
            // Autoplay (every 4.5 seconds)
            let autoplayInterval = setInterval(showNextSlide, 4500);
            
            const resetAutoplay = () => {
                clearInterval(autoplayInterval);
                autoplayInterval = setInterval(showNextSlide, 4500);
            };
            
            container.addEventListener('mouseenter', () => {
                clearInterval(autoplayInterval);
            });
            
            container.addEventListener('mouseleave', () => {
                resetAutoplay();
            });
        });
    };
    
    initProjectSliders();
});

// ==========================================
// MagicBento Interactive Effects (React Bits Inspired)
// Requires: GSAP (loaded via CDN before this script)
// ==========================================
(function initMagicBento() {
    const GLOW_COLOR = '0, 242, 254'; // Neon Cyan — matches portfolio theme
    const SPOTLIGHT_RADIUS = 300;
    const PARTICLE_COUNT = 12;
    const MOBILE_BREAKPOINT = 768;

    const isMobile = () => window.innerWidth <= MOBILE_BREAKPOINT;

    const bentoGrid = document.getElementById('magic-bento-grid');
    if (!bentoGrid) return;

    const cards = Array.from(bentoGrid.querySelectorAll('.magic-bento-card'));
    if (!cards.length) return;

    // ----------------------------------------
    // A. Global Spotlight
    // ----------------------------------------
    const spotlight = document.createElement('div');
    spotlight.className = 'global-spotlight';
    spotlight.style.cssText = `
        background: radial-gradient(circle,
            rgba(${GLOW_COLOR}, 0.15) 0%,
            rgba(${GLOW_COLOR}, 0.08) 15%,
            rgba(${GLOW_COLOR}, 0.04) 25%,
            rgba(${GLOW_COLOR}, 0.02) 40%,
            rgba(${GLOW_COLOR}, 0.01) 65%,
            transparent 70%
        );
    `;
    document.body.appendChild(spotlight);

    function updateSpotlight(mouseX, mouseY) {
        if (isMobile()) return;
        const section = bentoGrid.closest('.bento-section') || bentoGrid;
        const rect = section.getBoundingClientRect();
        const inside = mouseX >= rect.left && mouseX <= rect.right && mouseY >= rect.top && mouseY <= rect.bottom;

        const proximity = SPOTLIGHT_RADIUS * 0.5;
        const fadeDistance = SPOTLIGHT_RADIUS * 0.75;
        let minDist = Infinity;

        cards.forEach(card => {
            const cr = card.getBoundingClientRect();
            const relX = ((mouseX - cr.left) / cr.width) * 100;
            const relY = ((mouseY - cr.top) / cr.height) * 100;
            card.style.setProperty('--glow-x', `${relX}%`);
            card.style.setProperty('--glow-y', `${relY}%`);

            const cx = cr.left + cr.width / 2;
            const cy = cr.top + cr.height / 2;
            const dist = Math.max(0, Math.hypot(mouseX - cx, mouseY - cy) - Math.max(cr.width, cr.height) / 2);
            minDist = Math.min(minDist, dist);

            let intensity = 0;
            if (dist <= proximity) {
                intensity = 1;
            } else if (dist <= fadeDistance) {
                intensity = (fadeDistance - dist) / (fadeDistance - proximity);
            }
            card.style.setProperty('--glow-intensity', intensity.toString());
            card.style.setProperty('--glow-radius', `${SPOTLIGHT_RADIUS}px`);
        });

        if (!inside) {
            gsap.to(spotlight, { opacity: 0, duration: 0.3, ease: 'power2.out' });
            cards.forEach(c => c.style.setProperty('--glow-intensity', '0'));
            return;
        }

        gsap.to(spotlight, { left: mouseX, top: mouseY, duration: 0.1, ease: 'power2.out' });

        let targetOpacity = 0;
        if (minDist <= proximity) {
            targetOpacity = 0.8;
        } else if (minDist <= fadeDistance) {
            targetOpacity = ((fadeDistance - minDist) / (fadeDistance - proximity)) * 0.8;
        }
        gsap.to(spotlight, { opacity: targetOpacity, duration: targetOpacity > 0 ? 0.2 : 0.5, ease: 'power2.out' });
    }

    document.addEventListener('mousemove', e => updateSpotlight(e.clientX, e.clientY));
    document.addEventListener('mouseleave', () => {
        cards.forEach(c => c.style.setProperty('--glow-intensity', '0'));
        gsap.to(spotlight, { opacity: 0, duration: 0.3, ease: 'power2.out' });
    });

    // ----------------------------------------
    // B. Per-Card: Particles, Tilt, Magnetism, Click Ripple
    // ----------------------------------------
    cards.forEach(card => {
        let isHovered = false;
        let activeParticles = [];
        let particleTimeouts = [];
        const ENABLE_TILT = true;
        const ENABLE_MAGNETISM = true;
        const ENABLE_CLICK = true;

        // --- Particle helpers ---
        function spawnParticles() {
            if (isMobile()) return;
            const { width, height } = card.getBoundingClientRect();
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                const tid = setTimeout(() => {
                    if (!isHovered) return;
                    const p = document.createElement('div');
                    p.className = 'particle';
                    p.style.cssText = `
                        left: ${Math.random() * width}px;
                        top: ${Math.random() * height}px;
                        background: rgba(${GLOW_COLOR}, 1);
                        box-shadow: 0 0 6px rgba(${GLOW_COLOR}, 0.6);
                    `;
                    card.appendChild(p);
                    activeParticles.push(p);

                    gsap.fromTo(p, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' });
                    gsap.to(p, {
                        x: (Math.random() - 0.5) * 100,
                        y: (Math.random() - 0.5) * 100,
                        rotation: Math.random() * 360,
                        duration: 2 + Math.random() * 2,
                        ease: 'none',
                        repeat: -1,
                        yoyo: true
                    });
                    gsap.to(p, {
                        opacity: 0.3,
                        duration: 1.5,
                        ease: 'power2.inOut',
                        repeat: -1,
                        yoyo: true
                    });
                }, i * 80);
                particleTimeouts.push(tid);
            }
        }

        function clearParticles() {
            particleTimeouts.forEach(clearTimeout);
            particleTimeouts = [];
            activeParticles.forEach(p => {
                gsap.to(p, {
                    scale: 0, opacity: 0, duration: 0.3, ease: 'back.in(1.7)',
                    onComplete: () => p.parentNode?.removeChild(p)
                });
            });
            activeParticles = [];
        }

        // --- Mouse Enter ---
        card.addEventListener('mouseenter', () => {
            if (isMobile()) return;
            isHovered = true;
            spawnParticles();
            if (ENABLE_TILT) {
                gsap.to(card, { rotateX: 3, rotateY: 3, duration: 0.3, ease: 'power2.out', transformPerspective: 1000 });
            }
        });

        // --- Mouse Leave ---
        card.addEventListener('mouseleave', () => {
            isHovered = false;
            clearParticles();
            if (ENABLE_TILT) {
                gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.4, ease: 'power2.out', transformPerspective: 1000 });
            }
            if (ENABLE_MAGNETISM) {
                gsap.to(card, { x: 0, y: 0, duration: 0.4, ease: 'power2.out' });
            }
        });

        // --- Mouse Move (Tilt + Magnetism) ---
        card.addEventListener('mousemove', e => {
            if (isMobile() || (!ENABLE_TILT && !ENABLE_MAGNETISM)) return;
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const cx = rect.width / 2;
            const cy = rect.height / 2;

            if (ENABLE_TILT) {
                const rotX = ((y - cy) / cy) * -8;
                const rotY = ((x - cx) / cx) * 8;
                gsap.to(card, { rotateX: rotX, rotateY: rotY, duration: 0.1, ease: 'power2.out', transformPerspective: 1000 });
            }
            if (ENABLE_MAGNETISM) {
                gsap.to(card, {
                    x: (x - cx) * 0.04,
                    y: (y - cy) * 0.04,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            }
        });

        // --- Click Ripple ---
        card.addEventListener('click', e => {
            if (!ENABLE_CLICK || isMobile()) return;
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const maxDist = Math.max(
                Math.hypot(x, y),
                Math.hypot(x - rect.width, y),
                Math.hypot(x, y - rect.height),
                Math.hypot(x - rect.width, y - rect.height)
            );
            const ripple = document.createElement('div');
            ripple.style.cssText = `
                position: absolute;
                width: ${maxDist * 2}px;
                height: ${maxDist * 2}px;
                border-radius: 50%;
                background: radial-gradient(circle, rgba(${GLOW_COLOR}, 0.4) 0%, rgba(${GLOW_COLOR}, 0.15) 35%, transparent 70%);
                left: ${x - maxDist}px;
                top: ${y - maxDist}px;
                pointer-events: none;
                z-index: 50;
            `;
            card.appendChild(ripple);
            gsap.fromTo(ripple,
                { scale: 0, opacity: 1 },
                { scale: 1, opacity: 0, duration: 0.8, ease: 'power2.out', onComplete: () => ripple.remove() }
            );
        });
    });

    // Cleanup spotlight on page unload
    window.addEventListener('beforeunload', () => {
        spotlight?.parentNode?.removeChild(spotlight);
    });
})();

