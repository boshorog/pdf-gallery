import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";
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

export default function PdfJsViewer({ url, title, onLoaded, className }: PdfJsViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(1);
  const [scale, setScale] = useState(1.15);
  const [isReady, setIsReady] = useState(false);

  const safeUrl = useMemo(() => url || "", [url]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!safeUrl) return;
      ensurePdfWorker();

      setIsReady(false);
      setNumPages(0);
      setPage(1);

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
        setIsReady(true);
        onLoaded?.();

        // Render first page
        const first = await pdf.getPage(1);
        if (cancelled) return;

        await renderPage(pdf, first, 1, scale);

        // Store pdf on window for later renders without extra state churn
        (window as any).__pdfg_pdfDoc = pdf;
      } catch (e) {
        // If the PDF is blocked by X-Frame-Options/CSP or odd headers, PDF.js can still fail.
        // In that case, the parent UI can fall back to pop-out / download.
        onLoaded?.();
      }
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeUrl]);

  async function renderCurrent(nextPage = page, nextScale = scale) {
    const pdf = (window as any).__pdfg_pdfDoc;
    if (!pdf) return;
    const p = await pdf.getPage(nextPage);
    await renderPage(pdf, p, nextPage, nextScale);
  }

  async function renderPage(_pdf: any, pdfPage: any, _pageNum: number, nextScale: number) {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const viewport = pdfPage.getViewport({ scale: nextScale });
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // HiDPI
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(viewport.width * dpr);
    canvas.height = Math.floor(viewport.height * dpr);
    canvas.style.width = `${Math.floor(viewport.width)}px`;
    canvas.style.height = `${Math.floor(viewport.height)}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    await pdfPage.render({ canvasContext: ctx, viewport } as any).promise;
  }

  const canPrev = page > 1;
  const canNext = numPages > 0 && page < numPages;

  const clampScale = (s: number) => Math.max(0.6, Math.min(2.2, s));

  const goTo = async (next: number) => {
    const n = Math.max(1, Math.min(numPages || 1, next));
    setPage(n);
    await renderCurrent(n, scale);
  };

  const zoomTo = async (next: number) => {
    const z = clampScale(next);
    setScale(z);
    await renderCurrent(page, z);
  };

  return (
    <div className={`relative w-full h-full flex flex-col ${className || ""}`} aria-label={title || "PDF viewer"}>
      {/* Scrollable canvas area */}
      <div className="flex-1 min-h-0 overflow-auto pdfg-scrollbar-vertical flex items-start justify-center p-2 sm:p-4">
        <canvas ref={canvasRef} className="block rounded-lg shadow-2xl bg-white" />
      </div>

      {/* Controls bar - positioned at bottom, always interactive */}
      <div className="flex-shrink-0 flex items-center justify-center py-3 relative z-50">
        <div className="flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 backdrop-blur-sm pointer-events-auto">
          <button
            type="button"
            className="text-white/80 hover:text-white disabled:opacity-40 p-1 cursor-pointer select-none"
            onClick={(e) => { e.stopPropagation(); goTo(page - 1); }}
            disabled={!canPrev}
            title="Previous page"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-white/80 text-xs tabular-nums min-w-[60px] text-center select-none">
            {numPages ? `${page} / ${numPages}` : isReady ? "…" : "Loading"}
          </div>
          <button
            type="button"
            className="text-white/80 hover:text-white disabled:opacity-40 p-1 cursor-pointer select-none"
            onClick={(e) => { e.stopPropagation(); goTo(page + 1); }}
            disabled={!canNext}
            title="Next page"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="w-px h-5 bg-white/20 mx-1" />

          <button
            type="button"
            className="text-white/80 hover:text-white p-1 cursor-pointer select-none"
            onClick={(e) => { e.stopPropagation(); zoomTo(scale - 0.15); }}
            title="Zoom out"
          >
            <Minus className="w-5 h-5" />
          </button>
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
