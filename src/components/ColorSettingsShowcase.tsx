import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Palette, RotateCcw, ChevronDown, ChevronRight, Paintbrush, Layers, Type, Minus } from 'lucide-react';
import pdfPlaceholder from '@/assets/thumbnail-placeholder.png';

interface Colors {
  galleryBackground: string;
  galleryBgTransparent: boolean;
  cardBackground: string;
  titleColor: string;
  subtitleColor: string;
  borderColor: string;
  dividerLineColor: string;
  dividerTextColor: string;
}

const DEFAULTS: Colors = {
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
  { name: 'Default', colors: { ...DEFAULTS, galleryBgTransparent: true } },
  { name: 'Dark', colors: { galleryBackground: '#1F2937', galleryBgTransparent: false, cardBackground: '#374151', titleColor: '#F9FAFB', subtitleColor: '#9CA3AF', borderColor: '#4B5563', dividerLineColor: '#4B5563', dividerTextColor: '#9CA3AF' } },
  { name: 'Warm', colors: { galleryBackground: '#FFFBEB', galleryBgTransparent: false, cardBackground: '#FFFFFF', titleColor: '#78350F', subtitleColor: '#92400E', borderColor: '#FDE68A', dividerLineColor: '#FDE68A', dividerTextColor: '#92400E' } },
  { name: 'Ocean', colors: { galleryBackground: '#EFF6FF', galleryBgTransparent: false, cardBackground: '#FFFFFF', titleColor: '#1E3A5F', subtitleColor: '#3B82F6', borderColor: '#BFDBFE', dividerLineColor: '#BFDBFE', dividerTextColor: '#3B82F6' } },
  { name: 'Forest', colors: { galleryBackground: '#F0FDF4', galleryBgTransparent: false, cardBackground: '#FFFFFF', titleColor: '#064E3B', subtitleColor: '#047857', borderColor: '#A7F3D0', dividerLineColor: '#A7F3D0', dividerTextColor: '#047857' } },
];

/** HEX input with color swatch */
const HexSwatch = ({ color, label, onChange, disabled }: { color: string; label: string; onChange: (c: string) => void; disabled?: boolean }) => (
  <div className={`flex items-center gap-2 ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
    <input type="color" value={color} onChange={e => onChange(e.target.value)} className="w-7 h-7 rounded border border-border cursor-pointer p-0 flex-shrink-0" />
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium truncate">{label}</p>
      <Input value={color} onChange={e => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value) || e.target.value === '#') onChange(e.target.value); }} className="h-6 text-[10px] font-mono px-1.5 mt-0.5 w-20" />
    </div>
  </div>
);

/** Gallery preview with divider + 3 thumbnails */
const GalleryPreview = ({ colors, small }: { colors: Colors; small?: boolean }) => {
  const bg = colors.galleryBgTransparent ? 'transparent' : colors.galleryBackground;
  const checkered = colors.galleryBgTransparent
    ? 'repeating-conic-gradient(#e5e7eb 0% 25%, transparent 0% 50%) 50% / 16px 16px'
    : undefined;

  return (
    <div className={`rounded-lg border overflow-hidden ${small ? '' : ''}`} style={{ borderColor: colors.borderColor, backgroundColor: bg, background: checkered || bg }}>
      <div className={`${small ? 'p-2 space-y-2' : 'p-4 space-y-3'}`}>
        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 border-t" style={{ borderColor: colors.dividerLineColor }} />
          <span className={`${small ? 'text-[9px]' : 'text-xs'} font-medium whitespace-nowrap px-2`} style={{ color: colors.dividerTextColor }}>Section Divider</span>
          <div className="flex-1 border-t" style={{ borderColor: colors.dividerLineColor }} />
        </div>
        {/* 3 Thumbnails */}
        <div className="grid grid-cols-3 gap-2">
          {['Report 2025', 'Catalog', 'User Manual'].map(t => (
            <div key={t} className="rounded-md overflow-hidden border" style={{ borderColor: colors.borderColor, backgroundColor: colors.cardBackground }}>
              <div className="aspect-[3/2] overflow-hidden bg-muted">
                <img src={pdfPlaceholder} alt="" className="w-full h-full object-cover" />
              </div>
              <div className={`${small ? 'p-1' : 'p-1.5'}`} style={{ backgroundColor: colors.cardBackground }}>
                <p className={`font-semibold truncate ${small ? 'text-[8px]' : 'text-[10px]'}`} style={{ color: colors.titleColor }}>{t}</p>
                <p className={`${small ? 'text-[7px]' : 'text-[9px]'}`} style={{ color: colors.subtitleColor }}>March 2025</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════ OPTION 1: Colored Preset Cards + Inline Editing ═══════════════════ */
const Option1 = () => {
  const [colors, setColors] = useState<Colors>({ ...DEFAULTS });
  const [active, setActive] = useState('Default');
  const [editing, setEditing] = useState(false);
  const set = (k: keyof Colors, v: string | boolean) => { setColors(prev => ({ ...prev, [k]: v })); setActive(''); setEditing(true); };

  return (
    <div className="space-y-4">
      {/* Preset cards with colored backgrounds */}
      <div className="grid grid-cols-5 gap-1.5">
        {presets.map(p => (
          <button key={p.name} onClick={() => { setColors(p.colors); setActive(p.name); setEditing(false); }}
            className={`rounded-lg p-2 text-center transition-all border-2 ${active === p.name ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-border'}`}
            style={{
              backgroundColor: p.colors.galleryBgTransparent ? undefined : p.colors.galleryBackground,
              color: p.colors.titleColor,
            }}>
            <div className="flex justify-center gap-0.5 mb-1">
              {[p.colors.cardBackground, p.colors.titleColor, p.colors.dividerLineColor].map((c, i) => (
                <div key={i} className="w-2.5 h-2.5 rounded-full border border-black/10" style={{ backgroundColor: c }} />
              ))}
            </div>
            <span className="text-[9px] font-semibold">{p.name}</span>
          </button>
        ))}
      </div>
      {/* Toggle custom */}
      <div className="flex items-center justify-between border-t border-border pt-2">
        <Label className="text-xs">Customize</Label>
        <Switch checked={editing} onCheckedChange={setEditing} />
      </div>
      {editing && (
        <div className="space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Checkbox checked={colors.galleryBgTransparent} onCheckedChange={c => set('galleryBgTransparent', !!c)} id="tp1" />
            <Label htmlFor="tp1" className="text-xs">Transparent gallery background</Label>
          </div>
          <HexSwatch color={colors.galleryBackground} label="Gallery Background" onChange={c => set('galleryBackground', c)} disabled={colors.galleryBgTransparent} />
          <HexSwatch color={colors.cardBackground} label="Card Background" onChange={c => set('cardBackground', c)} />
          <HexSwatch color={colors.titleColor} label="Title" onChange={c => set('titleColor', c)} />
          <HexSwatch color={colors.subtitleColor} label="Subtitle" onChange={c => set('subtitleColor', c)} />
          <HexSwatch color={colors.borderColor} label="Border" onChange={c => set('borderColor', c)} />
          <HexSwatch color={colors.dividerLineColor} label="Divider Line" onChange={c => set('dividerLineColor', c)} />
          <HexSwatch color={colors.dividerTextColor} label="Divider Text" onChange={c => set('dividerTextColor', c)} />
        </div>
      )}
      <GalleryPreview colors={colors} small />
    </div>
  );
};

/* ═══════════════════ OPTION 2: Side-by-Side — Controls Left, Preview Right ═══════════════════ */
const Option2 = () => {
  const [colors, setColors] = useState<Colors>({ ...DEFAULTS });
  const set = (k: keyof Colors, v: string | boolean) => setColors(prev => ({ ...prev, [k]: v }));

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-3">
        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Presets</Label>
        <div className="flex flex-wrap gap-1">
          {presets.map(p => (
            <button key={p.name} onClick={() => setColors(p.colors)}
              className="px-2 py-1 rounded-md text-[9px] font-medium border border-border hover:bg-muted transition-colors"
              style={{ borderLeftColor: p.colors.titleColor, borderLeftWidth: 3 }}>
              {p.name}
            </button>
          ))}
        </div>
        <div className="space-y-2 border-t border-border pt-2">
          <div className="flex items-center gap-2">
            <Checkbox checked={colors.galleryBgTransparent} onCheckedChange={c => set('galleryBgTransparent', !!c)} id="tp2" />
            <Label htmlFor="tp2" className="text-[10px]">Transparent BG</Label>
          </div>
          <HexSwatch color={colors.galleryBackground} label="Gallery BG" onChange={c => set('galleryBackground', c)} disabled={colors.galleryBgTransparent} />
          <HexSwatch color={colors.cardBackground} label="Card BG" onChange={c => set('cardBackground', c)} />
          <HexSwatch color={colors.titleColor} label="Title" onChange={c => set('titleColor', c)} />
          <HexSwatch color={colors.subtitleColor} label="Subtitle" onChange={c => set('subtitleColor', c)} />
          <HexSwatch color={colors.borderColor} label="Border" onChange={c => set('borderColor', c)} />
          <HexSwatch color={colors.dividerLineColor} label="Div. Line" onChange={c => set('dividerLineColor', c)} />
          <HexSwatch color={colors.dividerTextColor} label="Div. Text" onChange={c => set('dividerTextColor', c)} />
        </div>
      </div>
      <div className="flex items-start">
        <GalleryPreview colors={colors} small />
      </div>
    </div>
  );
};

/* ═══════════════════ OPTION 3: Category Accordion with Icons ═══════════════════ */
const Option3 = () => {
  const [colors, setColors] = useState<Colors>({ ...DEFAULTS });
  const [open, setOpen] = useState<string>('bg');
  const set = (k: keyof Colors, v: string | boolean) => { setColors(prev => ({ ...prev, [k]: v })); };

  const sections = [
    { id: 'bg', icon: <Layers className="w-3 h-3" />, label: 'Backgrounds', swatches: [colors.galleryBackground, colors.cardBackground] },
    { id: 'text', icon: <Type className="w-3 h-3" />, label: 'Text', swatches: [colors.titleColor, colors.subtitleColor] },
    { id: 'borders', icon: <Paintbrush className="w-3 h-3" />, label: 'Borders & Dividers', swatches: [colors.borderColor, colors.dividerLineColor, colors.dividerTextColor] },
  ];

  return (
    <div className="space-y-3">
      {/* Presets as colored pills */}
      <div className="flex gap-1.5 flex-wrap">
        {presets.map(p => (
          <button key={p.name} onClick={() => setColors(p.colors)}
            className="rounded-full px-3 py-1 text-[10px] font-medium transition-all border hover:scale-105"
            style={{ backgroundColor: p.colors.galleryBgTransparent ? '#f3f4f6' : p.colors.galleryBackground, color: p.colors.titleColor, borderColor: p.colors.borderColor }}>
            {p.name}
          </button>
        ))}
      </div>

      {/* Accordion sections */}
      {sections.map(s => (
        <div key={s.id} className="border border-border rounded-lg overflow-hidden">
          <button onClick={() => setOpen(open === s.id ? '' : s.id)}
            className="w-full px-3 py-2 flex items-center gap-2 text-xs font-medium hover:bg-muted/50 transition-colors">
            {s.icon}
            <span className="flex-1 text-left">{s.label}</span>
            <div className="flex -space-x-1 mr-2">
              {s.swatches.map((c, i) => <div key={i} className="w-3.5 h-3.5 rounded-full border-2 border-background" style={{ backgroundColor: c }} />)}
            </div>
            {open === s.id ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>
          {open === s.id && (
            <div className="px-3 pb-3 pt-1 border-t border-border space-y-2">
              {s.id === 'bg' && (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <Checkbox checked={colors.galleryBgTransparent} onCheckedChange={c => set('galleryBgTransparent', !!c)} id="tp3" />
                    <Label htmlFor="tp3" className="text-[10px]">Transparent gallery background</Label>
                  </div>
                  <HexSwatch color={colors.galleryBackground} label="Gallery Background" onChange={c => set('galleryBackground', c)} disabled={colors.galleryBgTransparent} />
                  <HexSwatch color={colors.cardBackground} label="Card Background" onChange={c => set('cardBackground', c)} />
                </>
              )}
              {s.id === 'text' && (
                <>
                  <HexSwatch color={colors.titleColor} label="Title Color" onChange={c => set('titleColor', c)} />
                  <HexSwatch color={colors.subtitleColor} label="Subtitle / Date" onChange={c => set('subtitleColor', c)} />
                </>
              )}
              {s.id === 'borders' && (
                <>
                  <HexSwatch color={colors.borderColor} label="Card Border" onChange={c => set('borderColor', c)} />
                  <HexSwatch color={colors.dividerLineColor} label="Divider Line" onChange={c => set('dividerLineColor', c)} />
                  <HexSwatch color={colors.dividerTextColor} label="Divider Text" onChange={c => set('dividerTextColor', c)} />
                </>
              )}
            </div>
          )}
        </div>
      ))}
      <GalleryPreview colors={colors} small />
    </div>
  );
};

/* ═══════════════════ OPTION 4: Full-Width Preview on Top, Flat Controls Below ═══════════════════ */
const Option4 = () => {
  const [colors, setColors] = useState<Colors>({ ...DEFAULTS });
  const set = (k: keyof Colors, v: string | boolean) => setColors(prev => ({ ...prev, [k]: v }));

  return (
    <div className="space-y-4">
      {/* Preview first, full-width */}
      <GalleryPreview colors={colors} />

      {/* Presets as large colored cards */}
      <div className="grid grid-cols-5 gap-1.5">
        {presets.map(p => (
          <button key={p.name} onClick={() => setColors(p.colors)}
            className="rounded-lg overflow-hidden border border-border hover:ring-2 hover:ring-primary/30 transition-all">
            <div className="h-6" style={{ backgroundColor: p.colors.galleryBgTransparent ? '#f8f8f8' : p.colors.galleryBackground }}>
              <div className="h-full flex items-center justify-center gap-0.5">
                <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: p.colors.cardBackground, border: `1px solid ${p.colors.borderColor}` }} />
                <div className="w-2 h-1 rounded-sm" style={{ backgroundColor: p.colors.titleColor }} />
              </div>
            </div>
            <div className="py-0.5 text-center text-[8px] font-medium bg-muted/30">{p.name}</div>
          </button>
        ))}
      </div>

      {/* Flat grid of all swatches */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Checkbox checked={colors.galleryBgTransparent} onCheckedChange={c => set('galleryBgTransparent', !!c)} id="tp4" />
          <Label htmlFor="tp4" className="text-xs">Transparent gallery background</Label>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <HexSwatch color={colors.galleryBackground} label="Gallery BG" onChange={c => set('galleryBackground', c)} disabled={colors.galleryBgTransparent} />
          <HexSwatch color={colors.cardBackground} label="Card BG" onChange={c => set('cardBackground', c)} />
          <HexSwatch color={colors.titleColor} label="Title" onChange={c => set('titleColor', c)} />
          <HexSwatch color={colors.subtitleColor} label="Subtitle" onChange={c => set('subtitleColor', c)} />
          <HexSwatch color={colors.borderColor} label="Border" onChange={c => set('borderColor', c)} />
          <HexSwatch color={colors.dividerLineColor} label="Divider Line" onChange={c => set('dividerLineColor', c)} />
          <HexSwatch color={colors.dividerTextColor} label="Divider Text" onChange={c => set('dividerTextColor', c)} />
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════ OPTION 5: Token Map — Click on Preview Elements ═══════════════════ */
const Option5 = () => {
  const [colors, setColors] = useState<Colors>({ ...DEFAULTS });
  const [selected, setSelected] = useState<keyof Colors | null>(null);
  const set = (k: keyof Colors, v: string) => setColors(prev => ({ ...prev, [k]: v }));

  const bg = colors.galleryBgTransparent ? 'transparent' : colors.galleryBackground;
  const checkered = colors.galleryBgTransparent ? 'repeating-conic-gradient(#e5e7eb 0% 25%, transparent 0% 50%) 50% / 12px 12px' : undefined;

  const highlight = (k: keyof Colors) => selected === k ? '2px solid hsl(var(--primary))' : undefined;

  return (
    <div className="space-y-3">
      <p className="text-[10px] text-muted-foreground text-center">Click any element to edit its color</p>
      {/* Interactive preview */}
      <div className="rounded-lg border overflow-hidden cursor-pointer" style={{ borderColor: colors.borderColor, backgroundColor: bg, background: checkered || bg }}
        onClick={() => setSelected('galleryBackground')}>
        <div className="p-3 space-y-2">
          <div className="flex items-center gap-2" onClick={e => { e.stopPropagation(); setSelected('dividerLineColor'); }}>
            <div className="flex-1 border-t-2 cursor-pointer" style={{ borderColor: colors.dividerLineColor, outline: highlight('dividerLineColor') }} />
            <span className="text-[9px] font-medium px-1 cursor-pointer" style={{ color: colors.dividerTextColor, outline: highlight('dividerTextColor') }}
              onClick={e => { e.stopPropagation(); setSelected('dividerTextColor'); }}>
              Section
            </span>
            <div className="flex-1 border-t-2 cursor-pointer" style={{ borderColor: colors.dividerLineColor }} />
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {['Report', 'Catalog', 'Manual'].map(t => (
              <div key={t} className="rounded overflow-hidden border cursor-pointer"
                style={{ borderColor: colors.borderColor, backgroundColor: colors.cardBackground, outline: highlight('cardBackground') }}
                onClick={e => { e.stopPropagation(); setSelected('cardBackground'); }}>
                <div className="aspect-[3/2] bg-muted overflow-hidden">
                  <img src={pdfPlaceholder} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="p-1">
                  <p className="text-[8px] font-semibold truncate cursor-pointer" style={{ color: colors.titleColor, outline: highlight('titleColor') }}
                    onClick={e => { e.stopPropagation(); setSelected('titleColor'); }}>{t}</p>
                  <p className="text-[7px] cursor-pointer" style={{ color: colors.subtitleColor, outline: highlight('subtitleColor') }}
                    onClick={e => { e.stopPropagation(); setSelected('subtitleColor'); }}>2025</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Active editor */}
      {selected && selected !== 'galleryBgTransparent' && (
        <div className="p-2 bg-muted/50 rounded-lg border border-border animate-in fade-in duration-150 space-y-2">
          <p className="text-[10px] font-semibold capitalize">{String(selected).replace(/([A-Z])/g, ' $1')}</p>
          {selected === 'galleryBackground' && (
            <div className="flex items-center gap-2 mb-1">
              <Checkbox checked={colors.galleryBgTransparent} onCheckedChange={c => setColors(prev => ({ ...prev, galleryBgTransparent: !!c }))} id="tp5" />
              <Label htmlFor="tp5" className="text-[10px]">Transparent</Label>
            </div>
          )}
          <HexSwatch color={colors[selected] as string} label="" onChange={c => set(selected, c)} disabled={selected === 'galleryBackground' && colors.galleryBgTransparent} />
        </div>
      )}
    </div>
  );
};

/* ═══════════════════ OPTION 6: Tabbed Categories ═══════════════════ */
const Option6 = () => {
  const [colors, setColors] = useState<Colors>({ ...DEFAULTS });
  const [tab, setTab] = useState<'presets' | 'custom'>('presets');
  const [category, setCategory] = useState<'bg' | 'text' | 'lines'>('bg');
  const set = (k: keyof Colors, v: string | boolean) => { setColors(prev => ({ ...prev, [k]: v })); setTab('custom'); };

  const tabs = [
    { id: 'bg' as const, label: 'Backgrounds', icon: <Layers className="w-3 h-3" /> },
    { id: 'text' as const, label: 'Text', icon: <Type className="w-3 h-3" /> },
    { id: 'lines' as const, label: 'Lines', icon: <Minus className="w-3 h-3" /> },
  ];

  return (
    <div className="space-y-3">
      <GalleryPreview colors={colors} small />

      {/* Main tabs: Presets / Custom */}
      <div className="flex border-b border-border">
        {(['presets', 'custom'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition-colors border-b-2 ${tab === t ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
            {t === 'presets' ? 'Presets' : 'Custom'}
          </button>
        ))}
      </div>

      {tab === 'presets' ? (
        <div className="grid grid-cols-5 gap-1.5">
          {presets.map(p => (
            <button key={p.name} onClick={() => setColors(p.colors)}
              className="rounded-lg p-1.5 border border-border hover:border-primary/50 transition-all"
              style={{ backgroundColor: p.colors.galleryBgTransparent ? undefined : p.colors.galleryBackground }}>
              <div className="flex justify-center gap-0.5 mb-1">
                {[p.colors.cardBackground, p.colors.titleColor, p.colors.borderColor].map((c, i) => (
                  <div key={i} className="w-2 h-2 rounded-full border border-black/10" style={{ backgroundColor: c }} />
                ))}
              </div>
              <span className="text-[8px] font-medium" style={{ color: p.colors.titleColor }}>{p.name}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {/* Sub-category tabs */}
          <div className="flex gap-1">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setCategory(t.id)}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-colors ${category === t.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'}`}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            {category === 'bg' && (
              <>
                <div className="flex items-center gap-2">
                  <Checkbox checked={colors.galleryBgTransparent} onCheckedChange={c => set('galleryBgTransparent', !!c)} id="tp6" />
                  <Label htmlFor="tp6" className="text-[10px]">Transparent gallery background</Label>
                </div>
                <HexSwatch color={colors.galleryBackground} label="Gallery BG" onChange={c => set('galleryBackground', c)} disabled={colors.galleryBgTransparent} />
                <HexSwatch color={colors.cardBackground} label="Card BG" onChange={c => set('cardBackground', c)} />
              </>
            )}
            {category === 'text' && (
              <>
                <HexSwatch color={colors.titleColor} label="Title" onChange={c => set('titleColor', c)} />
                <HexSwatch color={colors.subtitleColor} label="Subtitle" onChange={c => set('subtitleColor', c)} />
              </>
            )}
            {category === 'lines' && (
              <>
                <HexSwatch color={colors.borderColor} label="Card Border" onChange={c => set('borderColor', c)} />
                <HexSwatch color={colors.dividerLineColor} label="Divider Line" onChange={c => set('dividerLineColor', c)} />
                <HexSwatch color={colors.dividerTextColor} label="Divider Text" onChange={c => set('dividerTextColor', c)} />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════ OPTION 7: Minimal Stripe — All Inline ═══════════════════ */
const Option7 = () => {
  const [colors, setColors] = useState<Colors>({ ...DEFAULTS });
  const set = (k: keyof Colors, v: string | boolean) => setColors(prev => ({ ...prev, [k]: v }));

  const rows: { key: keyof Colors; label: string; group: string }[] = [
    { key: 'galleryBackground', label: 'Gallery Background', group: 'Surface' },
    { key: 'cardBackground', label: 'Card Background', group: 'Surface' },
    { key: 'titleColor', label: 'Title', group: 'Text' },
    { key: 'subtitleColor', label: 'Subtitle / Date', group: 'Text' },
    { key: 'borderColor', label: 'Card Border', group: 'Lines' },
    { key: 'dividerLineColor', label: 'Divider Line', group: 'Lines' },
    { key: 'dividerTextColor', label: 'Divider Text', group: 'Lines' },
  ];

  let lastGroup = '';

  return (
    <div className="space-y-3">
      {/* Quick presets strip */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-muted-foreground font-medium">Theme:</span>
        {presets.map(p => (
          <button key={p.name} onClick={() => setColors(p.colors)}
            className="w-6 h-6 rounded-md border border-border hover:scale-110 transition-transform relative group"
            style={{ backgroundColor: p.colors.galleryBgTransparent ? '#f8f8f8' : p.colors.galleryBackground }}>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.colors.titleColor }} />
            </div>
            <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[7px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{p.name}</span>
          </button>
        ))}
      </div>

      {/* Transparent checkbox */}
      <div className="flex items-center gap-2 pt-1">
        <Checkbox checked={colors.galleryBgTransparent} onCheckedChange={c => set('galleryBgTransparent', !!c)} id="tp7" />
        <Label htmlFor="tp7" className="text-xs">Transparent gallery background</Label>
      </div>

      {/* Stripe-style rows */}
      <div className="rounded-lg border border-border overflow-hidden">
        {rows.map((r, i) => {
          const showGroup = r.group !== lastGroup;
          lastGroup = r.group;
          return (
            <div key={r.key}>
              {showGroup && i > 0 && <div className="border-t border-border" />}
              {showGroup && (
                <div className="px-3 py-1 bg-muted/40">
                  <span className="text-[9px] uppercase tracking-wider font-semibold text-muted-foreground">{r.group}</span>
                </div>
              )}
              <div className={`flex items-center px-3 py-1.5 gap-2 ${r.key === 'galleryBackground' && colors.galleryBgTransparent ? 'opacity-40 pointer-events-none' : ''}`}>
                <input type="color" value={colors[r.key] as string} onChange={e => set(r.key, e.target.value)} className="w-5 h-5 rounded border border-border cursor-pointer p-0 flex-shrink-0" />
                <span className="text-[10px] flex-1">{r.label}</span>
                <Input value={colors[r.key] as string} onChange={e => set(r.key, e.target.value)} className="h-5 w-16 text-[9px] font-mono px-1" />
              </div>
            </div>
          );
        })}
      </div>

      <GalleryPreview colors={colors} small />
    </div>
  );
};

/* ═══════════════════ MAIN SHOWCASE ═══════════════════ */
const options = [
  { id: 1, name: 'Colored Preset Cards', description: 'Preset cards use theme colors as backgrounds; toggle reveals HEX inputs', component: <Option1 /> },
  { id: 2, name: 'Side-by-Side', description: 'Controls on the left, always-visible live preview on the right', component: <Option2 /> },
  { id: 3, name: 'Icon Accordion', description: 'Collapsible sections by category (BG, Text, Borders) with pill presets', component: <Option3 /> },
  { id: 4, name: 'Preview-First', description: 'Large preview on top, visual preset cards and flat 2-column grid below', component: <Option4 /> },
  { id: 5, name: 'Token Map', description: 'Click elements in the preview to edit their color — contextual editing', component: <Option5 /> },
  { id: 6, name: 'Tabbed Categories', description: 'Presets / Custom tabs with sub-categories for Backgrounds, Text, Lines', component: <Option6 /> },
  { id: 7, name: 'Minimal Stripe', description: 'Compact rows with inline HEX inputs, grouped by surface/text/lines', component: <Option7 /> },
];

const ColorSettingsShowcase = () => (
  <div className="bg-background min-h-screen p-8">
    <div className="container mx-auto max-w-7xl">
      <h1 className="text-3xl font-bold text-center mb-2">Color Settings — Restructured</h1>
      <p className="text-muted-foreground text-center mb-10">
        7 approaches · No accent color · HEX default · Transparent BG option · Dividers included
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
