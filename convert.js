const mammoth = require('mammoth');
const createExtensions = require('.');
const fs = require('fs').promises;
const path = require('path');
const { filterWarnings } = require('./utils/warning-handler');
const { sanitizeFilename } = require('./utils/filename-handler');

const extensions = createExtensions(mammoth);
const sourceDir = process.argv[2] || './sources';
const outputDir = process.argv[3] || './output';
const imagesDir = path.join(outputDir, 'images');
const imagePattern = process.argv[4] || 'source_filename';
let currentInputFile = '';

async function getWordFiles(directory) {
    const files = await fs.readdir(directory);
    return files.filter(file => file.endsWith('.docx'));
}

async function processDirectory(srcDir) {
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
    await fs.mkdir(sourceDir, { recursive: true });
    await fs.mkdir(outputDir, { recursive: true });
    await fs.mkdir(imagesDir, { recursive: true });
}

async function ensureDirectoryExists(dir) {
    try {
        await fs.access(dir);
    } catch {
        await fs.mkdir(dir, { recursive: true });
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
}`;
    await fs.writeFile(path.join(outputDir, 'main.css'), cssContent);
}

function generateHtml5Template(content, title) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>${title}</title>
    <link rel="stylesheet" href="./main.css">
</head>
<body>
    <main>
        ${content}
    </main>
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
        const baseFilename = path.basename(inputFile);
        const outputFilename = sanitizeFilename(baseFilename);
        const outputFile = path.join(outputDir, outputFilename);
        const documentTitle = outputFilename.replace('.html', '');
        
        console.log(`Converting ${inputFile} to ${outputFile}...`);
        const result = await mammoth.convertToHtml({path: inputFile}, options);
        
        const filteredMessages = filterWarnings(result.messages);
        if (filteredMessages.length > 0) {
            console.log('Conversion messages:', filteredMessages);
        }

        // Process base64 images before generating final HTML
        const processedContent = await processBase64Images(result.value, outputDir);

        const html5Content = generateHtml5Template(processedContent, documentTitle);
        await fs.writeFile(outputFile, html5Content, 'utf8');
        console.log(`Successfully converted to ${outputFilename}`);
        
    } catch (error) {
        console.error('Conversion failed:', error);
        throw error;
    }
}

async function main() {
    try {
        await ensureDirectories();
        
        // Check if a single file was specified
        if (process.argv[5] && process.argv[5].endsWith('.docx')) {
            await convertDocument(process.argv[5]);
        } else {
            await processDirectory(sourceDir);
        }
    } catch (error) {
        console.error('Process failed:', error);
        process.exit(1);
    }
}

main();