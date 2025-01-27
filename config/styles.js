const config = require('../config');

class StyleGenerator {
    constructor(options = {}) {
        this.options = {
            fontSize: 16,
            maxWidth: '65ch',
            ...options
        };
    }

    generate() {
        return `
        :root {
            --primary-color: #1a73e8;
            --text-primary: #202124;
            --background-primary: #ffffff;
            --background-secondary: #f8f9fa;
            --border-color: #dadce0;
            --font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
            --spacing-md: 1rem;
            --radius: 8px;
        }

        /* Dark theme */
        @media (prefers-color-scheme: dark) {
            :root {
                --primary-color: #8ab4f8;
                --text-primary: #e8eaed;
                --background-primary: #202124; 
                --background-secondary: #292a2d;
                --border-color: #3c4043;
            }
        }

        body {
            font-family: var(--font-family);
            color: var(--text-primary);
            background: var(--background-secondary);
            line-height: 1.75;
            margin: 0;
        }

        .container {
            max-width: 1280px;
            margin: 0 auto;
            padding: 0 var(--spacing-md);
        }

        .navbar {
            background: var(--background-primary);
            border-bottom: 1px solid var(--border-color);
            position: sticky;
            top: 0;
            z-index: 100;
        }

        .document-content {
            background: var(--background-primary);
            border-radius: var(--radius);
            padding: 2rem;
            margin: 2rem 0;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        h1, h2, h3 {
            color: var(--text-primary);
            font-weight: 600;
            margin-top: 2rem;
        }

        code {
            font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
            background: var(--background-secondary);
            padding: 0.2em 0.4em;
            border-radius: 3px;
        }`;
    }
}

module.exports = StyleGenerator;