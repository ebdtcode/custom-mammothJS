const fs = require('fs').promises;
const path = require('path');
const mammoth = require('mammoth');
const Logger = require('../logger');
const ImageProcessor = require('./image-processor');

class DocumentProcessor {
    constructor(options = {}) {
        this.options = options;
        this.imageProcessor = new ImageProcessor(options);
        this.documents = [];
        this.currentIndex = 0;
    }

    async process(inputPath) {
        try {
            Logger.info('Processing document:', inputPath);
            
            // Reset image counter for new document
            this.imageProcessor.reset();
            
            // Basic conversion options
            const conversionOptions = {
                styleMap: [
                    "p[style-name='Title'] => h1:fresh",
                    "p[style-name='Heading 1'] => h1:fresh",
                    "p[style-name='Heading 2'] => h2:fresh",
                    "p[style-name='Heading 3'] => h3:fresh",
                    "p[style-name='Heading 4'] => h4:fresh",
                    "p[style-name='Heading 5'] => h5:fresh",
                    "p[style-name='Heading 6'] => h6:fresh"
                ],
                convertImage: mammoth.images.imgElement(this.processImage.bind(this))
            };
            
            const result = await mammoth.convertToHtml({ path: inputPath }, conversionOptions);
            
            if (!result || !result.value) {
                throw new Error('Document conversion failed');
            }
            
            // Update document list for pagination
            const filename = path.basename(inputPath, '.docx');
            const htmlFile = `${filename}.html`;
            this.documents = await this.getDocumentList();
            this.currentIndex = this.documents.findIndex(doc => doc === htmlFile);
            
            return this.generateHtml(result.value, filename);
        } catch (error) {
            Logger.error('Document processing failed:', error.message);
            throw error;
        }
    }
    
    async getDocumentList() {
        try {
            const files = await fs.readdir(this.options.outputDir);
            return files.filter(file => file.endsWith('.html')).sort();
        } catch (error) {
            Logger.error('Failed to get document list:', error.message);
            return [];
        }
    }
    
    async processImage(image) {
        try {
            const buffer = await image.read();
            const result = await this.imageProcessor.processBase64Image({
                buffer,
                contentType: image.contentType
            });
            return result ? {
                src: path.relative(this.options.outputDir, result.src),
                alt: "Document image"
            } : null;
        } catch (error) {
            Logger.error('Failed to process image:', error.message);
            return null;
        }
    }
    
    generateHtml(content, title) {
        const currentDate = new Date().toISOString();
        const prevDoc = this.currentIndex > 0 ? this.documents[this.currentIndex - 1] : null;
        const nextDoc = this.currentIndex < this.documents.length - 1 ? this.documents[this.currentIndex + 1] : null;
        
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Generated document: ${title}">
    <meta name="generator" content="MammothJS Document Converter">
    <meta name="date" content="${currentDate}">
    <meta name="author" content="MammothJS">
    <meta name="theme-color" content="#1a73e8">
    
    <title>${title}</title>
    
    <!-- Styles -->
    <link rel="stylesheet" href="../main.css">
    <style>
        :root {
            /* Light theme colors with WCAG AA compliant contrast ratios */
            --primary-color: #1a73e8;
            --primary-dark: #1557b0;
            --primary-light: #4285f4;
            --text-primary: #202124;
            --text-secondary: #5f6368;
            --background-primary: #ffffff;
            --background-secondary: #f8f9fa;
            --border-color: #dadce0;
            --link-color: #1a73e8;
            --error-color: #d93025;
            --success-color: #188038;
            --warning-color: #ea8600;
            
            /* Spacing */
            --spacing-xs: 0.25rem;
            --spacing-sm: 0.5rem;
            --spacing-md: 1rem;
            --spacing-lg: 1.5rem;
            --spacing-xl: 2rem;
            
            /* Typography */
            --font-size-base: 16px;
            --line-height-base: 1.6;
            --font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        }
        
        /* Dark theme colors with WCAG AA compliant contrast ratios */
        @media (prefers-color-scheme: dark) {
            :root {
                --primary-color: #8ab4f8;
                --primary-dark: #aecbfa;
                --primary-light: #669df6;
                --text-primary: #e8eaed;
                --text-secondary: #9aa0a6;
                --background-primary: #202124;
                --background-secondary: #292a2d;
                --border-color: #3c4043;
                --link-color: #8ab4f8;
                --error-color: #f28b82;
                --success-color: #81c995;
                --warning-color: #fdd663;
            }
        }
        
        /* Base styles */
        body {
            font-family: var(--font-family);
            font-size: var(--font-size-base);
            line-height: var(--line-height-base);
            color: var(--text-primary);
            background: var(--background-secondary);
            margin: 0;
            padding: 0;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }
        
        /* Container */
        .container {
            width: 100%;
            max-width: 100%;
            padding: 0 var(--spacing-md);
            margin: 0 auto;
            box-sizing: border-box;
        }
        
        @media (min-width: 640px) {
            .container {
                max-width: 640px;
                padding: 0 var(--spacing-lg);
            }
        }
        
        @media (min-width: 768px) {
            .container {
                max-width: 768px;
            }
        }
        
        @media (min-width: 1024px) {
            .container {
                max-width: 1024px;
            }
        }
        
        @media (min-width: 1280px) {
            .container {
                max-width: 1280px;
            }
        }
        
        /* Document content */
        .document-content {
            background: var(--background-primary);
            padding: var(--spacing-md);
            border-radius: 8px;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
            margin: var(--spacing-md) 0;
            overflow-x: auto;
        }
        
        @media (min-width: 768px) {
            .document-content {
                padding: var(--spacing-xl);
                margin: var(--spacing-xl) 0;
            }
        }
        
        /* Typography */
        h1, h2, h3, h4, h5, h6 {
            color: var(--text-primary);
            line-height: 1.3;
            margin: var(--spacing-lg) 0 var(--spacing-md);
        }
        
        h1 {
            font-size: 1.875rem;
            font-weight: 700;
        }
        
        h2 {
            font-size: 1.5rem;
            font-weight: 600;
        }
        
        h3 {
            font-size: 1.25rem;
            font-weight: 600;
        }
        
        p {
            margin: var(--spacing-md) 0;
            color: var(--text-primary);
        }
        
        a {
            color: var(--link-color);
            text-decoration: none;
            transition: color 0.2s ease;
        }
        
        a:hover {
            text-decoration: underline;
        }
        
        /* Images */
        .document-content img {
            max-width: 100%;
            height: auto;
            border-radius: 4px;
            margin: var(--spacing-md) 0;
            display: block;
        }
        
        /* Tables */
        .document-content table {
            width: 100%;
            border-collapse: collapse;
            margin: var(--spacing-md) 0;
            overflow-x: auto;
            display: block;
        }
        
        @media (min-width: 768px) {
            .document-content table {
                display: table;
            }
        }
        
        .document-content td, 
        .document-content th {
            padding: var(--spacing-sm) var(--spacing-md);
            border: 1px solid var(--border-color);
            text-align: left;
        }
        
        .document-content th {
            background: var(--background-secondary);
            font-weight: 600;
        }
        
        .document-content tr:nth-child(even) {
            background: var(--background-secondary);
        }
        
        /* Lists */
        .document-content ul,
        .document-content ol {
            padding-left: var(--spacing-xl);
            margin: var(--spacing-md) 0;
        }
        
        .document-content li {
            margin: var(--spacing-xs) 0;
        }
        
        /* Navigation */
        .navbar {
            background: var(--background-primary);
            border-bottom: 1px solid var(--border-color);
            padding: var(--spacing-md) 0;
            position: sticky;
            top: 0;
            z-index: 100;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }
        
        .navbar .container {
            display: flex;
            flex-wrap: wrap;
            gap: var(--spacing-md);
            align-items: center;
        }
        
        .navbar a {
            color: var(--text-primary);
            text-decoration: none;
            padding: var(--spacing-xs) var(--spacing-sm);
            border-radius: 4px;
            transition: background-color 0.2s ease;
        }
        
        .navbar a:hover {
            background: var(--background-secondary);
            text-decoration: none;
        }
        
        /* Pagination */
        .pagination {
            margin: var(--spacing-xl) 0;
            display: flex;
            flex-direction: column;
            gap: var(--spacing-md);
        }
        
        @media (min-width: 640px) {
            .pagination {
                flex-direction: row;
                justify-content: space-between;
                align-items: center;
            }
        }
        
        .pagination-links {
            display: flex;
            gap: var(--spacing-md);
            align-items: center;
            justify-content: center;
            flex-wrap: wrap;
        }
        
        .pagination a,
        .pagination button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: var(--spacing-sm) var(--spacing-md);
            border-radius: 4px;
            background: var(--background-primary);
            color: var(--primary-color);
            border: 1px solid var(--primary-color);
            font-weight: 500;
            text-decoration: none;
            transition: all 0.2s ease;
            min-width: 100px;
            text-align: center;
        }
        
        .pagination a:hover:not([aria-disabled="true"]),
        .pagination button:hover:not(:disabled) {
            background: var(--primary-color);
            color: white;
            text-decoration: none;
        }
        
        .pagination a[aria-disabled="true"],
        .pagination button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            border-color: var(--border-color);
            color: var(--text-secondary);
        }
        
        /* Focus styles for accessibility */
        a:focus,
        button:focus {
            outline: 2px solid var(--primary-color);
            outline-offset: 2px;
        }
        
        /* Skip to main content link for accessibility */
        .skip-to-main {
            position: absolute;
            top: -100px;
            left: 0;
            z-index: 1000;
            padding: var(--spacing-md);
            background: var(--primary-color);
            color: white;
            text-decoration: none;
            transition: top 0.2s ease;
        }
        
        .skip-to-main:focus {
            top: 0;
        }
        
        /* Print styles */
        @media print {
            body {
                background: white;
            }
            
            .navbar,
            .pagination,
            .skip-to-main {
                display: none;
            }
            
            .document-content {
                box-shadow: none;
                margin: 0;
                padding: 0;
            }
            
            a {
                text-decoration: underline;
            }
            
            a[href]:after {
                content: " (" attr(href) ")";
            }
        }
    </style>
</head>
<body>
    <a href="#main-content" class="skip-to-main">Skip to main content</a>
    
    <main id="main-content" class="container">
        <article class="document-content">
            <header>
                <h1>${title}</h1>
            </header>
            ${content}
        </article>
        
        <nav class="pagination" aria-label="Document navigation">
            <div class="pagination-links">
                ${prevDoc ? 
                    `<a href="./${prevDoc}" rel="prev" aria-label="Previous document">← Previous</a>` : 
                    `<button disabled aria-label="No previous document">← Previous</button>`}
                <a href="../index.html" class="home-button" aria-label="Go to document index">Index</a>
                ${nextDoc ? 
                    `<a href="./${nextDoc}" rel="next" aria-label="Next document">Next →</a>` : 
                    `<button disabled aria-label="No next document">Next →</button>`}
            </div>
        </nav>
    </main>

    <script>
        // Initialize Navbar
        class Navbar {
            constructor(options = {}) {
                this.options = {
                    title: 'MammothJS',
                    theme: 'light',
                    ...options
                };
                this.pages = [];
            }

            init(pages) {
                this.pages = pages;
                this.render();
            }

            render() {
                const navbar = document.createElement('nav');
                navbar.className = 'navbar';
                navbar.setAttribute('role', 'navigation');
                navbar.setAttribute('aria-label', 'Main navigation');
                navbar.innerHTML = \`
                    <div class="container">
                        <a href="../index.html" class="brand">\${this.options.title}</a>
                        \${this.pages.map(page => 
                            \`<a href="\${page.url}">\${page.title}</a>\`
                        ).join('')}
                    </div>
                \`;
                document.body.insertBefore(navbar, document.body.firstChild);
            }
        }

        // Initialize the navbar
        const navbar = new Navbar({ title: '${title}' });
        navbar.init([
            { title: 'Home', url: '../index.html' },
            { title: 'Documentation', url: '#' }
        ]);
    </script>
</body>
</html>`;
    }
}

module.exports = DocumentProcessor;