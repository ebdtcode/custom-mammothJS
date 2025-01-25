function sanitizeFilename(filename) {
  // Remove file extension first
  const nameWithoutExt = filename.replace(/\.docx$/i, "");

  // Match pattern: {ID} - {TYPE} where ID is alphanumeric and TYPE is letters
  const pattern = /^([A-Z0-9]+)\s*-\s*([A-Z]+)/i;
  const match = nameWithoutExt.match(pattern);

  if (match) {
    const [, id, type] = match;
    return `${id.toLowerCase()}_${type.toLowerCase()}.html`;
  }

  // Fallback: clean up special characters if pattern doesn't match
  return (
    nameWithoutExt
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "") + // Trim underscores
    ".html"
  );
}

module.exports = { sanitizeFilename };
