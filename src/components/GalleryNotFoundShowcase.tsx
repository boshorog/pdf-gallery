import React from 'react';
import logoSvg from '@/assets/pdf-gallery-logo.svg';

const GalleryNotFoundShowcase: React.FC = () => {
  return (
    <div className="p-8 space-y-12 bg-muted/30 min-h-screen">
      <h1 className="text-2xl font-bold text-foreground mb-8">Gallery Not Found - Design Options</h1>
      
      {/* Option 1: Minimal Centered */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Option 1: Minimal Centered</h2>
        <p className="text-sm text-muted-foreground mb-4">Clean, simple design with centered logo and message</p>
        <div className="border border-border rounded-lg bg-background p-12">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <img 
              src={logoSvg} 
              alt="PDF Gallery" 
              className="w-16 h-16 mb-6 opacity-60"
            />
            <h3 className="text-lg font-medium text-foreground mb-2">Gallery Not Found</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              The requested gallery does not exist. Please check the shortcode and try again.
            </p>
          </div>
        </div>
      </div>

      {/* Option 2: Card with Border Accent */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Option 2: Card with Border Accent</h2>
        <p className="text-sm text-muted-foreground mb-4">Subtle card with left border accent for visibility</p>
        <div className="border border-border rounded-lg bg-background p-12">
          <div className="flex items-start gap-6 p-6 bg-muted/40 border-l-4 border-primary/60 rounded-r-lg max-w-lg mx-auto">
            <img 
              src={logoSvg} 
              alt="PDF Gallery" 
              className="w-12 h-12 flex-shrink-0"
            />
            <div>
              <h3 className="text-base font-semibold text-foreground mb-1">Gallery Not Found</h3>
              <p className="text-sm text-muted-foreground">
                The gallery specified in your shortcode doesn't exist or may have been deleted.
              </p>
              <code className="text-xs text-primary/80 bg-primary/10 px-2 py-1 rounded mt-3 inline-block">
                [pdf_gallery id="..."]
              </code>
            </div>
          </div>
        </div>
      </div>

      {/* Option 3: Dashed Placeholder */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Option 3: Dashed Placeholder</h2>
        <p className="text-sm text-muted-foreground mb-4">Looks like an empty drop zone, subtle and non-intrusive</p>
        <div className="border border-border rounded-lg bg-background p-12">
          <div className="border-2 border-dashed border-muted-foreground/30 rounded-xl py-20 px-8">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
                <img 
                  src={logoSvg} 
                  alt="PDF Gallery" 
                  className="w-8 h-8 opacity-50"
                />
              </div>
              <p className="text-muted-foreground font-medium">Gallery not found</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Check that the gallery ID in your shortcode is correct
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Option 4: Inline Warning Style */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Option 4: Inline Warning Style</h2>
        <p className="text-sm text-muted-foreground mb-4">Alert-style banner that catches attention without being alarming</p>
        <div className="border border-border rounded-lg bg-background p-12">
          <div className="flex items-center gap-4 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-lg max-w-2xl mx-auto">
            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center flex-shrink-0">
              <img 
                src={logoSvg} 
                alt="PDF Gallery" 
                className="w-6 h-6"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Gallery not found
              </p>
              <p className="text-xs text-amber-700/80 dark:text-amber-300/70">
                The gallery ID specified in the shortcode does not exist. Please verify your configuration.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default GalleryNotFoundShowcase;
