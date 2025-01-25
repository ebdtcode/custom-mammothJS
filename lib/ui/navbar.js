/**
 * Responsive navigation bar component
 */
class Navbar {
    constructor(options = {}) {
        this.options = {
            title: 'MammothJS',
            theme: 'light',
            ...options
        };
        
        this.pages = [];
    }

    /**
     * Initialize the navbar
     * @param {Array} pages - Array of page objects with title and url
     */
    init(pages) {
        this.pages = pages;
        this.render();
        this.setupEventListeners();
    }

    /**
     * Add a page to the navbar
     * @param {string} title - The title of the page
     * @param {string} url - The URL of the page
     */
    addPage(title, url) {
        this.pages.push({ title, url });
    }

    /**
     * Create the navbar HTML
     * @private
     */
    render() {
        const navbar = document.createElement('nav');
        navbar.className = 'navbar';
        navbar.innerHTML = this.generateNavbarHTML();
        
        document.body.insertBefore(navbar, document.body.firstChild);
    }

    /**
     * Generate category dropdown menus
     * @private
     */
    generateNavbarCategories() {
        return this.pages
            .map(page => `
                <a class="navbar-item" href="${page.url}">
                    ${page.title}
                </a>
            `)
            .join('');
    }

    /**
     * Generate the navbar HTML
     * @param {string} currentTitle - The current title to display
     * @private
     */
    generateNavbarHTML(currentTitle) {
        return `
            <nav class="navbar is-${this.options.theme}" role="navigation" aria-label="main navigation">
                <div class="navbar-brand">
                    <a class="navbar-item" href="/">
                        <strong>${currentTitle || this.options.title}</strong>
                    </a>
                </div>
                
                <div class="navbar-menu">
                    <div class="navbar-start">
                        ${this.generateNavbarCategories()}
                    </div>
                </div>
            </nav>
        `;
    }

    /**
     * Setup event listeners for navbar interactions
     * @private
     */
    setupEventListeners() {
        // Toggle mobile menu
        const toggle = document.querySelector('.navbar-toggle');
        const menu = document.querySelector('.navbar-menu');
        
        toggle.addEventListener('click', () => {
            this.isOpen = !this.isOpen;
            toggle.classList.toggle('is-active');
            menu.classList.toggle('is-active');
        });

        // Handle dropdowns
        document.querySelectorAll('.has-dropdown').forEach(dropdown => {
            const link = dropdown.querySelector('.navbar-link');
            const menu = dropdown.querySelector('.navbar-dropdown');
            
            link.addEventListener('click', (e) => {
                e.preventDefault();
                dropdown.classList.toggle('is-active');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!dropdown.contains(e.target)) {
                    dropdown.classList.remove('is-active');
                }
            });
        });

        // Theme toggle
        const themeToggle = document.querySelector('.theme-toggle');
        themeToggle.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark-theme');
            localStorage.setItem(
                'theme',
                document.documentElement.classList.contains('dark-theme') ? 'dark' : 'light'
            );
        });

        // Initialize theme from localStorage
        if (localStorage.getItem('theme') === 'dark' ||
            (!localStorage.getItem('theme') && 
             window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark-theme');
        }
    }
}

module.exports = Navbar;
