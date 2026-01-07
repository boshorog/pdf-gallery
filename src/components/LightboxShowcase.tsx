import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut, Maximize2, FileText } from 'lucide-react';
import pdfPlaceholder from '@/assets/thumbnail-placeholder.png';

const sampleDocs = [
  { id: '1', title: 'Newsletter January 2025', date: 'January 2025', thumbnail: pdfPlaceholder },
  { id: '2', title: 'Newsletter February 2025', date: 'February 2025', thumbnail: pdfPlaceholder },
  { id: '3', title: 'Newsletter March 2025', date: 'March 2025', thumbnail: pdfPlaceholder },
  { id: '4', title: 'Newsletter April 2025', date: 'April 2025', thumbnail: pdfPlaceholder },
];

interface LightboxProps {
  isOpen: boolean;
  onClose: () => void;
  currentIndex: number;
  onPrev: () => void;
  onNext: () => void;
}

// Style 1: Minimal Dark Overlay
const LightboxMinimal = ({ isOpen, onClose, currentIndex, onPrev, onNext }: LightboxProps) => {
  if (!isOpen) return null;
  const doc = sampleDocs[currentIndex];
  
  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
      {/* Close button */}
      <button onClick={onClose} className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors">
        <X className="w-8 h-8" />
      </button>
      
      {/* Navigation */}
      <button onClick={onPrev} className="absolute left-6 text-white/70 hover:text-white transition-colors">
        <ChevronLeft className="w-12 h-12" />
      </button>
      <button onClick={onNext} className="absolute right-6 text-white/70 hover:text-white transition-colors">
        <ChevronRight className="w-12 h-12" />
      </button>
      
      {/* Content */}
      <div className="max-w-4xl max-h-[80vh] flex flex-col items-center">
        <img src={doc.thumbnail} alt={doc.title} className="max-h-[70vh] object-contain rounded-lg shadow-2xl" />
        <div className="mt-6 text-center">
          <h2 className="text-white text-xl font-semibold">{doc.title}</h2>
          <p className="text-white/60 text-sm mt-1">{doc.date}</p>
        </div>
      </div>
      
      {/* Counter */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-sm">
        {currentIndex + 1} / {sampleDocs.length}
      </div>
    </div>
  );
};

// Style 2: Floating Card with Blur
const LightboxFloatingCard = ({ isOpen, onClose, currentIndex, onPrev, onNext }: LightboxProps) => {
  if (!isOpen) return null;
  const doc = sampleDocs[currentIndex];
  
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{doc.title}</h2>
            <p className="text-sm text-gray-500">{doc.date}</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Download className="w-5 h-5 text-gray-600" />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="relative bg-gray-50 p-6">
          <img src={doc.thumbnail} alt={doc.title} className="w-full max-h-[60vh] object-contain rounded-lg" />
          
          {/* Navigation arrows */}
          <button onClick={onPrev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors">
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <button onClick={onNext} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors">
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </button>
        </div>
        
        {/* Footer with thumbnails */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-center gap-2">
          {sampleDocs.map((d, i) => (
            <div 
              key={d.id}
              className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                i === currentIndex ? 'border-blue-500 scale-110' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img src={d.thumbnail} alt={d.title} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Style 3: Full Screen Immersive
const LightboxFullScreen = ({ isOpen, onClose, currentIndex, onPrev, onNext }: LightboxProps) => {
  if (!isOpen) return null;
  const doc = sampleDocs[currentIndex];
  
  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-4 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-white font-medium">{doc.title}</h2>
            <p className="text-white/50 text-sm">{doc.date}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-white/70 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-all">
            <ZoomOut className="w-5 h-5" />
          </button>
          <button className="text-white/70 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-all">
            <ZoomIn className="w-5 h-5" />
          </button>
          <button className="text-white/70 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-all">
            <Maximize2 className="w-5 h-5" />
          </button>
          <button className="text-white/70 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-all">
            <Download className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-white/20 mx-2" />
          <button onClick={onClose} className="text-white/70 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="h-full flex items-center justify-center pt-20 pb-24 px-24">
        <img src={doc.thumbnail} alt={doc.title} className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" />
      </div>
      
      {/* Side navigation */}
      <button onClick={onPrev} className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all">
        <ChevronLeft className="w-8 h-8 text-white" />
      </button>
      <button onClick={onNext} className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all">
        <ChevronRight className="w-8 h-8 text-white" />
      </button>
      
      {/* Bottom thumbnails */}
      <div className="absolute bottom-0 left-0 right-0 py-4 px-6 bg-gradient-to-t from-black/50 to-transparent">
        <div className="flex items-center justify-center gap-3">
          {sampleDocs.map((d, i) => (
            <div 
              key={d.id}
              className={`w-16 h-16 rounded-xl overflow-hidden transition-all cursor-pointer ${
                i === currentIndex 
                  ? 'ring-2 ring-white scale-110 shadow-lg' 
                  : 'opacity-50 hover:opacity-80 hover:scale-105'
              }`}
            >
              <img src={d.thumbnail} alt={d.title} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Style 4: Side Panel Drawer
const LightboxSidePanel = ({ isOpen, onClose, currentIndex, onPrev, onNext }: LightboxProps) => {
  if (!isOpen) return null;
  const doc = sampleDocs[currentIndex];
  
  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      {/* Panel */}
      <div className="w-[600px] bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <button onClick={onPrev} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-gray-500">{currentIndex + 1} of {sampleDocs.length}</span>
            <button onClick={onNext} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Preview */}
        <div className="flex-1 bg-gray-100 p-6 overflow-auto">
          <img src={doc.thumbnail} alt={doc.title} className="w-full rounded-lg shadow-lg" />
        </div>
        
        {/* Details */}
        <div className="p-6 border-t space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{doc.title}</h2>
            <p className="text-gray-500 mt-1">{doc.date}</p>
          </div>
          <div className="flex gap-3">
            <button className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
              <Download className="w-4 h-4" />
              Download PDF
            </button>
            <button className="px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Maximize2 className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Style 5: Modern Split View
const LightboxSplitView = ({ isOpen, onClose, currentIndex, onPrev, onNext }: LightboxProps) => {
  if (!isOpen) return null;
  const doc = sampleDocs[currentIndex];
  
  return (
    <div className="fixed inset-0 z-50 bg-white flex">
      {/* Left: Thumbnails sidebar */}
      <div className="w-24 bg-gray-900 flex flex-col items-center py-6 gap-4">
        {sampleDocs.map((d, i) => (
          <div 
            key={d.id}
            className={`w-16 h-16 rounded-lg overflow-hidden cursor-pointer transition-all ${
              i === currentIndex 
                ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-900' 
                : 'opacity-40 hover:opacity-70'
            }`}
          >
            <img src={d.thumbnail} alt={d.title} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
      
      {/* Center: Main preview */}
      <div className="flex-1 bg-gray-100 flex items-center justify-center relative p-8">
        <img src={doc.thumbnail} alt={doc.title} className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" />
        
        {/* Nav arrows */}
        <button onClick={onPrev} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button onClick={onNext} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors">
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
      
      {/* Right: Details panel */}
      <div className="w-80 border-l flex flex-col">
        <div className="flex items-center justify-end px-4 py-3 border-b">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 p-6 space-y-6">
          <div>
            <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">Document</span>
            <h2 className="text-xl font-bold text-gray-900 mt-1">{doc.title}</h2>
            <p className="text-gray-500 mt-1">{doc.date}</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Type</span>
              <span className="font-medium">PDF Document</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Size</span>
              <span className="font-medium">2.4 MB</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Pages</span>
              <span className="font-medium">8 pages</span>
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t">
          <button className="w-full bg-gray-900 text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Showcase Component
const LightboxShowcase = () => {
  const [activeStyle, setActiveStyle] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const handlePrev = () => setCurrentIndex((prev) => (prev === 0 ? sampleDocs.length - 1 : prev - 1));
  const handleNext = () => setCurrentIndex((prev) => (prev === sampleDocs.length - 1 ? 0 : prev + 1));
  const handleClose = () => setActiveStyle(null);

  const styles = [
    { id: 1, name: 'Minimal Dark', description: 'Clean overlay with focus on content', preview: 'bg-gradient-to-br from-gray-900 to-black' },
    { id: 2, name: 'Floating Card', description: 'Elegant card with thumbnail strip', preview: 'bg-gradient-to-br from-blue-50 to-white' },
    { id: 3, name: 'Full Screen Immersive', description: 'Cinema-style with rich controls', preview: 'bg-gradient-to-br from-slate-800 to-slate-900' },
    { id: 4, name: 'Side Panel Drawer', description: 'Slide-in panel from right', preview: 'bg-gradient-to-r from-gray-100 to-white' },
    { id: 5, name: 'Modern Split View', description: 'Three-column layout with details', preview: 'bg-gradient-to-r from-gray-900 via-gray-100 to-white' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900">Lightbox Styles</h1>
          <p className="text-gray-600 mt-2">Click on any style to preview it in action</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {styles.map((style) => (
            <div 
              key={style.id}
              onClick={() => { setActiveStyle(style.id); setCurrentIndex(0); }}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100"
            >
              {/* Preview area */}
              <div className={`h-48 ${style.preview} relative overflow-hidden`}>
                <div className="absolute inset-4 flex items-center justify-center">
                  <div className="w-24 h-32 bg-white/20 rounded-lg backdrop-blur-sm border border-white/30 shadow-lg" />
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-gray-900 px-4 py-2 rounded-lg font-medium shadow-lg">
                    Preview
                  </span>
                </div>
              </div>
              
              {/* Info */}
              <div className="p-5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Style {style.id}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mt-2">{style.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{style.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center text-gray-500 text-sm">
          Click any card above to see the lightbox in action. Press ESC or click outside to close.
        </div>
      </div>

      {/* Render active lightbox */}
      {activeStyle === 1 && <LightboxMinimal isOpen={true} onClose={handleClose} currentIndex={currentIndex} onPrev={handlePrev} onNext={handleNext} />}
      {activeStyle === 2 && <LightboxFloatingCard isOpen={true} onClose={handleClose} currentIndex={currentIndex} onPrev={handlePrev} onNext={handleNext} />}
      {activeStyle === 3 && <LightboxFullScreen isOpen={true} onClose={handleClose} currentIndex={currentIndex} onPrev={handlePrev} onNext={handleNext} />}
      {activeStyle === 4 && <LightboxSidePanel isOpen={true} onClose={handleClose} currentIndex={currentIndex} onPrev={handlePrev} onNext={handleNext} />}
      {activeStyle === 5 && <LightboxSplitView isOpen={true} onClose={handleClose} currentIndex={currentIndex} onPrev={handlePrev} onNext={handleNext} />}
    </div>
  );
};

export default LightboxShowcase;
