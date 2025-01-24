const { convertToSvg, detectFormat } = require('../../lib/images/shape-converter');
const TEST_SHAPES = require('./__fixtures__/shapes');

describe('Shape Converter', () => {
    describe('Format Detection', () => {
        test('detects VML format', () => {
            const vmlContent = '<v:shape xmlns:v="urn:schemas-microsoft-com:vml" />';
            expect(detectFormat(vmlContent)).toBe('VML');
        });

        test('detects DrawingML format', () => {
            const drawingMlContent = '<a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/" />';
            expect(detectFormat(drawingMlContent)).toBe('DrawingML');
        });
    });

    describe('VML Conversion', () => {
        test('converts basic VML shape to SVG', async () => {
            const result = await convertToSvg(Buffer.from(TEST_SHAPES.vml.basic));
            expect(result).toBeInstanceOf(Buffer);
            expect(result.toString()).toContain('<svg');
            expect(result.toString()).toContain('fill="red"');
        });
    });

    describe('DrawingML Conversion', () => {
        test('converts basic DrawingML shape to SVG', async () => {
            const drawingMlShape = `
                <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/">
                    <a:graphicData>
                        <a:shape>
                            <a:spPr>
                                <a:prstGeom prst="rect"/>
                            </a:spPr>
                        </a:shape>
                    </a:graphicData>
                </a:graphic>`;
            
            const result = await convertToSvg(Buffer.from(drawingMlShape));
            expect(result).toBeInstanceOf(Buffer);
            expect(result.toString()).toContain('<svg');
            expect(result.toString()).toContain('<rect');
        });
    });

    describe('Error Handling', () => {
        test('handles invalid input', async () => {
            const invalidContent = 'not xml content';
            await expect(convertToSvg(Buffer.from(invalidContent)))
                .rejects.toThrow('Shape conversion error');
        });

        test('handles non-buffer input', async () => {
            await expect(convertToSvg('string input'))
                .rejects.toThrow('Input must be a buffer');
        });

        test('handles unsupported format', async () => {
            const unknownFormat = '<unknown>shape</unknown>';
            await expect(convertToSvg(Buffer.from(unknownFormat)))
                .rejects.toThrow('Unsupported shape format');
        });

        test('creates fallback shape for unsupported format', async () => {
            const unknownFormat = '<unknown>shape</unknown>';
            const result = await convertToSvg(Buffer.from(unknownFormat));
            expect(result.toString()).toContain('rect');
            expect(result.toString()).toContain('fill="#cccccc"');
        });
    });
});