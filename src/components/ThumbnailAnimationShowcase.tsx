import React from "react";

const ThumbnailAnimationShowcase = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-12">
        <h1 className="text-3xl font-bold text-center mb-8">
          "Generating thumbnails..." Animation Options
        </h1>
        
        {/* Option 1: Pulsing Dots */}
        <div className="border rounded-lg p-6 bg-card">
          <h3 className="text-lg font-semibold mb-4">Option 1: Pulsing Dots</h3>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Generating thumbnails
              <span className="inline-flex ml-1">
                <span className="animate-pulse delay-0">.</span>
                <span className="animate-pulse delay-75">.</span>
                <span className="animate-pulse delay-150">.</span>
              </span>
            </p>
          </div>
        </div>

        {/* Option 2: Bouncing Letters */}
        <div className="border rounded-lg p-6 bg-card">
          <h3 className="text-lg font-semibold mb-4">Option 2: Bouncing Letters</h3>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {"Generating thumbnails...".split("").map((char, index) => (
                <span
                  key={index}
                  className="inline-block animate-bounce"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {char === " " ? "\u00A0" : char}
                </span>
              ))}
            </p>
          </div>
        </div>

        {/* Option 3: Typewriter Effect */}
        <div className="border rounded-lg p-6 bg-card">
          <h3 className="text-lg font-semibold mb-4">Option 3: Typewriter Effect</h3>
          <div className="text-center">
            <p className="text-sm text-muted-foreground overflow-hidden border-r-2 border-primary whitespace-nowrap mx-auto animate-typing">
              Generating thumbnails...
            </p>
          </div>
        </div>

        {/* Option 4: Gradient Wave */}
        <div className="border rounded-lg p-6 bg-card">
          <h3 className="text-lg font-semibold mb-4">Option 4: Gradient Wave</h3>
          <div className="text-center">
            <p className="text-sm bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient-x bg-300%">
              Generating thumbnails...
            </p>
          </div>
        </div>

        {/* Option 5: Spinning Loader */}
        <div className="border rounded-lg p-6 bg-card">
          <h3 className="text-lg font-semibold mb-4">Option 5: Spinning Loader</h3>
          <div className="text-center flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-muted-foreground">Generating thumbnails...</p>
          </div>
        </div>

        {/* Option 6: Scale Animation */}
        <div className="border rounded-lg p-6 bg-card">
          <h3 className="text-lg font-semibold mb-4">Option 6: Scale Pulse</h3>
          <div className="text-center">
            <p className="text-sm text-muted-foreground animate-scale-pulse">
              Generating thumbnails...
            </p>
          </div>
        </div>

        {/* Option 7: Glowing Effect */}
        <div className="border rounded-lg p-6 bg-card">
          <h3 className="text-lg font-semibold mb-4">Option 7: Glowing Effect</h3>
          <div className="text-center">
            <p className="text-sm text-primary animate-glow font-medium">
              Generating thumbnails...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThumbnailAnimationShowcase;