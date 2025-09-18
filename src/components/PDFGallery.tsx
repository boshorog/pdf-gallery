import { useState, useEffect } from 'react';
import { FileText, ExternalLink } from 'lucide-react';
import { PDFThumbnailGenerator } from '@/utils/pdfThumbnailGenerator';
import pdfPlaceholder from '@/assets/pdf-placeholder.png';
import { useLicense } from '@/hooks/useLicense';

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
  settings?: {
    thumbnailStyle: string;
    accentColor: string;
    thumbnailShape: string;
    pdfIconPosition: string;
    defaultPlaceholder: string;
    thumbnailSize?: string;
  };
}

const PDFGallery = ({ 
  items = [], 
  title = "PDF Gallery",
  description = "Browse our collection of PDF documents",
  settings = {
    thumbnailStyle: 'default',
    accentColor: '#7FB3DC',
    thumbnailShape: 'landscape-16-9',
    pdfIconPosition: 'top-right',
    defaultPlaceholder: 'default',
    thumbnailSize: 'four-rows'
  }
}: PDFGalleryProps) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [itemsWithThumbnails, setItemsWithThumbnails] = useState<GalleryItem[]>([]);
  const [isGeneratingThumbnails, setIsGeneratingThumbnails] = useState(false);
  const [thumbnails, setThumbnails] = useState<{ [key: string]: string }>({});
  const [isMobile, setIsMobile] = useState(false);
  const license = useLicense();
  const placeholderUrl = (settings?.defaultPlaceholder && settings.defaultPlaceholder !== 'default')
    ? settings.defaultPlaceholder
    : pdfPlaceholder;

  useEffect(() => {
    setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
  }, []);

  useEffect(() => {
    console.log('PDFGallery: useEffect triggered, items count:', items.length);
    
    if (items.length === 0) {
      setItemsWithThumbnails([]);
      return;
    }

    setIsGeneratingThumbnails(true);
    
    // Extract PDFs that need thumbnail generation
    const pdfsNeedingThumbnails = items.filter((item): item is PDF => 
      'pdfUrl' in item && (!item.thumbnail || item.thumbnail === placeholderUrl || item.thumbnail.includes('placeholder'))
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
          return { ...item, thumbnail: item.thumbnail || placeholderUrl };
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

  // Map settings to classes
  const aspectClass = settings.thumbnailShape === 'square'
    ? 'aspect-square'
    : settings.thumbnailShape === 'landscape-3-2'
      ? 'aspect-[3/2]'
      : settings.thumbnailShape === 'portrait-2-3'
        ? 'aspect-[2/3]'
        : 'aspect-video';

  const iconPosClass = settings.pdfIconPosition === 'top-left'
    ? 'top-3 left-3'
    : settings.pdfIconPosition === 'bottom-right'
      ? 'bottom-3 right-3'
      : settings.pdfIconPosition === 'bottom-left'
        ? 'bottom-3 left-3'
        : 'top-3 right-3';

  // Grid columns based on thumbnail size setting
  const getGridCols = () => {
    switch (settings.thumbnailSize) {
      case 'three-rows': return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';
      case 'five-rows': return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';
      case 'four-rows':
      default: return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
    }
  };

  // Render thumbnail based on style
  const renderThumbnail = (pdf: PDF) => {
    const baseProps = {
      href: pdf.pdfUrl,
      target: isMobile ? '_self' : '_blank',
      rel: isMobile ? undefined : 'noopener noreferrer',
      className: "block",
      onMouseEnter: () => setHoveredId(pdf.id),
      onMouseLeave: () => setHoveredId(null),
      onClick: (e: any) => { if (isMobile) { e.preventDefault(); window.location.assign(pdf.pdfUrl); } }
    };

    // Force default style for free version
    const effectiveStyle = license.isPro ? settings.thumbnailStyle : 'default';

    switch (effectiveStyle) {
      case 'elevated-card':
        return (
          <a key={pdf.id} {...baseProps}>
            <div className="group cursor-pointer">
              <div className="relative bg-card rounded-2xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-300 transform group-hover:-translate-y-2 border border-border">
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  <img
                    src={pdf.thumbnail}
                    alt={pdf.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => { e.currentTarget.src = placeholderUrl; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/40"></div>
                </div>
                <div className="absolute bottom-3 right-3">
                  <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3" />
                    </svg>
                  </div>
                </div>
                <div className="p-3 bg-gradient-to-t from-card to-transparent">
                  <p className="text-xs text-muted-foreground mb-1">{pdf.date}</p>
                  <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">{pdf.title}</h3>
                </div>
              </div>
            </div>
          </a>
        );

      case 'slide-up-text':
        return (
          <a key={pdf.id} {...baseProps}>
            <div className="group cursor-pointer overflow-hidden rounded-xl">
              <div className="relative bg-card border border-border rounded-xl overflow-hidden">
                <div className="aspect-video overflow-hidden bg-muted">
                  <img
                    src={pdf.thumbnail}
                    alt={pdf.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                    onError={(e) => { e.currentTarget.src = placeholderUrl; }}
                  />
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <div className="p-3 pb-8 text-white">
                    <p className="text-xs opacity-80 mb-0.5">{pdf.date}</p>
                    <h3 className="font-semibold text-sm">{pdf.title}</h3>
                  </div>
                  <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13l-3 3m0 0l-3-3m3 3V8" />
                    </svg>
                  </div>
                </div>
                <div className="absolute top-3 left-3 opacity-100 group-hover:opacity-0 transition-opacity duration-300">
                  <div className="bg-white/90 rounded px-2 py-1">
                    <span className="text-xs font-medium text-gray-700">PDF</span>
                  </div>
                </div>
              </div>
            </div>
          </a>
        );

      case 'gradient-zoom':
        return (
          <a key={pdf.id} {...baseProps}>
            <div className="group cursor-pointer">
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 p-1 group-hover:from-primary/40 group-hover:via-secondary/40 group-hover:to-accent/40 transition-all duration-300">
                <div className="relative bg-card rounded-xl overflow-hidden">
                  <div className="aspect-video overflow-hidden bg-muted">
                    <img
                      src={pdf.thumbnail}
                      alt={pdf.title}
                      className="w-full h-full object-cover transition-all duration-500 group-hover:scale-125"
                      loading="lazy"
                      onError={(e) => { e.currentTarget.src = placeholderUrl; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 via-transparent to-secondary/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 animate-pulse">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-2 text-center">
                <p className="text-xs text-muted-foreground mb-1 group-hover:text-primary transition-colors">{pdf.date}</p>
                <h3 className="font-semibold text-sm text-foreground group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-secondary group-hover:bg-clip-text group-hover:text-transparent transition-all">{pdf.title}</h3>
              </div>
            </div>
          </a>
        );

      case 'split-layout':
        return (
          <a key={pdf.id} {...baseProps}>
            <div className="group cursor-pointer">
              <div className="flex items-center gap-3 bg-card p-3 rounded-lg border border-border group-hover:border-primary transition-all duration-300 group-hover:shadow-md">
                <div className="flex-shrink-0">
                  <div className="w-12 h-16 rounded overflow-hidden bg-muted relative">
                    <img
                      src={pdf.thumbnail}
                      alt={pdf.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      loading="lazy"
                      onError={(e) => { e.currentTarget.src = placeholderUrl; }}
                    />
                    <div className="absolute top-1 right-1">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-1 group-hover:text-primary transition-colors">{pdf.date}</p>
                  <h3 className="font-semibold text-sm text-foreground mb-1 group-hover:text-primary transition-colors truncate">{pdf.title}</h3>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <svg className="w-3 h-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3" />
                    </svg>
                    <span className="text-xs text-muted-foreground">Download PDF</span>
                  </div>
                </div>
              </div>
            </div>
          </a>
        );

      case 'minimal-underline':
        return (
          <a key={pdf.id} {...baseProps}>
            <div className="group cursor-pointer">
              <div className="space-y-2">
                <div className="relative aspect-video bg-muted rounded-md overflow-hidden">
                  <img
                    src={pdf.thumbnail}
                    alt={pdf.title}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                    loading="lazy"
                    onError={(e) => { e.currentTarget.src = placeholderUrl; }}
                  />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-4 h-4 bg-white/90 rounded-full flex items-center justify-center">
                      <svg className="w-2 h-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{pdf.date}</p>
                  <h3 className="font-medium text-sm text-foreground relative inline-block">
                    {pdf.title}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
                  </h3>
                </div>
              </div>
            </div>
          </a>
        );

      default: // 'default' style
        return (
          <a key={pdf.id} {...baseProps}>
            <div className="group">
              <div className="relative bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border border-border">
                <div className={`${aspectClass} overflow-hidden bg-muted`}>
                  <img
                    src={pdf.thumbnail}
                    alt={pdf.title}
                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => { e.currentTarget.src = placeholderUrl; }}
                  />
                  {hoveredId === pdf.id && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <ExternalLink className="w-8 h-8 text-white" />
                    </div>
                  )}
                </div>

                {/* PDF Indicator */}
                <div className={`absolute ${iconPosClass} bg-card/90 backdrop-blur-sm rounded-md px-2 py-1 shadow-sm`}>
                  <div className="flex items-center gap-1">
                    <FileText className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">PDF</span>
                  </div>
                </div>
              </div>
              
              {/* Clickable text outside the thumbnail frame */}
              <div className="mt-3 transition-colors duration-200">
                <p className="text-xs text-muted-foreground leading-tight mb-1 group-hover:text-[var(--accent-color)] hover:text-[var(--accent-color)]">
                  {pdf.date}
                </p>
                <h3 className="font-semibold text-sm line-clamp-2 leading-tight text-foreground group-hover:text-[var(--accent-color)] hover:text-[var(--accent-color)] transition-colors duration-200">
                  {pdf.title}
                </h3>
              </div>
            </div>
          </a>
        );
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4" style={{ ['--accent-color' as any]: settings.accentColor }}>
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
                    <div key={`grid-${currentGrid[0].id}`} className={`grid ${getGridCols()} gap-6`}>
                      {currentGrid.map((pdf) => (
                        <div key={pdf.id}>
                          {renderThumbnail(pdf)}
                        </div>
                      ))}
                    </div>
                  );
                  currentGrid = [];
                }

                // Render divider with spacing above
                renderedItems.push(
                  <div key={item.id} className="mt-20 mb-8 -mx-4 md:mx-0">
                    <div className="flex items-center gap-4 px-4 md:px-0">
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
                <div key={`grid-final`} className={`grid ${getGridCols()} gap-6`}>
                  {currentGrid.map((pdf) => (
                    <div key={pdf.id}>
                      {renderThumbnail(pdf)}
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