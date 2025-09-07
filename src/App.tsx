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
    
    const postHeight = () => {
      if (isUpdating) return;
      
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

      const contentHeight = Math.max(...heights, 0) + 32; // safety padding
      
      // Add minimum threshold and prevent loops
      if (Math.abs(contentHeight - lastHeight) > 10) {
        isUpdating = true;
        lastHeight = contentHeight;
        window.parent?.postMessage({ type: 'pdf-gallery:height', height: contentHeight }, '*');
        
        // Reset updating flag after a delay
        setTimeout(() => {
          isUpdating = false;
        }, 200);
      }
    };

    // Debounced height update with longer delay
    let timeout: number;
    const debouncedPostHeight = () => {
      clearTimeout(timeout);
      timeout = window.setTimeout(postHeight, 300);
    };

    // Initial height calculation with longer delay
    setTimeout(postHeight, 500);
    
    const ro = new ResizeObserver(debouncedPostHeight);
    ro.observe(document.documentElement);
    if (document.body) ro.observe(document.body);

    // Fallback listeners
    window.addEventListener('load', postHeight);
    window.addEventListener('resize', debouncedPostHeight);

    return () => {
      clearTimeout(timeout);
      ro.disconnect();
      window.removeEventListener('load', postHeight);
      window.removeEventListener('resize', debouncedPostHeight);
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
