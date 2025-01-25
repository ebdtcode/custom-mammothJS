const elements = require("./lib/elements");
const styles = require("./lib/styles");
const images = require("./lib/images");
const transforms = require("./lib/transforms");
const contentTypes = require("./lib/content-types");

module.exports = function createExtensions(mammoth) {
  return {
    elements: elements(mammoth),
    styles: styles(mammoth),
    images: images(mammoth),
    transforms: transforms(mammoth),
    contentTypes: contentTypes(mammoth),
  };
};
