const transforms = require("./transforms");
const htmlSimplifier = require("./processors/html-simplifier");

function createExtensions(mammoth) {
  return {
    transforms: transforms(mammoth),
    elements: {
      createCustomReader: function () {
        return {};
      },
    },
    styles: {
      customStyleMap: [],
    },
    processors: {
      htmlSimplifier: htmlSimplifier(mammoth)
    }
  };
}

module.exports = createExtensions;
