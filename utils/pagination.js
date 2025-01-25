function sortDocuments(documents) {
  return documents.sort((a, b) => {
    // First sort by category order
    if (a.categoryOrder !== b.categoryOrder) {
      return a.categoryOrder - b.categoryOrder;
    }
    // Then by filename within category
    return a.filename.localeCompare(b.filename);
  });
}

function getPaginationInfo(documents, currentFilename) {
  const sortedDocs = sortDocuments(documents);
  const currentIndex = sortedDocs.findIndex(
    (doc) => doc.filename === currentFilename
  );

  return {
    prev: currentIndex > 0 ? sortedDocs[currentIndex - 1] : null,
    next:
      currentIndex < sortedDocs.length - 1
        ? sortedDocs[currentIndex + 1]
        : null,
    current: currentIndex + 1,
    total: sortedDocs.length,
  };
}

function generatePaginationHtml(prev, next) {
  const prevLink = prev
    ? `<a href="./${prev.filename}" class="prev" title="Previous: ${prev.title}" aria-label="Go to previous page: ${prev.title}">← Previous</a>`
    : '<span class="prev disabled" aria-hidden="true">← Previous</span>';

  const nextLink = next
    ? `<a href="./${next.filename}" class="next" title="Next: ${next.title}" aria-label="Go to next page: ${next.title}">Next →</a>`
    : '<span class="next disabled" aria-hidden="true">Next →</span>';

  return `
    <nav class="pagination" role="navigation" aria-label="Document Navigation">
        <div class="prev-container">${prevLink}</div>
        <div class="next-container">${nextLink}</div>
    </nav>
    <script>
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                const prev = document.querySelector('.prev:not(.disabled)');
                if (prev) prev.click();
            } else if (e.key === 'ArrowRight') {
                const next = document.querySelector('.next:not(.disabled)');
                if (next) next.click();
            }
        });
    </script>`;
}

module.exports = { getPaginationInfo, generatePaginationHtml, sortDocuments };
