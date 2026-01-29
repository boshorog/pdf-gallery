import { useState, useEffect } from "react";

// Final refined version combining Version 1 mouse + Version 4 arrows, fixed keyboard
const ScrollOnboardingShowcase = () => {
  const [showFirst, setShowFirst] = useState(true);
  const [simulateScroll, setSimulateScroll] = useState(false);

  // Simulate scroll hiding
  useEffect(() => {
    if (simulateScroll) {
      const timer = setTimeout(() => setSimulateScroll(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [simulateScroll]);

  return (
    <div className="min-h-screen bg-zinc-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">
          Final Scroll Onboarding Design
        </h1>

        {/* Controls */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setShowFirst(true)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              showFirst ? "bg-white text-zinc-900" : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            First Opening (Mouse)
          </button>
          <button
            onClick={() => setShowFirst(false)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              !showFirst ? "bg-white text-zinc-900" : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            Second Opening (Keyboard)
          </button>
          <button
            onClick={() => setSimulateScroll(true)}
            className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          >
            Simulate Scroll (Hide)
          </button>
        </div>

        {/* Demo container simulating lightbox */}
        <div className="relative bg-zinc-800 rounded-xl h-[500px] flex items-center justify-center overflow-hidden">
          {/* Fake PDF content */}
          <div className="w-64 h-80 bg-white rounded-lg shadow-2xl flex items-center justify-center">
            <span className="text-zinc-400 text-sm">Multi-page Document</span>
          </div>

          {/* Onboarding overlay - right side */}
          <div
            className={`absolute right-8 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3 transition-all duration-500 ${
              simulateScroll ? "opacity-0 translate-x-4 pointer-events-none" : "opacity-100"
            }`}
          >
            {showFirst ? (
              /* First Opening: Mouse with Version 4 elegant arrows */
              <div className="flex flex-col items-center gap-4">
                {/* Mouse graphic - Version 1 style */}
                <div className="relative w-8 h-12 border-2 border-white/80 rounded-full">
                  {/* Scroll wheel */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1 h-2 bg-white/80 rounded-full animate-[scrollWheel_1.5s_ease-in-out_infinite]" />
                </div>
                
                {/* Version 4 elegant cascading chevrons */}
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
                {/* Arrow keys layout */}
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
          </div>
        </div>

        <p className="text-white/60 text-center mt-6 text-sm">
          These animations fade out when the user scrolls down. Click "Simulate Scroll" to preview.
        </p>
      </div>

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

export default ScrollOnboardingShowcase;
