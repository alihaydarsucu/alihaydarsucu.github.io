document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Functionality
    const hamburger = document.querySelector('.hamburger-menu');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
    const mobileMenuClose = document.querySelector('.mobile-menu-close');
    
    function openMobileMenu() {
        mobileMenu.classList.add('active');
        mobileMenuOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function closeMobileMenu() {
        mobileMenu.classList.remove('active');
        mobileMenuOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    hamburger.addEventListener('click', openMobileMenu);
    mobileMenuClose.addEventListener('click', closeMobileMenu);
    mobileMenuOverlay.addEventListener('click', closeMobileMenu);
    
    // Close menu when clicking on links
    document.querySelectorAll('.mobile-nav-links a').forEach(item => {
        item.addEventListener('click', closeMobileMenu);
    });
    
    // Close menu with ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
            closeMobileMenu();
        }
    });
    
    // Close menu on resize if desktop
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            closeMobileMenu();
        }
    });

    // Dark Mode Toggle
    const darkModeToggle = document.querySelector('.theme-toggle input');
    
    // Check for saved dark mode preference
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
        darkModeToggle.checked = true;
    }
    
    document.querySelector('.mobile-theme-toggle input').addEventListener('change', function() {
        const isChecked = this.checked;
        document.querySelector('.theme-toggle input').checked = isChecked;
        
        if (isChecked) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('darkMode', 'enabled');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('darkMode', 'disabled');
        }
    });

    darkModeToggle.addEventListener('change', function() {
        if (this.checked) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('darkMode', 'enabled');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('darkMode', 'disabled');
        }
    });

    // Fetch GitHub Repos
    async function fetchGitHubRepos() {
        try {
            const response = await fetch('https://api.github.com/users/alihaydarsucu/repos');
            const repos = await response.json();
            
            const publicRepos = repos
                .filter(repo => !repo.private)
                .sort((a, b) => b.stargazers_count - a.stargazers_count);
            
            displayRepos(publicRepos);
            setupFilters(publicRepos);
        } catch (error) {
            console.error('Error fetching GitHub repos:', error);
            document.getElementById('repos').innerHTML = `
                <div class="error-message">
                    Unable to load GitHub projects. Please try again later.
                </div>
            `;
        }
    }

    function setupFilters(repos) {
        const filterButtons = document.querySelectorAll('.filter-btn');
        
        function filterRepos(category) {
            let filteredRepos = repos;
            
            if (category === 'web') {
                filteredRepos = repos.filter(repo => 
                    repo.language === 'JavaScript' || 
                    repo.language === 'HTML' || 
                    repo.language === 'CSS' ||
                    repo.name.toLowerCase().includes('web'));
            } else if (category === 'embedded') {
                filteredRepos = repos.filter(repo => 
                    repo.language === 'Python' || 
                    repo.language === 'C' || 
                    repo.language === 'C++' ||
                    repo.language === 'Shell' ||
                    repo.name.toLowerCase().includes('embedded'));
            } else if (category === 'other') {
                filteredRepos = repos.filter(repo => 
                    !['JavaScript', 'HTML', 'CSS', 'Python', 'C', 'C++', 'Shell'].includes(repo.language) &&
                    !repo.name.toLowerCase().includes('web') &&
                    !repo.name.toLowerCase().includes('embedded'));
            }
            
            displayRepos(filteredRepos);
        }
        
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                filterRepos(this.dataset.filter);
            });
        });
        
        // Varsayılan olarak "All" aktif
        document.querySelector('.filter-btn[data-filter="all"]').classList.add('active');
    }
    
    function displayRepos(repos) {
        const container = document.getElementById('repos');
        container.innerHTML = '';
        
        // Language color mapping
        const langColors = {
            'JavaScript': '#f1e05a',
            'Python': '#3572A5',
            'Java': '#b07219',
            'HTML': '#e34c26',
            'CSS': '#563d7c',
            'TypeScript': '#2b7489',
            'C++': '#f34b7d',
            'C': '#555555',
            'Shell': '#89e051',
            'Ruby': '#701516',
            'PHP': '#4F5D95',
            'Go': '#00ADD8'
        };
        
        repos.forEach(repo => {
            const langColor = repo.language ? 
                (langColors[repo.language] || '#586069') : '#586069';
            
            const repoCard = document.createElement('div');
            repoCard.className = 'github-project-card';
            repoCard.innerHTML = `
                <div class="github-project-header">
                    <svg height="16" viewBox="0 0 16 16" width="16" fill="#586069">
                        <path fill-rule="evenodd" d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z"></path>
                    </svg>
                    <a href="${repo.html_url}" target="_blank" class="github-project-title">${repo.name}</a>
                </div>
                <p class="github-project-description">${repo.description || 'No description provided.'}</p>
                <div class="github-project-meta">
                    ${repo.language ? `
                        <div class="github-project-language">
                            <span class="github-project-language-color" style="background-color: ${langColor}"></span>
                            ${repo.language}
                        </div>
                    ` : ''}
                    <div class="github-project-stars">
                        <svg height="16" viewBox="0 0 16 16" width="16" fill="#586069">
                            <path fill-rule="evenodd" d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25zm0 2.445L6.615 5.5a.75.75 0 01-.564.41l-3.097.45 2.24 2.184a.75.75 0 01.216.664l-.528 3.084 2.769-1.456a.75.75 0 01.698 0l2.77 1.456-.53-3.084a.75.75 0 01.216-.664l2.24-2.183-3.096-.45a.75.75 0 01-.564-.41L8 2.694v.001z"></path>
                        </svg>
                        ${repo.stargazers_count}
                    </div>
                    <div class="github-project-forks">
                        <svg height="16" viewBox="0 0 16 16" width="16" fill="#586069">
                            <path fill-rule="evenodd" d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z"></path>
                        </svg>
                        ${repo.forks_count}
                    </div>
                </div>
            `;
            container.appendChild(repoCard);
        });
    }
    
    // Initialize
    fetchGitHubRepos();
    
    // Back to top button
    const backToTop = document.querySelector('.back-to-top');
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTop.classList.add('active');
        } else {
            backToTop.classList.remove('active');
        }
    });
    
    // Aktif Bölüm Takip Sistemi
    function updateActiveSection() {
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('.nav-links a, .mobile-nav-links a');
        let currentSection = '';
        
        // Scroll pozisyonuna göre aktif bölümü belirle
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (window.scrollY >= sectionTop - 200 && 
                window.scrollY < sectionTop + sectionHeight - 200) {
                currentSection = section.id;
            }
        });
        
        // Tüm linklerden aktif classını kaldır
        navLinks.forEach(link => {
            link.classList.remove('active');
            
            // Aktif bölümün linkini bul
            const href = link.getAttribute('href').replace('#', '');
            if (href === currentSection) {
                link.classList.add('active');
            }
        });
    }

    // Scroll event listener
    window.addEventListener('scroll', function() {
        updateActiveSection();
        
        // Debounce ekleyerek performansı artır
        clearTimeout(window.scrollTimer);
        window.scrollTimer = setTimeout(updateActiveSection, 50);
    });

    // Sayfa yüklendiğinde ve hash değiştiğinde kontrol et
    window.addEventListener('load', updateActiveSection);
    window.addEventListener('hashchange', updateActiveSection);

    // Mobil menü linklerine tıklayınca
    document.querySelectorAll('.mobile-nav-links a').forEach(link => {
        link.addEventListener('click', function() {
            // Diğer tüm aktif classlarını kaldır
            document.querySelectorAll('.mobile-nav-links a').forEach(item => {
                item.classList.remove('active');
            });
            // Tıklanana aktif classını ekle
            this.classList.add('active');
        });
    });
});