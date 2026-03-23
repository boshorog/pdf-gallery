import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Palette, RotateCcw, ExternalLink } from 'lucide-react';
import pdfPlaceholder from '@/assets/thumbnail-placeholder.png';
import SaturationColorPicker from '@/components/SaturationColorPicker';

export interface ColorSettingsValues {
  accentColor: string;
  galleryBackground: string;
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
  cardBackground: '#FFFFFF',
  titleColor: '#1A1A1A',
  subtitleColor: '#6B7280',
  borderColor: '#E5E7EB',
  dividerLineColor: '#E5E7EB',
  dividerTextColor: '#6B7280',
};

const presets = [
  { name: 'Default', colors: { ...DEFAULTS } },
  { name: 'Dark', colors: { accentColor: '#60A5FA', galleryBackground: '#1F2937', cardBackground: '#374151', titleColor: '#F9FAFB', subtitleColor: '#9CA3AF', borderColor: '#4B5563', dividerLineColor: '#4B5563', dividerTextColor: '#9CA3AF' } },
  { name: 'Warm', colors: { accentColor: '#F59E0B', galleryBackground: '#FFFBEB', cardBackground: '#FFFFFF', titleColor: '#78350F', subtitleColor: '#92400E', borderColor: '#FDE68A', dividerLineColor: '#FDE68A', dividerTextColor: '#92400E' } },
  { name: 'Forest', colors: { accentColor: '#10B981', galleryBackground: '#F0FDF4', cardBackground: '#FFFFFF', titleColor: '#064E3B', subtitleColor: '#047857', borderColor: '#A7F3D0', dividerLineColor: '#A7F3D0', dividerTextColor: '#047857' } },
];

const SAMPLE_ITEMS = [
  { id: '1', title: 'Annual Report 2025', date: 'March 2025' },
  { id: '2', title: 'Product Catalog', date: 'February 2025' },
  { id: '3', title: 'User Manual v3', date: 'January 2025' },
];

const ColorSwatch = ({ color, label, onChange }: { color: string; label: string; onChange: (c: string) => void }) => (
  <div className="flex items-center gap-2">
    <input type="color" value={color} onChange={e => onChange(e.target.value)} className="w-7 h-7 rounded border border-border cursor-pointer p-0" />
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium truncate">{label}</p>
      <p className="text-[10px] text-muted-foreground font-mono">{color}</p>
    </div>
  </div>
);

interface PreviewThumbnailProps {
  title: string;
  date: string;
  colors: ColorSettingsValues;
  thumbnailStyle: string;
  isHovered: boolean;
  onHover: (h: boolean) => void;
}

const PreviewThumbnail = ({ title, date, colors, thumbnailStyle, isHovered, onHover }: PreviewThumbnailProps) => {
  const handleClick = (e: React.MouseEvent) => { e.preventDefault(); };

  switch (thumbnailStyle) {
    case 'elevated-card':
      return (
        <a href="#" onClick={handleClick} className="block" onMouseEnter={() => onHover(true)} onMouseLeave={() => onHover(false)}>
          <div className="group cursor-pointer">
            <div className={`relative rounded-2xl overflow-hidden shadow-lg transition-all duration-300 border ${isHovered ? 'shadow-2xl -translate-y-2' : ''}`}
              style={{ borderColor: colors.borderColor, backgroundColor: colors.cardBackground }}>
              <div className="aspect-[3/2] overflow-hidden" style={{ backgroundColor: colors.galleryBackground }}>
                <img src={pdfPlaceholder} alt="" className={`w-full h-full object-cover transition-transform duration-300 ${isHovered ? 'scale-105' : ''}`} />
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/40" />
              </div>
              <div className="absolute bottom-3 right-3">
                <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg transition-all duration-300"
                  style={{ backgroundColor: isHovered ? colors.accentColor : undefined, color: isHovered ? 'white' : undefined }}>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3" />
                  </svg>
                </div>
              </div>
              <div className="p-2.5 bg-gradient-to-t from-card to-transparent" style={{ backgroundColor: colors.cardBackground }}>
                <h3 className="font-semibold text-xs transition-colors truncate" style={{ color: isHovered ? colors.accentColor : colors.titleColor }}>{title}</h3>
                <p className="text-[10px] mt-0.5" style={{ color: colors.subtitleColor }}>{date}</p>
              </div>
            </div>
          </div>
        </a>
      );

    case 'slide-up-text':
      return (
        <a href="#" onClick={handleClick} className="block" onMouseEnter={() => onHover(true)} onMouseLeave={() => onHover(false)}>
          <div className="group cursor-pointer overflow-hidden rounded-xl">
            <div className="relative rounded-xl overflow-hidden border" style={{ borderColor: colors.borderColor, backgroundColor: colors.cardBackground }}>
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
                  <div className={`absolute inset-0 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                    style={{ background: `linear-gradient(45deg, ${colors.accentColor}40, transparent 40%, #B07FDC40 80%, transparent)` }} />
                </div>
              </div>
            </div>
            <div className="mt-1.5 text-center">
              <h3 className="font-semibold text-xs transition-colors truncate" style={{ color: isHovered ? colors.accentColor : colors.titleColor }}>{title}</h3>
              <p className="text-[10px] mt-0.5 transition-colors" style={{ color: isHovered ? colors.accentColor : colors.subtitleColor }}>{date}</p>
            </div>
          </div>
        </a>
      );

    case 'split-layout':
      return (
        <a href="#" onClick={handleClick} className="block" onMouseEnter={() => onHover(true)} onMouseLeave={() => onHover(false)}>
          <div className="group cursor-pointer">
            <div className="flex items-center gap-2 p-2 rounded-lg border transition-all duration-300"
              style={{ borderColor: isHovered ? colors.accentColor : colors.borderColor, backgroundColor: colors.cardBackground }}>
              <div className="flex-shrink-0">
                <div className="w-10 aspect-[3/4] rounded overflow-hidden relative" style={{ backgroundColor: colors.galleryBackground }}>
                  <img src={pdfPlaceholder} alt="" className={`w-full h-full object-cover transition-transform duration-300 ${isHovered ? 'scale-110' : ''}`} />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-xs transition-colors truncate" style={{ color: isHovered ? colors.accentColor : colors.titleColor }}>{title}</h3>
                <p className="text-[10px] transition-colors" style={{ color: isHovered ? colors.accentColor : colors.subtitleColor }}>{date}</p>
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
                <h3 className="font-medium text-xs relative inline-block max-w-full truncate" style={{ color: colors.titleColor }}>
                  {title}
                  <span className={`absolute bottom-0 left-0 h-0.5 transition-all duration-300 ${isHovered ? 'w-full' : 'w-0'}`} style={{ backgroundColor: colors.accentColor }} />
                </h3>
                <p className="text-[10px] mt-0.5" style={{ color: colors.subtitleColor }}>{date}</p>
              </div>
            </div>
          </div>
        </a>
      );

    default: // 'default' style
      return (
        <a href="#" onClick={handleClick} className="block" onMouseEnter={() => onHover(true)} onMouseLeave={() => onHover(false)}>
          <div className="group cursor-pointer">
            <div className={`relative rounded-lg overflow-hidden shadow-sm transition-all duration-200 border ${isHovered ? 'shadow-md' : ''}`}
              style={{ borderColor: colors.borderColor, backgroundColor: colors.cardBackground }}>
              <div className="aspect-[3/2] overflow-hidden" style={{ backgroundColor: colors.galleryBackground }}>
                <img src={pdfPlaceholder} alt="" className={`w-full h-full object-cover transition-transform duration-200 ${isHovered ? 'scale-105' : ''}`} />
                {isHovered && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <ExternalLink className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>
            </div>
            <div className="mt-2 transition-colors duration-200">
              <h3 className="font-semibold text-xs leading-tight transition-colors duration-200 truncate"
                style={{ color: isHovered ? colors.accentColor : colors.titleColor, '--accent-color': colors.accentColor } as React.CSSProperties}>
                {title}
              </h3>
              <p className="text-[10px] mt-0.5" style={{ color: colors.subtitleColor }}>{date}</p>
            </div>
          </div>
        </a>
      );
  }
};

interface ColorSettingsProps {
  colors: ColorSettingsValues;
  onChange: (colors: ColorSettingsValues) => void;
  thumbnailStyle?: string;
}

const ColorSettings = ({ colors, onChange, thumbnailStyle = 'default' }: ColorSettingsProps) => {
  const [activePreset, setActivePreset] = useState(() => {
    const match = presets.find(p => p.colors.accentColor === colors.accentColor && p.colors.galleryBackground === colors.galleryBackground);
    return match?.name || '';
  });
  const [custom, setCustom] = useState(() => !presets.some(p => p.colors.accentColor === colors.accentColor && p.colors.galleryBackground === colors.galleryBackground));
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const set = (key: keyof ColorSettingsValues, val: string) => {
    onChange({ ...colors, [key]: val });
    setActivePreset('');
    setCustom(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Color Settings
        </CardTitle>
        <p className="text-sm text-muted-foreground">Choose a preset theme or customize individual colors for your gallery</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Live Preview */}
        <div className="space-y-1.5">
          <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Preview</Label>
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: colors.borderColor, backgroundColor: colors.galleryBackground }}>
            <div className="p-5 space-y-4">
              {/* Divider - matches actual gallery divider */}
              <div className="flex items-center gap-4">
                <div className="flex-1 border-t" style={{ borderColor: colors.dividerLineColor }} />
                <span className="px-4 text-sm font-medium whitespace-nowrap" style={{ color: colors.dividerTextColor }}>
                  Section Divider
                </span>
                <div className="flex-1 border-t" style={{ borderColor: colors.dividerLineColor }} />
              </div>

              {/* 3 Thumbnails below divider */}
              <div className="grid grid-cols-3 gap-3">
                {SAMPLE_ITEMS.map(item => (
                  <PreviewThumbnail
                    key={item.id}
                    title={item.title}
                    date={item.date}
                    colors={colors}
                    thumbnailStyle={thumbnailStyle}
                    isHovered={hoveredId === item.id}
                    onHover={(h) => setHoveredId(h ? item.id : null)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Presets */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Presets</Label>
          <div className="grid grid-cols-4 gap-2">
            {presets.map(p => (
              <button
                key={p.name}
                onClick={() => { onChange(p.colors); setActivePreset(p.name); setCustom(false); }}
                className={`rounded-lg border-2 p-2 text-center transition-all ${activePreset === p.name ? 'border-primary shadow-sm' : 'border-border hover:border-muted-foreground/30'}`}
              >
                <div className="flex justify-center gap-0.5 mb-1.5">
                  {[p.colors.accentColor, p.colors.galleryBackground, p.colors.cardBackground, p.colors.titleColor].map((c, i) => (
                    <div key={i} className="w-3 h-3 rounded-full border border-background" style={{ backgroundColor: c }} />
                  ))}
                </div>
                <span className="text-[10px] font-medium">{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <Label className="text-xs">Custom overrides</Label>
          <Switch checked={custom} onCheckedChange={c => {
            setCustom(c);
            if (!c) {
              const p = presets.find(x => x.name === activePreset);
              if (p) onChange(p.colors);
            }
          }} />
        </div>

        {custom && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Accent Color with Saturation Picker */}
            <div className="space-y-3">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Accent Color</Label>
              <SaturationColorPicker
                color={colors.accentColor}
                onChange={(c) => set('accentColor', c)}
              />
            </div>

            {/* Background Colors */}
            <div className="space-y-2 pt-3 border-t border-border">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Backgrounds</Label>
              <div className="grid grid-cols-2 gap-3">
                <ColorSwatch color={colors.galleryBackground} label="Gallery Background" onChange={c => set('galleryBackground', c)} />
                <ColorSwatch color={colors.cardBackground} label="Card Background" onChange={c => set('cardBackground', c)} />
              </div>
            </div>

            {/* Text Colors */}
            <div className="space-y-2 pt-3 border-t border-border">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Text</Label>
              <div className="grid grid-cols-2 gap-3">
                <ColorSwatch color={colors.titleColor} label="Title Color" onChange={c => set('titleColor', c)} />
                <ColorSwatch color={colors.subtitleColor} label="Subtitle / Date" onChange={c => set('subtitleColor', c)} />
              </div>
            </div>

            {/* Border */}
            <div className="space-y-2 pt-3 border-t border-border">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Border</Label>
              <ColorSwatch color={colors.borderColor} label="Card Border" onChange={c => set('borderColor', c)} />
            </div>

            {/* Divider Colors */}
            <div className="space-y-2 pt-3 border-t border-border">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Section Dividers</Label>
              <div className="grid grid-cols-2 gap-3">
                <ColorSwatch color={colors.dividerLineColor} label="Divider Line" onChange={c => set('dividerLineColor', c)} />
                <ColorSwatch color={colors.dividerTextColor} label="Divider Text" onChange={c => set('dividerTextColor', c)} />
              </div>
            </div>

            {/* Reset */}
            <button onClick={() => { onChange({ ...DEFAULTS }); setActivePreset('Default'); setCustom(false); }} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
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
