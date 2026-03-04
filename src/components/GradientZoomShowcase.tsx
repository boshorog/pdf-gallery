import pdfPlaceholder from '@/assets/thumbnail-placeholder.png';

const ACCENT = '#7FB3DC';

const GradientZoomShowcase = () => {
  const styles = [
    {
      id: 1,
      name: "Animated Gradient Border",
      description: "Rotating gradient border that spins on hover with zoom",
      component: (
        <div className="group cursor-pointer w-48">
          <div className="relative rounded-2xl p-[3px] overflow-hidden transition-all duration-300"
            style={{
              background: `linear-gradient(135deg, ${ACCENT}40, ${ACCENT}15, ${ACCENT}40)`,
            }}
          >
            {/* Spinning gradient overlay on hover */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: `conic-gradient(from 0deg, ${ACCENT}, transparent, ${ACCENT}cc, transparent, ${ACCENT})`,
                animation: 'spin 3s linear infinite',
              }}
            />
            <div className="relative bg-card rounded-xl overflow-hidden">
              <div className="aspect-video overflow-hidden bg-muted">
                <img src={pdfPlaceholder} alt="Preview" className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(135deg, ${ACCENT}30, transparent 50%, ${ACCENT}30)` }}
                />
              </div>
            </div>
          </div>
          <div className="mt-2 text-center">
            <p className="text-xs text-muted-foreground mb-1">April 2025</p>
            <h3 className="font-semibold text-xs text-foreground group-hover:transition-colors" style={{ color: undefined }}>Sample PDF Title</h3>
          </div>
        </div>
      ),
    },
    {
      id: 2,
      name: "Glow Pulse",
      description: "Soft accent glow that pulses on hover, gradient overlay on image",
      component: (
        <div className="group cursor-pointer w-48">
          <div className="relative rounded-2xl overflow-hidden transition-all duration-300">
            {/* Glow effect behind */}
            <div className="absolute -inset-1 rounded-2xl opacity-30 group-hover:opacity-70 blur-md transition-all duration-500"
              style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}80)` }}
            />
            <div className="relative rounded-2xl p-[3px]"
              style={{ background: `linear-gradient(135deg, ${ACCENT}50, ${ACCENT}20, ${ACCENT}50)` }}
            >
              <div className="relative bg-card rounded-xl overflow-hidden">
                <div className="aspect-video overflow-hidden bg-muted">
                  <img src={pdfPlaceholder} alt="Preview" className="w-full h-full object-cover transition-all duration-500 group-hover:scale-125" />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: `radial-gradient(circle at center, ${ACCENT}40 0%, transparent 70%)` }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="mt-2 text-center">
            <p className="text-xs text-muted-foreground mb-1">April 2025</p>
            <h3 className="font-semibold text-xs text-foreground">Sample PDF Title</h3>
          </div>
        </div>
      ),
    },
    {
      id: 3,
      name: "Dual Tone Border",
      description: "Two-color gradient border with complementary overlay",
      component: (
        <div className="group cursor-pointer w-48">
          <div className="relative rounded-2xl p-[3px] transition-all duration-300"
            style={{
              background: `linear-gradient(135deg, ${ACCENT}, #B07FDC, ${ACCENT})`,
              opacity: 0.6,
            }}
          >
            <div className="absolute inset-0 rounded-2xl transition-opacity duration-300 opacity-0 group-hover:opacity-100"
              style={{ background: `linear-gradient(135deg, ${ACCENT}, #B07FDC, ${ACCENT})` }}
            />
            <div className="relative bg-card rounded-xl overflow-hidden">
              <div className="aspect-video overflow-hidden bg-muted">
                <img src={pdfPlaceholder} alt="Preview" className="w-full h-full object-cover transition-all duration-500 group-hover:scale-115" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(45deg, ${ACCENT}40, transparent 40%, #B07FDC40 80%, transparent)` }}
                />
              </div>
            </div>
          </div>
          <div className="mt-2 text-center">
            <p className="text-xs text-muted-foreground mb-1">April 2025</p>
            <h3 className="font-semibold text-xs text-foreground">Sample PDF Title</h3>
          </div>
        </div>
      ),
    },
    {
      id: 4,
      name: "Corner Accents",
      description: "Gradient accents in corners that expand on hover",
      component: (
        <div className="group cursor-pointer w-48">
          <div className="relative rounded-2xl overflow-hidden bg-card border border-border group-hover:border-transparent transition-all duration-300">
            {/* Corner gradients */}
            <div className="absolute top-0 left-0 w-12 h-12 opacity-40 group-hover:opacity-100 group-hover:w-full group-hover:h-full transition-all duration-500 rounded-tl-2xl"
              style={{ background: `linear-gradient(135deg, ${ACCENT}60, transparent)` }}
            />
            <div className="absolute bottom-0 right-0 w-12 h-12 opacity-40 group-hover:opacity-100 group-hover:w-full group-hover:h-full transition-all duration-500 rounded-br-2xl"
              style={{ background: `linear-gradient(315deg, ${ACCENT}60, transparent)` }}
            />
            <div className="relative">
              <div className="aspect-video overflow-hidden bg-muted rounded-2xl">
                <img src={pdfPlaceholder} alt="Preview" className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(135deg, ${ACCENT}25, transparent 50%, ${ACCENT}25)` }}
                />
              </div>
            </div>
          </div>
          <div className="mt-2 text-center">
            <p className="text-xs text-muted-foreground mb-1">April 2025</p>
            <h3 className="font-semibold text-xs text-foreground">Sample PDF Title</h3>
          </div>
        </div>
      ),
    },
    {
      id: 5,
      name: "Thick Gradient Frame",
      description: "Bold visible gradient border, intensifies on hover",
      component: (
        <div className="group cursor-pointer w-48">
          <div className="relative rounded-2xl p-[4px] transition-all duration-300"
            style={{
              background: `linear-gradient(135deg, ${ACCENT}90, ${ACCENT}30, ${ACCENT}90)`,
            }}
          >
            <div className="absolute inset-0 rounded-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"
              style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}60, ${ACCENT})` }}
            />
            <div className="relative bg-card rounded-xl overflow-hidden">
              <div className="aspect-video overflow-hidden bg-muted">
                <img src={pdfPlaceholder} alt="Preview" className="w-full h-full object-cover transition-all duration-500 group-hover:scale-120" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(to top, ${ACCENT}50 0%, transparent 60%)` }}
                />
              </div>
            </div>
          </div>
          <div className="mt-2 text-center">
            <p className="text-xs text-muted-foreground mb-1">April 2025</p>
            <h3 className="font-semibold text-xs text-foreground">Sample PDF Title</h3>
          </div>
        </div>
      ),
    },
    {
      id: 6,
      name: "Shimmer Edge",
      description: "Moving shimmer effect along the border on hover",
      component: (
        <div className="group cursor-pointer w-48">
          <div className="relative rounded-2xl p-[3px] overflow-hidden transition-all duration-300"
            style={{
              background: `linear-gradient(135deg, ${ACCENT}50, ${ACCENT}15, ${ACCENT}50)`,
            }}
          >
            {/* Shimmer sweep */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: `linear-gradient(90deg, transparent 0%, ${ACCENT}90 50%, transparent 100%)`,
                backgroundSize: '200% 100%',
                animation: 'shimmer 2s linear infinite',
              }}
            />
            <div className="relative bg-card rounded-xl overflow-hidden">
              <div className="aspect-video overflow-hidden bg-muted">
                <img src={pdfPlaceholder} alt="Preview" className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(135deg, ${ACCENT}20, transparent 50%, ${ACCENT}20)` }}
                />
              </div>
            </div>
          </div>
          <div className="mt-2 text-center">
            <p className="text-xs text-muted-foreground mb-1">April 2025</p>
            <h3 className="font-semibold text-xs text-foreground">Sample PDF Title</h3>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-background min-h-screen p-8">
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      <div className="container mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold text-center mb-4">Gradient Zoom — Redesign Options</h1>
        <p className="text-muted-foreground text-center mb-12">
          Hover over each to see the gradient border + overlay effects. All use accent color <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{ACCENT}</code>.
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-10">
          {styles.map((style) => (
            <div key={style.id} className="space-y-4">
              <div className="bg-card/50 p-6 rounded-xl border border-border flex items-center justify-center min-h-[200px]">
                {style.component}
              </div>
              <div className="text-center">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold mb-1.5" style={{ backgroundColor: `${ACCENT}25`, color: ACCENT }}>
                  {style.id}
                </span>
                <h3 className="font-semibold text-sm">{style.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{style.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GradientZoomShowcase;
