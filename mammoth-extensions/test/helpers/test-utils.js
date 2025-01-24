const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');

const createTestImage = async (width, height, format = 'jpeg') => {
    const buffer = await sharp({
        create: {
            width,
            height,
            channels: 4,
            background: { r: 255, g: 0, b: 0, alpha: 0.5 }
        }
    })
    .toFormat(format)
    .toBuffer();
    
    return buffer;
};

module.exports = {
    createTestImage,
    getFixturePath: (filename) => path.join(__dirname, '../images/__fixtures__', filename),
    loadFixture: async (filename) => fs.readFile(getFixturePath(filename))
};