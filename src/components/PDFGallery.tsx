import { useState, useEffect } from 'react';
import { FileText, ExternalLink } from 'lucide-react';
import { PDFThumbnailGenerator } from '@/utils/pdfThumbnailGenerator';
import pdfPlaceholder from '@/assets/pdf-placeholder.png';

interface PDF {
  id: string;
  title: string;
  date: string;
  pdfUrl: string;
  thumbnail: string;
}

interface Divider {
  id: string;
  type: 'divider';
  text: string;
}

type GalleryItem = PDF | Divider;

interface PDFGalleryProps {
  items?: GalleryItem[];
  title?: string;
  description?: string;
}

const PDFGallery = ({ 
  items = [], 
  title = "PDF Gallery",
  description = "Browse our collection of PDF documents"
}: PDFGalleryProps) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [itemsWithThumbnails, setItemsWithThumbnails] = useState<GalleryItem[]>([]);
  const [isGeneratingThumbnails, setIsGeneratingThumbnails] = useState(false);
  const [thumbnails, setThumbnails] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    console.log('PDFGallery: useEffect triggered, items count:', items.length);
    
    if (items.length === 0) {
      setItemsWithThumbnails([]);
      return;
    }

    setIsGeneratingThumbnails(true);
    
    // Extract PDFs that need thumbnail generation
    const pdfsNeedingThumbnails = items.filter((item): item is PDF => 
      'pdfUrl' in item && (!item.thumbnail || item.thumbnail === pdfPlaceholder || item.thumbnail.includes('placeholder'))
    );
    
    if (pdfsNeedingThumbnails.length > 0) {
      console.log('Starting thumbnail generation...');
      
      // Check cached thumbnails first
      const itemsWithCached = items.map(item => {
        if ('pdfUrl' in item) {
          const cacheKey = `pdf_thumbnail_${item.pdfUrl}`;
          const cachedThumbnail = localStorage.getItem(cacheKey);
          if (cachedThumbnail) {
            return { ...item, thumbnail: cachedThumbnail };
          }
          return { ...item, thumbnail: item.thumbnail || pdfPlaceholder };
        }
        return item;
      });
      setItemsWithThumbnails(itemsWithCached);
      
      // Filter PDFs that still need generation (not cached)
      const pdfsNeedingGeneration = pdfsNeedingThumbnails.filter(pdf => {
        const cacheKey = `pdf_thumbnail_${pdf.pdfUrl}`;
        return !localStorage.getItem(cacheKey);
      });
      
      if (pdfsNeedingGeneration.length > 0) {
        const generateThumbnails = async () => {
          try {
            const thumbnailPromises = pdfsNeedingGeneration.map(async (pdf) => {
              try {
                const result = await PDFThumbnailGenerator.generateThumbnail(pdf.pdfUrl);
                if (result.success && result.dataUrl) {
                  // Cache the thumbnail
                  const cacheKey = `pdf_thumbnail_${pdf.pdfUrl}`;
                  localStorage.setItem(cacheKey, result.dataUrl);
                  setThumbnails(prev => ({
                    ...prev,
                    [pdf.pdfUrl]: result.dataUrl!
                  }));
                  return { url: pdf.pdfUrl, dataUrl: result.dataUrl, success: true };
                }
                return { url: pdf.pdfUrl, success: false };
              } catch (error) {
                console.error('Error generating thumbnail for', pdf.pdfUrl, error);
                return { url: pdf.pdfUrl, success: false };
              }
            });
            
            const results = await Promise.all(thumbnailPromises);
            
            const updatedItems = itemsWithCached.map((item) => {
              if ('pdfUrl' in item) {
                const result = results.find(r => r.url === item.pdfUrl);
                if (result?.success && result.dataUrl) {
                  return { ...item, thumbnail: result.dataUrl };
                }
              }
              return item;
            });
            
            setItemsWithThumbnails(updatedItems);
          } catch (error) {
            console.error('Error during thumbnail generation:', error);
          } finally {
            setIsGeneratingThumbnails(false);
          }
        };
        
        generateThumbnails();
      } else {
        setIsGeneratingThumbnails(false);
      }
    } else {
      console.log('No thumbnails to generate, using existing items');
      setItemsWithThumbnails(items);
      setIsGeneratingThumbnails(false);
    }
  }, [items]);


  const displayItems = itemsWithThumbnails.length > 0 ? itemsWithThumbnails : items;

  const openPdf = (url: string) => {
    // Check if mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Open in same tab for mobile to avoid popup blocking
      window.location.href = url;
    } else {
      // For desktop, use a more reliable method
      try {
        // Create a temporary anchor element
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        
        // Add to DOM temporarily
        document.body.appendChild(link);
        
        // Use the click() method directly
        link.click();
        
        // Clean up
        setTimeout(() => {
          if (document.body.contains(link)) {
            document.body.removeChild(link);
          }
        }, 100);
        
      } catch (error) {
        console.error('Error opening PDF:', error);
        // Final fallback - same tab
        window.location.href = url;
      }
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      {isGeneratingThumbnails && (
        <div className="text-center mb-6">
          <p className="text-sm text-muted-foreground">Generating PDF thumbnails...</p>
        </div>
      )}

      {displayItems.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No PDFs available</h3>
          <p className="text-muted-foreground">PDFs will appear here when they are added.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {(() => {
            let currentGrid: PDF[] = [];
            const renderedItems: JSX.Element[] = [];

            displayItems.forEach((item, index) => {
              if ('type' in item && item.type === 'divider') {
                // Render previous grid if exists
                if (currentGrid.length > 0) {
                  renderedItems.push(
                    <div key={`grid-${currentGrid[0].id}`} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {currentGrid.map((pdf) => (
                        <div key={pdf.id} className="group">
                          <div
                            className="cursor-pointer"
                            onClick={() => openPdf(pdf.pdfUrl)}
                            onMouseEnter={() => setHoveredId(pdf.id)}
                            onMouseLeave={() => setHoveredId(null)}
                          >
                            <div className="relative bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border border-border">
                              <div className="aspect-video overflow-hidden bg-muted">
                                <img
                                  src={pdf.thumbnail}
                                  alt={pdf.title}
                                  className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                                  loading="lazy"
                                  onError={(e) => {
                                    e.currentTarget.src = pdfPlaceholder;
                                  }}
                                />
                                {hoveredId === pdf.id && (
                                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                    <ExternalLink className="w-8 h-8 text-white" />
                                  </div>
                                )}
                              </div>

                              {/* PDF Indicator */}
                              <div className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm rounded-md px-2 py-1 shadow-sm">
                                <div className="flex items-center gap-1">
                                  <FileText className="w-3 h-3 text-muted-foreground" />
                                  <span className="text-xs font-medium text-muted-foreground">PDF</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Clickable text outside the thumbnail frame */}
                              <div className="mt-3 transition-colors duration-200">
                                <a href={pdf.pdfUrl} target="_blank" rel="noopener" className="block">
                                  <p className="text-xs text-muted-foreground leading-tight mb-1 group-hover:text-[#7FB3DC] hover:text-[#7FB3DC]">
                                    {pdf.date}
                                  </p>
                                  <h3 className="font-semibold text-sm line-clamp-2 leading-tight text-foreground group-hover:text-[#7FB3DC] hover:text-[#7FB3DC] transition-colors duration-200">
                                    {pdf.title}
                                  </h3>
                                </a>
                              </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                  currentGrid = [];
                }

                // Render divider with spacing above
                renderedItems.push(
                  <div key={item.id} className="mt-20 mb-8">
                    <div className="flex items-center gap-4 px-0">
                      <div className="flex-1 border-t border-border"></div>
                      <span className="bg-background px-4 md:px-6 text-lg font-medium text-muted-foreground whitespace-nowrap">
                        {item.text}
                      </span>
                      <div className="flex-1 border-t border-border"></div>
                    </div>
                  </div>
                );
              } else {
                // Add PDF to current grid
                currentGrid.push(item as PDF);
              }
            });

            // Render remaining grid if any PDFs are left
            if (currentGrid.length > 0) {
              renderedItems.push(
                <div key={`grid-final`} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {currentGrid.map((pdf) => (
                    <div key={pdf.id} className="group">
                      <div
                        className="cursor-pointer"
                        onClick={() => openPdf(pdf.pdfUrl)}
                        onMouseEnter={() => setHoveredId(pdf.id)}
                        onMouseLeave={() => setHoveredId(null)}
                      >
                        <div className="relative bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border border-border">
                          <div className="aspect-video overflow-hidden bg-muted">
                            <img
                              src={pdf.thumbnail}
                              alt={pdf.title}
                              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.src = pdfPlaceholder;
                              }}
                            />
                            {hoveredId === pdf.id && (
                              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                <ExternalLink className="w-8 h-8 text-white" />
                              </div>
                            )}
                          </div>

                          {/* PDF Indicator */}
                          <div className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm rounded-md px-2 py-1 shadow-sm">
                            <div className="flex items-center gap-1">
                              <FileText className="w-3 h-3 text-muted-foreground" />
                              <span className="text-xs font-medium text-muted-foreground">PDF</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Clickable text outside the thumbnail frame */}
                        <div className="mt-3 transition-colors duration-200">
                          <a href={pdf.pdfUrl} target="_blank" rel="noopener" className="block">
                            <p className="text-xs text-muted-foreground leading-tight mb-1 group-hover:text-[#7FB3DC] hover:text-[#7FB3DC]">
                              {pdf.date}
                            </p>
                            <h3 className="font-semibold text-sm line-clamp-2 leading-tight text-foreground group-hover:text-[#7FB3DC] hover:text-[#7FB3DC] transition-colors duration-200">
                              {pdf.title}
                            </h3>
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            }

            return renderedItems;
          })()}
        </div>
      )}
    </div>
  );
};

export default PDFGallery;