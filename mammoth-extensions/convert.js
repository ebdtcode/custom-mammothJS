const mammoth = require('mammoth');
const createExtensions = require('.');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const sourceDir = process.argv[2] || './sources';
const outputDir = process.argv[3] || './output';
const imagePattern = process.argv[4] || 'source_filename';
const imagesDir = path.join(outputDir, 'images');
let currentInputFile = '';

const extensions = createExtensions(mammoth);

function getImagePattern(pattern, inputFile, index) {
    const basename = path.basename(inputFile, '.docx');
    const relativePath = './images/';
    
    switch(pattern) {
        case 'source_filename':
            return `${relativePath}${basename}_${String(index).padStart(4, '0')}.jpeg`;
        case 'sequential':
            return `${relativePath}image_${String(index).padStart(4, '0')}.jpeg`;
        default:
            return `${relativePath}${basename}_${String(index).padStart(4, '0')}.jpeg`;
    }
}

function getImageName(index, inputFile) {
    return getImagePattern(imagePattern, inputFile, index);
}

async function ensureDirectories() {
    console.log('Creating directories...');
    await fs.mkdir(outputDir, { recursive: true });
    await fs.mkdir(imagesDir, { recursive: true });
}

const options = {
    customElements: extensions.elements.createCustomReader(),
    styleMap: extensions.styles.customStyleMap.concat([
        "p[style-name='Normal'] => p",
        "p[style-name='Caption'] => figcaption",  // Changed from p.caption
        "r[style-name='Emphasis'] => em"
    ]),
    transformers: extensions.transforms.createPipeline({
        outputDir,
        imagesDir,
        boxClass: "custom-box",
        imageQuality: 80
    }),
    contentTypes: extensions.contentTypes.customTypes
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
}`;
    await fs.writeFile(path.join(outputDir, 'main.css'), cssContent);
}

async function createHtml5Document(content, title = 'Converted Document') {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link rel="stylesheet" href="main.css">
</head>
<body>
    ${content}
</body>
</html>`;
}

async function processInlineImages(content, inputPath) {
    try {
        let modifiedContent = content;
        const imagePattern = /<p[^>]*>\s*<img[^>]+src="(data:image\/([^;]+);base64,([^"]+))"[^>]*>\s*<\/p>\s*(?:<p[^>]*>(.*?)<\/p>)?/g;
        let imageIndex = 1;
        const promises = [];

        modifiedContent = modifiedContent.replace(imagePattern, (match, base64Src, imageType, imageData, caption) => {
            try {
                const imageFileName = getImageName(imageIndex++, inputPath);
                const imagePath = path.join(imagesDir, path.basename(imageFileName));
                
                promises.push(
                    fs.writeFile(imagePath, Buffer.from(imageData, 'base64'))
                );

                if (caption && caption.trim()) {
                    return `
<figure>
    <img src="${imageFileName}" alt="${caption.trim()}">
    <figcaption>${caption.trim()}</figcaption>
</figure>`;
                }
                
                return `<p><img src="${imageFileName}"></p>`;
            } catch (err) {
                console.error('Failed to process image:', err);
                return match;
            }
        });

        await Promise.all(promises);
        return modifiedContent;
    } catch (error) {
        console.error('Image processing error:', error);
        return content;
    }
}

async function convertDocument(inputPath) {
    currentInputFile = inputPath;
    console.log(`Starting conversion of ${inputPath}`);
    
    try {
        await fs.access(inputPath);
        await ensureDirectories();
        await createDefaultCss();

        console.log('Converting document...');
        const result = await mammoth.convertToHtml({path: inputPath}, options);
        
        console.log('Processing content...');
        const processedContent = await processInlineImages(result.value, inputPath);
        const html = await createHtml5Document(processedContent);
        
        const outputPath = path.join(outputDir, `${path.basename(inputPath, '.docx')}.html`);
        await fs.writeFile(outputPath, html, 'utf8');
        
        console.log(`Successfully converted ${inputPath} to ${outputPath}`);
    } catch (error) {
        console.error('Conversion failed:', error);
        process.exit(1);
    }
}

async function processDirectory(sourcePath) {
    try {
        // Validate source directory
        await fs.access(sourcePath);
        const files = await fs.readdir(sourcePath);
        
        // Filter DOCX files
        const docxFiles = files.filter(file => 
            path.extname(file).toLowerCase() === '.docx'
        );
        
        if (docxFiles.length === 0) {
            console.log('No .docx files found in source directory');
            return;
        }

        // Process each file
        for (const file of docxFiles) {
            const inputPath = path.join(sourcePath, file);
            console.log(`\nProcessing ${file}`);
            
            try {
                await convertDocument(inputPath);
                console.log(`Completed processing ${file}`);
            } catch (error) {
                console.error(`Failed to process ${file}:`, error);
            }
        }
    } catch (error) {
        console.error('Directory processing failed:', error);
        process.exit(1);
    }
}

// Main execution
if (require.main === module) {
    (async () => {
        try {
            await processDirectory(sourceDir);
        } catch (error) {
            console.error('Conversion process failed:', error);
            process.exit(1);
        }
    })();
}

module.exports = {
    convertDocument,
    processDirectory
};