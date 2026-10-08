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
import ToolbarShowcase from "./components/ToolbarShowcase";
import ToolbarShowcase2 from "./components/ToolbarShowcase2";
import ToolbarShowcase3 from "./components/ToolbarShowcase3";
import ToolbarShowcase4 from "./components/ToolbarShowcase4";
import EngagementNoticeShowcase from "./components/EngagementNoticeShowcase";
import PlaceholderSettingsShowcase from "./components/PlaceholderSettingsShowcase";
import { useEffect } from "react";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = new URLSearchParams(window.location.search).get('frameToken') || undefined;
    
    let lastHeight = 0;

    const measure = () => {
      // IMPORTANT: Only measure the app root element, NOT document/body.
      // In an iframe, document.scrollHeight reflects the iframe viewport height
      // (set by the parent), creating a feedback loop.
      const rootEl =
        document.getElementById('kindpdfg-root') ||
        document.getElementById('pdf-gallery-root') ||
        document.getElementById('newsletter-gallery-root') ||
        document.getElementById('root');
      if (!rootEl) return 0;
      const rect = rootEl.getBoundingClientRect();
      const raw = Math.max(rootEl.scrollHeight, rect.height) + 24;
      return Math.ceil(raw / 8) * 8;
    };

    // Never drop an update: every change is eventually posted (debounced),
    // so late-loading content (thumbnails, fonts, async gallery data) is always included.
    const postHeight = () => {
      const contentHeight = measure();
      if (contentHeight > 0 && Math.abs(contentHeight - lastHeight) > 4) {
        lastHeight = contentHeight;
        window.parent?.postMessage({ type: POST_MESSAGE_HEIGHT, height: contentHeight, token }, '*');
      }
    };

    let timeout: number;
    const debouncedSchedule = () => {
      clearTimeout(timeout);
      timeout = window.setTimeout(() => requestAnimationFrame(postHeight), 150);
    };

    const timers = [300, 1000, 2000, 4000, 8000].map((ms) => window.setTimeout(postHeight, ms));
    const ro = new ResizeObserver(debouncedSchedule);
    const rootEl = document.getElementById('kindpdfg-root') || document.getElementById('root');
    if (rootEl) {
      ro.observe(rootEl);
      Array.from(rootEl.children).forEach((c) => ro.observe(c));
    }
    const mo = new MutationObserver(debouncedSchedule);
    if (rootEl) mo.observe(rootEl, { childList: true, subtree: true, attributes: true });

    window.addEventListener('load', postHeight);
    window.addEventListener('resize', debouncedSchedule);

    return () => {
      clearTimeout(timeout);
      timers.forEach(clearTimeout);
      ro.disconnect();
      mo.disconnect();
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
    if (showcase === 'toolbar') return <ToolbarShowcase />;
    if (showcase === 'toolbar2') return <ToolbarShowcase2 />;
    if (showcase === 'toolbar3') return <ToolbarShowcase3 />;
    if (showcase === 'toolbar4') return <ToolbarShowcase4 />;
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
