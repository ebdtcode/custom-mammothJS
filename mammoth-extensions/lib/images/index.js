const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');

module.exports = function(mammoth) {
    return {
        processImage: async function(imageBuffer, options = {}) {
            const { 
                outputDir = './output', 
                quality = 80, 
                width = 800, 
                height = 800,
                format = 'jpeg'
            } = options;

            const imagesDir = path.join(outputDir, 'images');
            await fs.mkdir(imagesDir, { recursive: true });

            // Detect image type
            const metadata = await sharp(imageBuffer).metadata();
            const outputFormat = format || metadata.format;
            const hash = crypto.createHash('md5').update(imageBuffer).digest('hex');
            const filename = `${hash}.${outputFormat}`;
            const imagePath = path.join(imagesDir, filename);

            // Process image based on format
            const sharpInstance = sharp(imageBuffer)
                .resize(width, height, {
                    fit: 'inside',
                    withoutEnlargement: true
                });

            switch(outputFormat) {
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
                default:
                    await sharpInstance.jpeg({ quality }).toFile(imagePath);
            }

            // Return web-friendly path
            return `images/${filename}`;
        },

        extractBase64Image: async function(match) {
            const [fullMatch, contentType, base64Data] = match;
            return {
                buffer: Buffer.from(base64Data, 'base64'),
                type: contentType,
                original: fullMatch
            };
        },

        createImageTransformer: function(options = {}) {
            return {
                transformElement: async (element) => {
                    if (element.type !== 'image') return element;
                    const imagePath = await this.processImage(element.value.buffer, options);
                    return { ...element, value: { ...element.value, src: imagePath } };
                }
            };
        },

        createTransformer: function(options = {}) {
            return {
                transformImage: async (element) => {
                    if (element.type !== 'image') return element;
                    
                    const imagePath = await this.processImage(element.value.buffer, options);
                    return {
                        ...element,
                        value: {
                            ...element.value,
                            src: imagePath
                        }
                    };
                }
            };
        }
    };
};