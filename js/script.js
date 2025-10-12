// JavaScript for Professional Portfolio Website

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initNavigation();
    initScrollEffects();
    initProjectModal();
    initContactForm();
    initAnimations();
    initInteractiveElements();
    initPerformanceOptimizations();
});

// Navigation Functionality
function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const navbar = document.querySelector('.navbar');

    // Mobile menu toggle
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Scroll Effects and Animations
function initScrollEffects() {
    // Scroll progress indicator
    const scrollIndicator = document.createElement('div');
    scrollIndicator.className = 'scroll-indicator';
    document.body.appendChild(scrollIndicator);

    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset;
        const docHeight = document.body.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        scrollIndicator.style.transform = `scaleX(${scrollPercent / 100})`;
    });

    // Parallax effects
    const parallaxElements = document.querySelectorAll('.parallax-element');
    
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        
        parallaxElements.forEach(element => {
            const speed = element.dataset.speed || 0.5;
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    });

    // Reveal animations on scroll
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    const fadeElements = document.querySelectorAll('.fade-in-scroll');

    function checkReveal() {
        const triggerBottom = window.innerHeight / 5 * 4;

        revealElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            
            if (elementTop < triggerBottom) {
                element.classList.add('active');
            }
        });

        fadeElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            
            if (elementTop < triggerBottom) {
                element.classList.add('visible');
            }
        });
    }

    window.addEventListener('scroll', checkReveal);
    checkReveal(); // Initial check
}

// Project Modal Functionality
function initProjectModal() {
    const modal = document.getElementById('projectModal');
    const projectCards = document.querySelectorAll('.project-card');
    const closeBtn = document.querySelector('.modal-close');
    const modalOverlay = document.querySelector('.modal-overlay');
    
    let currentProjectIndex = 0;
    const projects = [
        {
            title: "Cyber Quest RPG",
            subtitle: "Unity-built Cyberpunk RPG",
            overview: "A comprehensive Unity-built cyberpunk RPG featuring advanced gameplay systems, narrative design, and visual effects implementation. This project demonstrates expertise in complex game development, character progression systems, and immersive world-building.",
            features: [
                "Dynamic combat system with multiple weapon types",
                "Branching narrative with player choices affecting story",
                "Character customization and progression system",
                "Advanced visual effects and post-processing",
                "Open-world exploration with dynamic events",
                "Inventory and crafting system"
            ],
            techStack: [
                { name: "Unity Engine", description: "Primary game development platform" },
                { name: "C#", description: "Programming language for game logic" },
                { name: "DOTween", description: "Animation and tweening library" },
                { name: "Post Processing Stack", description: "Visual effects and image processing" }
            ],
            challenges: [
                {
                    challenge: "Implementing seamless open-world transitions",
                    solution: "Developed a custom streaming system that loads/unloads assets dynamically based on player position"
                },
                {
                    challenge: "Creating responsive combat mechanics",
                    solution: "Used state machines and animation curves to create fluid, responsive combat animations"
                }
            ],
            results: [
                { metric: "15k+", label: "Lines of code" },
                { metric: "6", label: "Months development" },
                { metric: "Solo", label: "Development" }
            ]
        },
        {
            title: "Neon Racing Pro",
            subtitle: "Unreal Engine Racing Simulator",
            overview: "A high-performance Unreal Engine racing simulator showcasing advanced physics implementation, vehicle dynamics, and multiplayer architecture. This project demonstrates expertise in C++ programming, network optimization, and real-time systems development.",
            features: [
                "Advanced vehicle physics and dynamics",
                "16-player multiplayer support",
                "Dynamic weather and time systems",
                "Vehicle customization and tuning",
                "Multiple racing modes and tracks",
                "Steam integration for leaderboards"
            ],
            techStack: [
                { name: "Unreal Engine 5", description: "Primary game development platform" },
                { name: "C++", description: "Core programming language" },
                { name: "Chaos Physics", description: "Advanced physics simulation" },
                { name: "Steamworks SDK", description: "Steam integration and multiplayer" }
            ],
            challenges: [
                {
                    challenge: "Optimizing network performance for 16 players",
                    solution: "Implemented client-side prediction and server reconciliation techniques"
                },
                {
                    challenge: "Creating realistic vehicle physics",
                    solution: "Used Chaos Physics with custom vehicle models and tire physics"
                }
            ],
            results: [
                { metric: "8", label: "Months development" },
                { metric: "3", label: "Team members" },
                { metric: "16", label: "Player multiplayer" }
            ]
        },
        {
            title: "Puzzle Master Mobile",
            subtitle: "Cross-Platform Mobile Puzzle Game",
            overview: "A cross-platform mobile puzzle game optimized for performance and user engagement. Features adaptive difficulty systems, social integration, and monetization strategies. Demonstrates mobile-first development approach and platform optimization.",
            features: [
                "200+ progressively challenging levels",
                "Adaptive difficulty system",
                "Social leaderboards and achievements",
                "In-app purchases and ad integration",
                "Offline play capability",
                "Cross-platform save synchronization"
            ],
            techStack: [
                { name: "Unity Mobile", description: "Mobile-optimized Unity setup" },
                { name: "C#", description: "Game logic and systems programming" },
                { name: "Firebase", description: "Backend services and analytics" },
                { name: "Unity Ads", description: "Ad integration and monetization" }
            ],
            challenges: [
                {
                    challenge: "Optimizing performance for low-end devices",
                    solution: "Implemented asset bundling, texture compression, and object pooling"
                },
                {
                    challenge: "Creating engaging puzzle mechanics",
                    solution: "Used procedural generation and player behavior analysis"
                }
            ],
            results: [
                { metric: "4", label: "Months development" },
                { metric: "200+", label: "Game levels" },
                { metric: "iOS/Android", label: "Platforms" }
            ]
        },
        {
            title: "Multiplayer Arena",
            subtitle: "Competitive Multiplayer Battle Arena",
            overview: "A competitive multiplayer battle arena featuring real-time combat systems, network synchronization, and anti-cheat mechanisms. Demonstrates expertise in network programming, server architecture, and competitive game design principles.",
            features: [
                "Real-time multiplayer combat",
                "Ranked matchmaking system",
                "Multiple character classes and abilities",
                "Anti-cheat and security systems",
                "Spectator mode and replay system",
                "Custom game modes and maps"
            ],
            techStack: [
                { name: "Unity", description: "Game development platform" },
                { name: "Mirror Networking", description: "High-level networking framework" },
                { name: "Photon", description: "Real-time multiplayer services" },
                { name: "MLAPI", description: "Low-level networking API" }
            ],
            challenges: [
                {
                    challenge: "Implementing lag compensation",
                    solution: "Used client-side prediction and server authority with rollback"
                },
                {
                    challenge: "Preventing cheating in competitive environment",
                    solution: "Implemented server-side validation and anti-cheat systems"
                }
            ],
            results: [
                { metric: "10", label: "Months development" },
                { metric: "5", label: "Team members" },
                { metric: "Ranked", label: "Matchmaking" }
            ]
        }
    ];

    // Open modal when clicking on project cards
    projectCards.forEach((card, index) => {
        card.addEventListener('click', function() {
            currentProjectIndex = index;
            openProjectModal(projects[index]);
        });
    });

    // Close modal
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    closeBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);

    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    // Navigate between projects
    window.navigateProject = function(direction) {
        currentProjectIndex += direction;
        
        if (currentProjectIndex < 0) {
            currentProjectIndex = projects.length - 1;
        } else if (currentProjectIndex >= projects.length) {
            currentProjectIndex = 0;
        }
        
        openProjectModal(projects[currentProjectIndex]);
    };

    function openProjectModal(project) {
        // Update modal content
        document.getElementById('modalTitle').textContent = project.title;
        document.getElementById('modalSubtitle').textContent = project.subtitle;
        document.getElementById('modalOverview').textContent = project.overview;
        
        // Update features
        const featuresList = document.getElementById('modalFeatures');
        featuresList.innerHTML = '';
        project.features.forEach(feature => {
            const li = document.createElement('li');
            li.textContent = feature;
            featuresList.appendChild(li);
        });
        
        // Update tech stack
        const techStack = document.getElementById('modalTechStack');
        techStack.innerHTML = '';
        project.techStack.forEach(tech => {
            const techDiv = document.createElement('div');
            techDiv.className = 'tech-item-expanded';
            techDiv.innerHTML = `
                <h4>${tech.name}</h4>
                <p>${tech.description}</p>
            `;
            techStack.appendChild(techDiv);
        });
        
        // Update challenges
        const challenges = document.getElementById('modalChallenges');
        challenges.innerHTML = '';
        project.challenges.forEach(challenge => {
            const challengeDiv = document.createElement('div');
            challengeDiv.className = 'challenge-item';
            challengeDiv.innerHTML = `
                <h4>${challenge.challenge}</h4>
                <p>${challenge.solution}</p>
            `;
            challenges.appendChild(challengeDiv);
        });
        
        // Update results
        const results = document.getElementById('modalResults');
        results.innerHTML = '';
        project.results.forEach(result => {
            const resultDiv = document.createElement('div');
            resultDiv.className = 'metric-item';
            resultDiv.innerHTML = `
                <div class="metric-number">${result.metric}</div>
                <div class="metric-label">${result.label}</div>
            `;
            results.appendChild(resultDiv);
        });
        
        // Show modal
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Project filter functionality
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.dataset.filter;
            
            // Show/hide project cards based on filter
            projectCards.forEach(card => {
                if (filter === 'all' || card.dataset.category.includes(filter)) {
                    card.style.display = 'block';
                    // Force a reflow before applying transitions
                    card.offsetHeight;
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    // Hide card after transition completes
                    setTimeout(() => {
                        if (card.style.opacity === '0') {
                            card.style.display = 'none';
                        }
                    }, 300);
                }
            });
        });
    });
}

// Contact Form Functionality
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(contactForm);
            const name = formData.get('name');
            const email = formData.get('email');
            const subject = formData.get('subject');
            const message = formData.get('message');
            
            // Basic validation
            if (!name || !email || !subject || !message) {
                showNotification('Please fill in all required fields.', 'error');
                return;
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showNotification('Please enter a valid email address.', 'error');
                return;
            }
            
            // Simulate form submission (in real implementation, this would send to server)
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalText = submitButton.innerHTML;
            
            submitButton.innerHTML = '<span>⏳</span> Sending...';
            submitButton.disabled = true;
            
            setTimeout(() => {
                showNotification('Thank you for your message! I\'ll get back to you within 24 hours.', 'success');
                contactForm.reset();
                submitButton.innerHTML = originalText;
                submitButton.disabled = false;
            }, 2000);
        });
    }
}

// Notification System
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
            <span class="notification-message">${message}</span>
        </div>
        <button class="notification-close">&times;</button>
    `;
    
    // Add notification styles if not already added
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: var(--card-bg);
                border: 1px solid var(--border-color);
                border-radius: var(--radius-lg);
                padding: var(--spacing-md);
                min-width: 300px;
                max-width: 400px;
                z-index: 10000;
                box-shadow: var(--shadow-xl);
                backdrop-filter: blur(10px);
                animation: slideInRight 0.3s ease-out;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: var(--spacing-md);
            }
            
            .notification-success {
                border-left: 4px solid #4CAF50;
            }
            
            .notification-error {
                border-left: 4px solid #f44336;
            }
            
            .notification-info {
                border-left: 4px solid var(--accent-pink);
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: var(--spacing-sm);
                flex: 1;
            }
            
            .notification-icon {
                font-size: 1.2rem;
            }
            
            .notification-message {
                color: var(--text-secondary);
                font-size: 0.9rem;
            }
            
            .notification-close {
                background: none;
                border: none;
                color: var(--text-muted);
                font-size: 1.2rem;
                cursor: pointer;
                padding: 0;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: var(--transition);
            }
            
            .notification-close:hover {
                background: var(--tertiary-dark);
                color: var(--text-primary);
            }
            
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(styles);
    }
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOutRight 0.3s ease-in-out';
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease-in-out';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }, 5000);
}

// Animations and Interactive Elements
function initAnimations() {
    // Counter animation for statistics
    const counters = document.querySelectorAll('.counter');
    
    function animateCounter(counter) {
        const target = parseInt(counter.textContent);
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;
        
        const updateCounter = () => {
            current += increment;
            if (current < target) {
                counter.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        };
        
        updateCounter();
    }
    
    // Intersection Observer for counter animations
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => {
        counterObserver.observe(counter);
    });
    
    // Typewriter effect for hero section
    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (heroSubtitle) {
        const text = heroSubtitle.textContent;
        heroSubtitle.textContent = '';
        heroSubtitle.classList.add('typewriter');
        
        let charIndex = 0;
        function typeWriter() {
            if (charIndex < text.length) {
                heroSubtitle.textContent += text.charAt(charIndex);
                charIndex++;
                setTimeout(typeWriter, 100);
            } else {
                heroSubtitle.classList.remove('typewriter');
            }
        }
        
        // Start typewriter effect after page load
        setTimeout(typeWriter, 500);
    }
    
    // Magnetic button effect
    const magneticButtons = document.querySelectorAll('.magnetic-btn');
    
    magneticButtons.forEach(button => {
        button.addEventListener('mousemove', function(e) {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            const distance = Math.sqrt(x * x + y * y);
            const maxDistance = 100;
            const strength = (maxDistance - distance) / maxDistance;
            
            if (strength > 0) {
                const moveX = (x / rect.width) * 20 * strength;
                const moveY = (y / rect.height) * 20 * strength;
                
                button.style.transform = `translate(${moveX}px, ${moveY}px) scale(${1 + strength * 0.1})`;
            }
        });
        
        button.addEventListener('mouseleave', function() {
            button.style.transform = 'translate(0, 0) scale(1)';
        });
    });
    
    // Ripple effect for buttons
    const rippleButtons = document.querySelectorAll('.ripple');
    
    rippleButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple-effect');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

// Interactive Elements Enhancement
function initInteractiveElements() {
    // Enhanced hover effects for cards
    const interactiveCards = document.querySelectorAll('.interactive-card, .project-card, .skill-category, .metric-card');
    
    interactiveCards.forEach(card => {
        card.addEventListener('mouseenter', function(e) {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Tooltip functionality
    const tooltips = document.querySelectorAll('.tooltip');
    
    tooltips.forEach(tooltip => {
        tooltip.addEventListener('mouseenter', function() {
            const tooltipText = this.getAttribute('data-tooltip');
            if (tooltipText) {
                // Tooltip is handled by CSS, just ensure data-tooltip is set
            }
        });
    });
    
    // Progress bar animation
    const progressBars = document.querySelectorAll('.progress-bar-fill');
    
    const progressObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const width = entry.target.style.width || '0%';
                entry.target.style.width = width;
                progressObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    progressBars.forEach(bar => {
        progressObserver.observe(bar);
    });
}

// Performance Optimizations
function initPerformanceOptimizations() {
    // Lazy loading for images
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => {
        imageObserver.observe(img);
    });
    
    // Throttle scroll events
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        if (scrollTimeout) {
            window.cancelAnimationFrame(scrollTimeout);
        }
        
        scrollTimeout = window.requestAnimationFrame(function() {
            // Handle scroll events
            updateScrollEffects();
        });
    });
    
    function updateScrollEffects() {
        // Update any scroll-based effects here
        const scrolled = window.pageYOffset;
        
        // Update parallax elements
        document.querySelectorAll('.parallax-element').forEach(element => {
            const speed = element.dataset.speed || 0.5;
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    }
    
    // Debounce resize events
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            // Handle resize events
            handleResize();
        }, 250);
    });
    
    function handleResize() {
        // Update any responsive elements here
        if (window.innerWidth <= 768) {
            // Mobile-specific adjustments
            document.body.classList.add('mobile-view');
        } else {
            document.body.classList.remove('mobile-view');
        }
    }
    
    // Initial resize check
    handleResize();
    
    // Optimize animations for users who prefer reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    if (prefersReducedMotion.matches) {
        document.body.classList.add('reduced-motion');
        
        // Disable or reduce animations
        const animatedElements = document.querySelectorAll('[class*="animate"], [class*="fade"], [class*="slide"]');
        animatedElements.forEach(element => {
            element.style.animation = 'none';
            element.style.transition = 'none';
        });
    }
    
    // Memory management - clean up event listeners
    window.addEventListener('beforeunload', function() {
        // Clean up any event listeners or intervals here
    });
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Export functions for global access
window.closeProjectModal = function() {
    const modal = document.getElementById('projectModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
};

// Initialize everything when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
} else {
    initAll();
}

function initAll() {
    initNavigation();
    initScrollEffects();
    initProjectModal();
    initContactForm();
    initAnimations();
    initInteractiveElements();
    initPerformanceOptimizations();
    
    // Add loading complete class
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('Portfolio Error:', e.message);
    // You could send error reports to a service here
});

// Add console welcome message
console.log('%c🎮 Lucian Matan - Games Programming Portfolio', 'color: #fad6e5; font-size: 20px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);');
console.log('%cWelcome to my professional portfolio! Feel free to explore my projects and skills.', 'color: #f8b5d0; font-size: 14px;');
