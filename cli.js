const fs = require('fs').promises;
const path = require('path');
const Logger = require('./lib/logger');
const DocumentProcessor = require('./lib/processors/document-processor');
const IndexGenerator = require('./lib/generators/index-generator');
const copyAssets = require('./lib/utils/copy-assets');

async function main() {
    try {
        Logger.info('Starting document conversion process...');
        const inputDir = process.argv[2] || './sources';
        const outputDir = process.argv[3] || './output';
        
        Logger.info(`Input directory: ${inputDir}`);
        Logger.info(`Output directory: ${outputDir}`);

        await fs.mkdir(outputDir, { recursive: true });
        await fs.mkdir(path.join(outputDir, 'images'), { recursive: true });
        
        const files = await fs.readdir(inputDir);
        Logger.info(`Found ${files.length} files in input directory`);
        
        const docxFiles = files.filter(file => /\.docx$/i.test(file));
        Logger.info(`Found ${docxFiles.length} DOCX files to process`);
        
        if (!docxFiles.length) {
            throw new Error('No .docx files found in input directory');
        }

        const processor = new DocumentProcessor({ outputDir });
        const generatedFiles = [];
        
        for (const file of docxFiles) {
            try {
                const inputPath = path.join(inputDir, file);
                const outputPath = path.join(outputDir, `${path.basename(file, '.docx')}.html`);
                
                Logger.info(`Processing: ${inputPath}`);
                Logger.info(`Output to: ${outputPath}`);
                
                const content = await processor.process(inputPath);
                await fs.writeFile(outputPath, content);
                generatedFiles.push(path.basename(outputPath));
                Logger.success(`Converted ${file}`);
            } catch (error) {
                Logger.error(`Failed to convert ${file}: ${error.stack}`);
                continue;
            }
        }

        Logger.info(`Successfully generated ${generatedFiles.length} HTML files`);

        if (generatedFiles.length === 0) {
            throw new Error('No files were successfully converted');
        }

        try {
            Logger.info('Copying documentation assets...');
            await copyAssets(outputDir);
            Logger.success('Assets copied successfully');
        } catch (error) {
            Logger.error(`Failed to copy assets: ${error.stack}`);
            throw error;
        }

        try {
            Logger.info('Generating index...');
            const indexGenerator = new IndexGenerator({ outputDir });
            const indexContent = await indexGenerator.generateIndex(generatedFiles);
            
            Logger.info(`Writing index to: ${path.join(outputDir, 'index.html')}`);
            await fs.writeFile(path.join(outputDir, 'index.html'), indexContent);
            
            Logger.success('Generated index.html with documentation styling');
        } catch (error) {
            Logger.error(`Failed to generate index: ${error.stack}`);
            throw error;
        }

        return true;
    } catch (error) {
        Logger.error(`Process failed: ${error.message}`);
        return false;
    }
}

if (require.main === module) {
    main().then(success => {
        if (!success) {
            process.exit(1);
        }
    }).catch(error => {
        Logger.error(`Unhandled error: ${error.stack}`);
        process.exit(1);
    });
}

module.exports = { main };
