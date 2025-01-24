const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');
const debug = require('debug')('mammoth:image');
const { performance } = require('perf_hooks');
const { SUPPORTED_FORMATS, MAX_IMAGE_SIZE } = require('./constants');

class ImageProcessor {
    constructor(mammoth) {
        this.mammoth = mammoth;
    }

    async processImage(imageBuffer, options = {}) {
        const startTime = performance.now();
        debug('Starting image processing with options:', options);

        try {
            this.validateInput(imageBuffer, options);
            
            const { 
                outputDir = './output', 
                quality = 80, 
                width = 800, 
                height = 800,
                format = 'jpeg',
                filename
            } = options;

            const imagesDir = path.join(outputDir, 'images');
            await fs.mkdir(imagesDir, { recursive: true });

            if (!filename) {
                throw new Error('Filename is required for image processing');
            }

            const imagePath = path.join(imagesDir, filename);
            debug(`Processing image to path: ${imagePath}`);

            const metadata = await sharp(imageBuffer).metadata();
            debug('Image metadata:', metadata);

            const sharpInstance = sharp(imageBuffer)
                .resize(width, height, {
                    fit: 'inside',
                    withoutEnlargement: true
                });

            await this.convertAndSave(sharpInstance, format, quality, imagePath);

            const endTime = performance.now();
            debug(`Image processing completed in ${endTime - startTime}ms`);

            return imagePath;
        } catch (error) {
            debug('Error in image processing:', error);
            throw new Error(`Image processing failed: ${error.message}`);
        }
    }

    validateInput(buffer, options) {
        if (!Buffer.isBuffer(buffer)) {
            throw new Error('Input must be a buffer');
        }

        if (buffer.length > MAX_IMAGE_SIZE) {
            throw new Error(`Image size exceeds maximum limit of ${MAX_IMAGE_SIZE} bytes`);
        }

        if (options.format && !SUPPORTED_FORMATS.includes(options.format)) {
            throw new Error(`Unsupported format: ${options.format}. Supported formats: ${SUPPORTED_FORMATS.join(', ')}`);
        }
    }

    async convertAndSave(sharpInstance, format, quality, imagePath) {
        debug(`Converting to format: ${format} with quality: ${quality}`);
        
        switch(format.toLowerCase()) {
            case 'jpeg':
            case 'jpg':
                await sharpInstance.jpeg({ quality }).toFile(imagePath);
                break;
            case 'png':
                await sharpInstance.png({ quality }).toFile(imagePath);
                break;
            case 'webp':
                await sharpInstance.webp({ quality }).toFile(imagePath);
                break;
            case 'svg':
                // Handle SVG differently as it's vector-based
                await fs.writeFile(imagePath, buffer);
                break;
            default:
                throw new Error(`Unsupported format: ${format}`);
        }

        // Verify the converted file
        await this.verifyConvertedFile(imagePath);
    }

    async verifyConvertedFile(imagePath) {
        const stats = await fs.stat(imagePath);
        debug(`Converted file size: ${stats.size} bytes`);

        if (stats.size === 0) {
            throw new Error('Converted file is empty');
        }

        // Verify image can be loaded
        await sharp(imagePath).metadata();
    }
}

module.exports = function(mammoth) {
    return new ImageProcessor(mammoth);
};