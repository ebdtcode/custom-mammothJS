const mammoth = require('mammoth');
const createExtensions = require('.');
const fs = require('fs').promises;
const path = require('path');

const extensions = createExtensions(mammoth);
const outputDir = process.argv[2] || './output';
const imagesDir = path.join(outputDir, 'images');
const imagePattern = process.argv[4] || 'source_filename'; // New pattern option
let currentInputFile = '';

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
body {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    font-family: system-ui, -apple-system, sans-serif;
}
img {
    max-width: 100%;
    height: auto;
}
figure {
    margin: 1.5em 0;
    text-align: center;
}
figcaption {
    font-style: italic;
    color: #666;
    margin-top: 0.5em;
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

async function processInlineImages(content, inputFile) {
    if (!content) {
        console.error('No content to process');
        return content;
    }

    try {
        const pattern = /<p><img([^>]+)src="([^"]+)"([^>]*)><\/p>\s*(?:<p class="caption">([^<]+)<\/p>)?/g;
        let processedContent = content;
        let imageCount = 0;
        let match;

        while ((match = pattern.exec(content)) !== null) {
            imageCount++;
            const [fullMatch, beforeSrc, base64Data, afterSrc, caption] = match;
            
            try {
                const imageBuffer = Buffer.from(base64Data.split(',')[1], 'base64');
                const filename = getImageName(imageCount, inputFile);
                console.log(`Processing image: ${filename}`);
                
                const imagePath = await extensions.images.processImage(imageBuffer, {
                    outputDir,
                    quality: 80,
                    filename
                });

                const imgTag = `<img${beforeSrc}src="${imagePath}"${afterSrc}>`;
                const replacement = caption
                    ? `<figure>\n    ${imgTag}\n    <figcaption>${caption}</figcaption>\n</figure>`
                    : `<p>${imgTag}</p>`;

                processedContent = processedContent.replace(fullMatch, replacement);
                console.log(`Processed image: ${filename}`);
            } catch (imgError) {
                console.error(`Error processing image ${imageCount}:`, imgError);
                continue;
            }
        }

        return processedContent;
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

const inputFile = process.argv[3];
if (!inputFile) {
    console.error('Please provide an input file path');
    process.exit(1);
}

console.log(`Using image pattern: ${imagePattern}`);
convertDocument(inputFile);