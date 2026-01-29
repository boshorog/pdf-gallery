import { useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "kindpdfg_scroll_onboarding_count";

interface ScrollOnboardingProps {
  /** Whether the document has multiple pages (needs scrolling) */
  isMultiPage: boolean;
  /** Container element that scrolls (to detect scroll) */
  scrollContainerRef: React.RefObject<HTMLElement>;
}

/**
 * Scroll onboarding overlay for multi-page documents in lightbox.
 * Shows mouse scroll hint on first opening, keyboard arrow hint on second.
 * Permanently dismissed after second viewing or on scroll.
 */
const ScrollOnboarding = ({ isMultiPage, scrollContainerRef }: ScrollOnboardingProps) => {
  const [viewCount, setViewCount] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10);
    } catch {
      return 0;
    }
  });
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Show onboarding only for first two viewings of multi-page docs
  useEffect(() => {
    if (!isMultiPage || viewCount >= 2) {
      setVisible(false);
      return;
    }

    // Small delay before showing
    const timer = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(timer);
  }, [isMultiPage, viewCount]);

  // Increment view count when onboarding is shown
  useEffect(() => {
    if (visible && !dismissed) {
      const newCount = viewCount + 1;
      try {
        localStorage.setItem(STORAGE_KEY, String(newCount));
      } catch {
        // localStorage unavailable
      }
    }
  }, [visible, dismissed, viewCount]);

  // Dismiss on scroll
  const handleScroll = useCallback(() => {
    if (visible && !dismissed) {
      setDismissed(true);
      setViewCount((prev) => {
        const next = prev + 1;
        try {
          localStorage.setItem(STORAGE_KEY, String(next));
        } catch {
          // ignore
        }
        return next;
      });
    }
  }, [visible, dismissed]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !visible) return;

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [scrollContainerRef, visible, handleScroll]);

  // Also dismiss on keyboard down arrow
  useEffect(() => {
    if (!visible || dismissed) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        setDismissed(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [visible, dismissed]);

  if (!visible || dismissed || viewCount >= 2) return null;

  const isFirstView = viewCount === 0;

  return (
    <div
      className={`absolute right-4 sm:right-8 bottom-32 sm:bottom-36 flex flex-col items-center gap-3 transition-all duration-500 pointer-events-none z-50 ${
        dismissed ? "opacity-0 translate-x-4" : "opacity-100"
      }`}
    >
      {isFirstView ? (
        /* First Opening: Mouse with elegant cascading arrows */
        <div className="flex flex-col items-center gap-4">
          {/* Mouse graphic */}
          <div className="relative w-8 h-12 border-2 border-white/80 rounded-full">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1 h-2 bg-white/80 rounded-full animate-[scrollWheel_1.5s_ease-in-out_infinite]" />
          </div>

          {/* Cascading chevrons */}
          <div className="flex flex-col items-center -space-y-1">
            {[0, 1, 2].map((i) => (
              <svg
                key={i}
                className="w-5 h-5 text-white/60"
                style={{
                  animation: `elegantFade 1.5s ease-in-out infinite`,
                  animationDelay: `${i * 0.2}s`,
                }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            ))}
          </div>

          <span className="text-white/70 text-xs font-light tracking-wide">scroll down</span>
        </div>
      ) : (
        /* Second Opening: Keyboard arrows with outward-pointing side arrows */
        <div className="flex flex-col items-center gap-3">
          <div className="flex flex-col items-center gap-1">
            {/* Up arrow */}
            <div className="w-8 h-8 border border-white/30 rounded flex items-center justify-center">
              <svg className="w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
              </svg>
            </div>

            {/* Middle row: Left, Down, Right */}
            <div className="flex gap-1">
              {/* Left arrow - pointing LEFT (outward) */}
              <div className="w-8 h-8 border border-white/30 rounded flex items-center justify-center">
                <svg className="w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </div>

              {/* Down arrow - highlighted */}
              <div className="w-8 h-8 border-2 border-white bg-white/10 rounded flex items-center justify-center animate-pulse">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Right arrow - pointing RIGHT (outward) */}
              <div className="w-8 h-8 border border-white/30 rounded flex items-center justify-center">
                <svg className="w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>

          <span className="text-white/70 text-xs font-light tracking-wide">press ↓ to scroll</span>
        </div>
      )}

      {/* Keyframe styles */}
      <style>{`
        @keyframes scrollWheel {
          0%, 100% { transform: translateX(-50%) translateY(0); opacity: 1; }
          50% { transform: translateX(-50%) translateY(4px); opacity: 0.5; }
        }
        @keyframes elegantFade {
          0%, 100% { opacity: 0.3; transform: translateY(0); }
          50% { opacity: 0.8; transform: translateY(2px); }
        }
      `}</style>
    </div>
  );
};

export default ScrollOnboarding;
