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

  useEffect(() => {
    console.log('PDFGallery: useEffect triggered, items count:', items.length);
    
    if (items.length === 0) {
      setItemsWithThumbnails([]);
      return;
    }

    setIsGeneratingThumbnails(true);
    
    // Extract PDFs that need thumbnail generation
    const pdfsNeedingThumbnails = items.filter((item): item is PDF => 
      'pdfUrl' in item && (!item.thumbnail || item.thumbnail === '/placeholder-pdf.jpg' || item.thumbnail === pdfPlaceholder)
    );
    
    if (pdfsNeedingThumbnails.length > 0) {
      console.log('Starting thumbnail generation...');
      console.log('Calling PDFThumbnailGenerator.generateMultipleThumbnails');
      
      const generateThumbnails = async () => {
        try {
          const results = await PDFThumbnailGenerator.generateMultipleThumbnails(
            pdfsNeedingThumbnails.map(pdf => pdf.pdfUrl)
          );
          
          console.log('Thumbnail generation results:', results);
          
          const updatedItems = items.map((item) => {
            if ('pdfUrl' in item) {
              const result = results.find(r => r.url === item.pdfUrl);
              console.log(`Processing PDF ${items.indexOf(item)}:`, result);
              
              if (result?.success && result.dataUrl) {
                console.log(`Successfully generated thumbnail for PDF ${items.indexOf(item)}`);
                return { ...item, thumbnail: result.dataUrl };
              } else {
                console.log(`Using fallback thumbnail for PDF ${items.indexOf(item)}`);
                return { ...item, thumbnail: pdfPlaceholder };
              }
            }
            return item;
          });
          
          console.log('Setting updated items:', updatedItems.length);
          setItemsWithThumbnails(updatedItems);
        } catch (error) {
          console.error('Error during thumbnail generation:', error);
          setItemsWithThumbnails(items.map(item => 
            'pdfUrl' in item ? { ...item, thumbnail: pdfPlaceholder } : item
          ));
        } finally {
          setIsGeneratingThumbnails(false);
          console.log('Thumbnail generation complete');
        }
      };
      
      generateThumbnails();
    } else {
      console.log('No thumbnails to generate, using existing items');
      setItemsWithThumbnails(items);
      setIsGeneratingThumbnails(false);
    }
  }, [items]);

  if (isGeneratingThumbnails) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Generating PDF thumbnails...</p>
        </div>
      </div>
    );
  }

  const displayItems = itemsWithThumbnails.length > 0 ? itemsWithThumbnails : items;

  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">{title}</h1>
        <p className="text-muted-foreground text-lg">{description}</p>
      </div>

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
                            className="relative cursor-pointer bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border border-border"
                            onClick={() => window.open(pdf.pdfUrl, '_blank')}
                            onMouseEnter={() => setHoveredId(pdf.id)}
                            onMouseLeave={() => setHoveredId(null)}
                          >
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
                          
                          {/* Text outside the thumbnail frame */}
                          <div className="mt-3">
                            <p className="text-xs text-muted-foreground leading-tight mb-1">
                              {pdf.date}
                            </p>
                            <h3 className="font-semibold text-sm line-clamp-2 leading-tight text-foreground">
                              {pdf.title}
                            </h3>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                  currentGrid = [];
                }

                // Render divider
                renderedItems.push(
                  <div key={item.id} className="relative">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-background px-6 text-lg font-medium text-muted-foreground">
                        {item.text}
                      </span>
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
                        className="relative cursor-pointer bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border border-border"
                        onClick={() => window.open(pdf.pdfUrl, '_blank')}
                        onMouseEnter={() => setHoveredId(pdf.id)}
                        onMouseLeave={() => setHoveredId(null)}
                      >
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
                      
                      {/* Text outside the thumbnail frame */}
                      <div className="mt-3">
                        <p className="text-xs text-muted-foreground leading-tight mb-1">
                          {pdf.date}
                        </p>
                        <h3 className="font-semibold text-sm line-clamp-2 leading-tight text-foreground">
                          {pdf.title}
                        </h3>
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