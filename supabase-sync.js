// Supabase client configuration
const supabaseUrl = 'https://aislcwzvooojemjizkhy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpc2xjd3p2b29vamVtaml6a2h5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNjMzOTgsImV4cCI6MjA3MDczOTM5OH0.BYGmgaqeu7bUhdW228JjlC9-x-9A9nVszibkuIBu63A';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Function to fetch articles from Supabase based on section
async function fetchArticlesBySection(section) {
    try {
        const { data, error } = await supabase
            .from('articoli')
            .select('*')
            .eq('section', section)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching articles:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

// Function to create article card HTML
function createArticleCard(article) {
    const date = new Date(article.created_at).toLocaleDateString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    return `
        <div class="article-card" data-id="${article.id}">
            <div class="article-image">
                ${article.preview_image_url ? 
                    `<img src="${article.preview_image_url}" alt="${article.title}" loading="lazy">` : 
                    '<div class="placeholder-image"><i class="fas fa-image"></i></div>'
                }
            </div>
            <div class="article-content">
                <div class="article-meta">
                    <span class="article-category">${article.category}</span>
                    <span class="article-date">${date}</span>
                    <span class="article-read-time">${article.readTime || '5 min'}</span>
                </div>
                <h3 class="article-title">${article.title}</h3>
                <p class="article-excerpt">${article.excerpt || ''}</p>
                <div class="article-author">
                    <span>Di ${article.author || 'Gianlorenzo Malvasi'}</span>
                </div>
                <a href="visualizzazionearticolo.html?id=${article.id}" class="read-more-btn">
                    Leggi di più
                    <i class="fas fa-arrow-right"></i>
                </a>
            </div>
        </div>
    `;
}

// Function to load and display articles for a specific section
async function loadSectionArticles(section) {
    const containerId = section === 'blog' ? 'blog-articles' : 'portfolio-items';
    const container = document.getElementById(containerId);
    const noContentDiv = container.querySelector('.no-articles, .no-portfolio');

    try {
        // Show loading state
        container.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Caricamento...</div>';

        // Fetch articles from Supabase
        const articles = await fetchArticlesBySection(section);

        // Clear container
        container.innerHTML = '';

        if (articles.length === 0) {
            // Show no articles message
            const noArticlesDiv = document.createElement('div');
            noArticlesDiv.className = section === 'blog' ? 'no-articles' : 'no-portfolio';
            noArticlesDiv.innerHTML = `
                <p>${section === 'blog' ? 'Nessun articolo pubblicato ancora.' : 'Nessun progetto portfolio ancora.'}</p>
            `;
            container.appendChild(noArticlesDiv);
            return;
        }

        // Create and append article cards
        articles.forEach(article => {
            const articleCard = createArticleCard(article);
            container.insertAdjacentHTML('beforeend', articleCard);
        });

    } catch (error) {
        console.error('Error loading articles:', error);
        container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Errore nel caricamento degli articoli. Riprova più tardi.</p>
            </div>
        `;
    }
}

// Function to initialize article loading
async function initializeArticles() {
    // Load blog articles
    await loadSectionArticles('blog');
    
    // Load portfolio articles
    await loadSectionArticles('portfolio');
}

// Function to refresh articles (useful after adding new articles)
async function refreshArticles() {
    await initializeArticles();
}

// Auto-refresh articles every 5 minutes
setInterval(refreshArticles, 5 * 60 * 1000);

// Listen for custom events to refresh articles
window.addEventListener('articlesUpdated', () => {
    refreshArticles();
});

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if Supabase client is available
    if (typeof createClient !== 'undefined') {
        initializeArticles();
    } else {
        console.error('Supabase client not loaded');
    }
});

// Export functions for global use
window.articleSync = {
    refreshArticles,
    loadSectionArticles,
    fetchArticlesBySection
};

async function syncArticlesToHTML() {
  try {
    const { data: articles, error } = await supabase
      .from('articoli')
      .select('*')
      .order('publishDate', { ascending: false });

    if (error) throw error;

    // Dividi gli articoli per sezione
    const blogArticles = articles.filter(article => article.section === 'blog');
    const portfolioArticles = articles.filter(article => article.section === 'portfolio');

    // Funzione per generare l'HTML di un articolo
    function generateArticleHTML(article) {
      return `
        <article class="post-card">
          <h2><a href="article.html?id=${article.id}">${article.title}</a></h2>
          <p class="post-meta">
            <span class="post-date">${new Date(article.publishDate).toLocaleDateString()}</span>
            <span class="post-author">${article.author}</span>
            <span class="post-category">${article.category}</span>
          </p>
          <p class="post-excerpt">${article.excerpt}</p>
        </article>
      `;
    }

    // Aggiorna gli articoli del blog
    const blogContainer = document.getElementById('blog-articles');
    blogContainer.innerHTML = blogArticles.map(generateArticleHTML).join('');

    // Aggiorna gli articoli del portfolio
    const portfolioContainer = document.getElementById('portfolio-items');
    portfolioContainer.innerHTML = portfolioArticles.map(generateArticleHTML).join('');

    console.log('Articoli sincronizzati con successo');
  } catch (error) {
    console.error('Errore durante la sincronizzazione degli articoli:', error);
  }
}

// Esegui la sincronizzazione quando il documento è completamente caricato
document.addEventListener('DOMContentLoaded', syncArticlesToHTML);