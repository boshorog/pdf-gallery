import { useState, useEffect } from 'react';
import { FileText, ExternalLink, FileType, Presentation, Image } from 'lucide-react';
import { PDFThumbnailGenerator } from '@/utils/pdfThumbnailGenerator';
import { generateThumbnail } from '@/utils/supabaseClient';
import pdfPlaceholder from '@/assets/pdf-placeholder.svg';
import { useLicense } from '@/hooks/useLicense';
import { useIsMobile } from '@/hooks/use-mobile';

interface PDF {
  id: string;
  title: string;
  date: string;
  pdfUrl: string;
  thumbnail: string;
  fileType?: 'pdf' | 'doc' | 'docx' | 'ppt' | 'pptx' | 'xls' | 'xlsx' | 'jpg' | 'jpeg' | 'png' | 'gif' | 'webp';
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
  const isMobile = useIsMobile();
  const isAndroid = /Android/i.test(navigator.userAgent || '');
  const license = useLicense();
  const placeholderUrl = (settings?.defaultPlaceholder && settings.defaultPlaceholder !== 'default')
    ? settings.defaultPlaceholder
    : pdfPlaceholder;

  const getItemFileType = (it: any): string => {
    try {
      const url = 'pdfUrl' in it ? (it.pdfUrl || '') : '';
      const title = 'title' in it ? (it.title || '') : '';
      const thumb = 'thumbnail' in it ? (it.thumbnail || '') : '';
      const source = url || title || thumb;
      const ext = (source.split('.').pop() || '').toLowerCase();
      if (!ext) return (it.fileType || 'pdf');
      return ext;
    } catch {
      return 'pdf';
    }
  };
  useEffect(() => {
    // Notify parent page to allow height auto-resize
    window.parent?.postMessage({ type: 'pdf-gallery:height-check' }, '*');
    
    if (items.length === 0) {
      setItemsWithThumbnails([]);
      return;
    }

    setIsGeneratingThumbnails(true);
    
    // Extract PDFs that need thumbnail generation (excluding images which use themselves as thumbnails)
    const pdfsNeedingThumbnails = items.filter((item): item is PDF => 
      'pdfUrl' in item && 
      (!item.thumbnail || item.thumbnail === placeholderUrl || (item as any).thumbnail?.includes('placeholder')) &&
      !['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(getItemFileType(item))
    );
    
    if (pdfsNeedingThumbnails.length > 0) {
      console.log('Starting thumbnail generation...');
      
      // Check cached thumbnails first and set image files to use themselves as thumbnails
      const itemsWithCached = items.map(item => {
        if ('pdfUrl' in item) {
          // For image files, use the original URL as thumbnail
          if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(getItemFileType(item))) {
            return { ...item, thumbnail: (item as PDF).pdfUrl };
          }
          
          const cacheKey = `pdf_thumbnail_${(item as PDF).pdfUrl}`;
          const cachedThumbnail = localStorage.getItem(cacheKey);
          if (cachedThumbnail) {
            return { ...item, thumbnail: cachedThumbnail };
          }
          return { ...item, thumbnail: placeholderUrl };
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


  const baseItems = itemsWithThumbnails.length > 0 ? itemsWithThumbnails : items;
  const displayItems = baseItems.map((item) => {
    if ('pdfUrl' in item) {
      const thumb = (item as PDF).thumbnail;
      return { ...item, thumbnail: thumb && thumb.trim() ? thumb : placeholderUrl } as PDF;
    }
    return item;
  });

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

  // Get file type icon and color
  const getFileTypeIcon = (fileType: string = 'pdf') => {
    let label: 'PDF' | 'DOC' | 'PPT' | 'IMG' = 'PDF';
    if (fileType === 'doc' || fileType === 'docx') label = 'DOC';
    else if (fileType === 'ppt' || fileType === 'pptx') label = 'PPT';
    else if (fileType === 'jpg' || fileType === 'jpeg' || fileType === 'png' || fileType === 'gif' || fileType === 'webp') label = 'IMG';
    return { icon: FileText, color: 'text-muted-foreground', bgColor: 'bg-muted', label };
  };

  // Render thumbnail based on style
  const renderThumbnail = (pdf: PDF) => {
    const httpsUrl = PDFThumbnailGenerator.toHttps(pdf.pdfUrl);
    const baseProps = {
      href: httpsUrl,
      target: isAndroid ? '_self' : (isMobile ? '_top' : '_blank'),
      rel: isAndroid || isMobile ? undefined : 'noopener noreferrer',
      className: "block",
      onMouseEnter: () => setHoveredId(pdf.id),
      onMouseLeave: () => setHoveredId(null),
      onClick: (e: React.MouseEvent) => {
        if (isAndroid) {
          e.preventDefault();
          // Use Google Docs viewer for Android compatibility
          const encodedUrl = encodeURIComponent(httpsUrl);
          const googleViewerUrl = `https://docs.google.com/gview?embedded=true&url=${encodedUrl}`;
          try { 
            (window.top || window).open(googleViewerUrl, '_blank');
          } catch { 
            window.open(googleViewerUrl, '_blank');
          }
        }
      }
    } as const;

    // Force default style for free version
    const effectiveStyle = license.isPro ? settings.thumbnailStyle : 'default';
    const fileTypeInfo = getFileTypeIcon(getItemFileType(pdf));
    const IconComponent = fileTypeInfo.icon;

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
                  <div 
                    className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg transition-all duration-300"
                    style={{ backgroundColor: hoveredId === pdf.id ? settings.accentColor : undefined, color: hoveredId === pdf.id ? 'white' : undefined }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3" />
                    </svg>
                  </div>
                </div>
                <div className="p-3 bg-gradient-to-t from-card to-transparent">
                  <h3 className="font-semibold text-sm text-foreground transition-colors" style={{ color: hoveredId === pdf.id ? settings.accentColor : undefined }}>{pdf.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{pdf.date}</p>
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
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-black/95 via-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="absolute bottom-2 left-0 right-0 px-4 pb-3 text-white translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <h3 className="font-bold text-sm leading-tight truncate text-white">{pdf.title}</h3>
                  <p className="text-xs opacity-90 mt-1 truncate text-white">{pdf.date}</p>
                </div>
                <div className="absolute top-3 left-3 opacity-100 group-hover:opacity-0 transition-opacity duration-300">
                  <div className="bg-white/90 rounded px-2 py-1">
                    <span className="text-xs font-medium text-muted-foreground">{fileTypeInfo.label}</span>
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
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[var(--accent-color)]/20 via-[var(--accent-color)]/10 to-[var(--accent-color)]/20 p-1 group-hover:from-[var(--accent-color)]/40 group-hover:via-[var(--accent-color)]/30 group-hover:to-[var(--accent-color)]/40 transition-all duration-300">
                <div className="relative bg-card rounded-xl overflow-hidden">
                  <div className="aspect-video overflow-hidden bg-muted">
                    <img
                      src={pdf.thumbnail}
                      alt={pdf.title}
                      className="w-full h-full object-cover transition-all duration-500 group-hover:scale-125"
                      loading="lazy"
                      onError={(e) => { e.currentTarget.src = placeholderUrl; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-[var(--accent-color)]/30 via-transparent to-[var(--accent-color)]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </div>
              </div>
              <div className="mt-2 text-center">
                <h3 className="font-semibold text-sm text-foreground transition-colors" style={{ color: hoveredId === pdf.id ? settings.accentColor : undefined }}>{pdf.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 transition-colors" style={{ color: hoveredId === pdf.id ? settings.accentColor : undefined }}>{pdf.date}</p>
              </div>
            </div>
          </a>
        );

      case 'split-layout':
        return (
          <a key={pdf.id} {...baseProps}>
            <div className="group cursor-pointer">
              <div className="flex items-center gap-3 bg-card p-3 rounded-lg border border-border transition-all duration-300 group-hover:shadow-md" style={{ borderColor: hoveredId === pdf.id ? settings.accentColor : undefined }}>
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
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: settings.accentColor }}></div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-foreground mb-1 transition-colors truncate" style={{ color: hoveredId === pdf.id ? settings.accentColor : undefined }}>{pdf.title}</h3>
                  <p className="text-xs text-muted-foreground transition-colors" style={{ color: hoveredId === pdf.id ? settings.accentColor : undefined }}>{pdf.date}</p>
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
              <h3 className="font-medium text-sm text-foreground relative inline-block">
                {pdf.title}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300" style={{ backgroundColor: settings.accentColor }}></span>
              </h3>
              <p className="text-xs text-muted-foreground mt-1">{pdf.date}</p>
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

                {/* File Type Indicator */}
                <div className={`absolute ${iconPosClass} bg-card/90 backdrop-blur-sm rounded-md px-2 py-1 shadow-sm`}>
                  <div className="flex items-center gap-1">
                    <IconComponent className={`w-3 h-3 ${fileTypeInfo.color}`} />
                    <span className={`text-xs font-medium ${fileTypeInfo.color}`}>{fileTypeInfo.label}</span>
                  </div>
                </div>
              </div>
              
              {/* Clickable text outside the thumbnail frame */}
              <div className="mt-3 transition-colors duration-200">
                <h3 className="font-semibold text-sm leading-tight text-foreground group-hover:text-[var(--accent-color)] hover:text-[var(--accent-color)] transition-colors duration-200 truncate">
                  {pdf.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-tight mt-1 group-hover:text-[var(--accent-color)] hover:text-[var(--accent-color)]">
                  {pdf.date}
                </p>
              </div>
            </div>
          </a>
        );
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-2" style={{ ['--accent-color' as any]: settings.accentColor }}>
      {isGeneratingThumbnails && (
        <div className="text-center mb-6 flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-muted-foreground">Generating thumbnails...</p>
        </div>
      )}

      {displayItems.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No content yet</h3>
          <p className="text-muted-foreground">Documents will appear here when they are added.</p>
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