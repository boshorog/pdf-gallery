/**
 * Showcase: 6 visual options for redesigning the "Default Placeholder Image" settings section
 */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Upload, Image, FileImage, RotateCcw, Check, Palette, Sparkles, Monitor, X, Eye } from 'lucide-react';
import pdfPlaceholder from '@/assets/pdf-placeholder.svg';

const sampleCustomPlaceholder = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="140" fill="none"><rect width="200" height="140" rx="8" fill="#E8F5E9"/><text x="100" y="75" text-anchor="middle" font-size="14" fill="#4CAF50" font-family="sans-serif">Custom Image</text></svg>'
);

/* ─── VARIANT 1: Side-by-Side Cards ─── */
const Variant1 = () => {
  const [selected, setSelected] = useState<'default' | 'custom'>('default');
  return (
    <div>
      <h3 className="text-lg font-bold text-foreground mb-1">Variant 1: Side-by-Side Cards</h3>
      <p className="text-sm text-muted-foreground mb-4">Two selectable cards with large previews — default vs custom.</p>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileImage className="w-5 h-5" /> Default Placeholder Image</CardTitle>
          <CardDescription>Choose the placeholder shown when a document has no thumbnail.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {/* Default card */}
            <button
              onClick={() => setSelected('default')}
              className={`relative rounded-xl border-2 p-4 transition-all text-left ${
                selected === 'default'
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'border-border hover:border-muted-foreground/40'
              }`}
            >
              {selected === 'default' && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
              )}
              <div className="aspect-[3/2] bg-muted rounded-lg flex items-center justify-center mb-3 overflow-hidden">
                <img src={pdfPlaceholder} alt="Default" className="w-full h-full object-contain p-4" />
              </div>
              <p className="text-sm font-medium text-foreground">Default</p>
              <p className="text-xs text-muted-foreground">Built-in PDF placeholder</p>
            </button>

            {/* Custom card */}
            <button
              onClick={() => setSelected('custom')}
              className={`relative rounded-xl border-2 p-4 transition-all text-left ${
                selected === 'custom'
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'border-dashed border-border hover:border-muted-foreground/40'
              }`}
            >
              {selected === 'custom' && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
              )}
              <div className="aspect-[3/2] bg-muted rounded-lg flex items-center justify-center mb-3">
                <div className="text-center">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-1" />
                  <span className="text-xs text-muted-foreground">Upload image</span>
                </div>
              </div>
              <p className="text-sm font-medium text-foreground">Custom Image</p>
              <p className="text-xs text-muted-foreground">PNG, JPG up to 2MB</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/* ─── VARIANT 2: Inline Toggle with Live Preview ─── */
const Variant2 = () => {
  const [mode, setMode] = useState<'default' | 'custom'>('default');
  return (
    <div>
      <h3 className="text-lg font-bold text-foreground mb-1">Variant 2: Inline Toggle + Live Preview</h3>
      <p className="text-sm text-muted-foreground mb-4">Radio toggle on the left, large live preview on the right.</p>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Image className="w-5 h-5" /> Default Placeholder Image</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-6">
            {/* Controls */}
            <div className="flex-1 space-y-4">
              <RadioGroup value={mode} onValueChange={(v) => setMode(v as any)}>
                <div className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${mode === 'default' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                  <RadioGroupItem value="default" id="v2-default" />
                  <div>
                    <Label htmlFor="v2-default" className="font-medium cursor-pointer">Built-in placeholder</Label>
                    <p className="text-xs text-muted-foreground">Standard PDF document icon</p>
                  </div>
                </div>
                <div className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${mode === 'custom' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                  <RadioGroupItem value="custom" id="v2-custom" />
                  <div>
                    <Label htmlFor="v2-custom" className="font-medium cursor-pointer">Custom image</Label>
                    <p className="text-xs text-muted-foreground">Upload your own placeholder</p>
                  </div>
                </div>
              </RadioGroup>

              {mode === 'custom' && (
                <div className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors">
                  <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-1" />
                  <p className="text-sm font-medium text-primary">Choose file</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG up to 2MB</p>
                </div>
              )}

              {mode === 'default' && (
                <Button variant="outline" size="sm" className="gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5" /> Reset to default
                </Button>
              )}
            </div>

            {/* Preview */}
            <div className="w-40 shrink-0">
              <Label className="text-xs text-muted-foreground mb-2 block text-center">PREVIEW</Label>
              <div className="aspect-[3/4] bg-muted rounded-xl border border-border flex items-center justify-center overflow-hidden shadow-inner">
                <img
                  src={mode === 'default' ? pdfPlaceholder : sampleCustomPlaceholder}
                  alt="Placeholder preview"
                  className="w-full h-full object-contain p-3"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/* ─── VARIANT 3: Compact Row with Thumbnail ─── */
const Variant3 = () => {
  return (
    <div>
      <h3 className="text-lg font-bold text-foreground mb-1">Variant 3: Compact Single Row</h3>
      <p className="text-sm text-muted-foreground mb-4">Minimal footprint — small thumbnail, filename, and action buttons in one row.</p>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileImage className="w-5 h-5" /> Default Placeholder Image</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg border border-border">
            <div className="w-16 h-12 rounded-md border border-border bg-background flex items-center justify-center overflow-hidden shrink-0">
              <img src={pdfPlaceholder} alt="Current" className="w-full h-full object-contain p-1" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">pdf-placeholder.svg</p>
              <p className="text-xs text-muted-foreground">Built-in default • 4 KB</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button variant="outline" size="sm" className="gap-1.5">
                <Upload className="w-3.5 h-3.5" /> Replace
              </Button>
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/* ─── VARIANT 4: Visual Gallery Picker ─── */
const Variant4 = () => {
  const [selected, setSelected] = useState(0);
  const presets = [
    { label: 'Document Icon', img: pdfPlaceholder },
    { label: 'Minimal Lines', img: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="140" fill="none"><rect width="200" height="140" rx="6" fill="#F5F5F5"/><line x1="50" y1="45" x2="150" y2="45" stroke="#CCC" stroke-width="2"/><line x1="50" y1="65" x2="130" y2="65" stroke="#CCC" stroke-width="2"/><line x1="50" y1="85" x2="140" y2="85" stroke="#CCC" stroke-width="2"/></svg>') },
    { label: 'Branded Color', img: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="140" fill="none"><rect width="200" height="140" rx="6" fill="#86B584" opacity="0.15"/><rect x="70" y="40" width="60" height="60" rx="8" fill="#86B584" opacity="0.4"/><text x="100" y="75" text-anchor="middle" font-size="20" fill="#86B584" font-family="sans-serif">PDF</text></svg>') },
  ];

  return (
    <div>
      <h3 className="text-lg font-bold text-foreground mb-1">Variant 4: Gallery Picker with Presets</h3>
      <p className="text-sm text-muted-foreground mb-4">Choose from built-in presets or upload your own — grid of small selectable thumbnails.</p>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Palette className="w-5 h-5" /> Default Placeholder Image</CardTitle>
          <CardDescription>Select a built-in style or upload a custom image.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3">
            {presets.map((p, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className={`rounded-lg border-2 p-2 transition-all ${
                  selected === i ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-muted-foreground/40'
                }`}
              >
                <div className="aspect-[3/2] bg-muted rounded flex items-center justify-center overflow-hidden mb-1.5">
                  <img src={p.img} alt={p.label} className="w-full h-full object-contain p-2" />
                </div>
                <p className="text-xs font-medium text-foreground text-center truncate">{p.label}</p>
              </button>
            ))}
            {/* Upload slot */}
            <button className="rounded-lg border-2 border-dashed border-border p-2 hover:border-primary/50 transition-colors">
              <div className="aspect-[3/2] rounded flex flex-col items-center justify-center">
                <Upload className="w-5 h-5 text-muted-foreground mb-1" />
                <span className="text-xs text-muted-foreground">Upload</span>
              </div>
              <p className="text-xs font-medium text-foreground text-center mt-1.5">Custom</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/* ─── VARIANT 5: Drag & Drop Zone with Large Preview ─── */
const Variant5 = () => {
  const [isDragging, setIsDragging] = useState(false);
  return (
    <div>
      <h3 className="text-lg font-bold text-foreground mb-1">Variant 5: Drag & Drop Focus</h3>
      <p className="text-sm text-muted-foreground mb-4">Large drag-and-drop zone with the current preview shown as a background watermark.</p>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5" /> Default Placeholder Image</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-all cursor-pointer ${
              isDragging ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-border hover:border-primary/40'
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={() => setIsDragging(false)}
          >
            {/* Watermark preview */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.08] pointer-events-none">
              <img src={pdfPlaceholder} alt="" className="w-32 h-32 object-contain" />
            </div>

            <div className="relative z-10">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                <Upload className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">
                Drag & drop an image here, or <span className="text-primary underline">browse</span>
              </p>
              <p className="text-xs text-muted-foreground">PNG, JPG up to 2MB • Current: Built-in default</p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-7 rounded border border-border bg-background overflow-hidden">
                <img src={pdfPlaceholder} alt="" className="w-full h-full object-contain p-0.5" />
              </div>
              <span className="text-xs text-muted-foreground">Currently using built-in default</span>
            </div>
            <Button variant="ghost" size="sm" className="text-xs gap-1">
              <RotateCcw className="w-3 h-3" /> Reset to default
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/* ─── VARIANT 6: Preview-First with Contextual Actions ─── */
const Variant6 = () => {
  const [showUpload, setShowUpload] = useState(false);
  return (
    <div>
      <h3 className="text-lg font-bold text-foreground mb-1">Variant 6: Preview-First with Overlay Actions</h3>
      <p className="text-sm text-muted-foreground mb-4">Large centered preview with action buttons that appear on hover. Clean and focused.</p>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Monitor className="w-5 h-5" /> Default Placeholder Image</CardTitle>
          <CardDescription>This image is displayed when a document has no generated thumbnail.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center">
            {/* Large preview with hover overlay */}
            <div className="group relative w-48 aspect-[3/4] bg-muted rounded-xl border border-border overflow-hidden shadow-sm">
              <img src={pdfPlaceholder} alt="Current placeholder" className="w-full h-full object-contain p-6" />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                <Button size="sm" variant="secondary" className="gap-1.5 text-xs shadow-md">
                  <Upload className="w-3.5 h-3.5" /> Replace Image
                </Button>
                <Button size="sm" variant="ghost" className="gap-1.5 text-xs text-white hover:text-white hover:bg-white/20">
                  <Eye className="w-3.5 h-3.5" /> Full Preview
                </Button>
              </div>
            </div>

            <div className="mt-3 text-center">
              <p className="text-sm font-medium text-foreground">Built-in Default</p>
              <p className="text-xs text-muted-foreground">pdf-placeholder.svg</p>
            </div>

            <div className="flex gap-2 mt-3">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <Upload className="w-3.5 h-3.5" /> Upload Custom
              </Button>
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground">
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/* ─── SHOWCASE WRAPPER ─── */
const PlaceholderSettingsShowcase = () => {
  return (
    <div className="max-w-3xl mx-auto p-8 space-y-10">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-foreground">Default Placeholder Image — Redesign Options</h1>
        <p className="text-muted-foreground mt-1">6 visual approaches for the settings section</p>
      </div>
      <Variant1 />
      <Variant2 />
      <Variant3 />
      <Variant4 />
      <Variant5 />
      <Variant6 />
    </div>
  );
};

export default PlaceholderSettingsShowcase;
