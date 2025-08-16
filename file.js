// Basic error catcher
window.addEventListener('error', (e) => {
    console.error('JavaScript Error:', e.error);
});

// Supabase client setup
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
const supabaseUrl = 'https://aislcwzvooojemjizkhy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpc2xjd3p2b29vamVtaml6a2h5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNjMzOTgsImV4cCI6MjA3MDczOTM5OH0.BYGmgaqeu7bUhdW228JjlC9-x-9A9nVszibkuIBu63A';
const supabase = createClient(supabaseUrl, supabaseKey);
// Funzione per salvare o aggiornare un articolo su Supabase
async function saveArticle(article) {
    // Assicura un ID sempre valorizzato per rispettare il NOT NULL su 'id'
    const ensuredId = article?.id && String(article.id).trim() !== '' ? String(article.id) : (crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`);
    const payload = { ...article, id: ensuredId };

    const { data, error } = await supabase
        .from('articoli')
        .upsert([payload], { onConflict: ['id'] }); // 'id' è la chiave primaria

    if (error) {
        console.error('Errore salvataggio articolo:', error.message);
        return false;
    }
    console.log('Articolo salvato!', data);
    return true;
}

// Theme Management
class ThemeManager {
    constructor() {
        this.theme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        this.setTheme(this.theme);
        this.bindEvents();
    }

    setTheme(theme) {
        this.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        this.updateThemeButton();
    }

    toggleTheme() {
        const newTheme = this.theme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }

    updateThemeButton() {
        const button = document.getElementById('theme-toggle');
        const sunIcon = button.querySelector('.sun-icon');
        const moonIcon = button.querySelector('.moon-icon');

        if (this.theme === 'dark') {
            sunIcon.style.opacity = '0.5';
            moonIcon.style.opacity = '1';
        } else {
            sunIcon.style.opacity = '1';
            moonIcon.style.opacity = '0.5';
        }
    }

    bindEvents() {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }
}

// Navigation Management
class NavigationManager {
    constructor() {
        this.navbar = document.querySelector('.navbar');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.hamburger = document.querySelector('.hamburger');
        this.navMenu = document.querySelector('.nav-menu');
        this.init();
    }

    init() {
        this.bindEvents();
        this.handleScroll();
    }

    bindEvents() {
        // Smooth scrolling for navigation links
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetSection = document.querySelector(targetId);

                if (targetSection) {
                    const offsetTop = targetSection.offsetTop - 70; // Account for fixed navbar
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }

                // Close mobile menu if open
                this.closeMobileMenu();
            });
        });

        // Mobile menu toggle
        if (this.hamburger) {
            this.hamburger.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
        }

        // Scroll event for navbar styling
        window.addEventListener('scroll', () => {
            this.handleScroll();
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.navbar.contains(e.target)) {
                this.closeMobileMenu();
            }
        });
    }

    toggleMobileMenu() {
        this.navMenu.classList.toggle('active');
        this.hamburger.classList.toggle('active');
    }

    closeMobileMenu() {
        this.navMenu.classList.remove('active');
        this.hamburger.classList.remove('active');
    }

    handleScroll() {
        const scrolled = window.scrollY > 50;

        if (scrolled) {
            this.navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            this.navbar.style.backdropFilter = 'blur(20px)';
        } else {
            this.navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            this.navbar.style.backdropFilter = 'blur(10px)';
        }

        // Update active navigation link based on scroll position
        this.updateActiveNavLink();
    }

    updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                this.navLinks.forEach(link => link.classList.remove('active'));
                if (navLink) {
                    navLink.classList.add('active');
                }
            }
        });
    }
}

// Article functionality
class ArticleManager {
    constructor() {
        this.currentArticle = null;
        this.blobUrls = new Set(); // Keep track of blob URLs to clean up
        this.init();
    }

    async init() {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        if (id) {
            await this.loadArticleById(id);
        } else {
            this.loadCurrentArticle();
        }
        this.bindEvents();
        this.setupReadingProgress();
        // this.loadRelatedArticles(); // Disabled - related articles section removed
    }



    loadCurrentArticle() {
        const articleData = localStorage.getItem('currentArticle');
        if (articleData) {
            this.currentArticle = JSON.parse(articleData);
            this.renderArticle();
        }
    }

    // Load article by id from Supabase and render
    async loadArticleById(id) {
        try {
            const { data, error } = await supabase
                .from('articoli')
                .select('*')
                .eq('id', id)
                .single();
            if (error) {
                console.error('Errore caricamento articolo:', error.message);
                return;
            }
            // Normalizza per il renderer già esistente
            const normalized = {
                id: data.id,
                title: data.title,
                category: data.category,
                author: data.author,
                excerpt: data.excerpt,
                content: data.content,
                date: data.publishDate,
                readTime: data.readTime,
                mainImage: data.preview_image_url ? { src: data.preview_image_url, alt: data.title } : null
            };
            this.currentArticle = normalized;
            localStorage.setItem('currentArticle', JSON.stringify(normalized));
            this.renderArticle();
        } catch (e) {
            console.error('loadArticleById exception:', e);
        }
    }

    renderArticle() {
        if (!this.currentArticle) return;

        const article = this.currentArticle;

        // Update article title
        const titleElement = document.querySelector('.article-title');
        if (titleElement) {
            titleElement.textContent = article.title;
        }

        // Update article meta information
        const categoryElement = document.querySelector('.article-category');
        if (categoryElement) {
            categoryElement.textContent = article.category;
        }

        const dateElement = document.querySelector('.article-date');
        if (dateElement) {
            dateElement.textContent = article.date;
        }

        const readTimeElement = document.querySelector('.article-read-time');
        if (readTimeElement) {
            readTimeElement.textContent = article.readTime;
        }

        // Update author information
        const authorNameElement = document.querySelector('.author-name');
        if (authorNameElement) {
            authorNameElement.textContent = article.author;
        }

        // Update main article image if available
        const articleImageElement = document.querySelector('.article-image');
        if (articleImageElement && article.mainImage) {
            // Clear existing image
            articleImageElement.innerHTML = '';

            // Create main image
            const mainImageHtml = `
                <img src="${article.mainImage.src}" 
                     alt="${article.mainImage.alt}" 
                     class="featured-image"
                     loading="lazy" />
                <div class="image-caption">${article.mainImage.alt}</div>
            `;
            articleImageElement.innerHTML = mainImageHtml;
        } else if (articleImageElement && !article.mainImage) {
            // Hide image section if no main image
            articleImageElement.style.display = 'none';
        }

        // Update article content
        const articleBodyElement = document.querySelector('.article-body');
        if (articleBodyElement) {
            // Clear existing content except for the intro
            const introElement = articleBodyElement.querySelector('.article-intro');
            articleBodyElement.innerHTML = '';

            // Add intro with excerpt
            if (introElement) {
                introElement.querySelector('.lead-paragraph').textContent = article.excerpt;
                articleBodyElement.appendChild(introElement);
            } else {
                const newIntro = document.createElement('div');
                newIntro.className = 'article-intro';
                newIntro.innerHTML = `<p class="lead-paragraph">${article.excerpt}</p>`;
                articleBodyElement.appendChild(newIntro);
            }

            // Add main content
            const contentDiv = document.createElement('div');
            contentDiv.className = 'article-section';
            contentDiv.innerHTML = article.content;
            articleBodyElement.appendChild(contentDiv);
        }

        // Update page title
        document.title = `${article.title} - Blog & Portfolio`;
    }

    bindEvents() {
        // Social sharing
        const shareButtons = document.querySelectorAll('.share-btn');
        shareButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleShare(button);
            });
        });

        // Tag interactions
        const tags = document.querySelectorAll('.tag');
        tags.forEach(tag => {
            tag.addEventListener('click', () => {
                this.handleTagClick(tag);
            });
        });
    }

    handleShare(button) {
        const url = window.location.href;
        const title = document.querySelector('.article-title')?.textContent || '';
        const text = (document.querySelector('.lead-paragraph')?.textContent || '').substring(0, 100) + '...';

        if (button.classList.contains('facebook')) {
            window.open(`https://www.facebook.com/sharer/sharer.php?u=  ${encodeURIComponent(url)}`, '_blank');
        } else if (button.classList.contains('twitter')) {
            window.open(`https://twitter.com/intent/tweet?url=  ${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
        } else if (button.classList.contains('linkedin')) {
            window.open(`https://www.linkedin.com/sharing/share-offsite/?url=  ${encodeURIComponent(url)}`, '_blank');
        } else if (button.classList.contains('email')) {
            window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text + '\n\n' + url)}`;
        }
    }

    handleTagClick(tag) {
        // Add visual feedback
        tag.style.transform = 'scale(0.95)';
        setTimeout(() => {
            tag.style.transform = '';
        }, 150);

        // Here you could implement tag filtering or navigation
        console.log('Tag clicked:', tag.textContent);
    }

    setupReadingProgress() {
        // Create reading progress bar
        const progressBar = document.createElement('div');
        progressBar.className = 'reading-progress';
        progressBar.innerHTML = '<div class="reading-progress-bar"></div>';
        document.body.appendChild(progressBar);

        // Update progress on scroll
        window.addEventListener('scroll', () => {
            const article = document.querySelector('.article-content');
            if (!article) return;

            const articleTop = article.offsetTop;
            const articleHeight = article.offsetHeight;
            const windowHeight = window.innerHeight;
            const scrollTop = window.scrollY;

            const progress = Math.min(
                Math.max((scrollTop - articleTop + windowHeight) / articleHeight, 0),
                1
            );

            const progressBarFill = document.querySelector('.reading-progress-bar');
            if (progressBarFill) {
                progressBarFill.style.width = `${progress * 100}%`;
            }

            // Show/hide progress bar based on scroll
            if (scrollTop > 100) {
                progressBar.classList.add('visible');
                document.body.classList.add('scrolled');
            } else {
                progressBar.classList.remove('visible');
                document.body.classList.remove('scrolled');
            }
        });
    }

    async loadRelatedArticles() {
        if (!this.currentArticle) return;

        const relatedContainer = document.querySelector('.related-grid');
        if (!relatedContainer) return;

        // Clean up previous blob URLs
        this.cleanupBlobUrls();

        // Get articles from both blog and portfolio

        const [blogArticles, portfolioArticles] = await loadArticlesFromSupabase();
        const allArticles = [...blogArticles, ...portfolioArticles];

        // Filter out current article and get related articles
        const currentId = this.currentArticle.id;
        const currentCategory = this.currentArticle.category;

        let relatedArticles = allArticles
            .filter(article => article.id !== currentId)
            .filter(article =>
                article.category === currentCategory ||
                this.hasCommonTags(article, this.currentArticle)
            )
            .slice(0, 6); // Get more articles for the slider

        // If not enough related articles by category/tags, get recent ones
        if (relatedArticles.length < 6) {
            const additionalArticles = allArticles
                .filter(article => article.id !== currentId)
                .filter(article => !relatedArticles.find(related => related.id === article.id))
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 6 - relatedArticles.length);

            relatedArticles = [...relatedArticles, ...additionalArticles];
        }

        // Clear existing content
        relatedContainer.innerHTML = '';

        // Generate related articles HTML
        relatedArticles.forEach(article => {
            const articleCard = this.createRelatedArticleCard(article);
            relatedContainer.appendChild(articleCard);
        });

        // If no related articles found, create some sample ones for demonstration
        if (relatedArticles.length === 0) {
            relatedArticles = this.createSampleArticles();
            // Clear again and add sample articles
            relatedContainer.innerHTML = '';
            relatedArticles.forEach(article => {
                const articleCard = this.createRelatedArticleCard(article);
                relatedContainer.appendChild(articleCard);
            });
        }

        // Initialize slider controls
        this.initializeSliderControls();

        // Show the section
        const relatedSection = document.querySelector('.related-articles');
        if (relatedSection) {
            relatedSection.style.display = 'block';
        }
    }

    hasCommonTags(article1, article2) {
        // Simple tag matching based on category similarity
        const keywords1 = article1.title.toLowerCase().split(' ');
        const keywords2 = article2.title.toLowerCase().split(' ');

        return keywords1.some(keyword =>
            keywords2.includes(keyword) && keyword.length > 3
        );
    }

    createSampleArticles() {
        return [
            {
                id: 'sample1',
                title: 'Come Iniziare un Programma di Allenamento',
                category: 'Allenamento',
                author: 'Trainer Esperto',
                excerpt: 'Scopri i primi passi per creare una routine di allenamento efficace e sostenibile nel tempo.',
                content: '<p>Guida completa per principianti...</p>',
                date: '10 Gennaio 2025',
                readTime: '4 min di lettura',
                mainImage: {
                    src: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=320&h=180&fit=crop&crop=center  ',
                    alt: 'Persona che si allena'
                }
            },
            {
                id: 'sample2',
                title: 'Nutrizione per lo Sport: Cosa Mangiare',
                category: 'Nutrizione',
                author: 'Nutrizionista',
                excerpt: 'I migliori alimenti per supportare i tuoi allenamenti e migliorare le performance sportive.',
                content: '<p>Guida nutrizionale completa...</p>',
                date: '8 Gennaio 2025',
                readTime: '6 min di lettura',
                mainImage: {
                    src: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=320&h=180&fit=crop&crop=center  ',
                    alt: 'Cibo salutare'
                }
            },
            {
                id: 'sample3',
                title: 'Tecniche di Rilassamento e Meditazione',
                category: 'Benessere',
                author: 'Esperto Benessere',
                excerpt: 'Impara tecniche semplici ed efficaci per ridurre lo stress e migliorare il tuo benessere mentale.',
                content: '<p>Guida al relax e alla meditazione...</p>',
                date: '5 Gennaio 2025',
                readTime: '5 min di lettura',
                mainImage: {
                    src: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=320&h=180&fit=crop&crop=center  ',
                    alt: 'Persona che medita'
                }
            },
            {
                id: 'sample4',
                title: 'App Mobile per il Fitness: Le Migliori',
                category: 'Tecnologia',
                author: 'Tech Expert',
                excerpt: 'Recensione delle migliori applicazioni mobile per monitorare i tuoi progressi fitness.',
                content: '<p>Analisi delle app più popolari...</p>',
                date: '3 Gennaio 2025',
                readTime: '7 min di lettura',
                mainImage: {
                    src: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=320&h=180&fit=crop&crop=center  ',
                    alt: 'Smartphone con app fitness'
                }
            },
            {
                id: 'sample5',
                title: 'Design UX per App di Wellness',
                category: 'UI/UX',
                author: 'UX Designer',
                excerpt: 'Come progettare interfacce user-friendly per applicazioni dedicate al benessere e alla salute.',
                content: '<p>Principi di design per il wellness...</p>',
                date: '1 Gennaio 2025',
                readTime: '8 min di lettura',
                mainImage: {
                    src: 'https://images.unsplash.com/photo-1559028006-448665bd7c7f?w=320&h=180&fit=crop&crop=center  ',
                    alt: 'Design interface mockup'
                }
            }
        ];
    }

    createRelatedArticleCard(article) {
        const card = document.createElement('article');
        card.className = 'related-card';

        // Prioritize main article image, then content images, then category-specific default
        const imageUrl = this.getArticlePreviewImage(article) ||
            this.getDefaultImageByCategory(article.category);

        const excerpt = article.excerpt || this.generateExcerpt(article.content, 100);

        card.innerHTML = `
            <div class="related-image">
                <img src="${imageUrl}" alt="${article.title}" loading="lazy" />
            </div>
            <div class="related-content">
                <h4 title="${article.title}">${article.title}</h4>
                <p>${excerpt}</p>
                <a href="javascript:void(0);" class="read-more" onclick="window.loadArticle('${article.id}')" data-article-id="${article.id}">Leggi di più</a>
            </div>
        `;

        // Simple card click handler (excluding read more link)
        card.addEventListener('click', (e) => {
            if (e.target.closest('.read-more')) return;
            window.loadArticle(article.id);
        });

        // Add hover effects
        card.addEventListener('mouseenter', () => {
            card.style.cursor = 'pointer';
        });

        return card;
    }

    getDefaultImageByCategory(category) {
        const defaultImages = {
            'Fitness & Salute': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=320&h=180&fit=crop&crop=center  ',
            'Nutrizione': 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=320&h=180&fit=crop&crop=center  ',
            'Allenamento': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=320&h=180&fit=crop&crop=center  ',
            'Benessere': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=320&h=180&fit=crop&crop=center  ',
            'Lifestyle': 'https://images.unsplash.com/photo-1506629905607-b5f859951999?w=320&h=180&fit=crop&crop=center  ',
            'Sviluppo Web': 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=320&h=180&fit=crop&crop=center  ',
            'Design': 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=320&h=180&fit=crop&crop=center  ',
            'Tecnologia': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=320&h=180&fit=crop&crop=center  ',
            'Progetti': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=320&h=180&fit=crop&crop=center  ',
            'App Mobile': 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=320&h=180&fit=crop&crop=center  ',
            'UI/UX': 'https://images.unsplash.com/photo-1559028006-448665bd7c7f?w=320&h=180&fit=crop&crop=center  '
        };

        return defaultImages[category] || 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=320&h=180&fit=crop&crop=center  ';
    }

    getArticlePreviewImage(article) {
        // 1. Check if article has a main image (from the editor)
        if (article.mainImage && article.mainImage.src) {
            // Convert data URL to blob URL for better performance
            if (article.mainImage.src.startsWith('data:')) {
                return this.convertDataUrlToBlobUrl(article.mainImage.src);
            }
            return article.mainImage.src;
        }

        // 2. Extract first image from article content
        const contentImage = this.getImageFromContent(article.content);
        if (contentImage) {
            // Convert data URL to blob URL for better performance
            if (contentImage.startsWith('data:')) {
                return this.convertDataUrlToBlobUrl(contentImage);
            }
            return contentImage;
        }

        return null; // Will use placeholder
    }

    getImageFromContent(content) {
        // Extract first image from article content
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');
        const firstImage = doc.querySelector('img');

        if (firstImage && firstImage.src) {
            return firstImage.src;
        }

        return null;
    }

    // Convert data URL to blob URL for better performance
    convertDataUrlToBlobUrl(dataUrl) {
        if (!dataUrl.startsWith('data:')) {
            return dataUrl;
        }

        try {
            // Convert data URL to blob
            const arr = dataUrl.split(',');
            const mime = arr[0].match(/:(.*?);/)[1];
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);

            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }

            const blob = new Blob([u8arr], { type: mime });
            const blobUrl = URL.createObjectURL(blob);

            // Keep track of blob URL for cleanup
            this.blobUrls.add(blobUrl);

            return blobUrl;
        } catch (error) {
            console.warn('Failed to convert data URL to blob URL:', error);
            return dataUrl;
        }
    }

    // Clean up blob URLs to prevent memory leaks
    cleanupBlobUrls() {
        this.blobUrls.forEach(url => {
            URL.revokeObjectURL(url);
        });
        this.blobUrls.clear();
    }

    generateExcerpt(content, maxLength = 120) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');
        const text = doc.body.textContent || doc.body.innerText || '';

        return text.length > maxLength
            ? text.substring(0, maxLength).trim() + '...'
            : text;
    }

    // This method is now replaced by the global window.loadArticle function
    loadArticleById(articleId) {
        window.loadArticle(articleId);
    }





    initializeSliderControls() {
        const slider = document.getElementById('related-slider');
        const prevBtn = document.getElementById('slider-prev');
        const nextBtn = document.getElementById('slider-next');

        if (!slider || !prevBtn || !nextBtn) return;

        const cardWidth = 280 + 24; // card width + gap

        // Update button states
        const updateButtonStates = () => {
            const scrollLeft = slider.scrollLeft;
            const maxScroll = slider.scrollWidth - slider.clientWidth;

            prevBtn.disabled = scrollLeft <= 0;
            nextBtn.disabled = scrollLeft >= maxScroll - 1;
        };

        // Initial button state
        updateButtonStates();

        // Previous button
        prevBtn.addEventListener('click', () => {
            slider.scrollBy({
                left: -cardWidth * 2,
                behavior: 'smooth'
            });
        });

        // Next button
        nextBtn.addEventListener('click', () => {
            slider.scrollBy({
                left: cardWidth * 2,
                behavior: 'smooth'
            });
        });

        // Update button states on scroll
        slider.addEventListener('scroll', updateButtonStates);

        // Handle keyboard navigation
        slider.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                prevBtn.click();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                nextBtn.click();
            }
        });

        // Touch/mouse drag support
        let isDown = false;
        let startX;
        let scrollLeft;

        slider.addEventListener('mousedown', (e) => {
            isDown = true;
            slider.classList.add('dragging');
            startX = e.pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
        });

        slider.addEventListener('mouseleave', () => {
            isDown = false;
            slider.classList.remove('dragging');
        });

        slider.addEventListener('mouseup', () => {
            isDown = false;
            slider.classList.remove('dragging');
        });

        slider.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - slider.offsetLeft;
            const walk = (x - startX) * 2;
            slider.scrollLeft = scrollLeft - walk;
        });
    }
}

// Global function for article loading (called from onclick)
window.loadArticle = function (articleId) {

    // Get articles from localStorage
    const blogArticles = JSON.parse(localStorage.getItem('blogArticles') || '[]');
    const portfolioArticles = JSON.parse(localStorage.getItem('portfolioArticles') || '[]');
    const allArticles = [...blogArticles, ...portfolioArticles];

    // Find the article
    const article = allArticles.find(a =>
        String(a.id) === String(articleId) ||
        a.id == articleId
    );

    if (article) {
        // Save it and reload
        localStorage.setItem('currentArticle', JSON.stringify(article));
        window.location.reload();
    } else {
        // Check sample articles
        const sampleArticles = [
            {
                id: 'sample1',
                title: 'Come Iniziare un Programma di Allenamento',
                category: 'Allenamento',
                author: 'Trainer Esperto',
                excerpt: 'Scopri i primi passi per creare una routine di allenamento efficace.',
                content: '<h2>Guida per Principianti</h2><p>Iniziare un programma di allenamento può sembrare difficile, ma con i giusti consigli è più facile di quanto pensi...</p>',
                date: '10 Gennaio 2025',
                readTime: '4 min di lettura',
                mainImage: {
                    src: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=320&h=180&fit=crop&crop=center  ',
                    alt: 'Persona che si allena'
                }
            }
        ];

        const sampleArticle = sampleArticles.find(a => String(a.id) === String(articleId));
        if (sampleArticle) {
            localStorage.setItem('currentArticle', JSON.stringify(sampleArticle));
            window.location.reload();
        } else {
            alert('Articolo non trovato!');
        }
    }
};

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ThemeManager();
    new NavigationManager();
    window.articleManager = new ArticleManager();
});

// Initialize on page load as fallback
window.addEventListener('load', () => {
    if (!document.querySelector('.theme-manager-initialized')) {
        new ThemeManager();
        new NavigationManager();
        window.articleManager = new ArticleManager();
        document.body.classList.add('theme-manager-initialized');
    }
});

// Clean up blob URLs when page unloads
window.addEventListener('beforeunload', () => {
    if (window.articleManager) {
        window.articleManager.cleanupBlobUrls();
    }
});