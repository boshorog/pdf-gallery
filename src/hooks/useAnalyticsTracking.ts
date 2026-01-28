import { useEffect, useRef, useCallback } from 'react';
import { trackAnalyticsEvent } from '@/utils/analyticsApi';

/**
 * Hook to track gallery visibility using Intersection Observer
 * Fires a "view" event when the gallery becomes visible in viewport
 */
export const useGalleryViewTracking = (
  galleryId: string | undefined,
  enabled: boolean = true
) => {
  const hasTracked = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled || !galleryId || hasTracked.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTracked.current) {
            hasTracked.current = true;
            trackAnalyticsEvent(galleryId, 'view');
            console.log('[Analytics] Gallery view tracked:', galleryId);
          }
        });
      },
      { threshold: 0.1 } // 10% visibility triggers the event
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [galleryId, enabled]);

  // Reset tracking when gallery changes
  useEffect(() => {
    hasTracked.current = false;
  }, [galleryId]);

  return containerRef;
};

/**
 * Hook to track file/document clicks
 * Returns a click handler to be attached to thumbnails
 */
export const useFileClickTracking = (
  galleryId: string | undefined,
  enabled: boolean = true
) => {
  const trackClick = useCallback(
    (documentId: string) => {
      if (!enabled || !galleryId) return;
      trackAnalyticsEvent(galleryId, 'click', documentId);
      console.log('[Analytics] File click tracked:', documentId);
    },
    [galleryId, enabled]
  );

  return trackClick;
};
