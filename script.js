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
                            if (currentPath.includes('hakkimda') || currentPath === '/hakkimda') {
            window.location.href = '/';
        } else if (currentPath.includes('yetenekler') || currentPath === '/yetenekler') {
            window.location.href = '/skills';
        } else if (currentPath.includes('projeler') || currentPath === '/projeler') {
            window.location.href = '/projects';
        } else if (currentPath.includes('deneyim') || currentPath === '/deneyim') {
            window.location.href = '/experience';
        }
                } else if (selectedLang === 'TR') {
                    // İngilizce'den Türkçe'ye geçiş
                            if (currentPath.includes('index') || currentPath === '/' || currentPath === '') {
            window.location.href = '/hakkimda';
        } else if (currentPath.includes('skills') || currentPath === '/skills') {
            window.location.href = '/yetenekler';
        } else if (currentPath.includes('projects') || currentPath === '/projects') {
            window.location.href = '/projeler';
        } else if (currentPath.includes('experience') || currentPath === '/experience') {
            window.location.href = '/deneyim';
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
            'C': '#555555'
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
});
