# Mammoth Extensions

Extension library for Mammoth.js to enhance DOCX to HTML conversion with advanced features and modern styling.

## Features

- Convert DOCX files to semantic HTML5
- Process images with optimized output
- Generate modern, responsive styling
- Support figure/figcaption elements
- Handle document tables
- Dark mode support
- Configurable image naming patterns

## Installation

```bash
npm install mammoth-extensions
```

## Usage

```javascript
const mammoth = require("mammoth");
const createExtensions = require("mammoth-extensions");

const extensions = createExtensions(mammoth);
const options = {
  outputDir: "./output",
  imagePattern: "source_filename",
};

// Convert a document
convertDocument("./document.docx", options);
```

## Output Structure

```
output/
├── images/
│   └── document_0001.jpeg
├── main.css
└── document.html
```

## Configuration

### Image Patterns

- source_filename: Uses source document name (default)
- sequential: Uses sequential numbering

```bash
node convert.js ./output ./document.docx source_filename
```

Styling
The generated HTML includes modern, responsive styling with:

Semantic HTML5 elements
Responsive images
Modern table design
Dark mode support
Mobile-friendly layout

# Install dependencies

npm install

# Run tests

npm test

# Build documentation

npm run docs

Contributing
Fork the repository
Create your feature branch
Commit your changes
Push to the branch
Create a Pull Request
License
MIT License - see LICENSE for details

```

```
