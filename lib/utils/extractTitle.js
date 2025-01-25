function extractTitle(content) {
  if (!content) return null;
  
  // Look for first heading pattern
  const headingMatch = content.match(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/i);
  if (headingMatch) {
    return headingMatch[1].trim();
  }
  
  // Look for strong/bold text in first paragraph
  const boldMatch = content.match(/<p[^>]*><strong>([^<]+)<\/strong>/i);
  if (boldMatch) {
    return boldMatch[1].trim();
  }
  
  // Fallback to first paragraph text
  const paragraphMatch = content.match(/<p[^>]*>([^<]+)<\/p>/i);
  if (paragraphMatch) {
    return paragraphMatch[1].trim();
  }
  
  return null;
}

module.exports = extractTitle;