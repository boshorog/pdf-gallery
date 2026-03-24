import { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Palette, RotateCcw, Layers, Type, Minus, ExternalLink } from 'lucide-react';
import pdfPlaceholder from '@/assets/thumbnail-placeholder.png';

export interface ColorSettingsValues {
  accentColor: string;
  galleryBackground: string;
  galleryBgTransparent?: boolean;
  cardBackground: string;
  titleColor: string;
  subtitleColor: string;
  borderColor: string;
  dividerLineColor: string;
  dividerTextColor: string;
}

const DEFAULTS: ColorSettingsValues = {
  accentColor: '#7FB3DC',
  galleryBackground: '#FFFFFF',
  galleryBgTransparent: true,
  cardBackground: '#FFFFFF',
  titleColor: '#1A1A1A',
  subtitleColor: '#6B7280',
  borderColor: '#E5E7EB',
  dividerLineColor: '#E5E7EB',
  dividerTextColor: '#6B7280',
};

const presets = [
  { name: 'Default', colors: { ...DEFAULTS } },
  { name: 'Dark', colors: { accentColor: '#60A5FA', galleryBackground: '#1F2937', galleryBgTransparent: false, cardBackground: '#374151', titleColor: '#F9FAFB', subtitleColor: '#9CA3AF', borderColor: '#4B5563', dividerLineColor: '#4B5563', dividerTextColor: '#9CA3AF' } as ColorSettingsValues },
  { name: 'Warm', colors: { accentColor: '#F59E0B', galleryBackground: '#FFFBEB', galleryBgTransparent: false, cardBackground: '#FFFFFF', titleColor: '#78350F', subtitleColor: '#92400E', borderColor: '#FDE68A', dividerLineColor: '#FDE68A', dividerTextColor: '#92400E' } as ColorSettingsValues },
  { name: 'Forest', colors: { accentColor: '#10B981', galleryBackground: '#F0FDF4', galleryBgTransparent: false, cardBackground: '#FFFFFF', titleColor: '#064E3B', subtitleColor: '#047857', borderColor: '#A7F3D0', dividerLineColor: '#A7F3D0', dividerTextColor: '#047857' } as ColorSettingsValues },
  { name: 'Ocean', colors: { accentColor: '#3B82F6', galleryBackground: '#EFF6FF', galleryBgTransparent: false, cardBackground: '#FFFFFF', titleColor: '#1E3A5F', subtitleColor: '#3B6998', borderColor: '#BFDBFE', dividerLineColor: '#BFDBFE', dividerTextColor: '#3B6998' } as ColorSettingsValues },
];

const SAMPLE_ITEMS = [
  { id: '1', title: 'Annual Report 2025', date: 'March 2025' },
  { id: '2', title: 'Product Catalog', date: 'February 2025' },
  { id: '3', title: 'User Manual v3', date: 'January 2025' },
];

// ─── Color labels for display ───
const COLOR_LABELS: Record<string, string> = {
  galleryBackground: 'Gallery Background',
  cardBackground: 'Card Background',
  titleColor: 'Title',
  subtitleColor: 'Subtitle / Date',
  borderColor: 'Card Border',
  dividerLineColor: 'Divider Line',
  dividerTextColor: 'Divider Text',
  accentColor: 'Accent Color',
};

// ─── HSV ↔ HEX helpers ───
function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d + 6) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  const s = max === 0 ? 0 : d / max;
  return [h, s, max];
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  return [parseInt(clean.substring(0, 2), 16) || 0, parseInt(clean.substring(2, 4), 16) || 0, parseInt(clean.substring(4, 6), 16) || 0];
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('');
}

// ─── Inline Color Picker (large, HEX default) ───
const InlineColorPicker = ({ color, onChange }: { color: string; onChange: (c: string) => void }) => {
  const [hsv, setHsv] = useState<[number, number, number]>(() => rgbToHsv(...hexToRgb(color)));
  const [hexInput, setHexInput] = useState(color);
  const canvasRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);
  const draggingSat = useRef(false);
  const draggingHue = useRef(false);

  useEffect(() => {
    const newHsv = rgbToHsv(...hexToRgb(color));
    setHsv(newHsv);
    setHexInput(color);
  }, [color]);

  const emitColor = useCallback((h: number, s: number, v: number) => {
    const hex = rgbToHex(...hsvToRgb(h, s, v));
    onChange(hex);
    setHexInput(hex);
  }, [onChange]);

  const handleSatCanvas = useCallback((e: React.MouseEvent | MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    setHsv([hsv[0], x, 1 - y]);
    emitColor(hsv[0], x, 1 - y);
  }, [hsv, emitColor]);

  const handleHueSlider = useCallback((e: React.MouseEvent | MouseEvent) => {
    const rect = hueRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newH = x * 360;
    setHsv([newH, hsv[1], hsv[2]]);
    emitColor(newH, hsv[1], hsv[2]);
  }, [hsv, emitColor]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (draggingSat.current) handleSatCanvas(e);
      if (draggingHue.current) handleHueSlider(e);
    };
    const onUp = () => { draggingSat.current = false; draggingHue.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [handleSatCanvas, handleHueSlider]);

  const hueColor = `hsl(${hsv[0]}, 100%, 50%)`;

  return (
    <div className="space-y-3">
      {/* Saturation/Value Canvas */}
      <div
        ref={canvasRef}
        className="relative w-full h-40 rounded-lg cursor-crosshair border border-border overflow-hidden"
        style={{ backgroundColor: hueColor }}
        onMouseDown={e => { draggingSat.current = true; handleSatCanvas(e); }}
      >
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, #fff, transparent)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent, #000)' }} />
        <div className="absolute w-4 h-4 rounded-full border-2 border-white shadow-md pointer-events-none"
          style={{ left: `calc(${hsv[1] * 100}% - 8px)`, top: `calc(${(1 - hsv[2]) * 100}% - 8px)`, boxShadow: '0 0 0 1px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.3)' }} />
      </div>
      {/* Hue Slider */}
      <div ref={hueRef}
        className="relative w-full h-4 rounded-full cursor-pointer border border-border"
        style={{ background: 'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)' }}
        onMouseDown={e => { draggingHue.current = true; handleHueSlider(e); }}>
        <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md pointer-events-none"
          style={{ left: `calc(${(hsv[0] / 360) * 100}% - 8px)`, boxShadow: '0 0 0 1px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.3)', backgroundColor: hueColor }} />
      </div>
      {/* HEX input */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg border border-border flex-shrink-0 self-center" style={{ backgroundColor: color }} />
        <div className="flex-1">
          <Label className="text-[10px] text-muted-foreground">HEX</Label>
          <Input value={hexInput}
            onChange={e => { setHexInput(e.target.value); if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) onChange(e.target.value); }}
            className="font-mono h-7 text-xs" placeholder="#000000" />
        </div>
      </div>
    </div>
  );
};

// ─── Color Swatch with Popover picker ───
const ColorSwatchPicker = ({ color, label, onChange, disabled, isSelected, onSelect }: {
  color: string; label: string; onChange: (c: string) => void; disabled?: boolean; isSelected?: boolean; onSelect?: () => void;
}) => (
  <Popover>
    <PopoverTrigger asChild>
      <button
        disabled={disabled}
        onClick={onSelect}
        className={`flex items-center gap-2 w-full p-1.5 rounded-md transition-all text-left ${disabled ? 'opacity-40 pointer-events-none' : 'hover:bg-muted/50 cursor-pointer'} ${isSelected ? 'ring-2 ring-primary bg-primary/5' : ''}`}
      >
        <div className="w-6 h-6 rounded border border-border flex-shrink-0" style={{ backgroundColor: color }} />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium truncate">{label}</p>
          <p className="text-[10px] text-muted-foreground font-mono">{color}</p>
        </div>
      </button>
    </PopoverTrigger>
    <PopoverContent className="w-72 p-3" side="left" align="start">
      <p className="text-xs font-semibold mb-2">{label}</p>
      <InlineColorPicker color={color} onChange={onChange} />
    </PopoverContent>
  </Popover>
);

// ─── Preview Thumbnail (supports all styles) ───
interface PreviewThumbnailProps {
  title: string;
  date: string;
  colors: ColorSettingsValues;
  thumbnailStyle: string;
  isHovered: boolean;
  onHover: (h: boolean) => void;
  onClickElement?: (key: keyof ColorSettingsValues) => void;
}

const PreviewThumbnail = ({ title, date, colors, thumbnailStyle, isHovered, onHover, onClickElement }: PreviewThumbnailProps) => {
  const click = (e: React.MouseEvent, key: keyof ColorSettingsValues) => { e.preventDefault(); e.stopPropagation(); onClickElement?.(key); };
  const handleClick = (e: React.MouseEvent) => { e.preventDefault(); };

  // Wrap content for token-map click behavior
  const wrapClick = (key: keyof ColorSettingsValues, children: React.ReactNode, className?: string) => (
    <span className={className} onClick={e => click(e, key)} style={{ cursor: 'pointer' }}>{children}</span>
  );

  switch (thumbnailStyle) {
    case 'elevated-card':
      return (
        <a href="#" onClick={handleClick} className="block" onMouseEnter={() => onHover(true)} onMouseLeave={() => onHover(false)}>
          <div className="group cursor-pointer">
            <div className={`relative rounded-2xl overflow-hidden shadow-lg transition-all duration-300 border ${isHovered ? 'shadow-2xl -translate-y-2' : ''}`}
              style={{ borderColor: colors.borderColor, backgroundColor: colors.cardBackground }}
              onClick={e => click(e, 'cardBackground')}>
              <div className="aspect-[3/2] overflow-hidden" style={{ backgroundColor: colors.galleryBackground }}>
                <img src={pdfPlaceholder} alt="" className={`w-full h-full object-cover transition-transform duration-300 ${isHovered ? 'scale-105' : ''}`} />
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/40" />
              </div>
              <div className="p-2.5" style={{ backgroundColor: colors.cardBackground }}>
                <h3 className="font-semibold text-xs transition-colors truncate"
                  style={{ color: isHovered ? colors.accentColor : colors.titleColor }}
                  onClick={e => click(e, 'titleColor')}>{title}</h3>
                <p className="text-[10px] mt-0.5" style={{ color: colors.subtitleColor }}
                  onClick={e => click(e, 'subtitleColor')}>{date}</p>
              </div>
            </div>
          </div>
        </a>
      );

    case 'slide-up-text':
      return (
        <a href="#" onClick={handleClick} className="block" onMouseEnter={() => onHover(true)} onMouseLeave={() => onHover(false)}>
          <div className="group cursor-pointer overflow-hidden rounded-xl">
            <div className="relative rounded-xl overflow-hidden border" style={{ borderColor: colors.borderColor, backgroundColor: colors.cardBackground }}
              onClick={e => click(e, 'cardBackground')}>
              <div className="aspect-[3/2] overflow-hidden" style={{ backgroundColor: colors.galleryBackground }}>
                <img src={pdfPlaceholder} alt="" className={`w-full h-full object-cover transition-transform duration-500 ${isHovered ? 'scale-110' : ''}`} />
              </div>
              <div className="absolute inset-0 pointer-events-none">
                <div className={`absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-black/95 via-black/70 to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
              </div>
              <div className={`absolute bottom-2 left-0 right-0 px-3 pb-2 text-white transition-all duration-300 ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
                <h3 className="font-bold text-xs leading-tight truncate text-white">{title}</h3>
                <p className="text-[10px] opacity-90 mt-0.5 truncate text-white">{date}</p>
              </div>
            </div>
          </div>
        </a>
      );

    case 'gradient-zoom':
      return (
        <a href="#" onClick={handleClick} className="block" onMouseEnter={() => onHover(true)} onMouseLeave={() => onHover(false)}>
          <div className="group cursor-pointer">
            <div className="relative rounded-2xl p-[3px] transition-all duration-300"
              style={{ background: `linear-gradient(135deg, ${colors.accentColor}99, #B07FDC99, ${colors.accentColor}99)` }}>
              <div className={`absolute inset-0 rounded-2xl transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                style={{ background: `linear-gradient(135deg, ${colors.accentColor}, #B07FDC, ${colors.accentColor})` }} />
              <div className="relative rounded-xl overflow-hidden" style={{ backgroundColor: colors.cardBackground }}>
                <div className="aspect-[3/2] overflow-hidden" style={{ backgroundColor: colors.galleryBackground }}>
                  <img src={pdfPlaceholder} alt="" className={`w-full h-full object-cover transition-all duration-500 ${isHovered ? 'scale-[1.15]' : ''}`} />
                </div>
              </div>
            </div>
            <div className="mt-1.5 text-center">
              <h3 className="font-semibold text-xs transition-colors truncate"
                style={{ color: isHovered ? colors.accentColor : colors.titleColor }}
                onClick={e => click(e, 'titleColor')}>{title}</h3>
              <p className="text-[10px] mt-0.5" style={{ color: isHovered ? colors.accentColor : colors.subtitleColor }}
                onClick={e => click(e, 'subtitleColor')}>{date}</p>
            </div>
          </div>
        </a>
      );

    case 'split-layout':
      return (
        <a href="#" onClick={handleClick} className="block" onMouseEnter={() => onHover(true)} onMouseLeave={() => onHover(false)}>
          <div className="group cursor-pointer">
            <div className="flex items-center gap-2 p-2 rounded-lg border transition-all duration-300"
              style={{ borderColor: isHovered ? colors.accentColor : colors.borderColor, backgroundColor: colors.cardBackground }}
              onClick={e => click(e, 'cardBackground')}>
              <div className="flex-shrink-0">
                <div className="w-10 aspect-[3/4] rounded overflow-hidden" style={{ backgroundColor: colors.galleryBackground }}>
                  <img src={pdfPlaceholder} alt="" className={`w-full h-full object-cover transition-transform duration-300 ${isHovered ? 'scale-110' : ''}`} />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-xs truncate" style={{ color: isHovered ? colors.accentColor : colors.titleColor }}
                  onClick={e => click(e, 'titleColor')}>{title}</h3>
                <p className="text-[10px]" style={{ color: isHovered ? colors.accentColor : colors.subtitleColor }}
                  onClick={e => click(e, 'subtitleColor')}>{date}</p>
              </div>
            </div>
          </div>
        </a>
      );

    case 'minimal-underline':
      return (
        <a href="#" onClick={handleClick} className="block" onMouseEnter={() => onHover(true)} onMouseLeave={() => onHover(false)}>
          <div className="group cursor-pointer">
            <div className="space-y-1.5">
              <div className="relative aspect-[3/2] overflow-hidden" style={{ backgroundColor: colors.galleryBackground }}>
                <img src={pdfPlaceholder} alt="" className={`w-full h-full object-cover transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-80'}`} />
              </div>
              <div>
                <h3 className="font-medium text-xs relative inline-block max-w-full truncate" style={{ color: colors.titleColor }}
                  onClick={e => click(e, 'titleColor')}>
                  {title}
                  <span className={`absolute bottom-0 left-0 h-0.5 transition-all duration-300 ${isHovered ? 'w-full' : 'w-0'}`} style={{ backgroundColor: colors.accentColor }} />
                </h3>
                <p className="text-[10px] mt-0.5" style={{ color: colors.subtitleColor }}
                  onClick={e => click(e, 'subtitleColor')}>{date}</p>
              </div>
            </div>
          </div>
        </a>
      );

    default:
      return (
        <a href="#" onClick={handleClick} className="block" onMouseEnter={() => onHover(true)} onMouseLeave={() => onHover(false)}>
          <div className="group cursor-pointer">
            <div className={`relative rounded-lg overflow-hidden shadow-sm transition-all duration-200 border ${isHovered ? 'shadow-md' : ''}`}
              style={{ borderColor: colors.borderColor, backgroundColor: colors.cardBackground }}
              onClick={e => click(e, 'cardBackground')}>
              <div className="aspect-[3/2] overflow-hidden" style={{ backgroundColor: colors.galleryBackground }}>
                <img src={pdfPlaceholder} alt="" className={`w-full h-full object-cover transition-transform duration-200 ${isHovered ? 'scale-105' : ''}`} />
                {isHovered && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <ExternalLink className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>
            </div>
            <div className="mt-2">
              <h3 className="font-semibold text-xs truncate" style={{ color: isHovered ? colors.accentColor : colors.titleColor }}
                onClick={e => click(e, 'titleColor')}>{title}</h3>
              <p className="text-[10px] mt-0.5" style={{ color: colors.subtitleColor }}
                onClick={e => click(e, 'subtitleColor')}>{date}</p>
            </div>
          </div>
        </a>
      );
  }
};

// ─── Main Color Settings Component ───
interface ColorSettingsProps {
  colors: ColorSettingsValues;
  onChange: (colors: ColorSettingsValues) => void;
  thumbnailStyle?: string;
}

const ColorSettings = ({ colors, onChange, thumbnailStyle = 'default' }: ColorSettingsProps) => {
  const [tab, setTab] = useState<'presets' | 'custom'>('presets');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedToken, setSelectedToken] = useState<keyof ColorSettingsValues | null>(null);

  const set = (key: keyof ColorSettingsValues, val: string | boolean) => {
    onChange({ ...colors, [key]: val });
    setTab('custom');
  };

  const bg = colors.galleryBgTransparent ? 'transparent' : colors.galleryBackground;
  const checkered = colors.galleryBgTransparent
    ? 'repeating-conic-gradient(#e5e7eb 0% 25%, transparent 0% 50%) 50% / 16px 16px'
    : undefined;

  const highlight = (k: keyof ColorSettingsValues) =>
    selectedToken === k ? '0 0 0 2px hsl(var(--primary))' : undefined;

  const handleTokenClick = (key: keyof ColorSettingsValues) => {
    setSelectedToken(key);
    setTab('custom');
    // Auto-switch to correct category
    if (key === 'galleryBackground' || key === 'cardBackground') setCategory('bg');
    else if (key === 'titleColor' || key === 'subtitleColor' || key === 'accentColor') setCategory('text');
    else if (key === 'borderColor' || key === 'dividerLineColor' || key === 'dividerTextColor') setCategory('lines');
  };

  const subTabs = [
    { id: 'bg' as const, label: 'Backgrounds', icon: <Layers className="w-3 h-3" /> },
    { id: 'text' as const, label: 'Text', icon: <Type className="w-3 h-3" /> },
    { id: 'lines' as const, label: 'Lines', icon: <Minus className="w-3 h-3" /> },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Color Settings
        </CardTitle>
        <p className="text-sm text-muted-foreground">Click any element in the preview to edit its color, or use the tabs below</p>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* ── Interactive Token Map Preview ── */}
        <div className="space-y-1.5">
          <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest text-center block">Preview</Label>
          <div
            className="rounded-xl border overflow-hidden cursor-pointer transition-shadow"
            style={{ borderColor: colors.borderColor, backgroundColor: bg, background: checkered || bg, boxShadow: highlight('galleryBackground') }}
            onClick={() => handleTokenClick('galleryBackground')}
          >
            <div className="p-5 space-y-4">
              {/* Divider - both sides clickable with tall hit area */}
              <div className="flex items-center gap-4">
                <div
                  className="flex-1 cursor-pointer transition-shadow rounded relative"
                  style={{ boxShadow: highlight('dividerLineColor') }}
                  onClick={e => { e.stopPropagation(); handleTokenClick('dividerLineColor'); }}
                >
                  <div className="py-3">
                    <div className="border-t" style={{ borderColor: colors.dividerLineColor }} />
                  </div>
                </div>
                <span
                  className="px-4 text-sm font-medium whitespace-nowrap cursor-pointer transition-shadow rounded px-2 py-0.5"
                  style={{ color: colors.dividerTextColor, boxShadow: highlight('dividerTextColor') }}
                  onClick={e => { e.stopPropagation(); handleTokenClick('dividerTextColor'); }}
                >
                  Section Divider
                </span>
                <div
                  className="flex-1 cursor-pointer transition-shadow rounded relative"
                  style={{ boxShadow: highlight('dividerLineColor') }}
                  onClick={e => { e.stopPropagation(); handleTokenClick('dividerLineColor'); }}
                >
                  <div className="py-3">
                    <div className="border-t" style={{ borderColor: colors.dividerLineColor }} />
                  </div>
                </div>
              </div>

              {/* 3 Thumbnails */}
              <div className="grid grid-cols-3 gap-3">
                {SAMPLE_ITEMS.map(item => (
                  <PreviewThumbnail
                    key={item.id}
                    title={item.title}
                    date={item.date}
                    colors={colors}
                    thumbnailStyle={thumbnailStyle}
                    isHovered={hoveredId === item.id}
                    onHover={h => setHoveredId(h ? item.id : null)}
                    onClickElement={handleTokenClick}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Tabs: Presets / Custom ── */}
        <div className="flex border-b border-border">
          {(['presets', 'custom'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 ${tab === t ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
              {t === 'presets' ? 'Presets' : 'Custom'}
            </button>
          ))}
        </div>

        {tab === 'presets' ? (
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-2">
              {presets.map(p => {
                const isActive = p.colors.accentColor === colors.accentColor &&
                  p.colors.galleryBackground === colors.galleryBackground &&
                  p.colors.cardBackground === colors.cardBackground;
                return (
                  <button key={p.name} onClick={() => onChange(p.colors)}
                    className={`rounded-lg border-2 p-2.5 text-center transition-all ${isActive ? 'border-primary shadow-sm ring-1 ring-primary/20' : 'border-border hover:border-muted-foreground/30'}`}
                    style={{ backgroundColor: p.colors.galleryBgTransparent ? undefined : p.colors.galleryBackground }}>
                    <div className="flex justify-center gap-1 mb-1.5">
                      {[p.colors.accentColor, p.colors.cardBackground, p.colors.titleColor, p.colors.borderColor].map((c, i) => (
                        <div key={i} className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                    <span className="text-[10px] font-semibold" style={{ color: p.colors.titleColor }}>{p.name}</span>
                  </button>
                );
              })}
            </div>
            {/* Reset to defaults */}
            <button
              onClick={() => onChange({ ...DEFAULTS })}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" /> Reset to defaults
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Sub-category tabs */}
            <div className="flex gap-1">
              {subTabs.map(t => (
                <button key={t.id} onClick={() => setCategory(t.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${category === t.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'}`}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            <div className="space-y-1">
              {category === 'bg' && (
                <>
                  <div className="flex items-center gap-2 px-1.5 py-1">
                    <Checkbox
                      checked={!!colors.galleryBgTransparent}
                      onCheckedChange={c => set('galleryBgTransparent', !!c)}
                      id="color-transparent-bg"
                    />
                    <Label htmlFor="color-transparent-bg" className="text-xs cursor-pointer">Transparent gallery background</Label>
                  </div>
                  <ColorSwatchPicker color={colors.galleryBackground} label="Gallery Background" onChange={c => set('galleryBackground', c)}
                    disabled={!!colors.galleryBgTransparent} isSelected={selectedToken === 'galleryBackground'} onSelect={() => setSelectedToken('galleryBackground')} />
                  <ColorSwatchPicker color={colors.cardBackground} label="Card Background" onChange={c => set('cardBackground', c)}
                    isSelected={selectedToken === 'cardBackground'} onSelect={() => setSelectedToken('cardBackground')} />
                </>
              )}
              {category === 'text' && (
                <>
                  <ColorSwatchPicker color={colors.accentColor} label="Accent Color" onChange={c => set('accentColor', c)}
                    isSelected={selectedToken === 'accentColor'} onSelect={() => setSelectedToken('accentColor')} />
                  <ColorSwatchPicker color={colors.titleColor} label="Title" onChange={c => set('titleColor', c)}
                    isSelected={selectedToken === 'titleColor'} onSelect={() => setSelectedToken('titleColor')} />
                  <ColorSwatchPicker color={colors.subtitleColor} label="Subtitle / Date" onChange={c => set('subtitleColor', c)}
                    isSelected={selectedToken === 'subtitleColor'} onSelect={() => setSelectedToken('subtitleColor')} />
                </>
              )}
              {category === 'lines' && (
                <>
                  <ColorSwatchPicker color={colors.borderColor} label="Card Border" onChange={c => set('borderColor', c)}
                    isSelected={selectedToken === 'borderColor'} onSelect={() => setSelectedToken('borderColor')} />
                  <ColorSwatchPicker color={colors.dividerLineColor} label="Divider Line" onChange={c => set('dividerLineColor', c)}
                    isSelected={selectedToken === 'dividerLineColor'} onSelect={() => setSelectedToken('dividerLineColor')} />
                  <ColorSwatchPicker color={colors.dividerTextColor} label="Divider Text" onChange={c => set('dividerTextColor', c)}
                    isSelected={selectedToken === 'dividerTextColor'} onSelect={() => setSelectedToken('dividerTextColor')} />
                </>
              )}
            </div>

            {/* Reset */}
            <button
              onClick={() => { onChange({ ...DEFAULTS }); setSelectedToken(null); }}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" /> Reset to defaults
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ColorSettings;
export { DEFAULTS as COLOR_DEFAULTS };
