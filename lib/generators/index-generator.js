const path = require('path');

class IndexGenerator {
    constructor({ outputDir }) {
        this.outputDir = outputDir;
    }

    async generateIndex(files) {
        return `<!DOCTYPE html>
        <html lang="en" style="font-size:16px">
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width,initial-scale=1">
            <title>Generated Documents</title>
            <link rel="stylesheet" href="styles/clean-jsdoc-theme.min.css">
            <script src="scripts/third-party/hljs.js" defer></script>
            <script src="scripts/third-party/hljs-line-num.js" defer></script>
            <script src="scripts/third-party/popper.js" defer></script>
            <script src="scripts/third-party/tippy.js" defer></script>
            <script src="scripts/third-party/tocbot.min.js"></script>
            
            <!-- SVG Icons -->
            <svg aria-hidden="true" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="display:none">
                <defs>
                    <symbol id="copy-icon" viewbox="0 0 488.3 488.3">
                        <g><path d="M314.25,85.4h-227c-21.3,0-38.6,17.3-38.6,38.6v325.7c0,21.3,17.3,38.6,38.6,38.6h227c21.3,0,38.6-17.3,38.6-38.6V124    C352.75,102.7,335.45,85.4,314.25,85.4z"/></g>
                    </symbol>
                    <symbol id="search-icon" viewBox="0 0 512 512">
                        <path d="M225.474,0C101.151,0,0,101.151,0,225.474c0,124.33,101.151,225.474,225.474,225.474"/>
                    </symbol>
                    <symbol id="down-icon" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M12.7803 6.21967C13.0732 6.51256 13.0732 6.98744 12.7803 7.28033L8.53033 11.5303C8.23744 11.8232 7.76256 11.8232 7.46967 11.5303L3.21967 7.28033C2.92678 6.98744 2.92678 6.51256 3.21967 6.21967C3.51256 5.92678 3.98744 5.92678 4.28033 6.21967L8 9.93934L11.7197 6.21967C12.0126 5.92678 12.4874 5.92678 12.7803 6.21967Z"/>
                    </symbol>
                </defs>
            </svg>
        </head>
        <body data-theme="dark">
            <div class="sidebar-container">
                <div class="sidebar" id="sidebar">
                    <a href="/" class="sidebar-title sidebar-title-anchor">Generated Documents</a>
                    <div class="sidebar-items-container">
                        <div class="sidebar-section-title with-arrow" data-isopen="true" id="sidebar-documents">
                            <div>Documents</div>
                            <svg><use xlink:href="#down-icon"></use></svg>
                        </div>
                        <div class="sidebar-section-children-container">
                            ${this.generateSidebarLinks(files)}
                        </div>
                    </div>
                </div>
            </div>

            <div class="navbar-container" id="VuAckcnZhf">
                <nav class="navbar">
                    <div class="navbar-left-items"></div>
                    <div class="navbar-right-items">
                        <div class="navbar-right-item">
                            <button class="icon-button search-button" aria-label="open-search">
                                <svg><use xlink:href="#search-icon"></use></svg>
                            </button>
                        </div>
                        <div class="navbar-right-item">
                            <button class="icon-button theme-toggle" aria-label="toggle-theme">
                                <svg><use class="theme-svg-use" xlink:href="#light-theme-icon"></use></svg>
                            </button>
                        </div>
                    </div>
                </nav>
            </div>

            <div class="search-container" id="PkfLWpAbet" style="display:none">
                <div class="wrapper" id="iCxFxjkHbP">
                    <div class="search-box-c">
                        <svg><use xlink:href="#search-icon"></use></svg>
                        <input type="text" id="vpcKVYIppa" class="search-input" placeholder="Search..." autofocus>
                    </div>
                    <div class="search-result-c" id="fWwVHRuDuN">
                        <span class="search-result-c-text">Type to search</span>
                    </div>
                </div>
            </div>

            <script type="text/javascript" src="scripts/core.min.js"></script>
            <script src="scripts/search.min.js" defer></script>
            <script src="scripts/third-party/fuse.js" defer></script>
        </body>
        </html>`;
    }

    generateSidebarLinks(files) {
        return files.map(file => `
            <div class="sidebar-section-children">
                <a href="${file}" class="sidebar-link">${path.basename(file, '.html')}</a>
            </div>
        `).join('\n');
    }
}

module.exports = IndexGenerator;