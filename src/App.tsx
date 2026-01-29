/**
 * ============================================================================
 * APP ENTRY COMPONENT
 * ============================================================================
 * 
 * Root component that sets up providers and handles iframe height sync
 * for WordPress embedding.
 * 
 * FEATURES:
 * - Query client provider for React Query
 * - Tooltip provider for accessible tooltips
 * - Toast notifications
 * - Iframe height synchronization with parent WordPress page
 * 
 * REUSE NOTES:
 * - This is a framework component, minimal customization needed
 * - Update POST_MESSAGE_HEIGHT if plugin prefix changes
 * 
 * @module App
 * ============================================================================
 */

import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { POST_MESSAGE_HEIGHT } from "@/config/pluginIdentity";
import Index from "./pages/Index";
import ScrollOnboardingShowcase from "./components/ScrollOnboardingShowcase";
import { useEffect } from "react";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = new URLSearchParams(window.location.search).get('frameToken') || undefined;
    
    let lastHeight = 0;
    let isUpdating = false;
    let lastSentAt = 0;

    const measure = () => {
      const rootEl = document.getElementById('root');
      const doc = document.documentElement;
      const body = document.body;

      // IMPORTANT: avoid using *clientHeight* here.
      // In an iframe, clientHeight tracks the iframe viewport height, which can create
      // a feedback loop (parent sets iframe height -> iframe clientHeight grows -> we post bigger height).
      const heights = [
        rootEl?.scrollHeight,
        rootEl?.offsetHeight,
        doc?.scrollHeight,
        doc?.offsetHeight,
        body?.scrollHeight,
        body?.offsetHeight,
      ].filter((v): v is number => typeof v === 'number');

      const raw = Math.max(...heights, 0) + 24; // small padding to avoid cutting the last row
      const contentHeight = Math.ceil(raw / 8) * 8; // align to reduce micro-jitter
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
        window.parent?.postMessage({ type: POST_MESSAGE_HEIGHT, height: contentHeight, token }, '*');
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

  // Show showcase if ?showcase=scroll-onboarding is in URL
  const showScrollShowcase = new URLSearchParams(window.location.search).get('showcase') === 'scroll-onboarding';

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        {showScrollShowcase ? <ScrollOnboardingShowcase /> : <Index />}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
