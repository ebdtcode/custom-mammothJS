module.exports = function (mammoth) {
  return {
    CustomBox: function CustomBox(children) {
      this.type = "custom-box";
      this.children = children;
    },

    createCustomReader: function (options) {
      return {
        "w:customBox": function (element) {
          return options
            .readXmlElements(element.children)
            .map((children) => new this.CustomBox(children));
        },
      };
    },
  };
};
