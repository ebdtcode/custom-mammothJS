const fs = require('fs').promises;
const path = require('path');
const Logger = require('../logger');

async function copyDir(src, dest) {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            await copyDir(srcPath, destPath);
        } else {
            await fs.copyFile(srcPath, destPath);
        }
    }
}

async function copyAssets(outputDir) {
    const docsDir = path.join(__dirname, '../../docs');
    
    // Copy all required assets from docs
    await copyDir(
        path.join(docsDir, 'styles'),
        path.join(outputDir, 'styles')
    );
    await copyDir(
        path.join(docsDir, 'scripts'),
        path.join(outputDir, 'scripts')
    );
}

module.exports = copyAssets;