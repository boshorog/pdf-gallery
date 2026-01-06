import pdfPlaceholder from '@/assets/thumbnail-placeholder.png';

const ThumbnailStyleShowcase = () => {
  const styles = [
    {
      id: 1,
      name: "Default Scale",
      component: (
        <div className="group cursor-pointer">
          <div className="relative bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border border-border">
            <div className="aspect-video overflow-hidden bg-muted">
              <img
                src={pdfPlaceholder}
                alt="Thumbnail preview"
                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            </div>
            <div className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm rounded-md px-2 py-1 shadow-sm">
              <div className="flex items-center gap-1">
                <svg className="w-3 h-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-xs font-medium text-muted-foreground">PDF</span>
              </div>
            </div>
          </div>
          <div className="mt-3" style={{ width: '128px' }}>
            <h3 className="font-semibold text-sm leading-tight text-foreground group-hover:text-primary transition-colors truncate">Sample PDF Title That Might Be Long</h3>
            <p className="text-xs text-muted-foreground leading-tight mt-1 group-hover:text-primary transition-colors truncate">April 2025 Description</p>
          </div>
        </div>
      )
    },
    {
      id: 2,
      name: "Circle Fade",
      component: (
        <div className="group cursor-pointer">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-muted mx-auto border-4 border-border group-hover:border-primary transition-colors duration-300">
              <img
                src={pdfPlaceholder}
                alt="Thumbnail preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 text-center" style={{ width: '128px' }}>
            <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">Sample PDF Title That Might Be Long</h3>
            <p className="text-xs text-muted-foreground mt-1 truncate">April 2025 Description</p>
          </div>
        </div>
      )
    },
    {
      id: 3,
      name: "Hexagon Rotation",
      component: (
        <div className="group cursor-pointer">
          <div className="relative mx-auto" style={{ width: '120px', height: '104px' }}>
            <div 
              className="w-full h-full bg-muted border-2 border-border group-hover:border-primary transition-all duration-300 group-hover:rotate-6 overflow-hidden"
              style={{ 
                clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
              }}
            >
              <img
                src={pdfPlaceholder}
                alt="Thumbnail preview"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="absolute top-2 right-2 w-6 h-6 bg-card rounded-full flex items-center justify-center shadow-md">
              <svg className="w-3 h-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6" />
              </svg>
            </div>
          </div>
          <div className="mt-4 text-center" style={{ width: '120px' }}>
            <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">Sample PDF Title That Might Be Long</h3>
            <p className="text-xs text-muted-foreground mt-1 truncate">April 2025 Description</p>
          </div>
        </div>
      )
    },
    {
      id: 4,
      name: "Elevated Card",
      component: (
        <div className="group cursor-pointer">
          <div className="relative bg-card rounded-2xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-300 transform group-hover:-translate-y-2 border border-border">
            <div className="aspect-[4/3] overflow-hidden bg-muted">
              <img
                src={pdfPlaceholder}
                alt="Thumbnail preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/40"></div>
            </div>
            <div className="absolute bottom-3 right-3">
              <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3" />
                </svg>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-t from-card to-transparent">
              <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">Sample PDF Title That Might Be Long</h3>
              <p className="text-xs text-muted-foreground mt-1 truncate">April 2025 Description</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 5,
      name: "Polaroid Tilt",
      component: (
        <div className="group cursor-pointer">
          <div className="relative bg-white p-3 pb-8 shadow-lg transform rotate-2 group-hover:-rotate-1 group-hover:scale-105 transition-all duration-300 border border-gray-200">
            <div className="aspect-square overflow-hidden bg-muted">
              <img
                src={pdfPlaceholder}
                alt="Thumbnail preview"
                className="w-full h-full object-cover group-hover:brightness-110 transition-all duration-300"
              />
            </div>
            <div className="absolute top-1 right-1">
              <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </div>
            </div>
            <div className="absolute bottom-1 left-3 right-3">
              <h3 className="text-xs text-gray-600 text-center font-handwriting font-semibold truncate">Sample PDF Title That Might Be Long</h3>
            </div>
          </div>
          <div className="mt-2 text-center transform group-hover:translate-y-1 transition-transform duration-300">
            <p className="text-xs text-muted-foreground truncate">April 2025 Description</p>
          </div>
        </div>
      )
    },
    {
      id: 6,
      name: "Slide Up Text",
      component: (
        <div className="group cursor-pointer overflow-hidden rounded-xl">
          <div className="relative bg-card border border-border rounded-xl overflow-hidden">
            <div className="aspect-video overflow-hidden bg-muted">
              <img
                src={pdfPlaceholder}
                alt="Thumbnail preview"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-black/90 via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="absolute bottom-2 left-0 right-0 px-4 pb-3 text-white translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
              <h3 className="font-semibold text-sm leading-tight truncate">Sample PDF Title That Might Be Long</h3>
              <p className="text-xs opacity-90 mt-1 truncate">April 2025 Description</p>
            </div>
            <div className="absolute top-3 left-3 opacity-100 group-hover:opacity-0 transition-opacity duration-300">
              <div className="bg-white/90 rounded px-2 py-1">
                <span className="text-xs font-medium text-gray-700">PDF</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 7,
      name: "Gradient Zoom",
      component: (
        <div className="group cursor-pointer">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 p-1 group-hover:from-primary/40 group-hover:via-secondary/40 group-hover:to-accent/40 transition-all duration-300">
            <div className="relative bg-card rounded-xl overflow-hidden">
              <div className="aspect-video overflow-hidden bg-muted">
                <img
                  src={pdfPlaceholder}
                  alt="Thumbnail preview"
                  className="w-full h-full object-cover transition-all duration-500 group-hover:scale-125"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 via-transparent to-secondary/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>
          </div>
          <div className="mt-3 text-center">
            <h3 className="font-semibold text-sm text-foreground group-hover:text-accent transition-colors truncate">Sample PDF Title That Might Be Long</h3>
            <p className="text-xs text-muted-foreground mt-1 group-hover:text-accent transition-colors truncate">April 2025 Description</p>
          </div>
        </div>
      )
    },
    {
      id: 8,
      name: "Split Layout",
      component: (
        <div className="group cursor-pointer">
          <div className="flex items-center gap-4 bg-card p-4 rounded-lg border border-border group-hover:border-primary transition-all duration-300 group-hover:shadow-md">
            <div className="flex-shrink-0">
              <div className="w-16 h-20 rounded overflow-hidden bg-muted relative">
                <img
                  src={pdfPlaceholder}
                  alt="Thumbnail preview"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-1 right-1">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                </div>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-foreground mb-1 group-hover:text-primary transition-colors truncate">Sample PDF Title That Might Be Long</h3>
              <p className="text-xs text-muted-foreground group-hover:text-primary transition-colors truncate">April 2025 Description</p>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3" />
                </svg>
                <span className="text-xs text-muted-foreground">Download PDF</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 9,
      name: "Minimal Underline",
      component: (
        <div className="group cursor-pointer">
          <div className="space-y-3">
            <div className="relative aspect-video bg-muted rounded-md overflow-hidden">
              <img
                src={pdfPlaceholder}
                alt="Thumbnail preview"
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
              />
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-6 h-6 bg-white/90 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6" />
                  </svg>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-sm text-foreground relative inline-block truncate max-w-full">
                Sample PDF Title That Might Be Long
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
              </h3>
              <p className="text-xs text-muted-foreground mt-1 truncate">April 2025 Description</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 10,
      name: "Magazine Cut",
      component: (
        <div className="group cursor-pointer">
          <div className="relative">
            <div 
              className="relative aspect-[3/4] bg-muted overflow-hidden border-2 border-border group-hover:border-primary transition-colors duration-300"
              style={{ clipPath: 'polygon(0 0, 85% 0, 100% 15%, 100% 100%, 0 100%)' }}
            >
              <img
                src={pdfPlaceholder}
                alt="Thumbnail preview"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/30 group-hover:to-black/50 transition-all duration-300"></div>
            </div>
            <div className="absolute top-3 left-3 bg-white rounded-sm px-2 py-1 shadow-sm transform -rotate-3 group-hover:rotate-0 transition-transform duration-300">
              <span className="text-xs font-bold text-gray-800">PDF</span>
            </div>
            <div className="absolute bottom-4 left-4 right-8 text-white">
              <h3 className="font-bold text-sm leading-tight group-hover:text-yellow-300 transition-colors truncate">Sample PDF Title That Might Be Long</h3>
              <p className="text-xs opacity-90 mt-1 truncate">April 2025 Description</p>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="bg-background min-h-screen p-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">10 Thumbnail Style Options</h1>
        <p className="text-muted-foreground text-center mb-12">
          Hover over each style to see the animation effects. Each style includes both thumbnail and title/subtitle display.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
          {styles.map((style) => (
            <div key={style.id} className="space-y-4">
              <div className="bg-card p-4 rounded-lg border border-border">
                <div className="flex items-center justify-center min-h-[200px]">
                  {style.component}
                </div>
              </div>
              <div className="text-center">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold mb-2">
                  {style.id}
                </span>
                <h3 className="font-semibold text-sm">{style.name}</h3>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            Tell me which styles you'd like to include in the plugin settings, and I'll implement them!
          </p>
        </div>
      </div>
    </div>
  );
};

export default ThumbnailStyleShowcase;