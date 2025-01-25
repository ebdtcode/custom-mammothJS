const mammoth = require('mammoth');
const fs = require('fs').promises;
const path = require('path');
const Logger = require('./lib/logger');
const ImageProcessor = require('./lib/processors/image-processor');
const CommonUtils = require('./lib/utils/common');
const config = require('./lib/config');
const createExtensions = require('./lib');
const extractTitle = require('./lib/utils/extractTitle');

async function convertDocument(inputPath, options = {}) {
    try {
        Logger.info('Converting document:', inputPath);
        
        // Verify mammoth is loaded
        if (!mammoth || typeof mammoth.convertToHtml !== 'function') {
            throw new Error('Mammoth library not properly initialized');
        }
        
        // Ensure output directory exists
        const outputDir = options.outputDir || path.join(__dirname, 'output');
        await fs.mkdir(outputDir, { recursive: true });
        
        // Generate output filename
        const baseName = path.basename(inputPath, path.extname(inputPath));
        const outputPath = path.join(outputDir, `${baseName}.html`);
        
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
            ]
        };
        
        // Perform the conversion
        const result = await mammoth.convertToHtml(
            { path: inputPath },
            conversionOptions
        );
        
        if (!result || !result.value) {
            throw new Error('Document conversion failed - no content generated');
        }
        
        let content = result.value;
        
        // Process images if needed
        if (options.outputDir) {
            content = await processBase64Images(content, options.outputDir);
        }
        
        // Extract title and generate HTML
        const title = extractTitle(content) || baseName;
        const html = generateHtml(content, title, options.navbar);
        
        // Write the output file
        await fs.writeFile(outputPath, html, 'utf8');
        Logger.info(`Successfully converted ${inputPath} to ${outputPath}`);
        
        return {
            content: html,
            outputPath,
            title
        };
        
    } catch (error) {
        Logger.error(`Failed to convert document: ${inputPath}`);
        throw error;
    }
}

async function processBase64Images(content, outputDir) {
    if (!content) return content;
    
    const imageRegex = /src="(data:image\/[^;]+;base64,[^"]+)"/g;
    let match;
    let processedContent = content;
    
    while ((match = imageRegex.exec(content)) !== null) {
        const base64Data = match[1];
        if (!isValidBase64Image(base64Data)) continue;
        
        try {
            const imagePath = await saveBase64Image(base64Data, outputDir);
            processedContent = processedContent.replace(base64Data, imagePath);
        } catch (error) {
            console.warn(`Failed to process image: ${error.message}`);
        }
    }
    
    return processedContent;
}

function determineCategory(filePath) {
    if (!filePath) return 'default';
    const filename = path.basename(filePath);
    return filename.split('-')[0] || 'default';
}

async function extractDocumentTitle(content) {
    const titleMatch = content.match(/<h1[^>]*>(.*?)<\/h1>/);
    return titleMatch ? titleMatch[1].trim() : null;
}

function generateHtml(content, title, navbar) {
    const currentDate = new Date().toISOString();
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Generated document: ${title}">
    <meta name="generator" content="MammothJS Document Converter">
    <meta name="date" content="${currentDate}">
    <meta name="author" content="MammothJS">
    
    <title>${title}</title>
    
    <!-- Styles -->
    <link rel="stylesheet" href="../main.css">
    <style>
        /* Document-specific styles */
        .document-content {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin: 2rem auto;
            max-width: 1200px;
        }
        
        .document-content img {
            max-width: 100%;
            height: auto;
            border-radius: 4px;
            margin: 1rem 0;
        }
        
        .document-content table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
        }
        
        .document-content td, 
        .document-content th {
            padding: 0.75rem;
            border: 1px solid var(--primary-color);
        }
        
        .document-content th {
            background: var(--primary-color);
            color: white;
        }
        
        .document-content tr:nth-child(even) {
            background: var(--background-color);
        }
        
        .document-content ul,
        .document-content ol {
            padding-left: 2rem;
            margin: 1rem 0;
        }
        
        .document-content li {
            margin: 0.5rem 0;
        }
        
        .document-content p {
            line-height: 1.6;
            margin: 1rem 0;
        }
        
        @media (prefers-color-scheme: dark) {
            .document-content {
                background: #2d2d2d;
            }
            
            .document-content tr:nth-child(even) {
                background: #333;
            }
        }
        
        @media print {
            .navbar,
            .pagination {
                display: none;
            }
            
            .document-content {
                box-shadow: none;
                margin: 0;
                padding: 0;
            }
        }
    </style>
</head>
<body>
    <main class="container">
        <article class="document-content">
            <header>
                <h1>${title}</h1>
            </header>
            ${content}
        </article>
        
        <nav class="pagination" aria-label="Document navigation">
            <button onclick="history.back()" aria-label="Go back to previous page">Back</button>
            <a href="../index.html" class="home-button" aria-label="Go to document index">Index</a>
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
                        <a href="../index.html">\${this.options.title}</a>
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

function isValidBase64Image(data) {
    return data && typeof data === 'string' && data.startsWith('data:image');
}

module.exports = {
    convertDocument
};
