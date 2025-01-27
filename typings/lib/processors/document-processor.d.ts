
declare interface conversionOptionsType {
	getDocumentList(): Promise<Function | any[]>;

	processImage(image: any): Promise<any>;

	generateHtml(content: any, title: any): null;
}
