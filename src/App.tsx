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
      
      const contentHeight = Math.max(
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight,
        document.body ? document.body.scrollHeight : 0,
        document.body ? document.body.offsetHeight : 0
      );
      
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
