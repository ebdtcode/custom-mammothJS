const { describe, it, beforeEach } = require("mocha");
const { expect } = require("chai");
const path = require("path");
const ImageProcessor = require("../lib/processors/image-processor");

describe("ImageProcessor", () => {
  let processor;

  beforeEach(() => {
    processor = new ImageProcessor("./output/images", "source_filename");
  });

  describe("_generateImageName", () => {
    it("should generate correct filename with source_filename pattern", () => {
      const name = processor._generateImageName("test-doc.docx");
      expect(name).to.match(/^test-doc_0001\.jpeg$/);
    });

    it("should generate sequential filenames", () => {
      processor = new ImageProcessor("./output/images", "sequential");
      const name = processor._generateImageName("test-doc.docx");
      expect(name).to.match(/^image_0001\.jpeg$/);
    });

    it("should increment counter for multiple images", () => {
      const name1 = processor._generateImageName("test-doc.docx");
      const name2 = processor._generateImageName("test-doc.docx");
      expect(name1).to.not.equal(name2);
      expect(name1).to.match(/0001/);
      expect(name2).to.match(/0002/);
    });
  });
});
