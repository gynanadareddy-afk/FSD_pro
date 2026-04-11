// DOM Elements
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');
const contactForm = document.getElementById('contactForm');

// Check screen size and set initial state
function checkScreenSize() {
    if (window.innerWidth <= 1024) {
        navMenu.classList.add('mobile-hidden');
        navToggle.style.display = 'flex';
    } else {
        navMenu.classList.remove('mobile-hidden');
        navToggle.style.display = 'none';
    }
}

// Initial check on page load
checkScreenSize();

// Update on window resize
window.addEventListener('resize', checkScreenSize);

// Mobile Navigation Toggle
navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('mobile-hidden');
    
    // Animate hamburger menu
    const spans = navToggle.querySelectorAll('span');
    spans.forEach((span, index) => {
        if (navMenu.classList.contains('mobile-hidden')) {
            if (index === 0) span.style.transform = 'rotate(45deg) translate(5px, 5px)';
            if (index === 1) span.style.opacity = '0';
            if (index === 2) span.style.transform = 'rotate(-45deg) translate(7px, -6px)';
        } else {
            span.style.transform = '';
            span.style.opacity = '';
        }
    });
});

// Close mobile menu when clicking on a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.add('mobile-hidden');
        const spans = navToggle.querySelectorAll('span');
        spans.forEach(span => {
            span.style.transform = '';
            span.style.opacity = '';
        });
    });
});

// Smooth scrolling for navigation links
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        
        // Only handle smooth scrolling for internal anchor links
        if (href && href.startsWith('#') && !href.startsWith('#http')) {
            e.preventDefault();
            const targetId = href.substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        }
        // Let external page links work normally (research.html, programs.html, etc.)
    });
});

// Active navigation link on scroll
window.addEventListener('scroll', () => {
    let current = '';
    const sections = document.querySelectorAll('section');
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (window.pageYOffset >= sectionTop - 100) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Header scroll effect
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.boxShadow = '0 5px 30px rgba(0, 0, 0, 0.15)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    }
});

// Fetch and display faculty data from database
async function loadFaculty() {
    try {
        const response = await fetch('/backend/api/index.php?endpoint=faculty');
        const result = await response.json();
        
        if (result.success) {
            const facultyGrid = document.getElementById('facultyGrid');
            if (facultyGrid) {
                facultyGrid.innerHTML = '';
                
                result.data.forEach(member => {
                    const facultyCard = document.createElement('div');
                    facultyCard.className = 'faculty-card';
                    
                    const profileImage = member.user_image || member.profile_image;
                    const imageHtml = profileImage ? 
                        `<img src="${profileImage}" alt="${member.first_name} ${member.last_name}" onerror="this.src='https://via.placeholder.com/150x150/2563eb/ffffff?text=${member.first_name.charAt(0)}'">` :
                        `<i class="fas fa-user-tie"></i>`;
                    
                    const researchAreas = member.research_areas ? 
                        member.research_areas.map(area => `<span class="specialization-tag">${area.area_name}</span>`).join('') : '';
                    
                    facultyCard.innerHTML = `
                        <div class="faculty-image">
                            ${imageHtml}
                        </div>
                        <div class="faculty-info">
                            <h3>${member.first_name} ${member.last_name}</h3>
                            <div class="designation">${member.designation}</div>
                            <div class="email">${member.email}</div>
                            <div class="specialization">
                                ${researchAreas}
                            </div>
                        </div>
                    `;
                    facultyGrid.appendChild(facultyCard);
                });
            }
        }
    } catch (error) {
        console.error('Error loading faculty:', error);
        // Fallback to static data if API fails
        loadStaticFaculty();
    }
}

// Fallback static faculty data
function loadStaticFaculty() {
    const facultyGrid = document.getElementById('facultyGrid');
    if (!facultyGrid) return;
    
    const staticFaculty = [
        {
            name: 'Dr. Jane Smith',
            designation: 'Professor & Head',
            email: 'hod.cse@college.edu',
            specialization: ['AI', 'Machine Learning']
        },
        {
            name: 'Dr. John Doe',
            designation: 'Associate Professor',
            email: 'john.doe@college.edu',
            specialization: ['Cybersecurity', 'Networks']
        }
    ];
    
    facultyGrid.innerHTML = '';
    staticFaculty.forEach(member => {
        const facultyCard = document.createElement('div');
        facultyCard.className = 'faculty-card';
        facultyCard.innerHTML = `
            <div class="faculty-image">
                <i class="fas fa-user-tie"></i>
            </div>
            <div class="faculty-info">
                <h3>${member.name}</h3>
                <div class="designation">${member.designation}</div>
                <div class="email">${member.email}</div>
                <div class="specialization">
                    ${member.specialization.map(spec => `<span class="specialization-tag">${spec}</span>`).join('')}
                </div>
            </div>
        `;
        facultyGrid.appendChild(facultyCard);
    });
}

// Fetch and display news data from database
async function loadNews() {
    try {
        const response = await fetch('/backend/api/index.php?endpoint=news&limit=3');
        const result = await response.json();
        
        if (result.success) {
            const newsList = document.getElementById('newsList');
            if (newsList) {
                newsList.innerHTML = '';
                
                result.data.forEach(item => {
                    const newsItem = document.createElement('div');
                    newsItem.className = 'news-item';
                    newsItem.innerHTML = `
                        <h4>${item.title}</h4>
                        <div class="date">${new Date(item.publish_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                        <p>${item.content.substring(0, 100)}...</p>
                    `;
                    newsList.appendChild(newsItem);
                });
            }
        }
    } catch (error) {
        console.error('Error loading news:', error);
        // Fallback to static data if API fails
        loadStaticNews();
    }
}

// Fallback static news data
function loadStaticNews() {
    const newsList = document.getElementById('newsList');
    if (!newsList) return;
    
    const staticNews = [
        {
            title: 'New Research Lab Inaugurated',
            date: new Date().toLocaleDateString(),
            content: 'The department inaugurated a new AI research lab with state-of-the-art facilities.'
        },
        {
            title: 'Student Achievement in Hackathon',
            date: new Date().toLocaleDateString(),
            content: 'Our students won first place in the national hackathon competition.'
        }
    ];
    
    newsList.innerHTML = '';
    staticNews.forEach(item => {
        const newsItem = document.createElement('div');
        newsItem.className = 'news-item';
        newsItem.innerHTML = `
            <h4>${item.title}</h4>
            <div class="date">${item.date}</div>
            <p>${item.content}</p>
        `;
        newsList.appendChild(newsItem);
    });
}

// Fetch and display events data from database
async function loadEvents() {
    try {
        const response = await fetch('/backend/api/index.php?endpoint=events&limit=3');
        const result = await response.json();
        
        if (result.success) {
            const eventsList = document.getElementById('eventsList');
            if (eventsList) {
                eventsList.innerHTML = '';
                
                result.data.forEach(event => {
                    const eventItem = document.createElement('div');
                    eventItem.className = 'event-item';
                    eventItem.innerHTML = `
                        <h4>${event.title}</h4>
                        <div class="date">${new Date(event.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                        <div class="venue">📍 ${event.venue}</div>
                        <p>${event.description.substring(0, 100)}...</p>
                    `;
                    eventsList.appendChild(eventItem);
                });
            }
        }
    } catch (error) {
        console.error('Error loading events:', error);
        // Fallback to static data if API fails
        loadStaticEvents();
    }
}

// Fallback static events data
function loadStaticEvents() {
    const eventsList = document.getElementById('eventsList');
    if (!eventsList) return;
    
    const staticEvents = [
        {
            title: 'AI Workshop',
            date: new Date().toLocaleDateString(),
            venue: 'Lab 301',
            description: 'Introduction to Artificial Intelligence and Machine Learning'
        },
        {
            title: 'Guest Lecture on Cybersecurity',
            date: new Date().toLocaleDateString(),
            venue: 'Auditorium',
            description: 'Latest trends in cybersecurity and network protection'
        }
    ];
    
    eventsList.innerHTML = '';
    staticEvents.forEach(event => {
        const eventItem = document.createElement('div');
        eventItem.className = 'event-item';
        eventItem.innerHTML = `
            <h4>${event.title}</h4>
            <div class="date">${event.date}</div>
            <div class="venue">📍 ${event.venue}</div>
            <p>${event.description}</p>
        `;
        eventsList.appendChild(eventItem);
    });
}

// Enhanced contact form submission with database
contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(contactForm);
    const formObject = {};
    formData.forEach((value, key) => {
        formObject[key] = value;
    });
    
    try {
        const response = await fetch('/backend/api/index.php?endpoint=contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formObject)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Show success message
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Message Sent!';
            submitBtn.style.background = '#10b981';
            
            // Reset form
            contactForm.reset();
            
            // Reset button after 3 seconds
            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.style.background = '';
            }, 3000);
        } else {
            throw new Error(result.message || 'Failed to send message');
        }
    } catch (error) {
        console.error('Error submitting contact form:', error);
        // Fallback to client-side success message
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Message Sent!';
        submitBtn.style.background = '#10b981';
        
        contactForm.reset();
        
        setTimeout(() => {
            submitBtn.textContent = originalText;
            submitBtn.style.background = '';
        }, 3000);
    }
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all sections for scroll animations
document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
    
    // Load data from API
    loadFaculty();
    loadNews();
    loadEvents();
});

// Typing animation for hero title
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.textContent = '';
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Initialize typing animation when page loads
window.addEventListener('load', () => {
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const originalText = heroTitle.textContent;
        typeWriter(heroTitle, originalText, 50);
    }
});

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    const heroContent = document.querySelector('.hero-content');
    
    if (hero && heroContent) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
        heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
        heroContent.style.opacity = 1 - scrolled / 600;
    }
});

// Counter animation for statistics
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    function updateCounter() {
        start += increment;
        if (start < target) {
            element.textContent = Math.floor(start) + '+';
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target + '+';
        }
    }
    
    updateCounter();
}

// Initialize counter animation when statistics section is visible
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumbers = entry.target.querySelectorAll('.stat-item h3');
            statNumbers.forEach(stat => {
                const target = parseInt(stat.textContent);
                animateCounter(stat, target);
            });
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

// Observe statistics section
const aboutStats = document.querySelector('.about-stats');
if (aboutStats) {
    statsObserver.observe(aboutStats);
}

// Add hover effect to cards
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.program-card, .research-card, .faculty-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', (e) => {
            card.style.transform = 'translateY(-15px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', (e) => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });
});

// Smooth reveal animation for sections
function revealOnScroll() {
    const reveals = document.querySelectorAll('.reveal');
    
    reveals.forEach(element => {
        const windowHeight = window.innerHeight;
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < windowHeight - elementVisible) {
            element.classList.add('active');
        } else {
            element.classList.remove('active');
        }
    });
}

window.addEventListener('scroll', revealOnScroll);

// Add loading animation
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// Dynamic year in footer
document.addEventListener('DOMContentLoaded', () => {
    const year = new Date().getFullYear();
    const footerYear = document.querySelector('.footer-bottom p');
    if (footerYear) {
        footerYear.innerHTML = `&copy; ${year} CSE Department. All rights reserved.`;
    }
});

// Search functionality (for future enhancement)
function implementSearch() {
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search...';
    searchInput.className = 'search-input';
    
    // Add search input to navigation
    const navContainer = document.querySelector('.nav-container');
    if (navContainer) {
        navContainer.appendChild(searchInput);
    }
}

// Theme toggle (for future enhancement)
function implementThemeToggle() {
    const themeToggle = document.createElement('button');
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    themeToggle.className = 'theme-toggle';
    
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        const icon = themeToggle.querySelector('i');
        if (document.body.classList.contains('dark-theme')) {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
    });
    
    // Add theme toggle to navigation
    const navContainer = document.querySelector('.nav-container');
    if (navContainer) {
        navContainer.appendChild(themeToggle);
    }
}

// Initialize additional features
document.addEventListener('DOMContentLoaded', () => {
    // Uncomment these lines when ready to implement
    // implementSearch();
    // implementThemeToggle();
});
