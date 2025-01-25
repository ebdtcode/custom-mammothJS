module.exports = function(mammoth) {
  return {
    simplifyHtml: function(element, options = {}) {
      const emptiers = {
        paragraph: (element) => ({ type: 'p', children: element.children }),
        run: (element) => ({ type: 'span', children: element.children }),
        text: (element) => ({ type: 'text', value: element.value }),
        table: (element) => ({ type: 'table', children: element.children }),
        tableRow: (element) => ({ type: 'tr', children: element.children }),
        tableCell: (element) => ({ type: 'td', children: element.children }),
        hyperlink: (element) => ({ type: 'a', href: element.href, children: element.children }),
        image: (element) => ({ type: 'img', src: element.src, alt: element.alt }),
        figure: (element) => ({ type: 'figure', children: element.children }),
        figcaption: (element) => ({ type: 'figcaption', children: element.children }),
        'custom-box': (element) => ({ type: 'div', className: element.className, children: element.children }),
        // Default handler for unknown types
        default: (element) => ({ type: 'div', children: element.children })
      };

      if (!element) return null;

      // Handle arrays of elements
      if (Array.isArray(element)) {
        return element.map(el => this.simplifyHtml(el, options)).filter(Boolean);
      }

      // Skip empty elements
      if (!element.type && !element.value && (!element.children || element.children.length === 0)) {
        return null;
      }

      // Get the appropriate emptier function
      const emptier = emptiers[element.type] || emptiers.default;

      try {
        // Process the element
        const processed = emptier(element);

        // Recursively process children if they exist
        if (processed.children) {
          processed.children = this.simplifyHtml(processed.children, options);
        }

        return processed;
      } catch (error) {
        console.warn(`Warning: Failed to process element of type ${element.type}`, error);
        // Return a fallback div for failed conversions
        return {
          type: 'div',
          children: element.children ? this.simplifyHtml(element.children, options) : []
        };
      }
    }
  };
};
