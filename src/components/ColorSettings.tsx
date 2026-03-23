import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Palette, RotateCcw } from 'lucide-react';
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

const ColorSwatch = ({ color, label, onChange }: { color: string; label: string; onChange: (c: string) => void }) => (
  <div className="flex items-center gap-2">
    <input type="color" value={color} onChange={e => onChange(e.target.value)} className="w-7 h-7 rounded border border-border cursor-pointer p-0" />
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium truncate">{label}</p>
      <p className="text-[10px] text-muted-foreground font-mono">{color}</p>
    </div>
  </div>
);

interface ColorSettingsProps {
  colors: ColorSettingsValues;
  onChange: (colors: ColorSettingsValues) => void;
}

const ColorSettings = ({ colors, onChange }: ColorSettingsProps) => {
  const [activePreset, setActivePreset] = useState(() => {
    const match = presets.find(p => p.colors.accentColor === colors.accentColor && p.colors.galleryBackground === colors.galleryBackground);
    return match?.name || '';
  });
  const [custom, setCustom] = useState(() => !presets.some(p => p.colors.accentColor === colors.accentColor && p.colors.galleryBackground === colors.galleryBackground));

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
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: colors.borderColor, backgroundColor: colors.galleryBackground }}>
          <div className="p-4 space-y-3">
            {/* Thumbnail card preview */}
            <div className="flex gap-3">
              <div className="rounded-lg border overflow-hidden flex-shrink-0" style={{ borderColor: colors.borderColor, backgroundColor: colors.cardBackground }}>
                <div className="w-20 h-14 overflow-hidden bg-muted">
                  <img src={pdfPlaceholder} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="p-1.5" style={{ backgroundColor: colors.cardBackground }}>
                  <p className="text-[9px]" style={{ color: colors.subtitleColor }}>April 2025</p>
                  <p className="text-[10px] font-semibold" style={{ color: colors.titleColor }}>Sample PDF</p>
                </div>
              </div>
              <div className="rounded-lg border overflow-hidden flex-shrink-0" style={{ borderColor: colors.borderColor, backgroundColor: colors.cardBackground }}>
                <div className="w-20 h-14 overflow-hidden bg-muted">
                  <img src={pdfPlaceholder} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="p-1.5" style={{ backgroundColor: colors.cardBackground }}>
                  <p className="text-[9px]" style={{ color: colors.subtitleColor }}>March 2025</p>
                  <p className="text-[10px] font-semibold" style={{ color: colors.titleColor }}>Another Doc</p>
                </div>
              </div>
            </div>
            {/* Divider preview */}
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 border-t" style={{ borderColor: colors.dividerLineColor }} />
              <span className="text-[10px] font-medium px-2 whitespace-nowrap" style={{ color: colors.dividerTextColor }}>Section Divider</span>
              <div className="flex-1 border-t" style={{ borderColor: colors.dividerLineColor }} />
            </div>
            {/* Accent bar */}
            <div className="flex gap-1.5">
              <div className="h-1.5 rounded-full flex-1" style={{ backgroundColor: colors.accentColor }} />
              <div className="h-1.5 rounded-full w-6" style={{ backgroundColor: colors.accentColor, opacity: 0.4 }} />
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
