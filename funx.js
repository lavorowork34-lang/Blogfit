// Simple Portfolio Website Script - Clean & Minimal
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 Initializing portfolio website...');
    initThemeToggle();
    initMobileMenu();
    initSmoothScrolling();
    initScrollEffects();
    initContactForm();
    loadBlogArticles();
    loadPortfolioItems();
    console.log('✅ All systems ready!');

    // If redirected from editor with ?articleId=, optionally scroll to blog and highlight
    const params = new URLSearchParams(window.location.search);
    const newId = params.get('articleId') || localStorage.getItem('lastArticleId');
    if (newId) {
        // Scroll to blog section after articles load
        setTimeout(() => {
            const blogSection = document.getElementById('blog');
            if (blogSection) blogSection.scrollIntoView({ behavior: 'smooth' });
        }, 800);
    }
});

// Theme Toggle Functionality
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    // Set initial theme
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            console.log('🌙 Theme changed to:', newTheme);
        });
        
        console.log('🎨 Theme toggle initialized');
    }
}

// Mobile Menu Toggle Functionality
function initMobileMenu() {
    const hamburger = document.getElementById('hamburger-menu');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (hamburger && navMenu) {
        // Toggle menu when hamburger is clicked
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            console.log('📱 Mobile menu toggled');
        });
        
        // Close menu when a link is clicked
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                console.log('🔗 Menu closed after link click');
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            const isClickInsideMenu = navMenu.contains(event.target);
            const isClickOnHamburger = hamburger.contains(event.target);
            
            if (!isClickInsideMenu && !isClickOnHamburger && navMenu.classList.contains('active')) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                console.log('👆 Menu closed by outside click');
            }
        });
        
        console.log('📱 Mobile menu initialized');
    }
}

// Smooth Scrolling for Navigation Links
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 70;
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
                
                // Update active nav link
                setTimeout(() => updateActiveNavLink(), 100);
            }
        });
    });
    
    console.log('🔗 Smooth scrolling initialized');
}

// Scroll Effects for Navbar
function initScrollEffects() {
    const navbar = document.querySelector('.navbar');
    let ticking = false;
    
    function handleScroll() {
        const scrolled = window.scrollY > 50;
        const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
        
        if (scrolled) {
            navbar.style.background = isDarkMode ? 
                'rgba(15, 15, 35, 0.98)' : 
                'rgba(255, 255, 255, 0.98)';
            navbar.style.backdropFilter = 'blur(20px)';
        } else {
            navbar.style.background = isDarkMode ? 
                'rgba(15, 15, 35, 0.95)' : 
                'rgba(255, 255, 255, 0.95)';
            navbar.style.backdropFilter = 'blur(10px)';
        }
        
        updateActiveNavLink();
        ticking = false;
    }
    
    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(handleScroll);
            ticking = true;
        }
    });
    
    console.log('📜 Scroll effects initialized');
}

// Update Active Navigation Link
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    const scrollPos = window.scrollY + 100;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
        
        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
            navLinks.forEach(link => link.classList.remove('active'));
            if (navLink) {
                navLink.classList.add('active');
            }
        }
    });
}

// Contact Form Functionality
function initContactForm() {
    const contactForm = document.querySelector('.contact-form');
    
    if (!contactForm) {
        console.log('📝 No contact form found');
        return;
    }
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const name = formData.get('name')?.trim();
        const email = formData.get('email')?.trim();
        const message = formData.get('message')?.trim();
        
        // Simple validation
        if (!name || !email || !message) {
            showMessage('Tutti i campi sono obbligatori', 'error');
            return;
        }
        
        if (!isValidEmail(email)) {
            showMessage('Inserisci un indirizzo email valido', 'error');
            return;
        }
        
        if (message.length < 10) {
            showMessage('Il messaggio deve contenere almeno 10 caratteri', 'error');
            return;
        }
        
        // Show success message and reset form
        showMessage('Messaggio inviato con successo! Ti risponderò presto.', 'success');
        this.reset();
        
        console.log('📧 Form submitted:', { name, email, messageLength: message.length });
    });
    
    console.log('📝 Contact form initialized');
}

// Email validation helper
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Show message (success or error)
function showMessage(text, type = 'success') {
    const contactForm = document.querySelector('.contact-form');
    if (!contactForm) return;
    
    // Remove existing messages
    const existingMessage = contactForm.querySelector('.form-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'form-message';
    messageDiv.innerHTML = `
        <div style="
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
            color: white;
            padding: 1rem;
            border-radius: 0.5rem;
            margin-bottom: 1rem;
            text-align: center;
            font-weight: 500;
            animation: slideIn 0.3s ease;
        ">
            ${type === 'success' ? '✓' : '⚠'} ${text}
        </div>
    `;
    
    contactForm.insertBefore(messageDiv, contactForm.firstChild);
    
    // Auto-remove success messages
    if (type === 'success') {
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }
}

// Add simple animation styles
const animationStyles = `
    <style>
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .nav-link.active {
        color: var(--accent-primary) !important;
    }
    
    .nav-link.active::after {
        width: 100% !important;
    }
    </style>
`;

document.head.insertAdjacentHTML('beforeend', animationStyles);

// Load Blog Articles from Supabase
async function loadBlogArticles() {
    const blogArticlesContainer = document.getElementById('blog-articles');
    const noArticlesDiv = blogArticlesContainer.querySelector('.no-articles');
    
    if (!blogArticlesContainer) {
        console.log('📝 Blog container not found');
        return;
    }
    
    try {
        // Get blog articles from Supabase
        const { data, error } = await supabase
            .from('articoli')
            .select('*')
            .eq('section', 'blog')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Error fetching blog articles:', error);
            return;
        }
        
        if (data && data.length > 0) {
            // Hide the "no articles" message
            if (noArticlesDiv) {
                noArticlesDiv.style.display = 'none';
            }
            
            // Clear existing articles (except no-articles div)
            const existingArticles = blogArticlesContainer.querySelectorAll('.blog-card');
            existingArticles.forEach(card => card.remove());
            
            // Create and append article cards
            data.forEach((article, index) => {
                const articleCard = createArticleCard(article, index);
                blogArticlesContainer.insertBefore(articleCard, noArticlesDiv);
            });
            
            console.log(`📝 Loaded ${data.length} blog articles from Supabase`);
        } else {
            // Show the "no articles" message
            if (noArticlesDiv) {
                noArticlesDiv.style.display = 'block';
            }
            console.log('📝 No blog articles found in Supabase');
        }
    } catch (error) {
        console.error('Error loading blog articles:', error);
    }
}

// Load Portfolio Items from Supabase
async function loadPortfolioItems() {
    const portfolioContainer = document.getElementById('portfolio-items');
    const noPortfolioDiv = portfolioContainer.querySelector('.no-portfolio');
    
    if (!portfolioContainer) {
        console.log('💼 Portfolio container not found');
        return;
    }
    
    try {
        // Get portfolio items from Supabase
        const { data, error } = await supabase
            .from('articoli')
            .select('*')
            .eq('section', 'portfolio')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Error fetching portfolio items:', error);
            // Fallback to localStorage if Supabase fails
            loadPortfolioItemsFromLocalStorage();
            return;
        }
        
        if (data && data.length > 0) {
            // Hide the "no portfolio" message
            if (noPortfolioDiv) {
                noPortfolioDiv.style.display = 'none';
            }
            
            // Clear existing items (except no-portfolio div)
            const existingItems = portfolioContainer.querySelectorAll('.portfolio-card');
            existingItems.forEach(card => card.remove());
            
            // Create and append portfolio cards
            data.forEach((item, index) => {
                const portfolioCard = createPortfolioCard(item, index);
                portfolioContainer.insertBefore(portfolioCard, noPortfolioDiv);
            });
            
            console.log(`💼 Loaded ${data.length} portfolio items from Supabase`);
        } else {
            // Fallback to localStorage if no items in Supabase
            loadPortfolioItemsFromLocalStorage();
        }
    } catch (error) {
        console.error('Error loading portfolio items:', error);
        // Fallback to localStorage
        loadPortfolioItemsFromLocalStorage();
    }
}

// Fallback function to load portfolio items from localStorage
function loadPortfolioItemsFromLocalStorage() {
    const portfolioContainer = document.getElementById('portfolio-items');
    const noPortfolioDiv = portfolioContainer.querySelector('.no-portfolio');
    
    // Get portfolio items from localStorage
    const portfolioItems = JSON.parse(localStorage.getItem('portfolioArticles') || '[]');
    
    if (portfolioItems.length > 0) {
        // Hide the "no portfolio" message
        if (noPortfolioDiv) {
            noPortfolioDiv.style.display = 'none';
        }
        
        // Clear existing items (except no-portfolio div)
        const existingItems = portfolioContainer.querySelectorAll('.portfolio-card');
        existingItems.forEach(card => card.remove());
        
        // Create and append portfolio cards
        portfolioItems.forEach((item, index) => {
            const portfolioCard = createPortfolioCard(item, index);
            portfolioContainer.insertBefore(portfolioCard, noPortfolioDiv);
        });
        
        console.log(`💼 Loaded ${portfolioItems.length} portfolio items from localStorage (fallback)`);
    } else {
        // Show the "no portfolio" message
        if (noPortfolioDiv) {
            noPortfolioDiv.style.display = 'block';
        }
        console.log('💼 No portfolio items found in localStorage');
    }
}

// Sync all articles from Supabase
async function syncArticlesFromSupabase() {
    console.log('🔄 Starting Supabase sync...');
    
    // Load both blog and portfolio articles
    await Promise.all([
        loadBlogArticles(),
        loadPortfolioItems()
    ]);
    
    console.log('✅ Supabase sync completed');
}

// Create Blog Article Card
function createArticleCard(article) {
    const card = document.createElement('div');
    card.className = 'blog-card';
    
    const truncatedExcerpt = truncateText(article.excerpt || '', 120);
    const displayImage = (article.mainImage || article.preview_image_url || '').toString() || 'https://via.placeholder.com/300x200?text=Articolo+Blog';
    
    card.innerHTML = `
        <div class="blog-image">
            <img src="${displayImage}" alt="${article.title}" loading="lazy" />
            ${article.category ? `<span class="blog-category">${article.category}</span>` : ''}
        </div>
        <div class="blog-content">
            <div class="blog-meta">
                <span class="blog-author">${article.author || 'Autore'}</span>
                <span class="blog-date">${formatDate(article.publishDate)}</span>
                ${article.readTime ? `<span class="blog-read-time">${article.readTime}</span>` : ''}
            </div>
            <h3 class="blog-title">${article.title}</h3>
            <p class="blog-excerpt">${truncatedExcerpt}</p>
            <a href="#" class="blog-read-more" onclick="openArticle('blog', '${article.id}')">Leggi di più →</a>
        </div>
    `;
    
    return card;
}

// Create Portfolio Card
function createPortfolioCard(item) {
    const card = document.createElement('div');
    card.className = 'portfolio-card';
    
    const truncatedExcerpt = truncateText(item.excerpt || '', 100);
    const displayImage = item.mainImage || 'https://via.placeholder.com/300x200?text=Portfolio+Item';
    
    card.innerHTML = `
        <div class="portfolio-image">
            <img src="${displayImage}" alt="${item.title}" loading="lazy" />
            ${item.category ? `<span class="portfolio-category">${item.category}</span>` : ''}
        </div>
        <div class="portfolio-content">
            <h3 class="portfolio-title">${item.title}</h3>
            <p class="portfolio-excerpt">${truncatedExcerpt}</p>
            <a href="#" class="portfolio-view-more" onclick="openArticle('portfolio', '${item.id}')">Visualizza →</a>
        </div>
    `;
    
    return card;
}

// Helper function to truncate text
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
}

// Helper function to format date
function formatDate(dateString) {
    if (!dateString) return 'Data non disponibile';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('it-IT', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (error) {
        return 'Data non valida';
    }
}

// Open article details page with the given ID
function openArticle(type, articleId) {
    try {
        if (!articleId) return;
        // Store type if you want to differentiate later (optional)
        localStorage.setItem('currentArticleType', type || 'blog');
        // Navigate to detailed page with query param id
        window.location.href = 'visualizzazionearticolo.html?id=' + encodeURIComponent(String(articleId));
    } catch (e) {
        console.error('openArticle error:', e);
    }
}

// Listen for storage changes from other tabs/windows (like the editor)
window.addEventListener('storage', function(e) {
    if (e.key === 'blogArticles') {
        console.log('📝 Blog articles updated in another tab');
        loadBlogArticles();
    }
    if (e.key === 'portfolioArticles') {
        console.log('💼 Portfolio items updated in another tab');
        loadPortfolioItems();
    }
});

// Listen for custom events from editor
window.addEventListener('articlesUpdated', function(e) {
    console.log('📝 Received articles update event:', e.detail);
    if (e.detail.storageKey === 'blogArticles') {
        loadBlogArticles();
    } else if (e.detail.storageKey === 'portfolioArticles') {
        loadPortfolioItems();
    }
});

// Console welcome message
console.log('%c🎨 Portfolio Website', 'color: #6366f1; font-size: 20px; font-weight: bold;');
console.log('%c📱 Responsive horizontal scrolling menu', 'color: #10b981; font-size: 14px;');
console.log('%c🚫 No hamburger, no problems!', 'color: #f59e0b; font-size: 12px;');







 // === METODO DI DIMAGRIIMENTO INTERACTIVE JAVASCRIPT ===
        document.addEventListener('DOMContentLoaded', function() {
            // Initialize accordion functionality
            initAccordion();
            
            // Initialize scientific toggle
            initScientificToggle();
        });

        // Accordion functionality
        function initAccordion() {
            const accordionHeaders = document.querySelectorAll('.accordion-header');
            
            accordionHeaders.forEach(header => {
                header.addEventListener('click', function() {
                    const accordionItem = this.closest('.accordion-item');
                    const content = this.nextElementSibling;
                    const icon = this.querySelector('.accordion-icon i');
                    
                    // Toggle active class
                    const isActive = this.classList.contains('active');
                    
                    // Close all other accordions
                    accordionHeaders.forEach(otherHeader => {
                        if (otherHeader !== this) {
                            otherHeader.classList.remove('active');
                            otherHeader.nextElementSibling.classList.remove('active');
                            otherHeader.querySelector('.accordion-icon i').style.transform = 'rotate(0deg)';
                        }
                    });
                    
                    // Toggle current accordion
                    if (!isActive) {
                        this.classList.add('active');
                        content.classList.add('active');
                        icon.style.transform = 'rotate(180deg)';
                    } else {
                        this.classList.remove('active');
                        content.classList.remove('active');
                        icon.style.transform = 'rotate(0deg)';
                    }
                });
            });
        }

        // Scientific toggle functionality
        function initScientificToggle() {
            const scientificToggle = document.querySelector('.scientific-toggle');
            const scientificContent = document.querySelector('.scientific-content');
            
            if (scientificToggle && scientificContent) {
                scientificToggle.addEventListener('click', function() {
                    const isActive = this.classList.contains('active');
                    
                    if (!isActive) {
                        this.classList.add('active');
                        scientificContent.classList.add('active');
                    } else {
                        this.classList.remove('active');
                        scientificContent.classList.remove('active');
                    }
                });
            }
        }

        // Add smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });