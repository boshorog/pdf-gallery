import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Download, FileText, Loader2, ExternalLink } from 'lucide-react';
import { PDFThumbnailGenerator } from '@/utils/pdfThumbnailGenerator';
import PdfJsViewer from '@/components/PdfJsViewer';

interface Document {
  id: string;
  title: string;
  date: string;
  pdfUrl: string;
  thumbnail: string;
  fileType?: string;
}

interface DocumentLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  documents: Document[];
  currentIndex: number;
  onNavigate: (index: number) => void;
  accentColor?: string;
}

const DocumentLightbox = ({
  isOpen,
  onClose,
  documents,
  currentIndex,
  onNavigate,
  accentColor = '#7FB3DC'
}: DocumentLightboxProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);

  const doc = documents[currentIndex];

  const resolveUrl = useCallback((url: string) => {
    if (!url) return '';
    try {
      // Absolute URL already
      return new URL(url).toString();
    } catch {
      // Relative URL -> resolve against current origin
      try {
        return new URL(url, window.location.origin).toString();
      } catch {
        return url;
      }
    }
  }, []);

  const httpsUrl = doc ? resolveUrl(PDFThumbnailGenerator.toHttps(doc.pdfUrl)) : '';

  // Get file extension
  const getFileType = useCallback((document: Document): string => {
    const url = document.pdfUrl || '';
    const ext = url.split('.').pop()?.toLowerCase() || document.fileType || 'pdf';
    return ext;
  }, []);

  const fileType = doc ? getFileType(doc) : 'pdf';
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileType);
  const isPdf = fileType === 'pdf';
  const isVideo = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'].includes(fileType);
  const isAudio = ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'].includes(fileType);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          if (currentIndex > 0) onNavigate(currentIndex - 1);
          break;
        case 'ArrowRight':
          if (currentIndex < documents.length - 1) onNavigate(currentIndex + 1);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, documents.length, onClose, onNavigate]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // When embedded via shortcode iframe: ask the parent page to temporarily expand
  // the iframe to full viewport while the lightbox is open.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.parent === window) return;

    const token = new URLSearchParams(window.location.search).get('frameToken') || undefined;
    const post = (type: string) => {
      try {
        window.parent.postMessage({ type, token }, '*');
      } catch {
        // cross-origin blocked, ignore
      }
    };

    if (isOpen) {
      // Fire multiple times with staggered delays to ensure parent receives message
      post('pdf-gallery:lightbox-open');
      const t1 = window.setTimeout(() => post('pdf-gallery:lightbox-open'), 50);
      const t2 = window.setTimeout(() => post('pdf-gallery:lightbox-open'), 150);
      const t3 = window.setTimeout(() => post('pdf-gallery:lightbox-open'), 300);
      return () => {
        window.clearTimeout(t1);
        window.clearTimeout(t2);
        window.clearTimeout(t3);
        post('pdf-gallery:lightbox-close');
        window.setTimeout(() => post('pdf-gallery:lightbox-close'), 100);
      };
    }

    post('pdf-gallery:lightbox-close');
    const t = window.setTimeout(() => post('pdf-gallery:lightbox-close'), 100);
    return () => window.clearTimeout(t);
  }, [isOpen]);

  // Reset loading state when document changes
  useEffect(() => {
    setIsLoading(true);
  }, [currentIndex]);

  // Safety: if an embed never fires onLoad (blocked/slow), stop the spinner
  useEffect(() => {
    if (!isOpen) return;
    if (!isLoading) return;

    const t = window.setTimeout(() => setIsLoading(false), 8000);
    return () => window.clearTimeout(t);
  }, [isOpen, currentIndex, isLoading]);

  // Auto-hide controls after 3 seconds of no interaction
  useEffect(() => {
    if (!isOpen) return;

    let timeout: NodeJS.Timeout;
    const resetTimeout = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowControls(false), 3000);
    };

    resetTimeout();
    window.addEventListener('mousemove', resetTimeout);
    window.addEventListener('touchstart', resetTimeout);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('mousemove', resetTimeout);
      window.removeEventListener('touchstart', resetTimeout);
    };
  }, [isOpen, currentIndex]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) onNavigate(currentIndex - 1);
  }, [currentIndex, onNavigate]);

  const handleNext = useCallback(() => {
    if (currentIndex < documents.length - 1) onNavigate(currentIndex + 1);
  }, [currentIndex, documents.length, onNavigate]);

  // Get Google Docs viewer URL for non-PDF documents
  const getViewerUrl = useCallback(() => {
    const encodedUrl = encodeURIComponent(httpsUrl);
    return `https://docs.google.com/gview?embedded=true&url=${encodedUrl}`;
  }, [httpsUrl]);

  const handleDownload = useCallback(async () => {
    if (!httpsUrl || !doc) return;

    const fileNameFromUrl = (() => {
      try {
        const u = new URL(httpsUrl);
        const last = u.pathname.split('/').pop() || '';
        return last || `${doc.title}.${fileType}`;
      } catch {
        return `${doc.title}.${fileType}`;
      }
    })();

    // Best effort: try native download attribute first
    try {
      const a = document.createElement('a');
      a.href = httpsUrl;
      a.download = fileNameFromUrl;
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      a.remove();
      return;
    } catch {
      // ignore
    }

    // Fallback: fetch -> blob (works when CORS allows)
    try {
      const res = await fetch(httpsUrl, { mode: 'cors' });
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fileNameFromUrl;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
      return;
    } catch {
      // Final fallback
      window.open(httpsUrl, '_blank', 'noopener,noreferrer');
    }
  }, [httpsUrl, doc, fileType]);

  const handlePopOut = useCallback(() => {
    if (!httpsUrl) return;

    // Different file types get different treatment:
    // - PDF, video, audio, images: open directly (browsers handle these natively)
    // - Other documents (Word, Excel, etc.): use Google Docs viewer
    const opensNatively = isPdf || isImage || isVideo || isAudio;
    const popUrl = opensNatively ? httpsUrl : getViewerUrl();
    window.open(popUrl, '_blank', 'noopener,noreferrer');
  }, [httpsUrl, isPdf, isImage, isVideo, isAudio, getViewerUrl]);

  // Touch swipe handling for mobile
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) handleNext();
    if (isRightSwipe) handlePrev();
  };

  if (!isOpen || !doc) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/85"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Top bar */}
      <div 
        className={`absolute top-0 left-0 right-0 flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 bg-gradient-to-b from-black/70 to-transparent z-10 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <div 
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${accentColor}33` }}
          >
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-white font-medium text-sm sm:text-base truncate">{doc.title}</h2>
            <p className="text-white/50 text-xs sm:text-sm">{doc.date}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2">
          <button 
            onClick={handleDownload}
            className="text-white/70 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-all"
            title="Download"
          >
            <Download className="w-5 h-5" />
          </button>
          <button 
            onClick={handlePopOut}
            className="text-white/70 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-all"
            title="Open in new tab"
          >
            <ExternalLink className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-white/20 mx-1 sm:mx-2 hidden sm:block" />
          <button 
            onClick={onClose}
            className="text-white/70 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-all"
            title="Close (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Content - Maximum size, with space for side nav arrows */}
      <div className="h-full flex items-center justify-center pt-14 sm:pt-20 pb-20 sm:pb-24 px-12 sm:px-20 md:px-24">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-20" style={{ pointerEvents: 'none' }}>
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 text-white animate-spin" />
              <p className="text-white/70 text-sm">Loading document...</p>
            </div>
          </div>
        )}
        
        {isImage ? (
          <img 
            src={httpsUrl}
            alt={doc.title}
            className={`max-w-full max-h-full object-contain rounded-lg sm:rounded-xl shadow-2xl transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
          />
        ) : isPdf ? (
          <div className={`w-full h-full max-w-5xl mx-auto flex flex-col rounded-lg sm:rounded-xl shadow-2xl overflow-hidden transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
            <PdfJsViewer url={httpsUrl} title={doc.title} onLoaded={() => setIsLoading(false)} />
          </div>
        ) : isVideo ? (
          <video
            src={httpsUrl}
            controls
            autoPlay
            className={`max-w-full max-h-full rounded-lg sm:rounded-xl shadow-2xl transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
            onLoadedData={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
          />
        ) : isAudio ? (
          <div className={`flex flex-col items-center justify-center gap-6 p-8 bg-white/10 rounded-lg sm:rounded-xl shadow-2xl transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
            <FileText className="w-24 h-24 text-white/50" />
            <h3 className="text-white text-lg font-medium">{doc.title}</h3>
            <audio
              src={httpsUrl}
              controls
              autoPlay
              className="w-full max-w-md"
              onLoadedData={() => setIsLoading(false)}
              onError={() => setIsLoading(false)}
            />
          </div>
        ) : (
          <iframe
            src={getViewerUrl()}
            title={doc.title}
            className={`w-full h-full rounded-lg sm:rounded-xl shadow-2xl bg-white transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
            onLoad={() => setIsLoading(false)}
            style={{ border: 'none' }}
          />
        )}
      </div>
      
      {/* Side navigation - hidden on very small screens, uses swipe instead */}
      {documents.length > 1 && (
        <>
          <button 
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-14 sm:h-14 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed rounded-full items-center justify-center transition-all z-10 hidden sm:flex ${showControls ? 'opacity-100' : 'opacity-0'}`}
          >
            <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </button>
          <button 
            onClick={handleNext}
            disabled={currentIndex === documents.length - 1}
            className={`absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-14 sm:h-14 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed rounded-full items-center justify-center transition-all z-10 hidden sm:flex ${showControls ? 'opacity-100' : 'opacity-0'}`}
          >
            <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </button>
        </>
      )}
      
      {/* Bottom thumbnails - scrollable on mobile */}
      {documents.length > 1 && (
        <div 
          className={`absolute bottom-0 left-0 right-0 py-3 sm:py-4 px-3 sm:px-6 bg-gradient-to-t from-black/70 to-transparent z-10 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
        >
          <div className="mx-auto w-full sm:w-[90%] overflow-visible flex justify-center">
            <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 pt-10 px-4 pdfg-scrollbar max-w-full">
              {documents.map((d, i) => (
                <button
                  key={d.id}
                  onClick={() => onNavigate(i)}
                  className={`group relative flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-md sm:rounded-lg overflow-visible transition-all ${
                    i === currentIndex 
                      ? 'ring-2 ring-white scale-110 shadow-lg' 
                      : 'opacity-50 hover:opacity-80 hover:scale-105'
                  }`}
                >
                  <img 
                    src={d.thumbnail} 
                    alt={d.title} 
                    className="w-full h-full object-cover rounded-md sm:rounded-lg"
                    loading="lazy"
                  />
                  {d.title && d.title.trim() && (
                    <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/90 px-2 py-1 text-[11px] text-white opacity-0 transition-opacity group-hover:opacity-100 z-20">
                      {d.title}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
          
          {/* Counter for mobile */}
          <div className="flex justify-center mt-2 sm:hidden">
            <span className="text-white/70 text-xs">
              {currentIndex + 1} / {documents.length}
            </span>
          </div>
        </div>
      )}

      {/* Mobile swipe hint - only shown briefly on first open */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 text-white/40 text-xs sm:hidden pointer-events-none">
        Swipe to navigate
      </div>
    </div>
  );
};

export default DocumentLightbox;
