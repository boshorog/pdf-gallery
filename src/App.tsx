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
    const postHeight = () => {
      const h = Math.max(
        document.documentElement.scrollHeight,
        document.body ? document.body.scrollHeight : 0
      );
      // Notify parent (WordPress) to resize iframe
      window.parent?.postMessage({ type: 'pdf-gallery:height', height: h }, '*');
    };

    // Initial and observed updates
    postHeight();
    const ro = new ResizeObserver(() => postHeight());
    ro.observe(document.documentElement);

    // Fallback listeners
    window.addEventListener('load', postHeight);
    window.addEventListener('resize', postHeight);

    return () => {
      ro.disconnect();
      window.removeEventListener('load', postHeight);
      window.removeEventListener('resize', postHeight);
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
