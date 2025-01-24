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
        }
    };
};