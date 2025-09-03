import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Set the worker source (ES module worker for Vite)
GlobalWorkerOptions.workerSrc = workerSrc;

export interface ThumbnailResult {
  success: boolean;
  dataUrl?: string;
  error?: string;
}

export class PDFThumbnailGenerator {
  
  static async generateThumbnail(pdfUrl: string, scale: number = 1.2): Promise<ThumbnailResult> {
    try {
      console.log('PDFThumbnailGenerator: Loading PDF:', pdfUrl);
      
      // Try to fetch the PDF with proper CORS handling
      let pdf;
      try {
        // First attempt: Direct PDF loading
        const loadingTask = getDocument({
          url: pdfUrl,
          cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.149/cmaps/',
          cMapPacked: true,
          disableAutoFetch: false,
          disableStream: false,
          verbosity: 0 // Reduce console noise
        });
        
        pdf = await loadingTask.promise;
      } catch (directLoadError) {
        console.log('Direct load failed, trying proxy approach:', directLoadError);
        
        // Second attempt: Fetch first, then load from buffer
        const response = await fetch(pdfUrl, { 
          mode: 'cors',
          headers: {
            'Accept': 'application/pdf',
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        const loadingTask = getDocument({
          data: new Uint8Array(arrayBuffer),
          cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.149/cmaps/',
          cMapPacked: true,
          verbosity: 0
        });
        
        pdf = await loadingTask.promise;
      }
      
      console.log('PDFThumbnailGenerator: PDF loaded, pages:', pdf.numPages);
      
      // Get the first page
      const page = await pdf.getPage(1);
      console.log('PDFThumbnailGenerator: Got first page');
      
      // Get viewport (page dimensions)
      const viewport = page.getViewport({ scale });
      console.log('PDFThumbnailGenerator: Viewport dimensions:', viewport.width, 'x', viewport.height);
      
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
      
      console.log('PDFThumbnailGenerator: Starting page render');
      await page.render(renderContext).promise;
      
      console.log('PDFThumbnailGenerator: Page rendered to canvas');
      
      // Convert canvas to data URL
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      console.log('PDFThumbnailGenerator: Generated data URL, length:', dataUrl.length);
      
      return {
        success: true,
        dataUrl
      };
      
    } catch (error) {
      console.error('PDFThumbnailGenerator: Error generating PDF thumbnail:', error);
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