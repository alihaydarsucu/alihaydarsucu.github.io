document.addEventListener('DOMContentLoaded', function() {
    if (!checkAndRedirect()) return;
    // Dil ve sayfa yapılandırması
    const appConfig = {
        languages: {
            'en': {
                'home': '',
                'skills': 'skills',
                'projects': 'projects',
                'experience': 'experience',
                'nav': {
                    'home': 'About',
                    'skills': 'Skills',
                    'projects': 'Projects',
                    'experience': 'Experience'
                }
            },
            'tr': {
                'home': '',
                'skills': 'yetenekler',
                'projects': 'projeler',
                'experience': 'deneyim',
                'nav': {
                    'home': 'Hakkımda',
                    'skills': 'Yetenekler',
                    'projects': 'Projeler',
                    'experience': 'Deneyim'
                }
            }
        },
        pageTitles: {
            'en': {
                'home': 'Ali Haydar Sucu | Computer Engineering Student',
                'skills': 'My Skills | Ali Haydar Sucu',
                'projects': 'My Projects | Ali Haydar Sucu',
                'experience': 'My Experience | Ali Haydar Sucu'
            },
            'tr': {
                'home': 'Ali Haydar Sucu | Bilgisayar Mühendisliği Öğrencisi',
                'skills': 'Yeteneklerim | Ali Haydar Sucu',
                'projects': 'Projelerim | Ali Haydar Sucu',
                'experience': 'Deneyimlerim | Ali Haydar Sucu'
            }
        }
    };

    // State management
    let currentState = {
        language: 'en',
        page: 'home',
        darkMode: localStorage.getItem('darkMode') === 'enabled'
    };

    // Initialize
    initApp();

    function initApp() {
        parseURL();
        setupEventListeners();
        renderPage();
        updateActiveNav();
    }

    function parseURL() {
        const pathSegments = window.location.pathname.substring(1).split('/');
        
        // Dil kontrolü
        if (pathSegments[0] === 'tr' || pathSegments[0] === 'en') {
            currentState.language = pathSegments[0];
        } else {
            // Varsayılan dil
            const preferredLang = localStorage.getItem('preferredLanguage');
            currentState.language = preferredLang || 'en';
            updateURL();
        }

        // Sayfa kontrolü
        const pageSegment = pathSegments[1] || '';
        for (const [page, path] of Object.entries(appConfig.languages[currentState.language])) {
            if (path === pageSegment) {
                currentState.page = page;
                break;
            }
        }
    }

    function updateURL() {
        let newPath = `/${currentState.language}`;
        const pagePath = appConfig.languages[currentState.language][currentState.page];
        
        if (pagePath) {
            newPath += `/${pagePath}`;
        }

        if (window.location.pathname !== newPath) {
            window.history.pushState(currentState, '', newPath);
        }
    }

    function setupEventListeners() {
        // Dil değiştirici
        document.querySelectorAll('.language-option').forEach(option => {
            option.addEventListener('click', function() {
                const lang = this.textContent.trim().toLowerCase();
                if (lang !== currentState.language) {
                    currentState.language = lang;
                    localStorage.setItem('preferredLanguage', lang);
                    updateURL();
                    renderPage();
                }
            });
        });

        // Navigasyon linkleri
        document.querySelectorAll('[data-page]').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const page = this.getAttribute('data-page');
                if (page !== currentState.page) {
                    currentState.page = page;
                    updateURL();
                    renderPage();
                }
            });
        });

        // Geri/ileri butonları
        window.addEventListener('popstate', function(event) {
            if (event.state) {
                currentState = event.state;
                renderPage();
            } else {
                parseURL();
                renderPage();
            }
        });

        // Dark mode toggle
        const darkModeToggle = document.querySelector('.theme-toggle input');
        const mobileDarkModeToggle = document.querySelector('.mobile-theme-toggle input');
        
        if (currentState.darkMode) {
            document.body.classList.add('dark-mode');
            if (darkModeToggle) darkModeToggle.checked = true;
            if (mobileDarkModeToggle) mobileDarkModeToggle.checked = true;
        }

        if (darkModeToggle) {
            darkModeToggle.addEventListener('change', function() {
                toggleDarkMode(this.checked);
            });
        }

        if (mobileDarkModeToggle) {
            mobileDarkModeToggle.addEventListener('change', function() {
                toggleDarkMode(this.checked);
            });
        }

        // Mobile menu
        const hamburger = document.querySelector('.hamburger-menu');
        const mobileMenu = document.querySelector('.mobile-menu');
        const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
        const mobileMenuClose = document.querySelector('.mobile-menu-close');
        
        if (hamburger) hamburger.addEventListener('click', openMobileMenu);
        if (mobileMenuClose) mobileMenuClose.addEventListener('click', closeMobileMenu);
        if (mobileMenuOverlay) mobileMenuOverlay.addEventListener('click', closeMobileMenu);
        
        // Close menu when clicking on links
        document.querySelectorAll('.mobile-nav-links a').forEach(item => {
            item.addEventListener('click', closeMobileMenu);
        });
    }

    function toggleDarkMode(enable) {
        currentState.darkMode = enable;
        if (enable) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('darkMode', 'enabled');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('darkMode', 'disabled');
        }
    }

    function openMobileMenu() {
        document.querySelector('.mobile-menu').classList.add('active');
        document.querySelector('.mobile-menu-overlay').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeMobileMenu() {
        document.querySelector('.mobile-menu').classList.remove('active');
        document.querySelector('.mobile-menu-overlay').classList.remove('active');
        document.body.style.overflow = '';
    }

    function renderPage() {
        // Sayfa başlığını güncelle
        document.title = appConfig.pageTitles[currentState.language][currentState.page];
        
        // Dil seçiciyi güncelle
        updateActiveLanguage();
        
        // İçerik yükleme
        loadContent();
        
        // Navigasyonu güncelle
        updateActiveNav();
    }

    function updateActiveLanguage() {
        document.querySelectorAll('.language-option').forEach(opt => {
            opt.classList.remove('active');
            if (opt.textContent.trim().toLowerCase() === currentState.language) {
                opt.classList.add('active');
            }
        });
    }

    function updateActiveNav() {
        document.querySelectorAll('.nav-links a, .mobile-nav-links a').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-page') === currentState.page) {
                link.classList.add('active');
            }
        });
    }

    function loadContent() {
        // Burada mevcut içeriği temizle
        const mainContent = document.querySelector('main');
        if (!mainContent) return;
        
        // Örnek içerik yükleme (gerçek uygulamada bu kısım daha karmaşık olacaktır)
        mainContent.innerHTML = `
            <section id="${currentState.page}">
                <h1>${appConfig.pageTitles[currentState.language][currentState.page]}</h1>
                <p>${currentState.language === 'tr' ? 'İçerik yükleniyor...' : 'Content loading...'}</p>
            </section>
        `;
        
        // Gerçek uygulamada burada AJAX ile içerik yükleyebilirsiniz
        // veya tüm içerik önceden yüklenmiş olabilir
    }

        function checkAndRedirect() {
        // Localhost'ta çalışırken .html uzantısını kontrol et
        if (window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost") {
            const path = window.location.pathname;
            const expectedPaths = [
                '/', '/hakkimda',
                '/skills', '/yetenekler',
                '/projects', '/projeler',
                '/experience', '/deneyim'
            ];

            if (!expectedPaths.includes(path) && path !== '/') {
                window.location.href = '/404';
                return false;
            }
        }
        return true;
    }

    // GitHub Projects functionality
    async function loadGitHubProjects() {
        const reposContainer = document.getElementById('repos');
        if (!reposContainer) return;

        try {
            const response = await fetch('https://api.github.com/users/alihaydarsucu/repos?sort=updated&per_page=50');
            
            if (!response.ok) {
                throw new Error(`GitHub API Error: ${response.status} ${response.statusText}`);
            }
            
            const repos = await response.json();
            
            // Filter out forked repositories and private repos
            const publicRepos = repos.filter(repo => !repo.fork && !repo.private);
            
            if (publicRepos.length === 0) {
                reposContainer.innerHTML = '<p style="text-align: center;">No public repositories found.</p>';
                return;
            }
            
            displayRepos(publicRepos);
            setupFilterButtons(publicRepos);
            
        } catch (error) {
            console.error('Error fetching GitHub repositories:', error);
            const errorMessage = currentState.language === 'tr' 
                ? 'GitHub projeleri yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.'
                : 'Error loading GitHub projects. Please try again later.';
            reposContainer.innerHTML = `<p style="text-align: center; color: var(--error-color, #e74c3c);">${errorMessage}</p>`;
        }
    }

    function displayRepos(repos, filter = 'all') {
        const reposContainer = document.getElementById('repos');
        if (!reposContainer) return;

        let filteredRepos = repos;
        
        if (filter !== 'all') {
            filteredRepos = repos.filter(repo => categorizeRepo(repo) === filter);
        }

        if (filteredRepos.length === 0) {
            const noProjectsMessage = currentState.language === 'tr' 
                ? 'Bu kategoride proje bulunamadı.'
                : 'No projects found in this category.';
            reposContainer.innerHTML = `<p style="text-align: center;">${noProjectsMessage}</p>`;
            return;
        }

        reposContainer.innerHTML = filteredRepos.map(repo => {
            const category = categorizeRepo(repo);
            const language = repo.language || (currentState.language === 'tr' ? 'Bilinmiyor' : 'Unknown');
            const description = repo.description || (currentState.language === 'tr' ? 'Açıklama bulunmuyor' : 'No description available');
            
            return `
                <div class="github-project-card" data-category="${category}">
                    <div class="github-project-header">
                        <h3 class="github-project-title">
                            <a href="${repo.html_url}" target="_blank">${repo.name}</a>
                        </h3>
                        <div class="github-project-meta">
                            <div class="github-project-language">
                                <span class="language-dot" style="background-color: ${getLanguageColor(repo.language)}"></span>
                                ${language}
                            </div>
                            ${repo.stargazers_count > 0 ? `
                                <div class="github-project-stars">
                                    <i class="fas fa-star"></i>
                                    ${repo.stargazers_count}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    <p class="github-project-description">${description}</p>
                    <div class="github-project-footer">
                        <span class="github-project-updated">
                            ${currentState.language === 'tr' ? 'Güncellendi' : 'Updated'}: ${formatDate(repo.updated_at)}
                        </span>
                    </div>
                </div>
            `;
        }).join('');
    }

    function categorizeRepo(repo) {
        const name = repo.name.toLowerCase();
        const topics = repo.topics || [];
        const language = (repo.language || '').toLowerCase();
        
        // Web development
        if (topics.includes('website') || topics.includes('web') || 
            name.includes('website') || name.includes('web') ||
            ['html', 'css', 'javascript', 'typescript', 'react', 'vue', 'angular'].includes(language)) {
            return 'web';
        }
        
        // Embedded systems
        if (topics.includes('embedded') || topics.includes('arduino') || topics.includes('raspberry-pi') ||
            name.includes('embedded') || name.includes('arduino') || name.includes('esp') ||
            ['c', 'c++'].includes(language)) {
            return 'embedded';
        }
        
        return 'other';
    }

    function getLanguageColor(language) {
        const colors = {
            'JavaScript': '#f7df1e',
            'TypeScript': '#3178c6',
            'Python': '#3776ab',
            'Java': '#007396',
            'C': '#a8b9cc',
            'C++': '#f34b7d',
            'HTML': '#e34c26',
            'CSS': '#1572b6',
            'PHP': '#777bb4',
            'Go': '#00add8',
            'Rust': '#dea584',
            'Swift': '#fa7343'
        };
        return colors[language] || '#666666';
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
        
        if (diffInDays === 0) {
            return currentState.language === 'tr' ? 'Bugün' : 'Today';
        } else if (diffInDays === 1) {
            return currentState.language === 'tr' ? 'Dün' : 'Yesterday';
        } else if (diffInDays < 30) {
            return currentState.language === 'tr' ? `${diffInDays} gün önce` : `${diffInDays} days ago`;
        } else {
            return date.toLocaleDateString(currentState.language === 'tr' ? 'tr-TR' : 'en-US');
        }
    }

    function setupFilterButtons(repos) {
        const filterButtons = document.querySelectorAll('.filter-btn');
        
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                filterButtons.forEach(btn => btn.classList.remove('active'));
                // Add active class to clicked button
                button.classList.add('active');
                
                // Get filter value
                const filter = button.getAttribute('data-filter');
                
                // Display filtered repos
                displayRepos(repos, filter);
            });
        });
    }

    // Load GitHub projects if we're on a projects page
    if (window.location.pathname.includes('project') || document.getElementById('repos')) {
        loadGitHubProjects();
    }
});