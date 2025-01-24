class Document {
    constructor(filename, title, category, order) {
        this.filename = filename;
        this.title = title;
        this.category = category;
        this.order = order;
    }
}

module.exports = { Document };