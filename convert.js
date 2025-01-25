const mammoth = require('mammoth');
const createExtensions = require('.');
const fs = require('fs').promises;
const path = require('path');
const { filterWarnings } = require('./utils/warning-handler');
const { sanitizeFilename } = require('./utils/filename-handler');
const { Document } = require('./models/document');
const { getPaginationInfo, generatePaginationHtml } = require('./utils/pagination');

const extensions = createExtensions(mammoth);
const sourceDir = process.argv[2] || './sources';
const outputDir = process.argv[3] || './output';
const imagesDir = path.join(outputDir, 'images');
const imagePattern = process.argv[4] || 'source_filename';
let currentInputFile = '';

// Add title map to store document titles
let documentTitles = new Map();
let documents = [];

async function getDocumentTitle(filePath) {
    try {
        const result = await mammoth.extractRawText({ path: filePath });
        const firstLine = result.value.split('\n')[0].trim();
        return firstLine || path.basename(filePath, '.docx');
    } catch (error) {
        console.error(`Failed to extract title from ${filePath}:`, error);
        return path.basename(filePath, '.docx');
    }
}

async function getWordFiles(directory) {
    const files = await fs.readdir(directory);
    return files.filter(file => file.endsWith('.docx'));
}

async function processDirectory(srcDir) {
    documentTitles.clear();
    const files = await getWordFiles(srcDir);
    console.log(`Found ${files.length} Word documents to process`);
    
    for (const file of files) {
        const inputPath = path.join(srcDir, file);
        try {
            await convertDocument(inputPath);
        } catch (error) {
            console.error(`Failed to convert ${file}:`, error);
        }
    }
    
    await generateIndexHtml();
    console.log('Generated index.html');
}

function getImagePattern(pattern, inputFile, index) {
    const basename = path.basename(inputFile, '.docx');
    switch(pattern) {
        case 'source_filename':
            return `${basename}_${String(index).padStart(4, '0')}.jpeg`;
        case 'sequential':
            return `image_${String(index).padStart(4, '0')}.jpeg`;
        default:
            return `${basename}_${String(index).padStart(4, '0')}.jpeg`;
    }
}

function getImageName(index, inputFile) {
    return getImagePattern(imagePattern, inputFile, index);
}

async function ensureDirectories() {
    console.log('Creating directories...');
    await ensureDirectoryExists(outputDir);
    await ensureDirectoryExists(imagesDir);
    await ensureDirectoryExists(sourceDir);
}

async function ensureDirectoryExists(dir) {
    try {
        await fs.access(dir);
    } catch {
        await fs.mkdir(dir, { recursive: true });
        console.log(`Created directory: ${dir}`);
    }
}

async function saveBase64Image(base64Data, outputPath) {
    const matches = base64Data.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches) throw new Error('Invalid base64 string');
    
    const buffer = Buffer.from(matches[2], 'base64');
    await fs.writeFile(outputPath, buffer);
}

async function processImages(content, options) {
    const { outputDir } = options;
    const imagesDir = path.join(outputDir, 'images');
    await ensureDirectoryExists(imagesDir);
    
    const imgPattern = /<img[^>]+src="(data:image\/[^"]+)"[^>]*>/g;
    let imageCount = 0;
    
    return content.replace(imgPattern, (match, base64Data) => {
        imageCount++;
        const filename = `image_${imageCount}.png`;
        const imagePath = path.join(imagesDir, filename);
        
        try {
            saveBase64Image(base64Data, imagePath);
            return match.replace(base64Data, `./images/${filename}`);
        } catch (error) {
            console.error(`Failed to process image ${imageCount}:`, error);
            return match;
        }
    });
}

const options = {
    customElements: extensions.elements.createCustomReader(),
    styleMap: extensions.styles.customStyleMap.concat([
        // Base paragraph styles
        "p[style-name='Normal'] => p:fresh",
        "p[style-name='Caption'] => figcaption:fresh",
        "p[style-name='Footer'] => footer:fresh",
        
    ]),
    transformers: extensions.transforms.createPipeline({
        outputDir,
        imagesDir,
        getImageName: (index) => getImageName(index, currentInputFile),
        postProcess: async (content) => {
            return await processImages(content, { outputDir });
        }
    })
};

async function createDefaultCss() {
    console.log('Creating CSS...');
    const cssContent = `
:root {
    --primary: #2563eb;
    --secondary: #475569;
    --background: #ffffff;
    --text: #1f2937;
    --border: #e5e7eb;
    --hover: #f8fafc;
    --spacing: 1rem;
    --radius: 8px;
}

body {
    max-width: min(90%, 65ch);
    margin: 0 auto;
    padding: var(--spacing);
    font-family: system-ui, -apple-system, sans-serif;
    line-height: 1.6;
    color: var(--text);
    background: var(--background);
}

img {
    max-width: 100%;
    height: auto;
    border-radius: var(--radius);
    transition: transform 0.2s ease;
}

figure {
    margin: calc(var(--spacing) * 2) 0;
    text-align: center;
}

figure img {
    box-shadow: 0 4px 6px rgb(0 0 0 / 0.1);
}

figure:hover img {
    transform: scale(1.01);
}

figcaption {
    margin-top: var(--spacing);
    font-style: italic;
    color: var(--secondary);
}

table {
    width: 100%;
    margin: var(--spacing) 0;
    border-collapse: separate;
    border-spacing: 0;
    border-radius: var(--radius);
    border: 1px solid var(--border);
    overflow: hidden;
    box-shadow: 0 4px 6px rgb(0 0 0 / 0.1);
}

th {
    background: var(--primary);
    color: white;
    font-weight: 600;
    text-align: left;
    border-bottom: 2px solid var(--border);
}

th, td {
    padding: calc(var(--spacing) * 0.75);
    border-right: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
}

th:last-child, td:last-child {
    border-right: none;
}

tr:last-child td {
    border-bottom: none;
}

tr:nth-child(even) {
    background: var(--hover);
}

tr:hover {
    background: var(--hover);
}

@media (max-width: 640px) {
    table {
        display: block;
        overflow-x: auto;
        white-space: nowrap;
    }
    
    th, td {
        padding: calc(var(--spacing) * 0.5);
    }
}

@media (prefers-color-scheme: dark) {
    :root {
        --primary: #3b82f6;
        --secondary: #9ca3af;
        --background: #1f2937;
        --text: #f3f4f6;
        --border: #374151;
        --hover: #2d3748;
    }
}

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

.prev-container,
.next-container {
    flex: 1;
}

.next-container {
    text-align: right;
}

.prev::before {
    content: "←";
    margin-right: 0.5em;
}

.next::after {
    content: "→";
    margin-left: 0.5em;
}

// Optional: Add keyboard navigation support
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        const prev = document.querySelector('.prev');
        if (prev) prev.click();
    }
    if (e.key === 'ArrowRight') {
        const next = document.querySelector('.next');
        if (next) next.click();
    }
});
`;
    await fs.writeFile(path.join(outputDir, 'main.css'), cssContent);
}

function generateHtml5Template(content, title, pagination) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <link rel="stylesheet" href="./main.css">
</head>
<body>
    ${content}
    ${pagination}
</body>
</html>`;
}

async function processInlineImages(content, inputFile) {
    if (!content) {
        console.error('No content to process');
        return content;
    }

    try {
        // Match base64 images with optional captions
        const pattern = /<img([^>]+)src="(data:image\/[^;]+;base64,[^"]+)"([^>]*)>/g;
        let processedContent = content;
        let imageCount = 0;
        
        // Replace each base64 image
        processedContent = await processedContent.replace(pattern, async (match, before, base64Data, after) => {
            imageCount++;
            
            try {
                // Extract and save image
                const imageBuffer = Buffer.from(base64Data.split(',')[1], 'base64');
                const filename = getImageName(imageCount, inputFile);
                const relativePath = path.join('images', filename);
                const fullPath = path.join(imagesDir, filename);
                
                // Save image file
                await fs.writeFile(fullPath, imageBuffer);
                console.log(`Saved image: ${filename}`);
                
                // Return new img tag with file reference
                return `<img${before}src="./${relativePath}"${after}>`;
            } catch (imgError) {
                console.error(`Error processing image ${imageCount}:`, imgError);
                return match; // Keep original on error
            }
        });

        return processedContent;
    } catch (error) {
        console.error('Image processing error:', error);
        return content;
    }
}

async function processBase64Images(content, outputDir) {
    const imagesDir = path.join(outputDir, 'images');
    await fs.mkdir(imagesDir, { recursive: true });
    
    const imgPattern = /<img[^>]+src="(data:image\/[^"]+)"[^>]*>/g;
    let imageCount = 0;
    
    return content.replace(imgPattern, (match, base64Data) => {
        imageCount++;
        const filename = `image_${imageCount}.png`;
        const imagePath = path.join(imagesDir, filename);
        
        try {
            const [header, content] = base64Data.split(',');
            const imageBuffer = Buffer.from(content, 'base64');
            fs.writeFile(imagePath, imageBuffer);
            return match.replace(base64Data, `./images/${filename}`);
        } catch (error) {
            console.error(`Failed to save image ${filename}:`, error);
            return match;
        }
    });
}

async function convertDocument(inputFile) {
    try {
        currentInputFile = inputFile;
        const title = await getDocumentTitle(inputFile);
        const baseFilename = path.basename(inputFile);
        const outputFilename = sanitizeFilename(baseFilename);
        const outputFile = path.join(outputDir, outputFilename);
        const documentTitle = outputFilename.replace('.html', '');
        
        documentTitles.set(outputFilename, title);

        console.log(`Converting ${inputFile} to ${outputFile}...`);
        const result = await mammoth.convertToHtml({path: inputFile}, options);
        
        const filteredMessages = filterWarnings(result.messages);
        if (filteredMessages.length > 0) {
            console.log('Conversion messages:', filteredMessages);
        }

        // Process base64 images before generating final HTML
        const processedContent = await processBase64Images(result.value, outputDir);

        const category = determineCategory(outputFilename);
        const doc = new Document(outputFilename, title, category, CATEGORIES[category].order);
        documents.push(doc);
        
        // Store the processed content and file info for later pagination
        return {
            content: processedContent,
            outputFile,
            outputFilename,
            documentTitle,
            doc
        };
        
    } catch (error) {
        console.error('Conversion failed:', error);
        throw error;
    }
}

const CATEGORIES = {
    'General Information': {
        pattern: /foreword/i,
        order: 1
    },
    'General Notices': {
        pattern: /_gen/i,
        order: 2
    },
    'Airports and Facility': {
        pattern: /^((?!(_gen|_mil|_sp)).)*$/i,
        order: 3
    },
    'Special Operations': {
        pattern: /_mil/i,
        order: 4
    },
    'Major Sporting Events': {
        pattern: /_sp/i,
        order: 5
    },
    'Airshows': {
        pattern: /_as/i,
        order: 6
    }
};

function determineCategory(filename) {
    return Object.entries(CATEGORIES)
        .find(([_, config]) => config.pattern.test(filename))?.[0] 
        || 'Airports and Facility';
}

async function generateIndexHtml() {
    const categorizedDocs = new Map();
    
    // Initialize categories
    Object.keys(CATEGORIES).forEach(category => {
        categorizedDocs.set(category, []);
    });
    
    // Sort documents into categories
    for (const [filename, title] of documentTitles.entries()) {
        for (const [category, config] of Object.entries(CATEGORIES)) {
            if (config.pattern.test(filename)) {
                categorizedDocs.get(category).push({ filename, title });
                break;
            }
        }
    }
    
    // Generate HTML content
    const template = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document Index</title>
    <link rel="stylesheet" href="main.css">
</head>
<body>
    <h1>Document Index</h1>
    ${Array.from(categorizedDocs.entries())
        .sort((a, b) => CATEGORIES[a[0]].order - CATEGORIES[b[0]].order)
        .map(([category, docs]) => docs.length ? `
    <h2>${category}</h2>
    <ul>
        ${docs
            .sort((a, b) => a.filename.localeCompare(b.filename))
            .map(doc => `<li><a href="./${doc.filename}">${doc.title}</a></li>`)
            .join('\n        ')}
    </ul>` : '').join('\n')}
</body>
</html>`;

    await fs.writeFile(path.join(outputDir, 'index.html'), template, 'utf8');
}

async function main() {
    try {
        await ensureDirectories();
        await createDefaultCss();
        
        let filesToProcess = [];
        
        // Check if a single file was specified
        if (process.argv[5] && process.argv[5].endsWith('.docx')) {
            filesToProcess = [process.argv[5]];
        } else {
            // Get all .docx files from the source directory
            const files = await getWordFiles(sourceDir);
            filesToProcess = files.map(file => path.join(sourceDir, file));
        }
        
        if (filesToProcess.length === 0) {
            console.log('No Word documents found to process');
            return;
        }
        
        console.log(`Found ${filesToProcess.length} Word documents to process`);
        const conversionResults = [];
        
        // First pass: Convert all documents and collect results
        for (const file of filesToProcess) {
            try {
                const result = await convertDocument(file);
                if (result) {
                    conversionResults.push(result);
                }
            } catch (error) {
                console.error(`Failed to convert ${path.basename(file)}:`, error);
            }
        }
        
        if (conversionResults.length === 0) {
            console.error('No documents were successfully converted');
            return;
        }
        
        // Sort documents for proper pagination order
        documents.sort((a, b) => {
            if (a.categoryOrder !== b.categoryOrder) {
                return a.categoryOrder - b.categoryOrder;
            }
            return a.filename.localeCompare(b.filename);
        });
        
        // Second pass: Generate HTML with pagination
        for (const result of conversionResults) {
            const { prev, next } = getPaginationInfo(documents, result.outputFilename);
            const paginationHtml = generatePaginationHtml(prev, next);
            
            // Add pagination to HTML template
            const html5Content = generateHtml5Template(result.content, result.documentTitle, paginationHtml);
            await fs.writeFile(result.outputFile, html5Content, 'utf8');
            console.log(`Successfully converted to ${result.outputFilename}`);
        }
        
        // Generate index page
        await generateIndexHtml();
        console.log('Conversion complete!');
        
    } catch (error) {
        console.error('Conversion failed:', error);
        process.exit(1);
    }
}

main();