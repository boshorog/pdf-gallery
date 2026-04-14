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
import GradientZoomShowcase from "./components/GradientZoomShowcase";
import ColorSettingsShowcase from "./components/ColorSettingsShowcase";
import EngagementNoticeShowcase from "./components/EngagementNoticeShowcase";
import PlaceholderSettingsShowcase from "./components/PlaceholderSettingsShowcase";
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
      // IMPORTANT: Only measure the #root element, NOT document/body.
      // In an iframe, document.scrollHeight reflects the iframe viewport height
      // (set by the parent), creating a feedback loop where each height post
      // makes the iframe taller, which makes scrollHeight bigger, etc.
      const rootEl = document.getElementById('root');
      if (!rootEl) return 0;

      const raw = rootEl.scrollHeight + 24; // small padding to avoid cutting the last row
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
    
    const rootEl = document.getElementById('root');
    if (rootEl) ro.observe(rootEl);

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
  const showcase = new URLSearchParams(window.location.search).get('showcase');

  const renderContent = () => {
    if (showcase === 'scroll-onboarding') return <ScrollOnboardingShowcase />;
    if (showcase === 'gradient-zoom') return <GradientZoomShowcase />;
    if (showcase === 'color-settings') return <ColorSettingsShowcase />;
    if (showcase === 'engagement-notice') return <EngagementNoticeShowcase />;
    if (showcase === 'placeholder-settings') return <PlaceholderSettingsShowcase />;
    return <Index />;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        {renderContent()}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
