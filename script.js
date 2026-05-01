document.addEventListener('DOMContentLoaded', function() {
    // Basit site fonksiyonları
    initializePage();
    
    function initializePage() {
        setupDarkMode();
        setupMobileMenu();
        setupBackToTop();
        setupLanguageSwitcher();
        setupCVDownload();
        
        // GitHub Projects sadece ilgili sayfalarda
        if (document.getElementById('repos')) {
            loadGitHubProjects();
        }
        
        // Blog sadece ilgili sayfalarda
        if (document.getElementById('blog-grid')) {
            loadBlogPosts();
        }
        
        // Article sadece ilgili sayfalarda
        if (document.getElementById('article-content')) {
            loadArticle();
        }
    }
    
    function setupDarkMode() {
        const darkModeEnabled = localStorage.getItem('darkMode') === 'enabled';
        if (darkModeEnabled) {
            document.body.classList.add('dark-mode');
        }

        const darkModeToggle = document.querySelector('.theme-toggle input');
        const mobileDarkModeToggle = document.querySelector('.mobile-theme-toggle input');
        
        if (darkModeToggle) {
            darkModeToggle.checked = darkModeEnabled;
            darkModeToggle.addEventListener('change', function() {
                toggleDarkMode(this.checked);
            });
        }

        if (mobileDarkModeToggle) {
            mobileDarkModeToggle.checked = darkModeEnabled;
            mobileDarkModeToggle.addEventListener('change', function() {
                toggleDarkMode(this.checked);
            });
        }

        function toggleDarkMode(enable) {
            if (enable) {
                document.body.classList.add('dark-mode');
                localStorage.setItem('darkMode', 'enabled');
            } else {
                document.body.classList.remove('dark-mode');
                localStorage.setItem('darkMode', 'disabled');
            }
            
            if (darkModeToggle) darkModeToggle.checked = enable;
            if (mobileDarkModeToggle) mobileDarkModeToggle.checked = enable;
        }
    }

    function setupMobileMenu() {
        const hamburger = document.querySelector('.hamburger-menu');
        const mobileMenu = document.querySelector('.mobile-menu');
        const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
        const mobileMenuClose = document.querySelector('.mobile-menu-close');
        
        if (hamburger) {
            hamburger.addEventListener('click', openMobileMenu);
        }
        
        if (mobileMenuClose) {
            mobileMenuClose.addEventListener('click', closeMobileMenu);
        }
        
        if (mobileMenuOverlay) {
            mobileMenuOverlay.addEventListener('click', closeMobileMenu);
        }
        
        document.querySelectorAll('.mobile-nav-links a').forEach(item => {
            item.addEventListener('click', closeMobileMenu);
        });

        function openMobileMenu() {
            if (mobileMenu) mobileMenu.classList.add('active');
            if (mobileMenuOverlay) mobileMenuOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeMobileMenu() {
            if (mobileMenu) mobileMenu.classList.remove('active');
            if (mobileMenuOverlay) mobileMenuOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    function setupBackToTop() {
        const backToTopButton = document.querySelector('.back-to-top');
        if (backToTopButton) {
            window.addEventListener('scroll', function() {
                if (window.pageYOffset > 300) {
                    backToTopButton.classList.add('active');
                } else {
                    backToTopButton.classList.remove('active');
                }
            });

            backToTopButton.addEventListener('click', function(e) {
                e.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }
    }

    function setupLanguageSwitcher() {
        const languageOptions = document.querySelectorAll('.language-option');
        languageOptions.forEach(option => {
            option.addEventListener('click', function() {
                const selectedLang = this.textContent.trim();
                const currentPath = window.location.pathname;
                
                if (selectedLang === 'EN') {
                    // Türkçe'den İngilizce'ye geçiş
                    if (currentPath.includes('tr') || currentPath === '/tr') {
                        window.location.href = '/';
                    } else if (currentPath.includes('yetenekler') || currentPath === '/yetenekler') {
                        window.location.href = '/skills';
                    } else if (currentPath.includes('projeler') || currentPath === '/projeler') {
                        window.location.href = '/projects';
                    } else if (currentPath.includes('deneyim') || currentPath === '/deneyim') {
                        window.location.href = '/experience';
                    } else if (currentPath.includes('fotograflar') || currentPath === '/fotograflar') {
                        window.location.href = '/photos';
                    } else if (currentPath.includes('yonetim') || currentPath === '/yonetim') {
                        window.location.href = '/admin';
                    } else if (currentPath.includes('yazilar') || currentPath === '/yazilar') {
                        window.location.href = '/posts';
                    } else if (currentPath.includes('blog-tr') || currentPath === '/blog-tr') {
                        window.location.href = '/blog'; // eski yönlendirme, kaldırılacak
                    } else if (currentPath.includes('yazilar') || currentPath === '/yazilar') {
                        window.location.href = '/posts';
                    }
                } else if (selectedLang === 'TR') {
                    // İngilizce'den Türkçe'ye geçiş
                    if (currentPath.includes('index') || currentPath === '/' || currentPath === '') {
                        window.location.href = '/tr';
                    } else if (currentPath.includes('skills') || currentPath === '/skills') {
                        window.location.href = '/yetenekler';
                    } else if (currentPath.includes('projects') || currentPath === '/projects') {
                        window.location.href = '/projeler';
                    } else if (currentPath.includes('experience') || currentPath === '/experience') {
                        window.location.href = '/deneyim';
                    } else if (currentPath.includes('photos') || currentPath === '/photos') {
                        window.location.href = '/fotograflar';
                    } else if (currentPath.includes('admin') || currentPath === '/admin') {
                        window.location.href = '/yonetim';
                    } else if (currentPath.includes('posts') || currentPath === '/posts') {
                        window.location.href = '/yazilar';
                    } else if (currentPath.includes('blog') || currentPath === '/blog') {
                        window.location.href = '/yazilar';
                    }
                }
            });
        });
    }

    function setupCVDownload() {
        const cvBtn = document.getElementById('cv-download-btn');
        if (cvBtn) {
            updateCVLink();
        }
    }

    function updateCVLink() {
        // Try to get the latest CV file from Assets directory
        const cvBtn = document.getElementById('cv-download-btn');
        if (!cvBtn) return;

        // Check for newer CV files via GitHub API
        fetch('https://api.github.com/repos/alihaydarsucu/alihaydarsucu.github.io/contents/Assets')
            .then(response => response.json())
            .then(files => {
                // Find the most recent CV file
                const cvFiles = files.filter(file => 
                    file.name.includes('AliHaydarSucu_CV_') && file.name.endsWith('.pdf')
                );
                
                if (cvFiles.length > 0) {
                    // Sort by name (which includes date) and get the latest
                    cvFiles.sort((a, b) => b.name.localeCompare(a.name));
                    const latestCV = cvFiles[0];
                    cvBtn.href = `Assets/${latestCV.name}`;
                    
                    // Update the note with last update time
                    const cvNote = document.querySelector('.cv-note');
                    if (cvNote) {
                        const lastUpdate = new Date().toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        });
                        cvNote.innerHTML = `<i class="fas fa-sync-alt"></i> CV automatically updated - Last: ${lastUpdate}`;
                    }
                }
            })
            .catch(error => {
                console.log('Using default CV link');
            });
    }

    // GitHub Projects fonksiyonları
    async function loadGitHubProjects() {
        try {
            const response = await fetch('https://api.github.com/users/alihaydarsucu/repos?sort=updated&per_page=20');
            const repos = await response.json();
            
            if (Array.isArray(repos)) {
                // Özel projeler - kendi GitHub'ımda olmayan ortak projeler
                const externalProjects = [
                    {
                        name: 'Pusula-GCS',
                        description: 'Custom-built Ground Control Station software for real-time communication with unmanned surface vehicles (USV). Features telemetry, mission planning, and interactive mapping.',
                        html_url: 'https://github.com/abdullah-aksoy/Pusula-GCS',
                        language: 'Python',
                        stargazers_count: 5,
                        updated_at: '2025-08-31T00:00:00Z',
                        fork: false
                    }
                    // Gelecekte eklenecek diğer external projeler buraya eklenebilir
                ];
                
                // GitHub repos ile external projeleri birleştir
                const allRepos = [...repos, ...externalProjects];
                displayRepos(allRepos);
                setupFilterButtons(allRepos);
            } else {
                document.getElementById('repos').innerHTML = '<p style="text-align: center;">GitHub projeleri yüklenemedi.</p>';
            }
        } catch (error) {
            console.error('GitHub repos fetch error:', error);
            document.getElementById('repos').innerHTML = '<p style="text-align: center;">GitHub projeleri yüklenemedi.</p>';
        }
    }

    function displayRepos(repos, filter = 'all') {
        const reposContainer = document.getElementById('repos');
        const filteredRepos = repos.filter(repo => {
            if (filter === 'all') return !repo.fork;
            const categories = categorizeRepo(repo);
            // Çoklu kategori desteği
            if (categories.includes(',')) {
                return !repo.fork && categories.split(',').includes(filter);
            }
            return !repo.fork && categories === filter;
        });

        reposContainer.innerHTML = filteredRepos.map(repo => `
            <div class="github-project-card" data-category="${categorizeRepo(repo)}">
                <div class="github-project-header">
                    <h3 class="github-project-title">
                        <a href="${repo.html_url}" target="_blank">${repo.name}</a>
                    </h3>
                </div>
                <p class="github-project-description">${repo.description || 'Açıklama bulunmuyor'}</p>
                <div class="github-project-meta">
                    ${repo.language ? `<span class="github-project-language"><span class="github-project-language-color" style="background-color: ${getLanguageColor(repo.language)}"></span>${repo.language}</span>` : ''}
                    <span class="github-project-stars">⭐ ${repo.stargazers_count}</span>
                    <span class="github-project-updated">${formatDate(repo.updated_at)}</span>
                </div>
            </div>
        `).join('');

        setTimeout(() => {
            document.querySelectorAll('.github-project-card').forEach((card, index) => {
                setTimeout(() => {
                    card.classList.add('show');
                }, index * 100);
            });
        }, 100);
    }

    function categorizeRepo(repo) {
        const name = repo.name.toLowerCase();
        const description = (repo.description || '').toLowerCase();
        const language = (repo.language || '').toLowerCase();
        
        // Özel projeler - hard coded kategoriler
        const specialProjects = {
            'pusula.github.io': 'web,embedded',
            'pusula-gcs': 'embedded',
            // Gelecekte eklenecek özel projeler buraya eklenebilir
        };
        
        // Önce özel projeler kontrolü
        if (specialProjects[name]) {
            return specialProjects[name];
        }
        
        // Genel kategorizasyon kuralları
        if (name.includes('web') || name.includes('site') || language.includes('html') || language.includes('css') || language.includes('javascript')) {
            return 'web';
        }
        
        if (name.includes('embedded') || name.includes('arduino') || description.includes('embedded') || 
            language.includes('c++') || language.includes('c') || language.includes('shell') || language.includes('makefile')) {
            return 'embedded';
        }
        
        return 'other';
    }

    function getLanguageColor(language) {
        const colors = {
            'JavaScript': '#f1e05a',
            'Python': '#3572A5',
            'HTML': '#e34c26',
            'CSS': '#563d7c',
            'Java': '#b07219',
            'C++': '#f34b7d',
            'C': '#098b2a96',
            'Shell': '#89e051',
        };
        return colors[language] || '#858585';
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return '1 gün önce';
        if (diffDays < 30) return `${diffDays} gün önce`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} ay önce`;
        return `${Math.floor(diffDays / 365)} yıl önce`;
    }

    function setupFilterButtons(repos) {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                filterButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                const filter = this.getAttribute('data-filter');
                displayRepos(repos, filter);
            });
        });
    }
    
    // Blog Posts fonksiyonları
    async function loadBlogPosts() {
        const blogGrid = document.getElementById('blog-grid');
        const blogLoading = document.querySelector('.blog-loading');
        const blogError = document.getElementById('blog-error');
        
        try {
            // Mevcut sayfa dilini belirle - Türkçe ve İngilizce URL'ler
            const isTurkishBlog = window.location.pathname.includes('yazilar') || window.location.pathname.includes('blog-tr');
            const isEnglishBlog = window.location.pathname.includes('posts') || window.location.pathname.includes('blog.html');
            const pageLang = isTurkishBlog ? 'tr' : (isEnglishBlog ? 'en' : 'en');
            
            // URL'den kategori parametrelerini al
            const urlParams = new URLSearchParams(window.location.search);
            const category = urlParams.get('category') || 'all';
            const subcategory = urlParams.get('subcategory') || 'all';
            
            // Test için mock data - GitHub Actions ile güncellenen veriyi kullan
            const useMockData = false; // false yapın gerçek veri için
            
            if (useMockData) {
                // Test verileri
                const mockPosts = [
                    {
                        title: "Arduino ile Gömülü Sistemler Geliştirme",
                        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Bu yazıda Arduino kullanarak nasıl gömülü sistemler geliştirebileceğimizi anlatacağım. Microcontroller programming ve embedded systems konularına değineceğiz.",
                        link: "https://alihaydarsucu.substack.com/p/arduino-ile-gomulu-sistemler",
                        pubDate: "2025-02-14T10:00:00Z",
                        slug: "arduino-ile-gomulu-sistemler",
                        lang: "tr",
                        category: "technical",
                        subcategory: "embedded",
                        categories: ["#technical", "#embedded", "#arduino"]
                    },
                    {
                        title: "Clean Code Kitap İncelemesi: Robert C. Martin",
                        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Software mühendisliğinin temel taşlarından biri olan clean code prensiplerini bu kitap incelemesinde ele alıyorum.",
                        link: "https://alihaydarsucu.substack.com/p/clean-code-kitap-incelemesi",
                        pubDate: "2025-02-13T15:30:00Z",
                        slug: "clean-code-kitap-incelemesi",
                        lang: "en",
                        category: "technical",
                        subcategory: "systems",
                        categories: ["#engineering", "#book-review", "#software"]
                    },
                    {
                        title: "Teknolojinin İnsan Üzerindeki Etkileri",
                        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Modern teknolojinin toplumsal yapıyı ve insan ilişkilerini nasıl değiştirdiğini felsefi bir perspektiften ele alıyorum.",
                        link: "https://alihaydarsucu.substack.com/p/teknolojinin-insan-uzerindeki-etkileri",
                        pubDate: "2025-02-12T20:15:00Z",
                        slug: "teknolojinin-insan-uzerindeki-etkileri",
                        lang: null,
                        category: null,
                        subcategory: null,
                        categories: ["#intellectual", "#philosophy", "#technology"]
                    }
                ];
                
                displayBlogPosts(mockPosts, pageLang, category, subcategory);
                setupBlogTabs(mockPosts, pageLang);
                setupBlogSearch(mockPosts, pageLang);
                return;
            }
            
            // GitHub Actions ile oluşturulan JSON dosyasını çek
            try {
                console.log('Loading blog posts from JSON file...');
                const response = await fetch('./blog-posts.json');
                const data = await response.json();
                
                if (data.status === 'ok' && data.items && data.items.length > 0) {
                    console.log('Found posts:', data.items.length);
                    displayBlogPosts(data.items, pageLang, category, subcategory);
                    setupBlogTabs(data.items, pageLang);
                    setupBlogSearch(data.items, pageLang);
                    return;
                }
            } catch (jsonError) {
                console.log('JSON file not found, trying fallback methods...');
            }
            
            // Fallback: CORS-free proxy servisleri dene
            const proxyUrls = [
                'https://corsproxy.io/?',
                'https://api.allorigins.win/raw?url=',
                'https://thingproxy.free.beeceptor.com/'
            ];
            
            const substackUsername = 'alihaydarsucu';
            const rssUrl = `https://${substackUsername}.substack.com/feed`;
            
            for (const proxy of proxyUrls) {
                try {
                    console.log('Trying proxy:', proxy);
                    const proxyUrl = proxy + encodeURIComponent(rssUrl);
                    const response = await fetch(proxyUrl);
                    const data = await response.json();
                    
                    if (data.status === 'ok' && data.items && data.items.length > 0) {
                        console.log('Success with proxy:', proxy, 'Posts:', data.items.length);
                        displayBlogPosts(data.items, pageLang, category, subcategory);
                        setupBlogTabs(data.items, pageLang);
                        setupBlogSearch(data.items, pageLang);
                        return;
                    }
                } catch (error) {
                    console.log('Proxy failed:', proxy, error);
                    continue;
                }
            }
            
            // Son çare: Hata göster
            showBlogError();
            
        } catch (error) {
            console.error('Blog posts fetch error:', error);
            showBlogError();
        } finally {
            if (blogLoading) {
                blogLoading.style.display = 'none';
            }
        }
    }
    
    function displayBlogPosts(posts, pageLang = 'en', category = 'all', subcategory = 'all') {
        const blogGrid = document.getElementById('blog-grid');
        if (!blogGrid) return;
        
        // Dil filtrelemesi: lang alanına göre yazıları filtrele
        let filteredPosts = posts.filter(post => {
            // Eğer yazının dili belirtilmişse sadece o dil için göster
            if (post.lang === 'tr') return pageLang === 'tr';
            if (post.lang === 'en') return pageLang === 'en';
            // Dil belirtilmemişse her iki sayfada da göster
            return true;
        });
        
        // Ana kategori filtrelemesi
        if (category !== 'all') {
            filteredPosts = filteredPosts.filter(post => post.category === category);
        }
        
        // Alt kategori filtrelemesi (sadece technical kategorisinde)
        if (category === 'technical' && subcategory !== 'all') {
            filteredPosts = filteredPosts.filter(post => post.subcategory === subcategory);
        }
        
        // Yazı linkini oluştur (slug varsa clean URL, yoksa eski yöntem)
        function getArticleLink(post) {
            if (post.slug) {
                return pageLang === 'tr' ? `/yazilar/${post.slug}` : `/posts/${post.slug}`;
            }
            // Geriye dönük uyumluluk: slug yoksa eski yöntem
            const baseUrl = pageLang === 'tr' ? '/article-tr.html' : '/article.html';
            return `${baseUrl}?id=${encodeURIComponent(post.link)}`;
        }
        
        // Kategori etiketini oluştur
        function getCategoryBadge(post) {
            if (post.category === 'technical') {
                const subcatLabel = {
                    'systems': pageLang === 'tr' ? 'Sistemler' : 'Systems',
                    'embedded': pageLang === 'tr' ? 'Gömülü' : 'Embedded',
                    'ai': pageLang === 'tr' ? 'Yapay Zeka' : 'AI'
                };
                return post.subcategory ? `${pageLang === 'tr' ? 'Teknik' : 'Technical'} • ${subcatLabel[post.subcategory] || post.subcategory}` : (pageLang === 'tr' ? 'Teknik' : 'Technical');
            } else if (post.category === 'history') {
                return pageLang === 'tr' ? 'Tarih' : 'History';
            } else if (post.category === 'fiction') {
                return pageLang === 'tr' ? 'Kurgu' : 'Fiction';
            }
            return pageLang === 'tr' ? 'Kategorisiz' : 'Uncategorized';
        }
        
        // Eğer filtrelenmiş yazı yoksa boş durum mesajı göster
        if (filteredPosts.length === 0) {
            const emptyMessages = {
                'tr': {
                    'all': 'Henüz hiç yazı yok.',
                    'technical': 'Bu kategoride henüz teknik yazı yok.',
                    'history': 'Bu kategoride henüz tarih yazısı yok.',
                    'fiction': 'Bu kategoride henüz kurgu yazısı yok.',
                    'systems': 'Bu alt kategoride henüz yazı yok.',
                    'embedded': 'Bu alt kategoride henüz yazı yok.',
                    'ai': 'Bu alt kategoride henüz yazı yok.'
                },
                'en': {
                    'all': 'No posts yet.',
                    'technical': 'No technical posts in this category yet.',
                    'history': 'No history posts in this category yet.',
                    'fiction': 'No fiction posts in this category yet.',
                    'systems': 'No posts in this subcategory yet.',
                    'embedded': 'No posts in this subcategory yet.',
                    'ai': 'No posts in this subcategory yet.'
                }
            };
            
            const messageKey = subcategory !== 'all' ? subcategory : category;
            const message = emptyMessages[pageLang][messageKey] || emptyMessages[pageLang]['all'];
            
            blogGrid.innerHTML = `
                <div class="blog-empty-state">
                    <i class="fas fa-folder-open" aria-hidden="true"></i>
                    <h3>${pageLang === 'tr' ? 'Henüz Yazı Yok' : 'No Posts Yet'}</h3>
                    <p>${message}</p>
                </div>
            `;
            return;
        }
        
        blogGrid.innerHTML = filteredPosts.map(post => {
            const articleUrl = getArticleLink(post);
            const categoryBadge = getCategoryBadge(post);
            return `
            <article class="blog-card" data-category="${post.category || 'uncategorized'}">
                <div class="blog-card-header">
                    <div class="blog-meta">
                        <time datetime="${post.pubDate}" class="blog-date">${formatBlogDate(post.pubDate)}</time>
                        <span class="blog-category">${categoryBadge}</span>
                    </div>
                    <h2 class="blog-title">
                        <a href="${articleUrl}">
                            ${post.title}
                        </a>
                    </h2>
                </div>
                <div class="blog-content">
                    <p class="blog-excerpt">${truncateText(stripHtml(post.description), 150)}</p>
                </div>
                <div class="blog-footer">
                    <a href="${articleUrl}" class="blog-read-more">
                        ${pageLang === 'tr' ? 'Devamını Oku' : 'Read More'} <i class="fas fa-arrow-right" aria-hidden="true"></i>
                    </a>
                    <button class="blog-share" type="button" aria-label="${pageLang === 'tr' ? 'Makale linkini kopyala' : 'Copy article link'}" data-article-link="${encodeURIComponent(post.link)}">
                        <i class="fas fa-share-nodes" aria-hidden="true"></i>
                    </button>
                </div>
            </article>
        `;
        }).join('');

        document.querySelectorAll('.blog-share').forEach(btn => {
            btn.addEventListener('click', async () => {
                const articleLink = btn.getAttribute('data-article-link') || '';
                const decodedLink = decodeURIComponent(articleLink);
                
                // Yazının slug'ını bulup clean URL oluştur
                const article = filteredPosts.find(post => post.link === decodedLink);
                let urlToCopy = decodedLink; // default: Substack linki
                
                if (article && article.slug) {
                    // Clean URL ile kopy et
                    const cleanUrl = pageLang === 'tr' ? `/yazilar/${article.slug}` : `/posts/${article.slug}`;
                    urlToCopy = `${window.location.origin}${cleanUrl}`;
                } else if (article) {
                    // Slug yoksa fallback
                    const baseUrl = pageLang === 'tr' ? '/article-tr.html' : '/article.html';
                    urlToCopy = `${window.location.origin}${baseUrl}?id=${encodeURIComponent(decodedLink)}`;
                }
                
                try {
                    await navigator.clipboard.writeText(urlToCopy);
                    btn.classList.add('copied');
                    setTimeout(() => btn.classList.remove('copied'), 1200);
                    showToast(pageLang === 'tr' ? 'Link panoya kopyalandı' : 'Link copied to clipboard');
                } catch (e) {
                    // fallback
                    const tmp = document.createElement('input');
                    tmp.value = urlToCopy;
                    document.body.appendChild(tmp);
                    tmp.select();
                    document.execCommand('copy');
                    document.body.removeChild(tmp);
                    btn.classList.add('copied');
                    setTimeout(() => btn.classList.remove('copied'), 1200);
                    showToast(pageLang === 'tr' ? 'Link panoya kopyalandı' : 'Link copied to clipboard');
                }
            });
        });
        
        // Blog kartlarını animasyonla göster
        setTimeout(() => {
            document.querySelectorAll('.blog-card').forEach((card, index) => {
                setTimeout(() => {
                    card.classList.add('show');
                }, index * 100);
            });
        }, 100);
    }
    
    function categorizeBlogPost(post) {
        const title = (post.title || '').toLowerCase();
        const description = (post.description || '').toLowerCase();
        const categories = (post.categories || []).join(' ').toLowerCase();
        
        const text = `${title} ${description} ${categories}`;
        
        // Öncelikle Substack etiketlerini kontrol et
        if (categories.includes('#technical') || categories.includes('technical')) {
            return 'technical';
        }
        if (categories.includes('#engineering') || categories.includes('engineering')) {
            return 'engineering';
        }
        if (categories.includes('#intellectual') || categories.includes('intellectual')) {
            return 'intellectual';
        }
        
        // Etiket yoksa otomatik kategorizasyon (fallback)
        // Teknik yazılar - gömülü sistemler, AI, programlama
        if (text.includes('embedded') || text.includes('ai') || text.includes('artificial intelligence') || 
            text.includes('machine learning') || text.includes('programming') || text.includes('code') ||
            text.includes('gömülü') || text.includes('yapay zeka') || text.includes('programlama') ||
            text.includes('python') || text.includes('javascript') || text.includes('c++') || text.includes('arduino')) {
            return 'technical';
        }
        
        // Mühendislikle ilgili kitap incelemeleri
        if (text.includes('book review') || text.includes('kitap incelemesi') || text.includes('engineering') ||
            text.includes('mühendislik') || text.includes('software') || text.includes('hardware') ||
            text.includes('technology') || text.includes('teknoloji')) {
            return 'engineering';
        }
        
        // Entelektüel içerik
        return 'intellectual';
    }
    
    function getCategoryLabel(category) {
        const labels = {
            'technical': 'Technical',
            'engineering': 'Engineering',
            'intellectual': 'Intellectual'
        };
        return labels[category] || 'General';
    }
    
    function formatBlogDate(dateString) {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    function stripHtml(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    }

    function sanitizeSubstackHtml(html) {
        if (!html) return '';

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const selectorsToRemove = [
            '.image-link-expand',
            '.pencraft',
            'button.restack-image',
            'button.view-image',
            'script',
            'style',
            'link[rel="stylesheet"]'
        ];

        selectorsToRemove.forEach(sel => {
            doc.querySelectorAll(sel).forEach(node => node.remove());
        });

        // Remove hashtag-only lines (e.g. "#engineering #software") so tags only appear in footer
        doc.querySelectorAll('p, div, span').forEach(node => {
            const text = (node.textContent || '').trim();
            if (!text) return;

            // Only hashtags and whitespace
            const onlyHashtags = /^(#[\p{L}][\p{L}\p{N}_\-]*\s*)+$/u.test(text);
            if (onlyHashtags) node.remove();
        });

        doc.querySelectorAll('a').forEach(a => {
            a.setAttribute('target', '_blank');
            a.setAttribute('rel', 'noopener noreferrer');
        });

        return doc.body ? doc.body.innerHTML : html;
    }

    function stripHtmlPreservingContent(html) {
        let content = sanitizeSubstackHtml(html);

        const textarea = document.createElement('textarea');
        textarea.innerHTML = content;
        content = textarea.value;

        content = content.replace(/\\n\\s*\\n/g, '</p><p>');

        if (!content.includes('<p>')) {
            content = '<p>' + content + '</p>';
        }

        return content;
    }

    function truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength).replace(/\s+\S*$/, '') + '...';
    }

    function showToast(message) {
        let toast = document.getElementById('toast-notification');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast-notification';
            toast.className = 'toast-notification';
            toast.setAttribute('role', 'status');
            toast.setAttribute('aria-live', 'polite');
            document.body.appendChild(toast);
        }

        toast.textContent = message;
        toast.classList.add('show');
        clearTimeout(showToast._t);
        showToast._t = setTimeout(() => {
            toast.classList.remove('show');
        }, 1800);
    }

    function setupBlogTabs(posts, pageLang) {
        const urlParams = new URLSearchParams(window.location.search);
        const currentCategory = urlParams.get('category') || 'all';
        const currentSubcategory = urlParams.get('subcategory') || 'all';
        
        // Ana tab konteynerini bul veya oluştur
        const mainTabsContainer = document.getElementById('blog-main-tabs');
        const subTabsContainer = document.getElementById('blog-sub-tabs');
        
        if (!mainTabsContainer) return;
        
        // Ana kategoriler - Türkçe ve İngilizce versiyonda aynı
        const mainTabs = ['all', 'technical', 'history', 'fiction'];
        const mainTabLabels = {
            'en': {
                'all': 'All',
                'technical': 'Technical',
                'history': 'History',
                'fiction': 'Fiction'
            },
            'tr': {
                'all': 'Tümü',
                'technical': 'Teknik',
                'history': 'Tarih',
                'fiction': 'Kurgu'
            }
        };
        
        mainTabsContainer.style.display = 'flex';
        mainTabsContainer.innerHTML = mainTabs.map(tab => `
            <button 
                class="tab-btn ${currentCategory === tab ? 'active' : ''}" 
                data-category="${tab}"
                aria-pressed="${currentCategory === tab}"
            >
                ${mainTabLabels[pageLang][tab]}
            </button>
        `).join('');
        
        // Alt tab'ları oluştur (sadece Technical seçiliyse)
        if (subTabsContainer) {
            if (currentCategory === 'technical') {
                const subTabs = ['all', 'systems', 'embedded', 'ai'];
                const subTabLabels = {
                    'en': {
                        'all': 'All',
                        'systems': 'Systems',
                        'embedded': 'Embedded',
                        'ai': 'AI'
                    },
                    'tr': {
                        'all': 'Tümü',
                        'systems': 'Sistemler',
                        'embedded': 'Gömülü',
                        'ai': 'Yapay Zeka'
                    }
                };
                
                subTabsContainer.style.display = 'flex';
                subTabsContainer.innerHTML = subTabs.map(tab => `
                    <button 
                        class="sub-tab-btn ${currentSubcategory === tab ? 'active' : ''}" 
                        data-subcategory="${tab}"
                        aria-pressed="${currentSubcategory === tab}"
                    >
                        ${subTabLabels[pageLang][tab]}
                    </button>
                `).join('');
                
                // Alt tab click handler'ları
                document.querySelectorAll('.sub-tab-btn').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const subcategory = this.getAttribute('data-subcategory');
                        const newUrl = new URL(window.location);
                        newUrl.searchParams.set('category', 'technical');
                        newUrl.searchParams.set('subcategory', subcategory);
                        window.location.href = newUrl.toString();
                    });
                });
            } else {
                subTabsContainer.style.display = 'none';
            }
        }
        
        // Ana tab click handler'ları
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const category = this.getAttribute('data-category');
                const newUrl = new URL(window.location);
                if (category === 'all') {
                    newUrl.searchParams.delete('category');
                    newUrl.searchParams.delete('subcategory');
                } else {
                    newUrl.searchParams.set('category', category);
                    newUrl.searchParams.delete('subcategory');
                }
                window.location.href = newUrl.toString();
            });
        });
    }
    
    function setupBlogFilters(posts) {
        // Eski filter sistemi - geriye dönük uyumluluk için koru
        const filterButtons = document.querySelectorAll('.filter-btn');
        if (filterButtons.length === 0) return;
        
        filterButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                filterButtons.forEach(b => {
                    b.classList.remove('active');
                    b.setAttribute('aria-pressed', 'false');
                });
                this.classList.add('active');
                this.setAttribute('aria-pressed', 'true');
                const filter = this.getAttribute('data-filter');
                displayBlogPosts(posts, filter);
            });
        });
    }
    
    function setupBlogSearch(posts, pageLang) {
        const searchInput = document.getElementById('blog-search');
        if (!searchInput) return;
        
        const urlParams = new URLSearchParams(window.location.search);
        const currentCategory = urlParams.get('category') || 'all';
        const currentSubcategory = urlParams.get('subcategory') || 'all';
        
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const filteredPosts = posts.filter(post => {
                const title = (post.title || '').toLowerCase();
                const description = (post.description || '').toLowerCase();
                return title.includes(searchTerm) || description.includes(searchTerm);
            });
            displayBlogPosts(filteredPosts, pageLang, currentCategory, currentSubcategory);
        });
    }
    
    function showBlogError() {
        const blogError = document.getElementById('blog-error');
        const blogGrid = document.getElementById('blog-grid');
        if (blogError) blogError.style.display = 'block';
        if (blogGrid) blogGrid.innerHTML = '';
    }
    
    // Article fonksiyonları
    async function loadArticle() {
        const articleLoading = document.getElementById('article-loading');
        const articleContent = document.getElementById('article-content');
        const articleError = document.getElementById('article-error');
        
        try {
            // URL'den parametreleri al (slug veya id)
            const urlParams = new URLSearchParams(window.location.search);
            const articleSlug = urlParams.get('slug');
            const articleLink = urlParams.get('id');
            
            if (!articleSlug && !articleLink) {
                showArticleError();
                return;
            }
            
            // Blog posts JSON'den makaleyi bul
            const response = await fetch('./blog-posts.json');
            const data = await response.json();
            
            if (data.status !== 'ok' || !data.items) {
                showArticleError();
                return;
            }
            
            // Makaleyi bul (slug veya link'e göre)
            let article;
            if (articleSlug) {
                article = data.items.find(post => post.slug === decodeURIComponent(articleSlug));
            } else if (articleLink) {
                article = data.items.find(post => post.link === decodeURIComponent(articleLink));
            }
            
            if (!article) {
                showArticleError();
                return;
            }
            
            // Makale içeriğini göster
            displayArticle(article);
            
        } catch (error) {
            console.error('Article load error:', error);
            showArticleError();
        } finally {
            if (articleLoading) {
                articleLoading.style.display = 'none';
            }
        }
    }
    
    function displayArticle(article) {
        const articleContent = document.getElementById('article-content');
        if (!articleContent) return;
        
        // Meta bilgileri güncelle
        document.title = `${article.title} | Ali Haydar Sucu`;
        
        // Open Graph meta tags'ini güncelle
        const ogUrl = document.getElementById('og-url');
        const ogTitle = document.getElementById('og-title');
        const ogDescription = document.getElementById('og-description');
        const canonicalUrl = document.getElementById('canonical-url');
        
        if (ogUrl) ogUrl.setAttribute('content', article.link);
        if (ogTitle) ogTitle.setAttribute('content', `${article.title} | Ali Haydar Sucu`);
        if (ogDescription) ogDescription.setAttribute('content', truncateText(stripHtml(article.description), 160));
        if (canonicalUrl) canonicalUrl.setAttribute('href', article.link);
        
        // Makale içeriğini oluştur
        const articleDate = document.getElementById('article-date');
        const articleTitle = document.getElementById('article-title');
        const articleBody = document.getElementById('article-body');
        const articleCategory = document.getElementById('article-category');
        const articleTags = document.getElementById('article-tags');
        const articleLink = document.getElementById('article-link');
        const backToBlog = document.getElementById('back-to-blog');
        const articleCtaLink = document.getElementById('article-cta-link');
        
        if (articleDate) {
            articleDate.textContent = formatBlogDate(article.pubDate);
            articleDate.setAttribute('datetime', article.pubDate);
        }
        
        if (articleTitle) articleTitle.textContent = article.title;
        
        if (articleBody) {
            // HTML içeriğini temizle ve göster
            const cleanContent = stripHtmlPreservingContent(article.description);
            articleBody.innerHTML = cleanContent;
        }
        
        if (articleCategory) {
            const category = categorizeBlogPost(article);
            articleCategory.textContent = getCategoryLabel(category);
            articleCategory.className = `article-category category-${category}`;
        }
        
        if (articleTags && article.categories && article.categories.length > 0) {
            const tags = article.categories
                .filter(cat => cat.startsWith('#') && !/^#\d+$/.test(cat))
                .map(cat => `<span class="article-tag">${cat}</span>`)
                .join('');
            articleTags.innerHTML = tags;
        }
        
        if (articleLink) articleLink.href = article.link;
        if (articleCtaLink) articleCtaLink.href = article.link;
        
        if (backToBlog) {
            backToBlog.onclick = () => {
                window.location.href = '/blog';
            };
        }
        
        // Share butonlarını ayarla
        setupShareButtons(article);
        
        // Makaleyi göster
        articleContent.style.display = 'block';
        articleContent.classList.add('show');
    }
    
    function showArticleError() {
        const articleError = document.getElementById('article-error');
        const articleContent = document.getElementById('article-content');
        if (articleError) articleError.style.display = 'block';
        if (articleContent) articleContent.style.display = 'none';
    }
    
    function setupShareButtons(article) {
        const shareTwitter = document.getElementById('share-twitter');
        const shareLinkedin = document.getElementById('share-linkedin');
        const shareCopy = document.getElementById('share-copy');
        
        const shareUrl = article.link;
        const shareTitle = article.title;
        const shareText = truncateText(stripHtml(article.description), 100);
        
        if (shareTwitter) {
            shareTwitter.onclick = () => {
                const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`;
                window.open(twitterUrl, '_blank', 'noopener,noreferrer');
            };
        }
        
        if (shareLinkedin) {
            shareLinkedin.onclick = () => {
                const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle)}`;
                window.open(linkedinUrl, '_blank', 'noopener,noreferrer');
            };
        }
        
        if (shareCopy) {
            shareCopy.onclick = () => {
                navigator.clipboard.writeText(shareUrl).then(() => {
                    const originalText = shareCopy.innerHTML;
                    shareCopy.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i>';
                    setTimeout(() => {
                        shareCopy.innerHTML = '<i class="fas fa-link" aria-hidden="true"></i>';
                    }, 2000);
                    showToast('Link copied to clipboard');
                });
            };
        }
    }
});
