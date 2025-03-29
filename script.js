document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger-menu');
    const navLinks = document.querySelector('.nav-links');
    const body = document.body;
    const darkModeToggle = document.getElementById('darkModeToggle');
    const themeIcon = darkModeToggle.querySelector('i');
    
    // Hamburger menu functionality
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
        body.classList.toggle('menu-open');
    });
    
    // Check for saved dark mode preference
    if (localStorage.getItem('darkMode') === 'enabled') {
        body.classList.add('dark-mode');
        themeIcon.classList.replace('fa-sun', 'fa-moon');
    }
    
    // Dark mode toggle functionality
    darkModeToggle.addEventListener('click', function() {
        body.classList.toggle('dark-mode');
        
        if (body.classList.contains('dark-mode')) {
            themeIcon.classList.replace('fa-sun', 'fa-moon');
            localStorage.setItem('darkMode', 'enabled');
        } else {
            themeIcon.classList.replace('fa-moon', 'fa-sun');
            localStorage.setItem('darkMode', 'disabled');
        }
    });
    
    // Close mobile menu when clicking on links
    document.querySelectorAll('.nav-links a').forEach(item => {
        item.addEventListener('click', function() {
            if (navLinks.classList.contains('active')) {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
                body.classList.remove('menu-open');
            }
        });
    });
});