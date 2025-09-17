import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Index from "./pages/Index";
import { useEffect } from "react";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    let lastHeight = 0;
    let isUpdating = false;
    let lastSentAt = 0;

    const measure = () => {
      const rootEl = document.getElementById('root');
      const doc = document.documentElement;
      const body = document.body;

      const heights = [
        rootEl?.scrollHeight,
        rootEl?.offsetHeight,
        doc?.scrollHeight,
        doc?.offsetHeight,
        doc?.clientHeight,
        body?.scrollHeight,
        body?.offsetHeight,
        body?.clientHeight,
      ].filter((v): v is number => typeof v === 'number');

      const raw = Math.max(...heights, 0) + 48; // extra padding to avoid cutting the last row
      const contentHeight = Math.ceil(raw / 16) * 16; // align to 16px to reduce micro-jitter
      return contentHeight;
    };
    
    const postHeight = () => {
      if (isUpdating) return;
      const now = Date.now();
      const contentHeight = measure();

      if (Math.abs(contentHeight - lastHeight) > 12 && (now - lastSentAt) > 700) {
        isUpdating = true;
        lastHeight = contentHeight;
        lastSentAt = now;
        window.parent?.postMessage({ type: 'pdf-gallery:height', height: contentHeight }, '*');
        setTimeout(() => {
          isUpdating = false;
        }, 250);
      }
    };

    let rafId = 0;
    const schedule = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => postHeight());
    };

    // Debounced height update
    let timeout: number;
    const debouncedSchedule = () => {
      clearTimeout(timeout);
      timeout = window.setTimeout(schedule, 300);
    };

    // Initial and follow-up height calculations to catch async image/lazy loads
    setTimeout(postHeight, 500);
    setTimeout(postHeight, 1500);
    setTimeout(postHeight, 3000);
    
    const ro = new ResizeObserver(debouncedSchedule);
    ro.observe(document.documentElement);
    if (document.body) ro.observe(document.body);

    // Fallback listeners
    window.addEventListener('load', postHeight);
    window.addEventListener('resize', debouncedSchedule);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(rafId);
      ro.disconnect();
      window.removeEventListener('load', postHeight);
      window.removeEventListener('resize', debouncedSchedule);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Index />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
