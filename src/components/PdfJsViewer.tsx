import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Minus, Plus } from "lucide-react";
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";

// Initialize PDF.js worker (mirrors src/utils/pdfThumbnailGenerator.ts)
let _workerInitialized = false;
function ensurePdfWorker() {
  if (_workerInitialized) return;
  _workerInitialized = true;

  try {
    const pdfWorker = new Worker(
      new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url),
      { type: "module" }
    );
    GlobalWorkerOptions.workerPort = pdfWorker as any;
  } catch {
    GlobalWorkerOptions.workerSrc =
      "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.149/build/pdf.worker.min.js";
  }
}

type PdfJsViewerProps = {
  url: string;
  title?: string;
  onLoaded?: () => void;
  className?: string;
};

const DEFAULT_SCALE = 1.15;
const ZOOM_SCALE = 2.0; // 200% zoom when clicking

export default function PdfJsViewer({ url, title, onLoaded, className }: PdfJsViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRefs = useRef<Map<number, HTMLCanvasElement>>(new Map());

  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(DEFAULT_SCALE);
  const [isReady, setIsReady] = useState(false);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  
  // Click-to-zoom state
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPageNum, setZoomPageNum] = useState<number | null>(null);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const lastMousePos = useRef({ x: 0, y: 0 });
  
  // High-res zoom canvas overlay
  const zoomOverlayRef = useRef<HTMLCanvasElement | null>(null);
  const [zoomCanvasReady, setZoomCanvasReady] = useState(false);

  const safeUrl = useMemo(() => url || "", [url]);

  // Show scrollbar only when zoomed in (via buttons)
  const isZoomed = scale > DEFAULT_SCALE + 0.01;

  // Check if we're on mobile
  const isMobile = typeof navigator !== 'undefined' && 
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!safeUrl) return;
      ensurePdfWorker();

      setIsReady(false);
      setNumPages(0);
      setPdfDoc(null);
      canvasRefs.current.clear();

      try {
        const task = getDocument({
          url: safeUrl,
          cMapUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.149/cmaps/",
          cMapPacked: true,
          verbosity: 0,
        } as any);

        const pdf = await task.promise;
        if (cancelled) return;

        setNumPages(pdf.numPages);
        setPdfDoc(pdf);
        setIsReady(true);
        onLoaded?.();
      } catch (e) {
        onLoaded?.();
      }
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeUrl]);

  // Render all pages when pdf or scale changes
  useEffect(() => {
    if (!pdfDoc || numPages === 0) return;

    let cancelled = false;

    async function renderAllPages() {
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        if (cancelled) return;
        const canvas = canvasRefs.current.get(pageNum);
        if (!canvas) continue;

        try {
          const pdfPage = await pdfDoc.getPage(pageNum);
          if (cancelled) return;

          const viewport = pdfPage.getViewport({ scale });
          const ctx = canvas.getContext("2d");
          if (!ctx) continue;

          const dpr = window.devicePixelRatio || 1;
          canvas.width = Math.floor(viewport.width * dpr);
          canvas.height = Math.floor(viewport.height * dpr);
          canvas.style.width = `${Math.floor(viewport.width)}px`;
          canvas.style.height = `${Math.floor(viewport.height)}px`;

          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

          await pdfPage.render({ canvasContext: ctx, viewport } as any).promise;
        } catch (e) {
          // Page render failed, continue with others
        }
      }
    }

    renderAllPages();
    return () => {
      cancelled = true;
    };
  }, [pdfDoc, numPages, scale]);

  // Render high-resolution zoom overlay when zooming
  useEffect(() => {
    if (!isZooming || !pdfDoc || zoomPageNum === null) {
      setZoomCanvasReady(false);
      return;
    }

    let cancelled = false;

    async function renderZoomOverlay() {
      const zoomCanvas = zoomOverlayRef.current;
      if (!zoomCanvas) return;

      try {
        const pdfPage = await pdfDoc.getPage(zoomPageNum);
        if (cancelled) return;

        // Render at full zoom scale for crisp quality
        const zoomViewport = pdfPage.getViewport({ scale: ZOOM_SCALE });
        const ctx = zoomCanvas.getContext("2d");
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        zoomCanvas.width = Math.floor(zoomViewport.width * dpr);
        zoomCanvas.height = Math.floor(zoomViewport.height * dpr);
        zoomCanvas.style.width = `${Math.floor(zoomViewport.width)}px`;
        zoomCanvas.style.height = `${Math.floor(zoomViewport.height)}px`;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        await pdfPage.render({ canvasContext: ctx, viewport: zoomViewport } as any).promise;
        if (cancelled) return;
        
        setZoomCanvasReady(true);
      } catch (e) {
        // Zoom render failed
      }
    }

    renderZoomOverlay();
    return () => {
      cancelled = true;
    };
  }, [isZooming, pdfDoc, zoomPageNum]);

  const clampScale = (s: number) => Math.max(0.6, Math.min(2.2, s));

  const zoomTo = (next: number) => {
    setScale(clampScale(next));
  };

  const setCanvasRef = (pageNum: number) => (el: HTMLCanvasElement | null) => {
    if (el) {
      canvasRefs.current.set(pageNum, el);
    } else {
      canvasRefs.current.delete(pageNum);
    }
  };

  // Handle mouse down on canvas - start zoom mode
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>, pageNum: number) => {
    if (isMobile) return; // Disable on mobile
    e.preventDefault();
    e.stopPropagation();
    
    const canvas = canvasRefs.current.get(pageNum);
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    // Calculate click position as percentage of canvas
    const xPercent = (e.clientX - rect.left) / rect.width;
    const yPercent = (e.clientY - rect.top) / rect.height;

    setZoomOrigin({ x: xPercent, y: yPercent });
    setPanOffset({ x: 0, y: 0 });
    lastMousePos.current = { x: e.clientX, y: e.clientY };
    setZoomPageNum(pageNum);
    setIsZooming(true);
  }, [isMobile]);

  // Handle mouse move while zooming - pan the view
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isZooming) return;
    
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    
    setPanOffset(prev => ({
      x: prev.x + dx,
      y: prev.y + dy
    }));
    
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  }, [isZooming]);

  // Handle mouse up - end zoom mode
  const handleMouseUp = useCallback(() => {
    setIsZooming(false);
    setZoomPageNum(null);
    setZoomCanvasReady(false);
  }, []);

  // Global mouse listeners for pan and release
  useEffect(() => {
    if (isZooming) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isZooming, handleMouseMove, handleMouseUp]);

  // Calculate position for the zoom overlay
  const getZoomOverlayStyle = useCallback((): React.CSSProperties => {
    if (!isZooming || zoomPageNum === null) return { display: 'none' };
    
    const sourceCanvas = canvasRefs.current.get(zoomPageNum);
    if (!sourceCanvas) return { display: 'none' };

    const rect = sourceCanvas.getBoundingClientRect();
    const container = containerRef.current;
    if (!container) return { display: 'none' };
    
    const containerRect = container.getBoundingClientRect();
    
    // The zoom canvas is rendered at ZOOM_SCALE, so it's larger
    const zoomRatio = ZOOM_SCALE / scale;
    const zoomWidth = rect.width * zoomRatio;
    const zoomHeight = rect.height * zoomRatio;
    
    // Calculate the offset so the clicked point stays under the cursor
    // The click was at (xPercent, yPercent) of the original canvas
    // In the zoomed canvas, that same point should be at the same screen position
    const clickXInZoom = zoomOrigin.x * zoomWidth;
    const clickYInZoom = zoomOrigin.y * zoomHeight;
    const clickXInOriginal = zoomOrigin.x * rect.width;
    const clickYInOriginal = zoomOrigin.y * rect.height;
    
    // Position the zoom canvas so the click point aligns
    const left = (rect.left - containerRect.left) + clickXInOriginal - clickXInZoom + panOffset.x;
    const top = (rect.top - containerRect.top) + container.scrollTop + clickYInOriginal - clickYInZoom + panOffset.y;
    
    return {
      position: 'absolute',
      left: `${left}px`,
      top: `${top}px`,
      zIndex: 100,
      pointerEvents: 'none',
      borderRadius: '8px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      opacity: zoomCanvasReady ? 1 : 0,
      transition: 'opacity 0.1s ease-out',
    };
  }, [isZooming, zoomPageNum, zoomOrigin, panOffset, scale, zoomCanvasReady]);

  return (
    <div className={`relative w-full h-full flex flex-col ${className || ""}`} aria-label={title || "PDF viewer"}>
      {/* Scrollable pages area - hide scrollbar unless zoomed */}
      <div 
        ref={containerRef}
        className={`flex-1 min-h-0 overflow-auto flex flex-col items-center gap-4 p-2 sm:p-4 ${isZoomed ? 'pdfg-scrollbar-vertical' : 'pdfg-scrollbar-hidden'}`}
      >
        {numPages > 0 ? (
          Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
            <div key={pageNum} className="relative">
              <canvas
                ref={setCanvasRef(pageNum)}
                className={`block rounded-lg shadow-2xl bg-white flex-shrink-0 ${!isMobile ? 'cursor-zoom-in' : ''}`}
                onMouseDown={(e) => handleCanvasMouseDown(e, pageNum)}
              />
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full text-white/60">
            {isReady ? "No pages" : "Loading..."}
          </div>
        )}
        
        {/* High-resolution zoom overlay canvas */}
        {isZooming && (
          <canvas
            ref={zoomOverlayRef}
            className="bg-white rounded-lg"
            style={getZoomOverlayStyle()}
          />
        )}
      </div>

      {/* Controls bar - zoom only */}
      <div className="flex-shrink-0 flex items-center justify-center py-3 relative z-50">
        <div className="flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 backdrop-blur-sm pointer-events-auto">
          <button
            type="button"
            className="text-white/80 hover:text-white p-1 cursor-pointer select-none"
            onClick={(e) => { e.stopPropagation(); zoomTo(scale - 0.15); }}
            title="Zoom out"
          >
            <Minus className="w-5 h-5" />
          </button>
          <div className="text-white/80 text-xs tabular-nums min-w-[50px] text-center select-none">
            {Math.round(scale * 100)}%
          </div>
          <button
            type="button"
            className="text-white/80 hover:text-white p-1 cursor-pointer select-none"
            onClick={(e) => { e.stopPropagation(); zoomTo(scale + 0.15); }}
            title="Zoom in"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
