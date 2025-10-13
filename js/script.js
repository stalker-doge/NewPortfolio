// JavaScript for Professional Portfolio Website

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initNavigation();
    initScrollEffects();
    initProjectModal();
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
    const closeBtn = document.querySelector('.modal-close');
    const modalOverlay = document.querySelector('.modal-overlay');
    
    let currentProjectIndex = 0;
    let projects = [];

    // Load projects dynamically
    async function loadProjects() {
        try {
            const response = await fetch('data/projects.json');
            const data = await response.json();
            projects = data.projects || [];
            
            // Render projects
            renderProjects();
            
            // Initialize filter functionality
            initializeFilters();
            
        } catch (error) {
            console.error('Failed to load projects:', error);
            // Show error message in projects grid
            const projectsGrid = document.getElementById('projectsGrid');
            if (projectsGrid) {
                projectsGrid.innerHTML = `
                    <div class="error-message">
                        <div class="error-icon">⚠️</div>
                        <h3>Failed to load projects</h3>
                        <p>Please check your internet connection and try again later.</p>
                    </div>
                `;
            }
            projects = [];
        }
    }

    // Render project cards
    function renderProjects() {
        const projectsGrid = document.getElementById('projectsGrid');
        if (!projectsGrid) return;

        // Clear existing content
        projectsGrid.innerHTML = '';

        if (projects.length === 0) {
            projectsGrid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📁</div>
                    <h3>No Projects Available</h3>
                    <p>Check back soon for new projects!</p>
                </div>
            `;
            return;
        }

        // Create and append project cards
        projects.forEach((project, index) => {
            const card = createProjectCard(project, index);
            projectsGrid.appendChild(card);
        });

        // Attach event listeners to new cards
        attachProjectCardListeners();
    }

    // Create project card element
    function createProjectCard(project, index) {
        const card = document.createElement('div');
        card.className = `project-card ${project.featured ? 'featured' : ''}`;
        card.dataset.category = project.category ? project.category.join(' ') : '';
        
        // Get the first image or use placeholder
        const imageUrl = project.images?.hero || project.images?.thumbnail || '';
        
        card.innerHTML = `
            ${project.featured ? '<div class="project-badge">Featured Project</div>' : ''}
            <div class="project-image">
                ${imageUrl ? 
                    `<img src="${imageUrl}" alt="${project.title}" loading="lazy">` :
                    `<div class="placeholder-image"><span>${project.title}</span></div>`
                }
            </div>
            <div class="project-content">
                <h3 class="project-title">${escapeHtml(project.title)}</h3>
                <p class="project-description">
                    ${escapeHtml(project.description || project.overview || '')}
                </p>
                <div class="project-tech">
                    ${project.technologies && project.technologies.length > 0 ? 
                        project.technologies.slice(0, 4).map(tech => 
                            `<span class="tech-tag">${escapeHtml(tech.name || tech)}</span>`
                        ).join('') :
                        project.techStack && project.techStack.length > 0 ?
                        project.techStack.slice(0, 4).map(tech => 
                            `<span class="tech-tag">${escapeHtml(tech.name || tech)}</span>`
                        ).join('') : ''
                    }
                </div>
                <div class="project-links">
                    ${project.links?.demo ? 
                        `<a href="${project.links.demo}" class="project-link" target="_blank">View Demo</a>` : 
                        '<span class="project-link disabled">Demo</span>'
                    }
                    ${project.links?.github ? 
                        `<a href="${project.links.github}" class="project-link" target="_blank">Source Code</a>` : 
                        '<span class="project-link disabled">GitHub</span>'
                    }
                </div>
                <div class="project-stats">
                    ${project.stats?.developmentTime ? 
                        `<div class="project-stat">
                            <span class="project-stat-icon">⏱️</span>
                            <span>${project.stats.developmentTime}</span>
                        </div>` : ''
                    }
                    ${project.stats?.teamSize ? 
                        `<div class="project-stat">
                            <span class="project-stat-icon">👥</span>
                            <span>${project.stats.teamSize}</span>
                        </div>` : ''
                    }
                    ${project.stats?.linesOfCode ? 
                        `<div class="project-stat">
                            <span class="project-stat-icon">📦</span>
                            <span>${project.stats.linesOfCode}</span>
                        </div>` : ''
                    }
                </div>
            </div>
        `;

        return card;
    }

    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Attach event listeners to project cards
    function attachProjectCardListeners() {
        const projectCards = document.querySelectorAll('.project-card');
        projectCards.forEach((card, index) => {
            card.addEventListener('click', function() {
                currentProjectIndex = index;
                openProjectModal(projects[index]);
            });
        });
    }

    // Initialize filter functionality
    function initializeFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Remove active class from all buttons
                filterButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                const filter = this.dataset.filter;
                
                // Show/hide project cards based on filter
                const projectCards = document.querySelectorAll('.project-card');
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

    // Load projects on initialization
    loadProjects();

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
        document.getElementById('modalOverview').textContent = project.description || project.overview || '';
        
        // Update hero image
        const modalHeroImage = document.getElementById('modalHeroImage');
        const imageUrl = project.images?.hero || project.images?.thumbnail || '';
        if (imageUrl) {
            modalHeroImage.innerHTML = `<img src="${imageUrl}" alt="${project.title}">`;
        } else {
            modalHeroImage.innerHTML = `<div class="placeholder-image"><span>${project.title}</span></div>`;
        }
        
        // Update features
        const featuresList = document.getElementById('modalFeatures');
        featuresList.innerHTML = '';
        if (project.features && Array.isArray(project.features)) {
            project.features.forEach(feature => {
                const li = document.createElement('li');
                li.textContent = feature;
                featuresList.appendChild(li);
            });
        }
        
        // Update tech stack
        const techStack = document.getElementById('modalTechStack');
        techStack.innerHTML = '';
        if (project.technologies && Array.isArray(project.technologies)) {
            project.technologies.forEach(tech => {
                const techDiv = document.createElement('div');
                techDiv.className = 'tech-item-expanded';
                techDiv.innerHTML = `
                    <h4>${tech.name || tech}</h4>
                    <p>${tech.description || ''}</p>
                `;
                techStack.appendChild(techDiv);
            });
        } else if (project.techStack && Array.isArray(project.techStack)) {
            // Support for legacy techStack format
            project.techStack.forEach(tech => {
                const techDiv = document.createElement('div');
                techDiv.className = 'tech-item-expanded';
                techDiv.innerHTML = `
                    <h4>${tech.name || tech}</h4>
                    <p>${tech.description || ''}</p>
                `;
                techStack.appendChild(techDiv);
            });
        }
        
        // Update challenges
        const challenges = document.getElementById('modalChallenges');
        challenges.innerHTML = '';
        if (project.challenges && Array.isArray(project.challenges)) {
            project.challenges.forEach(challenge => {
                const challengeDiv = document.createElement('div');
                challengeDiv.className = 'challenge-item';
                challengeDiv.innerHTML = `
                    <h4>${challenge.challenge}</h4>
                    <p>${challenge.solution}</p>
                `;
                challenges.appendChild(challengeDiv);
            });
        }
        
        // Update gallery
        const gallery = document.getElementById('modalGallery');
        gallery.innerHTML = '';
        if (project.images?.gallery && Array.isArray(project.images.gallery)) {
            project.images.gallery.forEach(image => {
                const galleryItem = document.createElement('div');
                galleryItem.className = 'gallery-item';
                galleryItem.innerHTML = `
                    <img src="${image.url}" alt="${image.caption || ''}" loading="lazy">
                `;
                gallery.appendChild(galleryItem);
            });
        }
        
        // Update results/stats
        const results = document.getElementById('modalResults');
        results.innerHTML = '';
        let stats = [];
        
        // Try to get stats from different possible locations
        if (project.results) {
            stats = project.results;
        } else if (project.stats) {
            // Convert stats format to results format
            Object.entries(project.stats).forEach(([key, value]) => {
                stats.push({
                    metric: value,
                    label: key.replace(/([A-Z])/g, ' $1').trim() // Convert camelCase to readable text
                });
            });
        }
        
        if (Array.isArray(stats)) {
            stats.forEach(result => {
                const resultDiv = document.createElement('div');
                resultDiv.className = 'metric-item';
                resultDiv.innerHTML = `
                    <div class="metric-number">${result.metric}</div>
                    <div class="metric-label">${result.label}</div>
                `;
                results.appendChild(resultDiv);
            });
        }
        
        // Update modal links
        const modalDemoLink = document.getElementById('modalDemoLink');
        const modalGithubLink = document.getElementById('modalGithubLink');
        
        if (project.links?.demo) {
            modalDemoLink.href = project.links.demo;
            modalDemoLink.style.display = 'inline-block';
        } else {
            modalDemoLink.style.display = 'none';
        }
        
        if (project.links?.github) {
            modalGithubLink.href = project.links.github;
            modalGithubLink.style.display = 'inline-block';
        } else {
            modalGithubLink.style.display = 'none';
        }
        
        // Show modal
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
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
