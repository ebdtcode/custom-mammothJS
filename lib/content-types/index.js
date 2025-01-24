module.exports = function(mammoth) {
    return {
        customTypes: {
            "application/vnd.custom-type": {
                read: function(element) {
                    return {
                        type: "custom",
                        content: element.value
                    };
                }
            }
        }
    };
};