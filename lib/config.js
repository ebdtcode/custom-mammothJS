const path = require("path");

const config = {
  app: {
    title: "MammothJS Documentation",
    version: "1.0.0"
  },

  sourceDir: process.argv[2] || "./sources",
  outputDir: process.argv[3] || "./output",
  imagePattern: process.argv[4] || "source_filename",

  get imagesDir() {
    return path.join(this.outputDir, "images");
  },

  categories: {
    "General Information": {
      pattern: /foreword|introduction/i,
      order: 1,
    },
    "Technical Documentation": {
      pattern: /technical|spec/i,
      order: 2,
    },
    "User Guides": {
      pattern: /guide|manual/i,
      order: 3,
    },
    Other: {
      pattern: /.*/,
      order: 4,
    },
  },

  styles: {
    colors: {
      primary: "#2563eb",
      secondary: "#475569",
      background: "#ffffff",
      text: "#1f2937",
      border: "#e5e7eb",
      hover: "#f8fafc",
    },
    spacing: "1rem",
    radius: "8px",
    mammothStyleMap: [
      "p[style-name='Normal'] => p:fresh",
      "p[style-name='Title'] => h1.title:fresh",
      "p[style-name='Heading 1'] => h1:fresh",
      "p[style-name='Heading 2'] => h2:fresh",
      "p[style-name='Heading 3'] => h3:fresh",
      "p[style-name='Heading 4'] => h4:fresh",
      "p[style-name='Heading 5'] => h5:fresh",
      "p[style-name='Heading 6'] => h6:fresh",
      "p[style-name='Subtitle'] => h2.subtitle:fresh",
      "p[style-name='Quote'] => blockquote:fresh",
      "p[style-name='Intense Quote'] => blockquote.intense:fresh",
      "p[style-name='List Paragraph'] => p.list:fresh",
      "p[style-name='TOC 1'] => p.toc1:fresh",
      "p[style-name='TOC 2'] => p.toc2:fresh",
      "p[style-name='TOC 3'] => p.toc3:fresh",
      "r[style-name='Strong'] => strong",
      "r[style-name='Emphasis'] => em",
      "r[style-name='Subtle Emphasis'] => em.subtle",
      "r[style-name='Intense Emphasis'] => em.intense",
      "r[style-name='Book Title'] => cite",
      "r[style-name='Hyperlink'] => a",
      "p[style-name='Caption'] => figcaption:fresh",
      "p[style-name='Footnote Text'] => p.footnote:fresh",
      "p[style-name='Endnote Text'] => p.endnote:fresh",
      "p[style-name='Bibliography'] => p.bibliography:fresh",
      "p[style-name='Table Grid'] => table",
      "p[style-name='Decimal Aligned'] => p.decimal:fresh"
    ]
  },
};

module.exports = config;
