import * as pdfjsLib from 'pdfjs-dist';

// Set the worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface ThumbnailResult {
  success: boolean;
  dataUrl?: string;
  error?: string;
}

export class PDFThumbnailGenerator {
  
  static async generateThumbnail(pdfUrl: string, scale: number = 1.5): Promise<ThumbnailResult> {
    try {
      console.log('Loading PDF:', pdfUrl);
      
      // Load the PDF document
      const loadingTask = pdfjsLib.getDocument(pdfUrl);
      const pdf = await loadingTask.promise;
      
      console.log('PDF loaded, pages:', pdf.numPages);
      
      // Get the first page
      const page = await pdf.getPage(1);
      
      // Get viewport (page dimensions)
      const viewport = page.getViewport({ scale });
      
      // Create canvas
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        throw new Error('Could not get canvas context');
      }
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      // Render page to canvas
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
        canvas: canvas,
      };
      
      await page.render(renderContext).promise;
      
      console.log('Page rendered to canvas');
      
      // Convert canvas to data URL
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      
      return {
        success: true,
        dataUrl
      };
      
    } catch (error) {
      console.error('Error generating PDF thumbnail:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  static async generateMultipleThumbnails(pdfUrls: string[]): Promise<(ThumbnailResult & { url: string })[]> {
    const results = await Promise.allSettled(
      pdfUrls.map(async (url) => {
        const result = await this.generateThumbnail(url);
        return { ...result, url };
      })
    );
    
    return results.map((result, index) => 
      result.status === 'fulfilled' 
        ? result.value 
        : { success: false, error: 'Failed to generate thumbnail', url: pdfUrls[index] }
    );
  }
}