const mammoth = require('mammoth');
const path = require('path');

async function testConversion() {
    try {
        const inputPath = path.join(__dirname, 'sources', 'sample.docx');
        console.log('Converting:', inputPath);
        
        const result = await mammoth.convertToHtml({ path: inputPath });
        console.log('Result length:', result.value.length);
        console.log('First 200 chars:', result.value.substring(0, 200));
        console.log('Messages:', result.messages);
    } catch (error) {
        console.error('Error:', error);
    }
}

testConversion();
