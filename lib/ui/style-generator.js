class StyleGenerator {
    generate() {
        return `
            :root {
                --primary-color: #1a73e8;
                --text-color: #202124;
                --bg-color: #ffffff;
                --nav-height: 60px;
            }

            body {
                margin: 0;
                font-family: system-ui, -apple-system, sans-serif;
                color: var(--text-color);
            }

            .navbar {
                background: var(--primary-color);
                height: var(--nav-height);
                color: white;
            }

            .container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 0 1rem;
            }

            .document-list {
                list-style: none;
                padding: 0;
            }

            .document-list li {
                padding: 1rem;
                border-bottom: 1px solid #eee;
            }
        `;
    }
}

module.exports = StyleGenerator;