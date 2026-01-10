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
  const [zoomOrigin, setZoomOrigin] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const lastMousePos = useRef({ x: 0, y: 0 });
  const zoomCanvasRef = useRef<HTMLCanvasElement | null>(null);

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
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setZoomOrigin({ x, y });
    setPanOffset({ x: 0, y: 0 });
    lastMousePos.current = { x: e.clientX, y: e.clientY };
    zoomCanvasRef.current = canvas;
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
    zoomCanvasRef.current = null;
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

  // Calculate zoom transform for the overlay
  const getZoomTransform = useCallback(() => {
    if (!isZooming || !zoomCanvasRef.current) return {};
    
    const canvas = zoomCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Calculate the transform origin based on where user clicked
    const originX = (zoomOrigin.x / rect.width) * 100;
    const originY = (zoomOrigin.y / rect.height) * 100;
    
    return {
      transform: `scale(${ZOOM_SCALE / scale}) translate(${panOffset.x}px, ${panOffset.y}px)`,
      transformOrigin: `${originX}% ${originY}%`,
    };
  }, [isZooming, zoomOrigin, panOffset, scale]);

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
                style={
                  isZooming && zoomCanvasRef.current === canvasRefs.current.get(pageNum)
                    ? getZoomTransform()
                    : undefined
                }
              />
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full text-white/60">
            {isReady ? "No pages" : "Loading..."}
          </div>
        )}
      </div>

      {/* Zoom hint for desktop */}
      {!isMobile && numPages > 0 && !isZooming && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 text-white/70 text-xs px-3 py-1.5 rounded-full backdrop-blur-sm pointer-events-none opacity-70">
          Click & hold to zoom • Drag to pan
        </div>
      )}

      {/* Active zoom indicator */}
      {isZooming && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm pointer-events-none">
          {Math.round(ZOOM_SCALE * 100)}% — Release to exit
        </div>
      )}

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
