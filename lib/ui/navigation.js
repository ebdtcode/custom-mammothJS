/**
 * Handles document navigation and keyboard shortcuts
 */
class Navigation {
    constructor() {
        this.shortcuts = new Map();
        this.sidebar = document.querySelector('.sidebar');
        this.navToggle = document.querySelector('.nav-toggle');
        this.setupDefaultShortcuts();
        this.init();
    }

    /**
     * Initialize navigation listeners
     */
    init() {
        this.setupKeyboardNavigation();
        this.setupTouchNavigation();
        this.setupProgressBar();
        this.bindEvents();
        this.generateTOC();
    }

    /**
     * Setup default keyboard shortcuts
     */
    setupDefaultShortcuts() {
        this.shortcuts.set('ArrowLeft', () => this.navigatePrevious());
        this.shortcuts.set('ArrowRight', () => this.navigateNext());
        this.shortcuts.set('Home', () => this.navigateHome());
    }

    /**
     * Setup keyboard navigation
     */
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            const handler = this.shortcuts.get(e.key);
            if (handler) {
                e.preventDefault();
                handler();
            }
        });
    }

    /**
     * Setup touch navigation
     */
    setupTouchNavigation() {
        let touchStartX = 0;
        let touchEndX = 0;
        
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        document.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe(touchStartX, touchEndX);
        });
    }

    /**
     * Handle swipe gestures
     */
    handleSwipe(startX, endX) {
        const swipeThreshold = 50;
        const diff = endX - startX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                this.navigatePrevious();
            } else {
                this.navigateNext();
            }
        }
    }

    /**
     * Setup progress bar
     */
    setupProgressBar() {
        const progress = document.createElement('div');
        progress.className = 'progress-bar';
        document.body.appendChild(progress);
        
        window.addEventListener('scroll', () => {
            const winScroll = document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            progress.style.width = scrolled + '%';
        });
    }

    /**
     * Navigate to previous document
     */
    navigatePrevious() {
        const prev = document.querySelector('.prev:not(.disabled)');
        if (prev) prev.click();
    }

    /**
     * Navigate to next document
     */
    navigateNext() {
        const next = document.querySelector('.next:not(.disabled)');
        if (next) next.click();
    }

    /**
     * Navigate to home/index
     */
    navigateHome() {
        window.location.href = './index.html';
    }

    /**
     * Bind events for navigation toggle
     */
    bindEvents() {
        this.navToggle?.addEventListener('click', () => {
            document.body.classList.toggle('nav-open');
        });
    }

    /**
     * Generate table of contents
     */
    generateTOC() {
        const headings = document.querySelectorAll('h2, h3');
        const toc = Array.from(headings).map(heading => {
            return `<li class="toc-${heading.tagName.toLowerCase()}">
                <a href="#${heading.id}">${heading.textContent}</a>
            </li>`;
        }).join('');
        
        const tocContainer = document.querySelector('.toc-container');
        if (tocContainer) {
            tocContainer.innerHTML = `<ul>${toc}</ul>`;
        }
    }
}

module.exports = Navigation;

new Navigation();
