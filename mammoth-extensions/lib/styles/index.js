module.exports = function(mammoth) {
    return {
        customStyleMap: [
            "p[style-name='CustomBox'] => div.custom-box",
            "p[style-name='CustomHighlight'] => span.highlight",
            "p[style-name='Caption'] => p.caption"
        ],
        
        createStyleReader: function() {
            return {
                "CustomBox": {
                    type: "paragraph",
                    tagName: "div",
                    className: "custom-box"
                },
                "CustomHighlight": {
                    type: "run",
                    tagName: "span",
                    className: "highlight"
                },
                "Caption": {
                    type: "paragraph",
                    tagName: "p",
                    className: "caption"
                }
            };
        }
    };
};