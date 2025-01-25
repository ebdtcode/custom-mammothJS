const sharp = require("sharp");
const path = require("path");
const fs = require("fs").promises;
const crypto = require("crypto");

module.exports = function (mammoth) {
  return {
    processImage: async function (imageBuffer, options = {}) {
      const {
        outputDir = "./output",
        quality = 80,
        width = 800,
        height = 800,
        format = "jpeg",
        filename,
      } = options;

      const imagesDir = path.join(outputDir, "images");
      await fs.mkdir(imagesDir, { recursive: true });

      if (!filename) {
        throw new Error("Filename is required for image processing");
      }

      const imagePath = path.join(imagesDir, filename);

      // Process image based on format
      const sharpInstance = sharp(imageBuffer).resize(width, height, {
        fit: "inside",
        withoutEnlargement: true,
      });

      switch (format) {
        case "jpeg":
        case "jpg":
          await sharpInstance.jpeg({ quality }).toFile(imagePath);
          break;
        case "png":
          await sharpInstance.png({ quality }).toFile(imagePath);
          break;
        case "webp":
          await sharpInstance.webp({ quality }).toFile(imagePath);
          break;
        default:
          await sharpInstance.jpeg({ quality }).toFile(imagePath);
      }

      // Return web-friendly path
      return `images/${filename}`;
    },

    extractBase64Image: async function (match) {
      const [fullMatch, contentType, base64Data] = match;
      return {
        buffer: Buffer.from(base64Data, "base64"),
        type: contentType,
        original: fullMatch,
      };
    },
  };
};
