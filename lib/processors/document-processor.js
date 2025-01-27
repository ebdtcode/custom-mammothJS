const fs = require('fs').promises;
const path = require('path');
const mammoth = require('mammoth');
const Logger = require('../logger');
const ImageProcessor = require('./image-processor');
const StyleGenerator = require('../ui/styles');

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
        const styleGenerator = new StyleGenerator();
        
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${title}</title>
            <style>
                ${styleGenerator.generate()}
            </style>
        </head>
        <body>
            <nav class="navbar">
                <div class="container">
                    <a href="../index.html">Home</a>
                </div>
            </nav>
            <main class="container">
                <article class="document-content">
                    <h1>${title}</h1>
                    ${content}
                </article>
            </main>
        </body>
        </html>`;
    }
}

module.exports = DocumentProcessor;