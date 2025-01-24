const path = require('path');

module.exports = function(mammoth) {
    return {
        createPipeline: function(options) {
            return [
                this.customBoxTransform(options),
                this.imageTransform(options)
            ];
        },

        customBoxTransform: function(options) {
            return element => {
                if (element.type === "custom-box") {
                    return {
                        ...element,
                        className: options.boxClass || "custom-box"
                    };
                }
                return element;
            };
        },

        imageTransform: function(options) {
            return async element => {
                if (element.type === "image") {
                    const processed = await this.processImage(element.buffer, options);
                    return { ...element, buffer: processed };
                }
                return element;
            };
        },

        createImageTransformer: function(options = {}) {
            return {
                transformElement: async function(element) {
                    // Skip non-paragraph elements
                    if (element.type !== 'paragraph') return element;

                    // Find image in paragraph
                    const image = element.children?.find(child => 
                        child.type === 'image' && child.value?.src);
                    if (!image) return element;

                    // Check next element for caption
                    const nextElement = element.next;
                    const isCaption = nextElement && 
                        nextElement.type === 'paragraph' && 
                        nextElement.styleId === 'Caption';

                    if (!isCaption) return element;

                    // Process image if it's base64
                    if (image.value.src.startsWith('data:')) {
                        const base64Data = image.value.src.split(',')[1];
                        const imageBuffer = Buffer.from(base64Data, 'base64');
                        image.value.src = await mammoth.images.processImage(
                            imageBuffer, 
                            options
                        );
                    }

                    // Create figure structure
                    return {
                        type: 'figure',
                        children: [
                            {
                                type: 'image',
                                value: image.value
                            },
                            {
                                type: 'figcaption',
                                children: nextElement.children
                            }
                        ],
                        next: nextElement.next // Skip caption in next iteration
                    };
                }
            };
        }
    };
};