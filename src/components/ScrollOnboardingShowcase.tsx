import React from "react";
import { ChevronDown, ArrowDown } from "lucide-react";

const ScrollOnboardingShowcase = () => {
  return (
    <div className="min-h-screen bg-zinc-900 p-8">
      <div className="max-w-6xl mx-auto space-y-16">
        <h1 className="text-3xl font-bold text-center text-white mb-4">
          Lightbox Scroll Onboarding - Animation Options
        </h1>
        <p className="text-center text-zinc-400 mb-12">
          First opening: Mouse + scroll down | Second opening: Keyboard arrows + down arrow
        </p>

        {/* Version 1: Minimal & Clean */}
        <div className="border border-zinc-700 rounded-xl p-8 bg-zinc-800/50">
          <h2 className="text-xl font-semibold text-white mb-6">Version 1: Minimal & Clean</h2>
          <div className="grid grid-cols-2 gap-8">
            {/* First Opening - Mouse */}
            <div className="bg-zinc-900 rounded-lg p-8 flex flex-col items-center justify-center min-h-[300px] relative">
              <p className="text-xs text-zinc-500 absolute top-4 left-4">First opening</p>
              <div className="flex flex-col items-center gap-4">
                {/* Simple Mouse Icon */}
                <div className="w-8 h-12 border-2 border-white/80 rounded-full relative">
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1 h-2 bg-white/80 rounded-full animate-bounce" />
                </div>
                {/* Animated Arrows */}
                <div className="flex flex-col items-center -space-y-2">
                  <ChevronDown className="w-5 h-5 text-white/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <ChevronDown className="w-5 h-5 text-white/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <ChevronDown className="w-5 h-5 text-white/20 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <p className="text-white/70 text-sm mt-2">Scroll down</p>
              </div>
            </div>
            {/* Second Opening - Keyboard */}
            <div className="bg-zinc-900 rounded-lg p-8 flex flex-col items-center justify-center min-h-[300px] relative">
              <p className="text-xs text-zinc-500 absolute top-4 left-4">Second opening</p>
              <div className="flex flex-col items-center gap-4">
                {/* Arrow Keys */}
                <div className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 border border-white/30 rounded bg-white/5 flex items-center justify-center">
                    <ArrowDown className="w-4 h-4 text-white/30 rotate-180" />
                  </div>
                  <div className="flex gap-1">
                    <div className="w-10 h-10 border border-white/30 rounded bg-white/5 flex items-center justify-center">
                      <ArrowDown className="w-4 h-4 text-white/30 -rotate-90" />
                    </div>
                    <div className="w-10 h-10 border-2 border-white rounded bg-white/20 flex items-center justify-center animate-pulse">
                      <ArrowDown className="w-5 h-5 text-white" />
                    </div>
                    <div className="w-10 h-10 border border-white/30 rounded bg-white/5 flex items-center justify-center">
                      <ArrowDown className="w-4 h-4 text-white/30 rotate-90" />
                    </div>
                  </div>
                </div>
                <p className="text-white/70 text-sm mt-2">Press ↓ to scroll</p>
              </div>
            </div>
          </div>
        </div>

        {/* Version 2: Glowing & Modern */}
        <div className="border border-zinc-700 rounded-xl p-8 bg-zinc-800/50">
          <h2 className="text-xl font-semibold text-white mb-6">Version 2: Glowing & Modern</h2>
          <div className="grid grid-cols-2 gap-8">
            {/* First Opening - Mouse */}
            <div className="bg-zinc-900 rounded-lg p-8 flex flex-col items-center justify-center min-h-[300px] relative">
              <p className="text-xs text-zinc-500 absolute top-4 left-4">First opening</p>
              <div className="flex flex-col items-center gap-3">
                {/* Glowing Mouse */}
                <div className="relative">
                  <div className="absolute inset-0 w-10 h-14 bg-blue-500/30 rounded-full blur-xl animate-pulse" />
                  <div className="relative w-10 h-14 border-2 border-white rounded-full bg-gradient-to-b from-white/10 to-transparent">
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-1.5 h-3 bg-white rounded-full animate-[bounce_1s_ease-in-out_infinite]" />
                  </div>
                </div>
                {/* Cascading glow arrows */}
                <div className="flex flex-col items-center">
                  {[0, 1, 2].map((i) => (
                    <ChevronDown 
                      key={i}
                      className="w-6 h-6 text-blue-400 -mt-2"
                      style={{ 
                        animation: "bounce 1.5s ease-in-out infinite",
                        animationDelay: `${i * 200}ms`,
                        opacity: 1 - i * 0.25
                      }} 
                    />
                  ))}
                </div>
                <p className="text-blue-300 text-sm font-medium">Scroll to continue</p>
              </div>
            </div>
            {/* Second Opening - Keyboard */}
            <div className="bg-zinc-900 rounded-lg p-8 flex flex-col items-center justify-center min-h-[300px] relative">
              <p className="text-xs text-zinc-500 absolute top-4 left-4">Second opening</p>
              <div className="flex flex-col items-center gap-4">
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-12 h-12 border border-white/20 rounded-lg bg-white/5 flex items-center justify-center">
                    <ArrowDown className="w-5 h-5 text-white/20 rotate-180" />
                  </div>
                  <div className="flex gap-1.5">
                    <div className="w-12 h-12 border border-white/20 rounded-lg bg-white/5 flex items-center justify-center">
                      <ArrowDown className="w-5 h-5 text-white/20 -rotate-90" />
                    </div>
                    <div className="relative">
                      <div className="absolute inset-0 bg-blue-500/40 rounded-lg blur-md animate-pulse" />
                      <div className="relative w-12 h-12 border-2 border-blue-400 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <ArrowDown className="w-6 h-6 text-white animate-bounce" />
                      </div>
                    </div>
                    <div className="w-12 h-12 border border-white/20 rounded-lg bg-white/5 flex items-center justify-center">
                      <ArrowDown className="w-5 h-5 text-white/20 rotate-90" />
                    </div>
                  </div>
                </div>
                <p className="text-blue-300 text-sm font-medium">Use arrow key</p>
              </div>
            </div>
          </div>
        </div>

        {/* Version 3: Playful & Bouncy */}
        <div className="border border-zinc-700 rounded-xl p-8 bg-zinc-800/50">
          <h2 className="text-xl font-semibold text-white mb-6">Version 3: Playful & Bouncy</h2>
          <div className="grid grid-cols-2 gap-8">
            {/* First Opening - Mouse */}
            <div className="bg-zinc-900 rounded-lg p-8 flex flex-col items-center justify-center min-h-[300px] relative">
              <p className="text-xs text-zinc-500 absolute top-4 left-4">First opening</p>
              <div className="flex flex-col items-center">
                {/* Cute Mouse with face */}
                <div className="relative animate-bounce">
                  <div className="w-12 h-16 bg-white rounded-[2rem] relative shadow-lg">
                    {/* Mouse wheel */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-2 h-4 bg-zinc-300 rounded-full">
                      <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full mx-auto mt-0.5 animate-[ping_1s_ease-in-out_infinite]" />
                    </div>
                    {/* Divider line */}
                    <div className="absolute top-10 left-1/2 -translate-x-1/2 w-8 h-px bg-zinc-200" />
                  </div>
                </div>
                {/* Bouncy arrows */}
                <div className="mt-4 flex flex-col items-center">
                  <div className="animate-[bounce_0.6s_ease-in-out_infinite]">
                    <ChevronDown className="w-8 h-8 text-emerald-400" />
                  </div>
                  <div className="animate-[bounce_0.6s_ease-in-out_infinite]" style={{ animationDelay: "100ms" }}>
                    <ChevronDown className="w-8 h-8 text-emerald-400/70 -mt-4" />
                  </div>
                </div>
                <p className="text-emerald-400 text-sm font-bold mt-2">Scroll down! ↓</p>
              </div>
            </div>
            {/* Second Opening - Keyboard */}
            <div className="bg-zinc-900 rounded-lg p-8 flex flex-col items-center justify-center min-h-[300px] relative">
              <p className="text-xs text-zinc-500 absolute top-4 left-4">Second opening</p>
              <div className="flex flex-col items-center gap-3">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 bg-zinc-700 rounded-xl flex items-center justify-center shadow-lg border border-zinc-600">
                    <span className="text-white/40 text-lg">↑</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-14 h-14 bg-zinc-700 rounded-xl flex items-center justify-center shadow-lg border border-zinc-600">
                      <span className="text-white/40 text-lg">←</span>
                    </div>
                    <div className="w-14 h-14 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg border-2 border-emerald-400 animate-[pulse_0.5s_ease-in-out_infinite]">
                      <span className="text-white text-xl font-bold">↓</span>
                    </div>
                    <div className="w-14 h-14 bg-zinc-700 rounded-xl flex items-center justify-center shadow-lg border border-zinc-600">
                      <span className="text-white/40 text-lg">→</span>
                    </div>
                  </div>
                </div>
                <p className="text-emerald-400 text-sm font-bold">Press this key!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Version 4: Elegant & Subtle */}
        <div className="border border-zinc-700 rounded-xl p-8 bg-zinc-800/50">
          <h2 className="text-xl font-semibold text-white mb-6">Version 4: Elegant & Subtle</h2>
          <div className="grid grid-cols-2 gap-8">
            {/* First Opening - Mouse */}
            <div className="bg-zinc-900 rounded-lg p-8 flex flex-col items-center justify-center min-h-[300px] relative">
              <p className="text-xs text-zinc-500 absolute top-4 left-4">First opening</p>
              <div className="flex flex-col items-center gap-6">
                {/* Elegant thin mouse */}
                <div className="w-6 h-10 border border-white/60 rounded-full relative">
                  <div 
                    className="absolute top-2 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-white/80 rounded-full"
                    style={{ animation: "scroll-down 2s ease-in-out infinite" }}
                  />
                </div>
                {/* Single elegant arrow with fade */}
                <div className="relative h-12">
                  <ChevronDown 
                    className="w-6 h-6 text-white/50 absolute"
                    style={{ animation: "fade-scroll 2s ease-in-out infinite" }}
                  />
                </div>
                <p className="text-white/50 text-xs tracking-widest uppercase">Scroll</p>
              </div>
            </div>
            {/* Second Opening - Keyboard */}
            <div className="bg-zinc-900 rounded-lg p-8 flex flex-col items-center justify-center min-h-[300px] relative">
              <p className="text-xs text-zinc-500 absolute top-4 left-4">Second opening</p>
              <div className="flex flex-col items-center gap-6">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-9 h-9 border border-white/20 rounded flex items-center justify-center">
                    <span className="text-white/20 text-xs">▲</span>
                  </div>
                  <div className="flex gap-1">
                    <div className="w-9 h-9 border border-white/20 rounded flex items-center justify-center">
                      <span className="text-white/20 text-xs">◀</span>
                    </div>
                    <div 
                      className="w-9 h-9 border border-white/60 rounded flex items-center justify-center bg-white/10"
                      style={{ animation: "subtle-pulse 2s ease-in-out infinite" }}
                    >
                      <span className="text-white text-xs">▼</span>
                    </div>
                    <div className="w-9 h-9 border border-white/20 rounded flex items-center justify-center">
                      <span className="text-white/20 text-xs">▶</span>
                    </div>
                  </div>
                </div>
                <p className="text-white/50 text-xs tracking-widest uppercase">Press Down</p>
              </div>
            </div>
          </div>
        </div>

        {/* Version 5: Bold & Direct */}
        <div className="border border-zinc-700 rounded-xl p-8 bg-zinc-800/50">
          <h2 className="text-xl font-semibold text-white mb-6">Version 5: Bold & Direct</h2>
          <div className="grid grid-cols-2 gap-8">
            {/* First Opening - Mouse */}
            <div className="bg-zinc-900 rounded-lg p-8 flex flex-col items-center justify-center min-h-[300px] relative">
              <p className="text-xs text-zinc-500 absolute top-4 left-4">First opening</p>
              <div className="flex items-center gap-6">
                {/* Large bold mouse */}
                <div className="flex flex-col items-center">
                  <div className="w-14 h-20 bg-white rounded-[2.5rem] relative shadow-2xl">
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-3 h-5 bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className="w-2 h-2 bg-zinc-400 rounded-full mx-auto"
                        style={{ animation: "scroll-wheel 1.5s ease-in-out infinite" }}
                      />
                    </div>
                  </div>
                </div>
                {/* Large vertical arrow indicator */}
                <div className="flex flex-col items-center">
                  <div className="w-1 h-16 bg-gradient-to-b from-transparent via-white to-transparent rounded-full" />
                  <ArrowDown className="w-10 h-10 text-white animate-bounce -mt-2" />
                </div>
              </div>
              <p className="text-white text-base font-bold mt-6">SCROLL DOWN</p>
            </div>
            {/* Second Opening - Keyboard */}
            <div className="bg-zinc-900 rounded-lg p-8 flex flex-col items-center justify-center min-h-[300px] relative">
              <p className="text-xs text-zinc-500 absolute top-4 left-4">Second opening</p>
              <div className="flex items-center gap-6">
                {/* Just the down key, large */}
                <div className="relative">
                  <div className="absolute -inset-2 bg-white/20 rounded-2xl blur-lg animate-pulse" />
                  <div className="relative w-20 h-20 bg-white rounded-xl flex items-center justify-center shadow-2xl">
                    <ArrowDown className="w-10 h-10 text-zinc-900 animate-bounce" />
                  </div>
                </div>
                {/* Text on the side */}
                <div className="text-left">
                  <p className="text-white text-lg font-bold">PRESS</p>
                  <p className="text-white/60 text-sm">to scroll down</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Custom CSS for animations */}
        <style>{`
          @keyframes scroll-down {
            0%, 100% { transform: translateX(-50%) translateY(0); opacity: 1; }
            50% { transform: translateX(-50%) translateY(4px); opacity: 0.5; }
          }
          @keyframes fade-scroll {
            0%, 100% { transform: translateY(0); opacity: 0.5; }
            50% { transform: translateY(12px); opacity: 0; }
          }
          @keyframes subtle-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
          }
          @keyframes scroll-wheel {
            0% { transform: translateY(-4px); }
            50% { transform: translateY(8px); }
            100% { transform: translateY(-4px); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default ScrollOnboardingShowcase;
