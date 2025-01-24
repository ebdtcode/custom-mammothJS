export interface ImageOptions {
    outputDir?: string;
    quality?: number;
    width?: number;
    height?: number;
    format?: string;
    filename: string;
}

export interface ImageProcessor {
    processImage(buffer: Buffer, options: ImageOptions): Promise<string>;
}