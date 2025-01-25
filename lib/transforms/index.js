const path = require("path");
const fs = require('fs').promises;

module.exports = function (mammoth) {
  return {
    createPipeline: function (options) {
      // Return a single transform function that chains the transforms
      return (element) => {
        return Promise.resolve(element)
          .then((element) => this.customBoxTransform(options)(element))
          .then((element) => this.imageTransform(options)(element));
      };
    },

    customBoxTransform: function (options) {
      return async (element) => {
        if (element.type === "custom-box") {
          return {
            ...element,
            className: options.boxClass || "custom-box",
          };
        }
        return element;
      };
    },

    imageTransform: function (options) {
      return async (element) => {
        if (element.type === "image") {
          const processed = await this.processImage(element.buffer, options);
          return { ...element, buffer: processed };
        }
        return element;
      };
    },

    saveBase64Image: async function(base64Data, outputDir) {
      if (!base64Data) {
        throw new Error('No image data provided');
      }

      const matches = base64Data.match(/^data:image\/([A-Za-z]+);base64,(.+)$/);
      if (!matches) {
        throw new Error('Invalid image data format');
      }

      const [, extension, data] = matches;
      const filename = `image-${Date.now()}.${extension}`;
      const filepath = path.join(outputDir, filename);
      
      await fs.writeFile(filepath, Buffer.from(data, 'base64'));
      return `./${filename}`;
    },

    createImageTransformer: function (options = {}) {
      return {
        transformElement: async function (element) {
          // Skip non-paragraph elements
          if (element.type !== "paragraph") return element;

          // Find image in paragraph
          const image = element.children?.find(
            (child) => child.type === "image" && child.value?.src
          );
          if (!image) return element;

          // Check next element for caption
          const nextElement = element.next;
          const isCaption =
            nextElement &&
            nextElement.type === "paragraph" &&
            nextElement.styleId === "Caption";

          if (!isCaption) return element;

          // Process image if it's base64
          if (image.value.src.startsWith("data:")) {
            const base64Data = image.value.src.split(",")[1];
            const imageBuffer = Buffer.from(base64Data, "base64");
            image.value.src = await mammoth.images.processImage(
              imageBuffer,
              options
            );
          }

          // Create figure structure
          return {
            type: "figure",
            children: [
              {
                type: "image",
                value: image.value,
              },
              {
                type: "figcaption",
                children: nextElement.children,
              },
            ],
            next: nextElement.next, // Skip caption in next iteration
          };
        },
      };
    },
  };
};
