const config = require('../config');

/**
 * Generates responsive CSS styles for the document
 */
class StyleGenerator {
    constructor(options = {}) {
        this.options = {
            darkMode: false,
            fontSize: 16,
            maxWidth: '65ch',
            ...options
        };
    }

    /**
     * Generate the complete CSS content
     */
    generate() {
        return `
${this.generateVariables()}
${this.generateBase()}
${this.generateNavbar()}
${this.generateLayout()}
${this.generateNavigation()}
${this.generateComponents()}
${this.generateUtilities()}
${this.generateDocumentStyles()}
${this.generateDarkMode()}
${this.generatePrint()}
        `.trim();
    }

    /**
     * Generate CSS variables
     */
    generateVariables() {
        const { colors } = config.styles;
        return `
:root {
    --primary: ${colors.primary};
    --secondary: ${colors.secondary};
    --background: ${colors.background};
    --text: ${colors.text};
    --border: ${colors.border};
    --hover: ${colors.hover};
    --spacing: ${config.styles.spacing};
    --radius: ${config.styles.radius};
    --font-size: ${this.options.fontSize}px;
}`;
    }

    /**
     * Generate base styles
     */
    generateBase() {
        return `
/* Base Styles */
html {
    font-size: var(--font-size);
    line-height: 1.6;
    -webkit-text-size-adjust: 100%;
    scroll-padding-top: 70px; /* Account for fixed navbar */
}

body {
    margin: 0;
    padding: 0;
    font-family: system-ui, -apple-system, sans-serif;
    color: var(--text);
    background: var(--background);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

/* Main content area */
main.container {
    max-width: min(90%, ${this.options.maxWidth});
    margin: 2rem auto;
    padding: var(--spacing);
    flex: 1;
}

/* Responsive Images */
img {
    max-width: 100%;
    height: auto;
    border-radius: var(--radius);
    transition: transform 0.2s ease;
}

/* Typography */
h1, h2, h3, h4, h5, h6 {
    margin-top: 2rem;
    margin-bottom: 1rem;
    line-height: 1.3;
    color: var(--text);
}

h1 {
    font-size: 2.5rem;
}

h2 {
    font-size: 2rem;
}

h3 {
    font-size: 1.75rem;
}

p {
    margin-bottom: 1.5rem;
}

/* Links */
a {
    color: var(--primary);
    text-decoration: none;
    transition: color 0.2s ease;
}

a:hover {
    color: color-mix(in srgb, var(--primary) 80%, black);
    text-decoration: underline;
}

/* Section spacing */
section {
    margin: 3rem 0;
}

section:first-child {
    margin-top: 0;
}

/* Mobile adjustments */
@media (max-width: 768px) {
    html {
        font-size: calc(var(--font-size) * 0.9);
    }
    
    main.container {
        margin: 1rem auto;
        padding: calc(var(--spacing) * 0.75);
    }
    
    h1 {
        font-size: 2rem;
    }
    
    h2 {
        font-size: 1.75rem;
    }
    
    h3 {
        font-size: 1.5rem;
    }
    
    section {
        margin: 2rem 0;
    }
}`;
    }

    /**
     * Generate navbar styles
     * @private
     */
    generateNavbar() {
        return `
/* Navbar Styles */
.navbar {
    position: sticky;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    background: var(--background);
    border-bottom: 1px solid var(--border);
    box-shadow: 0 2px 4px rgb(0 0 0 / 0.1);
    height: 60px;
    display: flex;
    align-items: center;
}

.navbar-container {
    width: 100%;
    max-width: min(95%, 1200px);
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 1rem;
    height: 100%;
}

.navbar-brand {
    display: flex;
    align-items: center;
    gap: 1rem;
    height: 100%;
}

.navbar-logo {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--primary);
    text-decoration: none;
    white-space: nowrap;
    height: 100%;
    display: flex;
    align-items: center;
}

.navbar-logo:hover {
    text-decoration: none;
}

.navbar-toggle {
    display: none;
    padding: 0.5rem;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text);
}

.hamburger {
    display: block;
    width: 24px;
    height: 2px;
    background: currentColor;
    position: relative;
    transition: all 0.3s ease;
}

.hamburger::before,
.hamburger::after {
    content: '';
    position: absolute;
    width: 24px;
    height: 2px;
    background: currentColor;
    transition: all 0.3s ease;
}

.hamburger::before {
    top: -6px;
}

.hamburger::after {
    bottom: -6px;
}

.navbar-toggle.is-active .hamburger {
    background: transparent;
}

.navbar-toggle.is-active .hamburger::before {
    transform: rotate(45deg);
    top: 0;
}

.navbar-toggle.is-active .hamburger::after {
    transform: rotate(-45deg);
    bottom: 0;
}

.navbar-menu {
    display: flex;
    align-items: center;
    gap: 1rem;
    height: 100%;
}

.navbar-start {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    height: 100%;
}

.navbar-end {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    height: 100%;
}

.navbar-item {
    position: relative;
    color: var(--text);
    text-decoration: none;
    padding: 0.5rem 1rem;
    border-radius: var(--radius);
    transition: all 0.2s ease;
    height: 100%;
    display: flex;
    align-items: center;
}

.navbar-item:hover {
    background: var(--hover);
    text-decoration: none;
}

.navbar-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--text);
    text-decoration: none;
    cursor: pointer;
    padding: 0.5rem 1rem;
    border-radius: var(--radius);
    transition: all 0.2s ease;
}

.navbar-link:hover {
    background: var(--hover);
    text-decoration: none;
}

.navbar-link::after {
    content: '';
    display: inline-block;
    width: 0.5rem;
    height: 0.5rem;
    border-right: 2px solid currentColor;
    border-bottom: 2px solid currentColor;
    transform: rotate(45deg);
    transition: transform 0.2s ease;
    margin-left: 0.5rem;
}

.has-dropdown.is-active .navbar-link::after {
    transform: rotate(-135deg);
}

.navbar-dropdown {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    min-width: 200px;
    background: var(--background);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    box-shadow: 0 4px 6px rgb(0 0 0 / 0.1);
    z-index: 20;
    padding: 0.5rem 0;
}

.has-dropdown.is-active .navbar-dropdown {
    display: block;
}

.navbar-dropdown .navbar-item {
    padding: 0.75rem 1rem;
    height: auto;
}

.theme-toggle {
    padding: 0.5rem;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text);
    border-radius: var(--radius);
    transition: all 0.2s ease;
}

.theme-toggle:hover {
    background: var(--hover);
}

.theme-icon {
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
    fill: none;
}

/* Mobile Styles */
@media (max-width: 768px) {
    .navbar-toggle {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .navbar-menu {
        display: none;
        position: absolute;
        top: 60px;
        left: 0;
        right: 0;
        background: var(--background);
        border-bottom: 1px solid var(--border);
        box-shadow: 0 4px 6px rgb(0 0 0 / 0.1);
        padding: 1rem;
        flex-direction: column;
        align-items: stretch;
        height: auto;
        max-height: calc(100vh - 60px);
        overflow-y: auto;
    }

    .navbar-menu.is-active {
        display: flex;
    }

    .navbar-start {
        flex-direction: column;
        align-items: stretch;
        height: auto;
        gap: 0;
    }

    .navbar-item {
        height: auto;
    }

    .navbar-dropdown {
        position: static;
        box-shadow: none;
        border: none;
        border-radius: 0;
        background: var(--hover);
        margin: 0.5rem 0;
        padding: 0;
    }

    .navbar-end {
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid var(--border);
        justify-content: center;
        height: auto;
    }
}`;
    }

    /**
     * Generate layout styles
     */
    generateLayout() {
        return `
/* Layout */
.container {
    width: 100%;
    margin: 0 auto;
}

.grid {
    display: grid;
    gap: var(--spacing);
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

@media (max-width: 480px) {
    .grid {
        grid-template-columns: 1fr;
    }
}`;
    }

    /**
     * Generate navigation styles
     */
    generateNavigation() {
        return `
/* Navigation */
.pagination {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: calc(var(--spacing) * 2) 0;
    padding: var(--spacing);
    border-top: 1px solid var(--border);
}

.pagination a,
.pagination .disabled {
    display: inline-flex;
    align-items: center;
    padding: calc(var(--spacing) * 0.75) var(--spacing);
    color: var(--primary);
    text-decoration: none;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    transition: all 0.2s ease;
}

.pagination a:hover {
    background: var(--hover);
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgb(0 0 0 / 0.1);
}

.pagination .disabled {
    color: var(--secondary);
    background: var(--hover);
    cursor: not-allowed;
    opacity: 0.6;
}

/* Progress Bar */
.progress-bar {
    position: fixed;
    top: 0;
    left: 0;
    height: 3px;
    background: var(--primary);
    transition: width 0.2s ease;
}

@media (max-width: 480px) {
    .pagination {
        flex-direction: column;
        gap: var(--spacing);
    }
    
    .pagination a,
    .pagination .disabled {
        width: 100%;
        justify-content: center;
    }
}`;
    }

    /**
     * Generate component styles
     */
    generateComponents() {
        return `
/* Components */
.card {
    padding: var(--spacing);
    background: var(--background);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    transition: all 0.2s ease;
}

.card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgb(0 0 0 / 0.1);
}

/* Tables */
table {
    width: 100%;
    border-collapse: collapse;
    margin: var(--spacing) 0;
}

th, td {
    padding: calc(var(--spacing) * 0.5);
    border: 1px solid var(--border);
    text-align: left;
}

@media (max-width: 768px) {
    table {
        display: block;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
    }
}`;
    }

    /**
     * Generate utility styles
     */
    generateUtilities() {
        return `
/* Utilities */
.visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    border: 0;
}

.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}`;
    }

    /**
     * Generate document content styles
     * @private
     */
    generateDocumentStyles() {
        return `
/* Document Content */
.document-content {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
    background: var(--background);
    border-radius: var(--radius);
    box-shadow: 0 1px 3px rgb(0 0 0 / 0.1);
}

.document-content h1 {
    font-size: 2.5rem;
    margin-bottom: 2rem;
    color: var(--text);
    border-bottom: 2px solid var(--border);
    padding-bottom: 0.5rem;
}

.document-content h2 {
    font-size: 2rem;
    margin: 2rem 0 1rem;
    color: var(--text);
}

.document-content h3 {
    font-size: 1.75rem;
    margin: 1.5rem 0 1rem;
    color: var(--text);
}

.document-content p {
    margin-bottom: 1rem;
    line-height: 1.6;
}

.document-content ul,
.document-content ol {
    margin: 1rem 0;
    padding-left: 2rem;
}

.document-content li {
    margin-bottom: 0.5rem;
}

.document-content a {
    color: var(--primary);
    text-decoration: none;
    transition: color 0.2s ease;
}

.document-content a:hover {
    text-decoration: underline;
}

.document-content img {
    max-width: 100%;
    height: auto;
    margin: 1rem 0;
    border-radius: var(--radius);
}

.document-content blockquote {
    margin: 1rem 0;
    padding: 1rem;
    border-left: 4px solid var(--primary);
    background: var(--hover);
    border-radius: 0 var(--radius) var(--radius) 0;
}

.document-content pre,
.document-content code {
    font-family: monospace;
    background: var(--hover);
    padding: 0.2rem 0.4rem;
    border-radius: var(--radius);
}

.document-content pre {
    padding: 1rem;
    margin: 1rem 0;
    overflow-x: auto;
}

.document-content pre code {
    padding: 0;
    background: none;
}

.document-content table {
    width: 100%;
    margin: 1rem 0;
    border-collapse: collapse;
}

.document-content th,
.document-content td {
    padding: 0.5rem;
    border: 1px solid var(--border);
    text-align: left;
}

.document-content th {
    background: var(--hover);
    font-weight: 600;
}

/* Dark theme adjustments */
.dark-theme .document-content {
    background: var(--background);
    box-shadow: 0 1px 3px rgb(255 255 255 / 0.1);
}

.dark-theme .document-content blockquote {
    background: color-mix(in srgb, var(--hover) 80%, black);
}

.dark-theme .document-content pre,
.dark-theme .document-content code {
    background: color-mix(in srgb, var(--hover) 80%, black);
}

.dark-theme .document-content th {
    background: color-mix(in srgb, var(--hover) 80%, black);
}`;
    }

    /**
     * Generate dark mode styles
     */
    generateDarkMode() {
        return `
/* Dark Mode */
@media (prefers-color-scheme: dark) {
    :root {
        --background: #1a1a1a;
        --text: #e5e5e5;
        --border: #333;
        --hover: #222;
    }
    
    img {
        opacity: 0.8;
        transition: opacity 0.2s ease;
    }
    
    img:hover {
        opacity: 1;
    }
}`;
    }

    /**
     * Generate print styles
     */
    generatePrint() {
        return `
/* Print Styles */
@media print {
    .pagination,
    .progress-bar {
        display: none;
    }
    
    body {
        max-width: none;
        padding: 0;
    }
    
    a {
        text-decoration: none;
    }
    
    a[href]:after {
        content: " (" attr(href) ")";
    }
}`;
    }
}

module.exports = StyleGenerator;
