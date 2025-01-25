#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const Logger = require('./lib/logger');
const DocumentProcessor = require('./lib/processors/document-processor');
const Navbar = require('./lib/ui/navbar');

async function main() {
    try {
        const inputDir = process.argv[2] || './sources';
        const outputDir = process.argv[3] || './output';
        
        await fs.mkdir(outputDir, { recursive: true });
        await fs.mkdir(path.join(outputDir, 'images'), { recursive: true });
        
        const files = await fs.readdir(inputDir);
        const docxFiles = files.filter(file => /\.docx$/i.test(file));
        
        if (!docxFiles.length) {
            throw new Error('No .docx files found');
        }

        Logger.info(`Found ${docxFiles.length} documents to convert`);
        
        const processor = new DocumentProcessor({ outputDir });
        const navbar = new Navbar();
        
        for (let i = 0; i < docxFiles.length; i++) {
            const file = docxFiles[i];
            const inputPath = path.join(inputDir, file);
            const outputPath = path.join(outputDir, `${path.basename(file, '.docx')}.html`);
            
            try {
                const progress = Math.round(((i + 1) / docxFiles.length) * 100);
                Logger.info(`[${progress}%] Converting ${file}`);
                
                const content = await processor.process(inputPath);
                await fs.writeFile(outputPath, content);
                Logger.success(`Converted ${file}`);
            } catch (error) {
                Logger.error(`Failed to convert ${file}:`, error.message);
            }
        }
        
        Logger.success('Conversion completed');
    } catch (error) {
        Logger.error('Process failed:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { main };
