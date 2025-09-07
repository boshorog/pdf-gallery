import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import pdfPlaceholder from '@/assets/pdf-placeholder.png';

interface PDFSettingsProps {
  settings: {
    thumbnailStyle: string;
    accentColor: string;
    thumbnailShape: string;
    pdfIconPosition: string;
    defaultPlaceholder: string;
  };
  onSettingsChange: (settings: any) => void;
}

const PDFSettings = ({ settings, onSettingsChange }: PDFSettingsProps) => {
  const [localSettings, setLocalSettings] = useState(settings);
  const { toast } = useToast();

  // keep local state in sync when parent settings change
  // (e.g., when loaded from WordPress)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = () => {
    onSettingsChange(localSettings);
    toast({
      title: "Settings Saved",
      description: "Your gallery settings have been updated successfully",
    });
  };

  const thumbnailShapes = [
    { value: 'landscape-16-9', label: 'Landscape 16:9', aspect: 'aspect-video' },
    { value: 'landscape-3-2', label: 'Landscape 3:2', aspect: 'aspect-[3/2]' },
    { value: 'square', label: 'Square 1:1', aspect: 'aspect-square' },
    { value: 'portrait-2-3', label: 'Portrait 2:3', aspect: 'aspect-[2/3]' },
  ];

  // Note: positions arranged via layout, no need for array order

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Settings</h2>
        <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
          Save Settings
        </Button>
      </div>

      {/* Thumbnail Style */}
      <Card>
        <CardHeader>
          <CardTitle>Thumbnail Style</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="default-style" 
                checked={localSettings.thumbnailStyle === 'default'}
                onCheckedChange={(checked) => 
                  checked && setLocalSettings(prev => ({ ...prev, thumbnailStyle: 'default' }))
                }
              />
              <Label htmlFor="default-style">Default style</Label>
            </div>
            <p className="text-sm text-muted-foreground ml-6">
              Includes thumbnail, title, and date
            </p>
            {/* Preview */}
            <div className="mt-4">
              <div className="max-w-xs">
                <div className="relative bg-card rounded-lg overflow-hidden shadow-sm border border-border">
                  <div className={`${localSettings.thumbnailShape === 'square' ? 'aspect-square' : localSettings.thumbnailShape === 'landscape-3-2' ? 'aspect-[3/2]' : localSettings.thumbnailShape === 'portrait-2-3' ? 'aspect-[2/3]' : 'aspect-video'} overflow-hidden bg-muted`}>
                    <img
                      src={(localSettings.defaultPlaceholder && localSettings.defaultPlaceholder !== 'default') ? localSettings.defaultPlaceholder : pdfPlaceholder}
                      alt="Thumbnail preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-xs text-muted-foreground leading-tight mb-1" style={{ ['--accent-color' as any]: localSettings.accentColor }}>April 2025</p>
                  <h3 className="font-semibold text-sm leading-tight">Sample PDF Title</h3>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accent Color */}
      <Card>
        <CardHeader>
          <CardTitle>Accent Color</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="accent-color">Current accent color</Label>
              <div className="flex items-center gap-2 mt-1">
                <div 
                  className="w-8 h-8 rounded border border-border"
                  style={{ backgroundColor: localSettings.accentColor }}
                />
                <span className="text-sm font-mono">{localSettings.accentColor}</span>
              </div>
            </div>
            <div className="flex-1">
              <Label htmlFor="color-picker">Select new color</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="color-picker"
                  type="color"
                  value={localSettings.accentColor}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, accentColor: e.target.value }))}
                  className="w-16 h-10"
                />
                <Input
                  value={localSettings.accentColor}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, accentColor: e.target.value }))}
                  placeholder="#7FB3DC"
                  className="font-mono"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Thumbnail Shape */}
      <Card>
        <CardHeader>
          <CardTitle>Thumbnail Shape</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={localSettings.thumbnailShape} 
            onValueChange={(value) => setLocalSettings(prev => ({ ...prev, thumbnailShape: value }))}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {thumbnailShapes.map((shape) => (
                <div key={shape.value} className="text-center">
                  <div className="flex items-center space-x-2 mb-2">
                    <RadioGroupItem value={shape.value} id={shape.value} />
                    <Label htmlFor={shape.value} className="text-sm font-medium">
                      {shape.label}
                    </Label>
                  </div>
                  <div className={`w-16 h-auto bg-muted rounded mx-auto ${shape.aspect} flex items-center justify-center`}>
                    <div className="w-6 h-6 bg-primary/20 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* PDF Icon Position */}
      <Card>
        <CardHeader>
          <CardTitle>PDF Icon Position</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={localSettings.pdfIconPosition} 
            onValueChange={(value) => setLocalSettings(prev => ({ ...prev, pdfIconPosition: value }))}
          >
            <div className="grid grid-cols-2 gap-4">
              {/* Left column (Top Left, Bottom Left) */}
              <div className="space-y-4">
                {['top-left','bottom-left'].map((pos) => {
                  const label = pos === 'top-left' ? 'Top Left' : 'Bottom Left';
                  const cls = pos === 'top-left' ? 'top-3 left-3' : 'bottom-3 left-3';
                  return (
                    <div key={pos} className="text-center">
                      <div className="flex items-center space-x-2 mb-2">
                        <RadioGroupItem value={pos} id={pos} />
                        <Label htmlFor={pos} className="text-sm font-medium">{label}</Label>
                      </div>
                      <div className="relative w-20 h-12 bg-muted rounded mx-auto">
                        <div className={`absolute w-4 h-2 bg-primary rounded-sm ${cls}`}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Right column (Top Right, Bottom Right) */}
              <div className="space-y-4">
                {['top-right','bottom-right'].map((pos) => {
                  const label = pos === 'top-right' ? 'Top Right' : 'Bottom Right';
                  const cls = pos === 'top-right' ? 'top-3 right-3' : 'bottom-3 right-3';
                  return (
                    <div key={pos} className="text-center">
                      <div className="flex items-center space-x-2 mb-2">
                        <RadioGroupItem value={pos} id={pos} />
                        <Label htmlFor={pos} className="text-sm font-medium">{label}</Label>
                      </div>
                      <div className="relative w-20 h-12 bg-muted rounded mx-auto">
                        <div className={`absolute w-4 h-2 bg-primary rounded-sm ${cls}`}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Default Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Default Placeholder</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <img
              src={(localSettings.defaultPlaceholder && localSettings.defaultPlaceholder !== 'default') ? localSettings.defaultPlaceholder : pdfPlaceholder}
              alt="Current placeholder"
              className="w-20 h-12 object-cover rounded border border-border"
            />
            <div className="space-y-2">
              <Label htmlFor="placeholder-url">Placeholder URL</Label>
              <Input
                id="placeholder-url"
                placeholder="https://example.com/placeholder.jpg"
                value={localSettings.defaultPlaceholder === 'default' ? '' : localSettings.defaultPlaceholder}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, defaultPlaceholder: e.target.value || 'default' }))}
              />
              <div>
                <Label htmlFor="placeholder-file" className="cursor-pointer">Upload image</Label>
                <Input
                  id="placeholder-file"
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const wp = (window as any).wpPDFGallery;
                    const urlParams = new URLSearchParams(window.location.search);
                    const ajaxUrl = wp?.ajaxUrl || urlParams.get('ajax');
                    const nonce = wp?.nonce || urlParams.get('nonce') || '';
                    if (!ajaxUrl || !nonce) return;
                    const form = new FormData();
                    form.append('action', 'pdf_gallery_action');
                    form.append('action_type', 'upload_image');
                    form.append('nonce', nonce);
                    form.append('image_file', file);
                    const res = await fetch(ajaxUrl, { method: 'POST', credentials: 'same-origin', body: form });
                    const data = await res.json();
                    if (data?.success && data?.data?.url) {
                      setLocalSettings(prev => ({ ...prev, defaultPlaceholder: data.data.url }));
                    }
                    // reset input
                    e.currentTarget.value = '';
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">Save Settings</Button>
      </div>
    </div>
  );
};

export default PDFSettings;