import { useEffect, useMemo, useRef, useState } from "react";
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

export default function PdfJsViewer({ url, title, onLoaded, className }: PdfJsViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRefs = useRef<Map<number, HTMLCanvasElement>>(new Map());

  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(DEFAULT_SCALE);
  const [isReady, setIsReady] = useState(false);
  const [pdfDoc, setPdfDoc] = useState<any>(null);

  const safeUrl = useMemo(() => url || "", [url]);

  // Show scrollbar only when zoomed in
  const isZoomed = scale > DEFAULT_SCALE + 0.01;

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

  return (
    <div className={`relative w-full h-full flex flex-col ${className || ""}`} aria-label={title || "PDF viewer"}>
      {/* Scrollable pages area - hide scrollbar unless zoomed */}
      <div 
        ref={containerRef}
        className={`flex-1 min-h-0 overflow-auto flex flex-col items-center gap-4 p-2 sm:p-4 ${isZoomed ? 'pdfg-scrollbar-vertical' : 'pdfg-scrollbar-hidden'}`}
      >
        {numPages > 0 ? (
          Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
            <canvas
              key={pageNum}
              ref={setCanvasRef(pageNum)}
              className="block rounded-lg shadow-2xl bg-white flex-shrink-0"
            />
          ))
        ) : (
          <div className="flex items-center justify-center h-full text-white/60">
            {isReady ? "No pages" : "Loading..."}
          </div>
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
