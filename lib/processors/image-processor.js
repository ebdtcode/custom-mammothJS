const fs = require('fs').promises;
const path = require('path');
const Logger = require('../logger');

/**
 * Handles image processing operations for document conversion.
 * Provides functionality for processing base64 images, optimizing them,
 * and managing image naming conventions.
 * 
 * @class ImageProcessor
 */
class ImageProcessor {
  /**
   * Creates an instance of ImageProcessor.
   * @param {object} options - Options for the ImageProcessor
   * @param {string} options.outputDir - Directory where processed images will be saved
   */
  constructor(options = {}) {
    this.outputDir = options.outputDir || 'output';
    this.imageCount = 0;
  }

  /**
   * Resets the internal image counter to 0.
   * Useful when starting a new document conversion.
   */
  reset() {
    this.imageCount = 0;
  }

  /**
   * Processes a base64 encoded image and saves it to the output directory.
   * 
   * @param {object} imageData - Image data from mammoth
   * @returns {Promise<object|null>} Object containing the path to the processed image and its content type, or null if processing failed
   */
  async processBase64Image(imageData) {
    try {
      const imageDir = path.join(this.outputDir, 'images');
      await fs.mkdir(imageDir, { recursive: true });

      // Handle missing or invalid image data
      if (!imageData.buffer) {
        Logger.warn('No image data received');
        return null;
      }

      this.imageCount++;
      const extension = imageData.contentType ? 
        imageData.contentType.split('/').pop().split(';')[0] || 'png' : 
        'png';
      
      const imageName = `image-${this.imageCount}.${extension}`;
      const imagePath = path.join(imageDir, imageName);
      
      await fs.writeFile(imagePath, imageData.buffer);
      Logger.info(`Saved image: ${imagePath}`);
      
      return {
        src: imagePath,
        contentType: imageData.contentType || 'image/png'
      };
      
    } catch (error) {
      Logger.error('Failed to process image:', error.message);
      return null;
    }
  }
}

module.exports = ImageProcessor;
