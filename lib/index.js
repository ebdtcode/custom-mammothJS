const transforms = require('./transforms');

function createExtensions(mammoth) {
    return {
        transforms, // Include transforms in extensions
        elements: {
            createCustomReader: function() {
                // Implement any custom elements if needed
                return {};
            }
        },
        styles: {
            customStyleMap: [
                // Add your custom style mappings here
                // e.g., "p[style-name='Heading 1'] => h1:fresh"
            ]
        }
        // Include other extension points as needed
    };
}

module.exports = createExtensions;