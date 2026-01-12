import { useState, useEffect, useCallback } from 'react';
import { FileText, ExternalLink, FileType, Presentation, Image } from 'lucide-react';
import { PDFThumbnailGenerator } from '@/utils/pdfThumbnailGenerator';
import { generateThumbnail } from '@/utils/supabaseClient';
import pdfPlaceholder from '@/assets/thumbnail-placeholder.png';
import { useLicense } from '@/hooks/useLicense';
import { useIsMobile } from '@/hooks/use-mobile';
import { DocumentRating } from '@/components/DocumentRating';
import DocumentLightbox from '@/components/DocumentLightbox';

interface PDF {
  id: string;
  title: string;
  date: string;
  pdfUrl: string;
  thumbnail: string;
  fileType?: 'pdf' | 'doc' | 'docx' | 'ppt' | 'pptx' | 'xls' | 'xlsx' | 'jpg' | 'jpeg' | 'png' | 'gif' | 'webp' | 'odt' | 'ods' | 'odp' | 'rtf' | 'txt' | 'csv' | 'svg' | 'ico' | 'zip' | 'rar' | '7z' | 'epub' | 'mobi' | 'mp3' | 'wav' | 'ogg' | 'mp4' | 'mov' | 'webm';
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
  galleryId?: string;
  showRatings?: boolean;
  lightboxEnabled?: boolean;
  settings?: {
    thumbnailStyle: string;
    accentColor: string;
    thumbnailShape: string;
    pdfIconPosition: string;
    defaultPlaceholder: string;
    thumbnailSize?: string;
    showFileTypeBadges?: boolean;
    showTitlesSubtitles?: boolean;
  };
}

const PDFGallery = ({ 
  items = [], 
  title = "PDF Gallery",
  description = "Browse our collection of PDF documents",
  galleryId = "default",
  showRatings = false,
  lightboxEnabled = false,
  settings = {
    thumbnailStyle: 'default',
    accentColor: '#7FB3DC',
    thumbnailShape: '3-2',
    pdfIconPosition: 'top-right',
    defaultPlaceholder: 'default',
    thumbnailSize: 'four-rows',
    showFileTypeBadges: true,
    showTitlesSubtitles: true
  }
}: PDFGalleryProps) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  // Initialize with items immediately to prevent shape flash during loading
  const [itemsWithThumbnails, setItemsWithThumbnails] = useState<GalleryItem[]>(items);
  const [isGeneratingThumbnails, setIsGeneratingThumbnails] = useState(false);
  const [thumbnails, setThumbnails] = useState<{ [key: string]: string }>({});
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  
  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  
  const isMobile = useIsMobile();
  const isAndroid = /Android/i.test(navigator.userAgent || '');
  const license = useLicense();
  const placeholderUrl = (settings?.defaultPlaceholder && settings.defaultPlaceholder !== 'default')
    ? settings.defaultPlaceholder
    : pdfPlaceholder;

  // Get only PDF items (not dividers) for lightbox navigation
  const pdfItems = (itemsWithThumbnails.length > 0 ? itemsWithThumbnails : items).filter(
    (item): item is PDF => 'pdfUrl' in item
  );

  const openLightbox = useCallback((pdfId: string) => {
    const index = pdfItems.findIndex(p => p.id === pdfId);
    if (index !== -1) {
      setLightboxIndex(index);
      setLightboxOpen(true);
    }
  }, [pdfItems]);

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
      setIsGeneratingThumbnails(false);
      setInitialLoadDone(true);
      return;
    }

    // Immediately sync items on first load to prevent shape flash
    if (!initialLoadDone) {
      setItemsWithThumbnails(items);
    }

    console.log('PDFGallery: Received', items.length, 'items');
    setIsGeneratingThumbnails(true);
    
    // Initialize all items with placeholders or existing thumbnails first
    const initialItems = items.map(item => {
      if ('pdfUrl' in item) {
        const fileType = getItemFileType(item);
        // For image files, use the original URL as thumbnail
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileType)) {
          return { ...item, thumbnail: (item as PDF).pdfUrl };
        }
        // For PDFs with existing thumbnails, keep them
        if (item.thumbnail && item.thumbnail !== placeholderUrl && !(item as any).thumbnail?.includes('placeholder')) {
          return item;
        }
        // Check cache
        const cacheKey = `pdf_thumbnail_${(item as PDF).pdfUrl}`;
        const cachedThumbnail = localStorage.getItem(cacheKey);
        if (cachedThumbnail) {
          return { ...item, thumbnail: cachedThumbnail };
        }
        // Default to placeholder
        return { ...item, thumbnail: placeholderUrl };
      }
      return item;
    });
    
    // Set initial items immediately so gallery shows even before thumbnails generate
    setItemsWithThumbnails(initialItems);
    console.log('PDFGallery: Initial items set with placeholders');
    
    // Extract PDFs that need thumbnail generation
    const pdfsNeedingGeneration = initialItems.filter((item): item is PDF => 
      'pdfUrl' in item && 
      item.thumbnail === placeholderUrl &&
      !['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(getItemFileType(item))
    );
    
    if (pdfsNeedingGeneration.length > 0) {
      console.log('PDFGallery: Need to generate', pdfsNeedingGeneration.length, 'thumbnails');
      
      const generateThumbnails = async () => {
        try {
          const thumbnailPromises = pdfsNeedingGeneration.map(async (pdf) => {
            try {
              console.log('PDFGallery: Generating thumbnail for', pdf.title);
              const result = await PDFThumbnailGenerator.generateThumbnail(pdf.pdfUrl);
              if (result.success && result.dataUrl) {
                console.log('PDFGallery: Successfully generated thumbnail for', pdf.title);
                // Cache the thumbnail
                const cacheKey = `pdf_thumbnail_${pdf.pdfUrl}`;
                try {
                  localStorage.setItem(cacheKey, result.dataUrl);
                } catch (storageError) {
                  console.warn('Could not cache thumbnail:', storageError);
                }
                return { url: pdf.pdfUrl, dataUrl: result.dataUrl, success: true };
              } else {
                console.warn('PDFGallery: Failed to generate thumbnail for', pdf.title, result.error);
                return { url: pdf.pdfUrl, success: false };
              }
            } catch (error) {
              console.error('PDFGallery: Error generating thumbnail for', pdf.title, error);
              return { url: pdf.pdfUrl, success: false };
            }
          });
          
          const results = await Promise.all(thumbnailPromises);
          console.log('PDFGallery: Thumbnail generation complete', results.filter(r => r.success).length, 'succeeded');
          
          // Update items with generated thumbnails
          const updatedItems = initialItems.map((item) => {
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
          console.error('PDFGallery: Error during thumbnail generation batch:', error);
        } finally {
          setIsGeneratingThumbnails(false);
        }
      };
      
      // Small delay to ensure DOM is ready
      setTimeout(generateThumbnails, 100);
    } else {
      console.log('PDFGallery: No thumbnails to generate, all items ready');
      setIsGeneratingThumbnails(false);
    }
    setInitialLoadDone(true);
  }, [items, placeholderUrl]);


  const baseItems = itemsWithThumbnails.length > 0 ? itemsWithThumbnails : items;
  const displayItems = baseItems.map((item) => {
    if ('pdfUrl' in item) {
      const thumb = (item as PDF).thumbnail;
      return { ...item, thumbnail: thumb && thumb.trim() ? thumb : placeholderUrl } as PDF;
    }
    return item;
  });

  // Map settings to classes - support both old and new shape value names
  const getAspectClass = () => {
    switch (settings.thumbnailShape) {
      case '1-1':
      case '1:1':
      case 'square':
      case 'square-1-1':
        return 'aspect-square';
      case '3-2':
      case '3:2':
      case 'landscape-3-2':
        return 'aspect-[3/2]';
      case '2-3':
      case '2:3':
      case 'portrait-2-3':
        return 'aspect-[2/3]';
      case '16-9':
      case '16:9':
      case 'landscape-16-9':
        return 'aspect-video';
      case '9-16':
      case '9:16':
        return 'aspect-[9/16]';
      case 'auto':
        return ''; // No fixed aspect for masonry
      default:
        return 'aspect-[3/2]'; // Default to 3:2
    }
  };
  const aspectClass = getAspectClass();

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

  // Masonry columns based on thumbnail size setting
  const getMasonryCols = () => {
    switch (settings.thumbnailSize) {
      case 'three-rows': return 'columns-1 sm:columns-2 md:columns-3';
      case 'five-rows': return 'columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5';
      case 'four-rows':
      default: return 'columns-1 sm:columns-2 md:columns-3 lg:columns-4';
    }
  };

  // Check if masonry layout is active
  const isMasonry = settings.thumbnailShape === 'auto';

  // Check display options (default to true)
  const showFileTypeBadges = settings.showFileTypeBadges !== false;
  const showTitlesSubtitles = settings.showTitlesSubtitles !== false;

  // Get file type icon and color - use first 3 characters of extension
  const getFileTypeIcon = (fileType: string = 'pdf') => {
    const label = fileType.substring(0, 3).toUpperCase();
    return { icon: FileText, color: 'text-muted-foreground', bgColor: 'bg-muted', label };
  };

  // Render thumbnail based on style
  const renderThumbnail = (pdf: PDF) => {
    const httpsUrl = PDFThumbnailGenerator.toHttps(pdf.pdfUrl);
    const isAndroid = /Android/i.test(navigator.userAgent || '');
    
    const baseProps = {
      className: "block cursor-pointer",
      onMouseEnter: () => setHoveredId(pdf.id),
      onMouseLeave: () => setHoveredId(null),
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // Lightbox is desktop-only; on mobile, fall through to open in new tab
        if (lightboxEnabled && !isMobile) {
          openLightbox(pdf.id);
        } else {
          // Open in new tab (fallback behavior when lightbox is disabled)
          if (isAndroid) {
            const encodedUrl = encodeURIComponent(httpsUrl);
            const googleViewerUrl = `https://docs.google.com/gview?embedded=true&url=${encodedUrl}`;
            try { 
              (window.top || window).open(googleViewerUrl, '_blank');
            } catch { 
              window.open(googleViewerUrl, '_blank');
            }
          } else if (isMobile) {
            try {
              (window.top || window).location.href = httpsUrl;
            } catch {
              window.location.href = httpsUrl;
            }
          } else {
            window.open(httpsUrl, '_blank', 'noopener,noreferrer');
          }
        }
      }
    };

    // Force default style for free version
    const effectiveStyle = license.isPro ? settings.thumbnailStyle : 'default';
    const fileTypeInfo = getFileTypeIcon(getItemFileType(pdf));
    const IconComponent = fileTypeInfo.icon;

    switch (effectiveStyle) {
      case 'elevated-card':
        return (
            <div key={pdf.id} {...baseProps}>
             <div className="group cursor-pointer">
               <div className="relative bg-card rounded-2xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-300 transform group-hover:-translate-y-2 border border-border">
                 <div className={`${aspectClass || 'aspect-[4/3]'} overflow-hidden bg-muted`}>
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
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-sm text-foreground transition-colors truncate flex-1 min-w-0" style={{ color: hoveredId === pdf.id ? settings.accentColor : undefined }}>{pdf.title}</h3>
                    {showRatings && (
                      <DocumentRating documentId={pdf.id} galleryId={galleryId} size="sm" showCount={false} className="mr-2" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{pdf.date}</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'slide-up-text':
        return (
            <div key={pdf.id} {...baseProps}>
             <div className="group cursor-pointer overflow-hidden rounded-xl">
               <div className="relative bg-card border border-border rounded-xl overflow-hidden">
                 <div className={`${aspectClass || 'aspect-video'} overflow-hidden bg-muted`}>
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
                {showTitlesSubtitles && (
                  <div className="absolute bottom-2 left-0 right-0 px-4 pb-3 text-white translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-sm leading-tight truncate text-white flex-1 min-w-0">{pdf.title}</h3>
                      {showRatings && (
                        <DocumentRating documentId={pdf.id} galleryId={galleryId} size="sm" showCount={false} className="mr-2 [&_button]:text-white [&_svg]:text-white" />
                      )}
                    </div>
                    <p className="text-xs opacity-90 mt-1 truncate text-white">{pdf.date}</p>
                  </div>
                )}
                {showFileTypeBadges && (
                  <div className="absolute top-3 left-3 opacity-100 group-hover:opacity-0 transition-opacity duration-300">
                    <div className="bg-white/90 rounded px-2 py-1">
                      <span className="text-xs font-medium text-muted-foreground">{fileTypeInfo.label}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'gradient-zoom':
        return (
          <div key={pdf.id} {...baseProps}>
            <div className="group cursor-pointer">
              <div 
                className="relative rounded-2xl overflow-hidden transition-all duration-300"
                style={{
                  padding: '3px',
                  background: `linear-gradient(135deg, ${settings.accentColor}, transparent, ${settings.accentColor})`,
                }}
              >
                <div className="relative bg-card rounded-xl overflow-hidden">
                  <div className={`${aspectClass || 'aspect-video'} overflow-hidden bg-muted`}>
                    <img
                      src={pdf.thumbnail}
                      alt={pdf.title}
                      className="w-full h-full object-cover transition-all duration-500 group-hover:scale-125"
                      loading="lazy"
                      onError={(e) => { e.currentTarget.src = placeholderUrl; }}
                    />
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: `linear-gradient(135deg, ${settings.accentColor}cc 0%, transparent 50%, ${settings.accentColor}cc 100%)`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="mt-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-sm text-foreground transition-colors truncate flex-1 min-w-0" style={{ color: hoveredId === pdf.id ? settings.accentColor : undefined }}>{pdf.title}</h3>
                  {showRatings && (
                    <DocumentRating documentId={pdf.id} galleryId={galleryId} size="sm" showCount={false} className="mr-2" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1 transition-colors text-center" style={{ color: hoveredId === pdf.id ? settings.accentColor : undefined }}>{pdf.date}</p>
              </div>
            </div>
          </div>
        );

      case 'split-layout':
        return (
          <div key={pdf.id} {...baseProps}>
              <div className="group cursor-pointer">
               <div className="flex items-center gap-3 bg-card p-3 rounded-lg border border-border transition-all duration-300 group-hover:shadow-md" style={{ borderColor: hoveredId === pdf.id ? settings.accentColor : undefined }}>
                 <div className="flex-shrink-0">
                   <div className={`w-12 ${aspectClass || 'aspect-[3/4]'} rounded overflow-hidden bg-muted relative`}>
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
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-sm text-foreground mb-1 transition-colors truncate flex-1 min-w-0" style={{ color: hoveredId === pdf.id ? settings.accentColor : undefined }}>{pdf.title}</h3>
                    {showRatings && (
                      <DocumentRating documentId={pdf.id} galleryId={galleryId} size="sm" showCount={false} className="mr-2" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground transition-colors" style={{ color: hoveredId === pdf.id ? settings.accentColor : undefined }}>{pdf.date}</p>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <svg className="w-3 h-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3" />
                    </svg>
                    <span className="text-xs text-muted-foreground">View Document</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'minimal-underline':
        return (
            <div key={pdf.id} {...baseProps}>
             <div className="group cursor-pointer">
               <div className="space-y-2">
                 <div className={`relative ${aspectClass || 'aspect-video'} bg-muted overflow-hidden`}>
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
                <div className="mt-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm text-foreground relative inline-block max-w-full truncate">
                        {pdf.title}
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300" style={{ backgroundColor: settings.accentColor }}></span>
                      </h3>
                    </div>
                    {showRatings && (
                      <DocumentRating documentId={pdf.id} galleryId={galleryId} size="sm" showCount={false} className="mr-2" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{pdf.date}</p>
                </div>
              </div>
            </div>
          </div>
        );

      default: // 'default' style
        return (
          <div key={pdf.id} {...baseProps}>
            <div className="group">
              <div className="relative bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border border-border">
                <div className={`${aspectClass || 'aspect-[3/2]'} overflow-hidden bg-muted`}>
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
                {showFileTypeBadges && (
                  <div className={`absolute ${iconPosClass} bg-card/90 backdrop-blur-sm rounded-md px-2 py-1 shadow-sm`}>
                    <div className="flex items-center gap-1">
                      <IconComponent className={`w-3 h-3 ${fileTypeInfo.color}`} />
                      <span className={`text-xs font-medium ${fileTypeInfo.color}`}>{fileTypeInfo.label}</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Clickable text outside the thumbnail frame */}
              {showTitlesSubtitles && (
                <div className="mt-3 transition-colors duration-200">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-sm leading-tight text-foreground group-hover:text-[var(--accent-color)] hover:text-[var(--accent-color)] transition-colors duration-200 truncate flex-1 min-w-0">
                      {pdf.title}
                    </h3>
                    {showRatings && (
                      <DocumentRating 
                        documentId={pdf.id} 
                        galleryId={galleryId} 
                        size="sm" 
                        showCount={false}
                        className="mr-2"
                      />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-tight mt-1 group-hover:text-[var(--accent-color)] hover:text-[var(--accent-color)]">
                    {pdf.date}
                  </p>
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-2" style={{ ['--accent-color' as any]: settings.accentColor }}>
      {isGeneratingThumbnails && (
        <div className="sticky top-4 z-50 flex justify-center mb-4">
          <div className="bg-card border border-border rounded-lg shadow-lg px-6 py-4 flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-foreground">Generating thumbnails...</p>
          </div>
        </div>
      )}

      {displayItems.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No content yet</h3>
          <p className="text-muted-foreground">Documents will appear here when they are added.</p>
        </div>
      ) : (
        /* Grid or Masonry view for both mobile and desktop */
        <div className="space-y-8">
          {(() => {
            let currentGrid: PDF[] = [];
            const renderedItems: JSX.Element[] = [];

            displayItems.forEach((item, index) => {
              if ('type' in item && item.type === 'divider') {
                // Render previous grid if exists
                if (currentGrid.length > 0) {
                  if (isMasonry) {
                    // True masonry layout using CSS columns
                    renderedItems.push(
                      <div key={`grid-${currentGrid[0].id}`} className={`${getMasonryCols()} gap-x-6`} style={{ columnGap: '1.5rem' }}>
                        {currentGrid.map((pdf) => (
                          <div key={pdf.id} className="break-inside-avoid mb-6" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                            {renderThumbnail(pdf)}
                          </div>
                        ))}
                      </div>
                    );
                  } else {
                    // Regular grid layout
                    renderedItems.push(
                      <div key={`grid-${currentGrid[0].id}`} className={`grid ${getGridCols()} gap-6`}>
                        {currentGrid.map((pdf) => (
                          <div key={pdf.id}>
                            {renderThumbnail(pdf)}
                          </div>
                        ))}
                      </div>
                    );
                  }
                  currentGrid = [];
                }

                // Render divider as a "chapter" break: more vertical space above than below
                const isFirstBlock = renderedItems.length === 0;
                renderedItems.push(
                  <div key={item.id} className={`${isFirstBlock ? 'pt-6' : 'pt-14'} pb-5 -mx-4 md:mx-0`}>
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
              if (isMasonry) {
                // True masonry layout using CSS columns
                renderedItems.push(
                  <div key={`grid-final`} className={`${getMasonryCols()} gap-x-6`} style={{ columnGap: '1.5rem' }}>
                    {currentGrid.map((pdf) => (
                      <div key={pdf.id} className="break-inside-avoid mb-6" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                        {renderThumbnail(pdf)}
                      </div>
                    ))}
                  </div>
                );
              } else {
                // Regular grid layout
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
            }

            return renderedItems;
          })()}
        </div>
      )}

      {/* Full Screen Immersive Lightbox */}
      <DocumentLightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        documents={pdfItems}
        currentIndex={lightboxIndex}
        onNavigate={setLightboxIndex}
        accentColor={settings.accentColor}
      />
    </div>
  );
};

export default PDFGallery;