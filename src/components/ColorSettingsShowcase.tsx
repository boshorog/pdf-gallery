import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Palette, RotateCcw, Eye } from 'lucide-react';
import pdfPlaceholder from '@/assets/thumbnail-placeholder.png';

const DEFAULTS = {
  accent: '#7FB3DC',
  background: '#FFFFFF',
  cardBg: '#FFFFFF',
  textPrimary: '#1A1A1A',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
};

/** Mini thumbnail preview card reused across options */
const MiniPreview = ({ colors }: { colors: typeof DEFAULTS }) => (
  <div className="rounded-lg border overflow-hidden w-full max-w-[220px]" style={{ backgroundColor: colors.background, borderColor: colors.border }}>
    <div className="p-3 space-y-2" style={{ backgroundColor: colors.background }}>
      <div className="rounded-md overflow-hidden border" style={{ borderColor: colors.border, backgroundColor: colors.cardBg }}>
        <div className="aspect-[3/2] bg-muted overflow-hidden">
          <img src={pdfPlaceholder} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="p-2" style={{ backgroundColor: colors.cardBg }}>
          <p className="text-[10px]" style={{ color: colors.textSecondary }}>April 2025</p>
          <p className="text-xs font-semibold" style={{ color: colors.textPrimary }}>Sample PDF Title</p>
        </div>
      </div>
      <div className="flex gap-1.5">
        <div className="h-1.5 rounded-full flex-1" style={{ backgroundColor: colors.accent }} />
        <div className="h-1.5 rounded-full w-6" style={{ backgroundColor: colors.accent, opacity: 0.4 }} />
      </div>
    </div>
  </div>
);

const ColorSwatch = ({ color, label, onChange }: { color: string; label: string; onChange: (c: string) => void }) => (
  <div className="flex items-center gap-2">
    <input type="color" value={color} onChange={e => onChange(e.target.value)} className="w-7 h-7 rounded border border-border cursor-pointer p-0" />
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium truncate">{label}</p>
      <p className="text-[10px] text-muted-foreground font-mono">{color}</p>
    </div>
  </div>
);

/* ─────────────────── OPTION 1: Grouped Sections ─────────────────── */
const Option1 = () => {
  const [colors, setColors] = useState({ ...DEFAULTS });
  const set = (key: string, val: string) => setColors(prev => ({ ...prev, [key]: val }));

  return (
    <div className="space-y-4">
      {/* Accent */}
      <div>
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Accent</Label>
        <div className="mt-2">
          <ColorSwatch color={colors.accent} label="Accent Color" onChange={c => set('accent', c)} />
        </div>
      </div>
      {/* Gallery Background */}
      <div className="pt-3 border-t border-border">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Gallery Background</Label>
        <div className="mt-2 space-y-2">
          <ColorSwatch color={colors.background} label="Page Background" onChange={c => set('background', c)} />
          <ColorSwatch color={colors.cardBg} label="Card Background" onChange={c => set('cardBg', c)} />
        </div>
      </div>
      {/* Typography */}
      <div className="pt-3 border-t border-border">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Typography</Label>
        <div className="mt-2 space-y-2">
          <ColorSwatch color={colors.textPrimary} label="Title Color" onChange={c => set('textPrimary', c)} />
          <ColorSwatch color={colors.textSecondary} label="Date / Subtitle" onChange={c => set('textSecondary', c)} />
        </div>
      </div>
      {/* Border */}
      <div className="pt-3 border-t border-border">
        <ColorSwatch color={colors.border} label="Card Border" onChange={c => set('border', c)} />
      </div>
      {/* Preview */}
      <div className="pt-3 border-t border-border flex justify-center">
        <MiniPreview colors={colors} />
      </div>
    </div>
  );
};

/* ─────────────────── OPTION 2: Two-Column with Live Preview ─────────────────── */
const Option2 = () => {
  const [colors, setColors] = useState({ ...DEFAULTS });
  const set = (key: string, val: string) => setColors(prev => ({ ...prev, [key]: val }));

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-3">
        <ColorSwatch color={colors.accent} label="Accent Color" onChange={c => set('accent', c)} />
        <ColorSwatch color={colors.background} label="Page Background" onChange={c => set('background', c)} />
        <ColorSwatch color={colors.cardBg} label="Card Background" onChange={c => set('cardBg', c)} />
        <ColorSwatch color={colors.textPrimary} label="Title Color" onChange={c => set('textPrimary', c)} />
        <ColorSwatch color={colors.textSecondary} label="Subtitle Color" onChange={c => set('textSecondary', c)} />
        <ColorSwatch color={colors.border} label="Border Color" onChange={c => set('border', c)} />
        <button onClick={() => setColors({ ...DEFAULTS })} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mt-2">
          <RotateCcw className="w-3 h-3" /> Reset defaults
        </button>
      </div>
      <div className="flex items-start justify-center pt-2">
        <MiniPreview colors={colors} />
      </div>
    </div>
  );
};

/* ─────────────────── OPTION 3: Accordion-style Collapsible ─────────────────── */
const Option3 = () => {
  const [colors, setColors] = useState({ ...DEFAULTS });
  const [open, setOpen] = useState<string | null>('accent');
  const set = (key: string, val: string) => setColors(prev => ({ ...prev, [key]: val }));

  const sections = [
    { id: 'accent', label: 'Accent Color', items: [{ key: 'accent', label: 'Primary Accent', color: colors.accent }] },
    { id: 'bg', label: 'Backgrounds', items: [{ key: 'background', label: 'Page Background', color: colors.background }, { key: 'cardBg', label: 'Card Background', color: colors.cardBg }] },
    { id: 'text', label: 'Text Colors', items: [{ key: 'textPrimary', label: 'Title', color: colors.textPrimary }, { key: 'textSecondary', label: 'Subtitle', color: colors.textSecondary }] },
    { id: 'border', label: 'Borders', items: [{ key: 'border', label: 'Card Border', color: colors.border }] },
  ];

  return (
    <div className="space-y-2">
      {sections.map(s => (
        <div key={s.id} className="border border-border rounded-lg overflow-hidden">
          <button onClick={() => setOpen(open === s.id ? null : s.id)} className="w-full text-left px-3 py-2 text-xs font-semibold flex items-center justify-between hover:bg-muted/50 transition-colors">
            <span className="flex items-center gap-2">
              <div className="flex -space-x-1">
                {s.items.map(i => <div key={i.key} className="w-4 h-4 rounded-full border-2 border-background" style={{ backgroundColor: i.color }} />)}
              </div>
              {s.label}
            </span>
            <span className={`text-muted-foreground transition-transform ${open === s.id ? 'rotate-180' : ''}`}>▾</span>
          </button>
          {open === s.id && (
            <div className="px-3 pb-3 space-y-2 border-t border-border pt-2">
              {s.items.map(i => <ColorSwatch key={i.key} color={i.color} label={i.label} onChange={c => set(i.key, c)} />)}
            </div>
          )}
        </div>
      ))}
      <div className="pt-2 flex justify-center">
        <MiniPreview colors={colors} />
      </div>
    </div>
  );
};

/* ─────────────────── OPTION 4: Toggle-Based (Simple/Advanced) ─────────────────── */
const Option4 = () => {
  const [colors, setColors] = useState({ ...DEFAULTS });
  const [advanced, setAdvanced] = useState(false);
  const set = (key: string, val: string) => setColors(prev => ({ ...prev, [key]: val }));

  return (
    <div className="space-y-4">
      <ColorSwatch color={colors.accent} label="Accent Color" onChange={c => set('accent', c)} />
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <Label className="text-xs">Customize all colors</Label>
        <Switch checked={advanced} onCheckedChange={setAdvanced} />
      </div>
      {advanced && (
        <div className="space-y-3 pl-2 border-l-2 border-primary/20 animate-in fade-in slide-in-from-top-2 duration-200">
          <ColorSwatch color={colors.background} label="Page Background" onChange={c => set('background', c)} />
          <ColorSwatch color={colors.cardBg} label="Card Background" onChange={c => set('cardBg', c)} />
          <ColorSwatch color={colors.textPrimary} label="Title Color" onChange={c => set('textPrimary', c)} />
          <ColorSwatch color={colors.textSecondary} label="Subtitle Color" onChange={c => set('textSecondary', c)} />
          <ColorSwatch color={colors.border} label="Border Color" onChange={c => set('border', c)} />
        </div>
      )}
      <div className="pt-2 border-t border-border flex justify-center">
        <MiniPreview colors={colors} />
      </div>
    </div>
  );
};

/* ─────────────────── OPTION 5: Visual Token Map ─────────────────── */
const Option5 = () => {
  const [colors, setColors] = useState({ ...DEFAULTS });
  const set = (key: string, val: string) => setColors(prev => ({ ...prev, [key]: val }));

  return (
    <div className="space-y-4">
      {/* The preview IS the settings — click areas to change colors */}
      <p className="text-xs text-muted-foreground text-center">Click any area to change its color</p>
      <div className="rounded-lg border border-border overflow-hidden max-w-[260px] mx-auto relative cursor-pointer" style={{ backgroundColor: colors.background }}>
        <div className="p-3 space-y-2">
          {/* Background click area */}
          <label className="absolute inset-0 cursor-pointer">
            <input type="color" value={colors.background} onChange={e => set('background', e.target.value)} className="opacity-0 absolute w-0 h-0" />
          </label>
          <div className="relative rounded-md overflow-hidden border" style={{ borderColor: colors.border, backgroundColor: colors.cardBg }}>
            {/* Card click area */}
            <label className="absolute inset-0 z-10 cursor-pointer">
              <input type="color" value={colors.cardBg} onChange={e => set('cardBg', e.target.value)} className="opacity-0 absolute w-0 h-0" />
            </label>
            <div className="aspect-[3/2] bg-muted overflow-hidden relative z-20 pointer-events-none">
              <img src={pdfPlaceholder} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="p-2 relative z-20 pointer-events-none">
              <p className="text-[10px]" style={{ color: colors.textSecondary }}>April 2025</p>
              <p className="text-xs font-semibold" style={{ color: colors.textPrimary }}>Sample PDF Title</p>
            </div>
          </div>
          <div className="relative h-2 rounded-full" style={{ backgroundColor: colors.accent }}>
            <label className="absolute inset-0 cursor-pointer z-20">
              <input type="color" value={colors.accent} onChange={e => set('accent', e.target.value)} className="opacity-0 absolute w-0 h-0" />
            </label>
          </div>
        </div>
      </div>
      {/* Swatch summary */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { key: 'accent', label: 'Accent', color: colors.accent },
          { key: 'background', label: 'Background', color: colors.background },
          { key: 'cardBg', label: 'Card', color: colors.cardBg },
          { key: 'textPrimary', label: 'Title', color: colors.textPrimary },
          { key: 'textSecondary', label: 'Subtitle', color: colors.textSecondary },
          { key: 'border', label: 'Border', color: colors.border },
        ].map(s => (
          <div key={s.key} className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded border border-border flex-shrink-0" style={{ backgroundColor: s.color }} />
            <span className="text-[10px] text-muted-foreground truncate">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─────────────────── OPTION 6: Preset Themes + Custom ─────────────────── */
const presets = [
  { name: 'Default', colors: { ...DEFAULTS } },
  { name: 'Dark', colors: { accent: '#60A5FA', background: '#1F2937', cardBg: '#374151', textPrimary: '#F9FAFB', textSecondary: '#9CA3AF', border: '#4B5563' } },
  { name: 'Warm', colors: { accent: '#F59E0B', background: '#FFFBEB', cardBg: '#FFFFFF', textPrimary: '#78350F', textSecondary: '#92400E', border: '#FDE68A' } },
  { name: 'Forest', colors: { accent: '#10B981', background: '#F0FDF4', cardBg: '#FFFFFF', textPrimary: '#064E3B', textSecondary: '#047857', border: '#A7F3D0' } },
];

const Option6 = () => {
  const [colors, setColors] = useState({ ...DEFAULTS });
  const [activePreset, setActivePreset] = useState('Default');
  const [custom, setCustom] = useState(false);
  const set = (key: string, val: string) => { setColors(prev => ({ ...prev, [key]: val })); setActivePreset(''); setCustom(true); };

  return (
    <div className="space-y-4">
      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Presets</Label>
      <div className="grid grid-cols-4 gap-2">
        {presets.map(p => (
          <button
            key={p.name}
            onClick={() => { setColors(p.colors); setActivePreset(p.name); setCustom(false); }}
            className={`rounded-lg border-2 p-2 text-center transition-all ${activePreset === p.name ? 'border-primary shadow-sm' : 'border-border hover:border-muted-foreground/30'}`}
          >
            <div className="flex justify-center gap-0.5 mb-1.5">
              {[p.colors.accent, p.colors.background, p.colors.cardBg, p.colors.textPrimary].map((c, i) => (
                <div key={i} className="w-3 h-3 rounded-full border border-background" style={{ backgroundColor: c }} />
              ))}
            </div>
            <span className="text-[10px] font-medium">{p.name}</span>
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <Label className="text-xs">Custom overrides</Label>
        <Switch checked={custom} onCheckedChange={c => { setCustom(c); if (!c) { const p = presets.find(x => x.name === activePreset); if (p) setColors(p.colors); } }} />
      </div>
      {custom && (
        <div className="space-y-2 animate-in fade-in duration-200">
          <ColorSwatch color={colors.accent} label="Accent" onChange={c => set('accent', c)} />
          <ColorSwatch color={colors.background} label="Background" onChange={c => set('background', c)} />
          <ColorSwatch color={colors.cardBg} label="Card Background" onChange={c => set('cardBg', c)} />
          <ColorSwatch color={colors.textPrimary} label="Title" onChange={c => set('textPrimary', c)} />
          <ColorSwatch color={colors.textSecondary} label="Subtitle" onChange={c => set('textSecondary', c)} />
          <ColorSwatch color={colors.border} label="Border" onChange={c => set('border', c)} />
        </div>
      )}
      <div className="pt-2 border-t border-border flex justify-center">
        <MiniPreview colors={colors} />
      </div>
    </div>
  );
};

/* ─────────────────── MAIN SHOWCASE ─────────────────── */
const options = [
  { id: 1, name: 'Grouped Sections', description: 'Colors organized by category with section dividers', component: <Option1 /> },
  { id: 2, name: 'Side-by-Side Preview', description: 'All colors on the left, live preview always visible on the right', component: <Option2 /> },
  { id: 3, name: 'Accordion Panels', description: 'Collapsible sections — keeps the UI compact', component: <Option3 /> },
  { id: 4, name: 'Simple / Advanced Toggle', description: 'Accent only by default, toggle reveals all customization', component: <Option4 /> },
  { id: 5, name: 'Visual Token Map', description: 'Click directly on the preview to change colors', component: <Option5 /> },
  { id: 6, name: 'Preset Themes + Custom', description: 'Pre-made themes with optional custom overrides', component: <Option6 /> },
];

const ColorSettingsShowcase = () => (
  <div className="bg-background min-h-screen p-8">
    <div className="container mx-auto max-w-6xl">
      <h1 className="text-3xl font-bold text-center mb-2">Color Settings — Redesign Options</h1>
      <p className="text-muted-foreground text-center mb-10">
        Expanding the Accent Color section to cover all gallery color properties. Each option is interactive.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {options.map(opt => (
          <Card key={opt.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">{opt.id}</span>
                <CardTitle className="text-sm">{opt.name}</CardTitle>
              </div>
              <p className="text-xs text-muted-foreground">{opt.description}</p>
            </CardHeader>
            <CardContent>
              {opt.component}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </div>
);

export default ColorSettingsShowcase;
