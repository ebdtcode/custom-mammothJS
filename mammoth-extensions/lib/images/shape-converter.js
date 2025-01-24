const { parseString } = require('xml2js');
const util = require('util');
const parseXml = util.promisify(parseString);

// Strip any namespace prefix (e.g., "v:shape" -> "shape")
function stripPrefix(name) {
  return name.replace(/^[a-zA-Z0-9]+:/, '');
}

const FORMATS = {
  VML: 'VML',
  DRAWINGML: 'DrawingML',
  UNKNOWN: 'UNKNOWN'
};

function detectFormat(content) {
  if (typeof content !== 'string') return FORMATS.UNKNOWN;
  const trimmed = content.trim();
  if (trimmed.includes('xmlns:v="urn:schemas-microsoft-com:vml"')) {
    return FORMATS.VML;
  }
  if (trimmed.includes('xmlns:a="http://schemas.openxmlformats.org/drawingml/')) {
    return FORMATS.DRAWINGML;
  }
  return FORMATS.UNKNOWN;
}

async function convertToSvg(buffer, options = {}) {
  const { width = 100, height = 100 } = options;

  if (!Buffer.isBuffer(buffer)) {
    throw new Error('Input must be a buffer');
  }

  // 1) Try parsing. If malformed => “Shape conversion error”
  let parsedXml;
  let content;
  try {
    content = buffer.toString().trim();
    parsedXml = await parseXml(content, {
      explicitArray: true,
      trim: true,
      tagNameProcessors: [stripPrefix],
    });
  } catch (err) {
    throw new Error(`Shape conversion error: ${err.message}`);
  }

  // 2) Detect format
  const format = detectFormat(content);

  // If unknown => return fallback shape
  if (format === FORMATS.UNKNOWN) {
    return createFallbackShape(width, height);
  }

  // 3) Convert recognized format
  try {
    const svgContent = convertByFormat(parsedXml, format);
    return Buffer.from(wrapInSvg(svgContent, width, height));
  } catch (error) {
    throw new Error(`Shape conversion error: ${error.message}`);
  }
}

function convertByFormat(parsed, format) {
  switch (format) {
    case FORMATS.VML:
      return convertVmlToSvg(parsed);
    case FORMATS.DRAWINGML:
      return convertDrawingMlToSvg(parsed);
    default:
      throw new Error('Unsupported shape format');
  }
}

function convertVmlToSvg(parsed) {
  const shapes = parsed.shape;
  if (!shapes || !shapes.length) {
    throw new Error('Invalid VML structure');
  }
  const attrs = shapes[0].$ || {};
  const fillColor = attrs.fillcolor || '#000000';
  const strokeColor = attrs.strokecolor || 'none';
  const strokeWidth = attrs.strokeweight || '1';
  const pathD = attrs.path || '';

  return `<path
      d="${pathD}"
      fill="${fillColor}"
      stroke="${strokeColor}"
      stroke-width="${strokeWidth}"
  />`;
}

function convertDrawingMlToSvg(parsed) {
  const graphic = parsed.graphic?.[0];
  const graphicData = graphic?.graphicData?.[0];
  const shape = graphicData?.shape?.[0];
  if (!shape) {
    throw new Error('No shape found in DrawingML');
  }

  const spPr = shape.spPr?.[0];
  const prstGeom = spPr?.prstGeom?.[0];
  const shapeType = prstGeom?.$.prst || 'rect';
  return convertPresetShape(shapeType);
}

function convertPresetShape(preset) {
  if (preset === 'rect') {
    return '<rect x="0" y="0" width="100%" height="100%" fill="red" />';
  }
  return '<rect x="0" y="0" width="100%" height="100%" fill="red" />';
}

function wrapInSvg(content, width, height) {
  return `
<svg xmlns="http://www.w3.org/2000/svg"
     width="${width}" height="${height}"
     viewBox="0 0 ${width} ${height}">
  ${content}
</svg>`.trim();
}

// fallback shape => gray rectangle
function createFallbackShape(width, height) {
  return Buffer.from(
    wrapInSvg(
      `<rect x="0" y="0" width="${width}" height="${height}" fill="#cccccc" stroke="#999999" stroke-width="2"/>`,
      width,
      height
    )
  );
}

module.exports = {
  convertToSvg,
  detectFormat,
  FORMATS
};