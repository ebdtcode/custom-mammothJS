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
    // Ensure documents are sorted first
    const sortedDocs = sortDocuments(documents);
    const currentIndex = sortedDocs.findIndex(doc => doc.filename === currentFilename);
    
    if (currentIndex === -1) return { prev: null, next: null };
    
    return {
        prev: currentIndex > 0 ? sortedDocs[currentIndex - 1] : null,
        next: currentIndex < sortedDocs.length - 1 ? sortedDocs[currentIndex + 1] : null
    };
}

function generatePaginationHtml(prev, next) {
    const prevLink = prev 
        ? `<a href="./${prev.filename}" class="prev" title="Previous: ${prev.title}">← Previous</a>`
        : '<span></span>';
        
    const nextLink = next
        ? `<a href="./${next.filename}" class="next" title="Next: ${next.title}">Next →</a>`
        : '<span></span>';

    return `
    <nav class="pagination">
        <div class="prev-container">${prevLink}</div>
        <div class="next-container">${nextLink}</div>
    </nav>`;
}

module.exports = { getPaginationInfo, generatePaginationHtml, sortDocuments };