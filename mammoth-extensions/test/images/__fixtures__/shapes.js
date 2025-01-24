const TEST_SHAPES = {
    vml: {
        basic: '<v:shape xmlns:v="urn:schemas-microsoft-com:vml" style="width:100px;height:100px" fillcolor="red" strokecolor="blue" strokeweight="2pt" />',
        complex: '...'
    },
    drawingMl: {
        basic: '<a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/"><a:graphicData><a:shape><a:spPr><a:prstGeom prst="rect"/></a:spPr></a:shape></a:graphicData></a:graphic>',
        complex: '...'
    }
};

module.exports = TEST_SHAPES;