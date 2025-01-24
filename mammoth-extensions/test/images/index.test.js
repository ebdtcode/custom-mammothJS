const ImageProcessor = require('../../lib/images');
const { SUPPORTED_FORMATS, MAX_IMAGE_SIZE } = require('../../lib/images/constants');
const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');

describe('ImageProcessor', () => {
    let processor;
    const outputDir = path.join(__dirname, '__fixtures__/output');

    beforeAll(async () => {
        await fs.mkdir(outputDir, { recursive: true });
    });

    beforeEach(() => {
        processor = ImageProcessor({});
    });

    afterAll(async () => {
        await fs.rm(outputDir, { recursive: true, force: true });
    });

    test('validates supported formats', () => {
        expect(SUPPORTED_FORMATS).toContain('jpeg');
        expect(SUPPORTED_FORMATS).toContain('png');
    });

    test('validates maximum image size', () => {
        expect(MAX_IMAGE_SIZE).toBe(50 * 1024 * 1024);
    });

    describe('Image Processing', () => {
        test('processes basic image successfully', async () => {
            const imageBuffer = await sharp({
                create: {
                    width: 100,
                    height: 100,
                    channels: 4,
                    background: { r: 255, g: 0, b: 0, alpha: 0.5 }
                }
            }).jpeg().toBuffer();

            const result = await processor.processImage(imageBuffer, {
                outputDir,
                filename: 'test.jpg'
            });
            
            expect(result).toBeTruthy();
            const stats = await fs.stat(result);
            expect(stats.size).toBeGreaterThan(0);
        });

        test('validates input formats', async () => {
            const imageBuffer = Buffer.from('test');
            await expect(processor.processImage(imageBuffer, {
                outputDir,
                filename: 'test.jpg',
                format: 'invalid'
            })).rejects.toThrow('Unsupported format');
        });

        test('handles large images', async () => {
            const imageBuffer = Buffer.alloc(51 * 1024 * 1024);
            await expect(processor.processImage(imageBuffer, {
                outputDir,
                filename: 'large.jpg'
            })).rejects.toThrow('exceeds maximum limit');
        });
    });
});