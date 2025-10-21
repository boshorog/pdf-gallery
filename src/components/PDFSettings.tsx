import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { FileText, ExternalLink, Upload } from 'lucide-react';
import pdfPlaceholder from '@/assets/pdf-placeholder.svg';
import { useLicense } from '@/hooks/useLicense';
import ProBanner from '@/components/ProBanner';

interface PDFSettingsProps {
  settings: {
    thumbnailStyle: string;
    accentColor: string;
    thumbnailShape: string;
    pdfIconPosition: string;
    defaultPlaceholder: string;
    thumbnailSize?: string;
  };
  onSettingsChange: (settings: any) => void;
}

const PDFSettings = ({ settings, onSettingsChange }: PDFSettingsProps) => {
  const [localSettings, setLocalSettings] = useState({
    ...settings,
    thumbnailSize: settings.thumbnailSize || 'four-rows'
  });
  const { toast } = useToast();
  const license = useLicense();

  // keep local state in sync when parent settings change
  // (e.g., when loaded from WordPress)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setLocalSettings({
      ...settings,
      thumbnailSize: settings.thumbnailSize || 'four-rows'
    });
  }, [settings]);

  const handleSave = async () => {
    // Update local/parent state immediately
    onSettingsChange(localSettings);

    // Persist to WordPress if available (admin page or shortcode iframe with nonce)
    try {
      const wp = (window as any).wpPDFGallery;
      const urlParams = new URLSearchParams(window.location.search);
      const ajaxUrl = wp?.ajaxUrl || urlParams.get('ajax');
      const nonce = wp?.nonce || urlParams.get('nonce') || '';

      if (ajaxUrl && nonce) {
        const form = new FormData();
        form.append('action', 'pdf_gallery_action');
        form.append('action_type', 'save_settings');
        form.append('nonce', nonce);
        form.append('settings', JSON.stringify(localSettings));
        await fetch(ajaxUrl, { method: 'POST', credentials: 'same-origin', body: form });
      }

      toast({
        title: "Settings Saved",
        description: "Your gallery settings have been updated successfully",
      });
    } catch (e) {
      toast({ title: "Saved locally", description: "Could not reach WordPress AJAX." });
    }
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
      {license.checked && license.status === 'free' ? (<ProBanner className="mb-6" />) : null}
      
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Settings</h2>
        <Button 
          onClick={() => { if (license.isPro) handleSave(); }}
          className={!license.isPro ? "opacity-50 cursor-not-allowed pointer-events-none" : "bg-primary hover:bg-primary/90"}
          disabled={!license.isPro}
          aria-disabled={!license.isPro}
        >
          Save Settings
        </Button>
      </div>

      {/* Default Placeholder */}
      <Card className={!license.isPro ? 'opacity-50 pointer-events-none' : ''}>
        <CardHeader>
          <CardTitle>Default Placeholder</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-6">
            <div>
              <Label>Current placeholder</Label>
              <div className="mt-2">
                <img 
                  src={localSettings.defaultPlaceholder === 'default' ? pdfPlaceholder : localSettings.defaultPlaceholder}
                  alt="Current placeholder" 
                  className="w-24 h-16 object-cover rounded border border-border"
                />
              </div>
            </div>
            <div className="flex-1">
              <Label
                htmlFor="placeholderFile"
                className="border-2 border-dashed border-border rounded-lg p-6 text-center mt-2 cursor-pointer hover:border-muted-foreground/50 transition-colors block"
              >
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <span className="text-sm font-medium text-primary hover:underline">
                  Upload new placeholder
                </span>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG up to 2MB
                </p>
                <Input
                  id="placeholderFile"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        setLocalSettings(prev => ({ 
                          ...prev, 
                          defaultPlaceholder: event.target?.result as string 
                        }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Thumbnail Style */}
      <Card className={!license.isPro ? 'opacity-50 pointer-events-none' : ''}>
        <CardHeader>
          <CardTitle>Thumbnail Style</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6" style={{ ['--accent-color' as any]: localSettings.accentColor }}>
            {/* Default Style - Original frontend style */}
            <div className="space-y-3 relative">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="default" 
                  checked={localSettings.thumbnailStyle === 'default'}
                  onCheckedChange={(checked) => 
                    checked && setLocalSettings(prev => ({ ...prev, thumbnailStyle: 'default' }))
                  }
                />
                <Label htmlFor="default">Default Style</Label>
              </div>
                <div className="flex justify-center">
                  <div className="group cursor-pointer w-48">
                    <div className="relative bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border border-border">
                      <div className="aspect-video overflow-hidden bg-muted relative">
                        <img
                          src={pdfPlaceholder}
                          alt="Thumbnail preview"
                          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <ExternalLink className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <div className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm rounded-md px-2 py-1 shadow-sm">
                        <div className="flex items-center gap-1">
                          <FileText className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs font-medium text-muted-foreground">PDF</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-xs text-muted-foreground">April 2025</p>
                      <h3 className="font-semibold text-sm group-hover:text-[var(--accent-color)] transition-colors">Sample PDF Title</h3>
                    </div>
                  </div>
                </div>
            </div>

            {/* Style 4: Elevated Card */}
            <div className="space-y-3 relative">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="elevated-card" 
                  checked={localSettings.thumbnailStyle === 'elevated-card'}
                  onCheckedChange={(checked) => 
                    checked && setLocalSettings(prev => ({ ...prev, thumbnailStyle: 'elevated-card' }))
                  }
                />
                <Label htmlFor="elevated-card">Elevated Card</Label>
              </div>
              <div className="flex justify-center">
                <div className="group cursor-pointer w-48">
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
                      <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg group-hover:bg-[var(--accent-color)] group-hover:text-white transition-all duration-300">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3" />
                        </svg>
                      </div>
                    </div>
                    <div className="p-3 bg-gradient-to-t from-card to-transparent">
                      <p className="text-xs text-muted-foreground mb-1">April 2025</p>
                      <h3 className="font-semibold text-xs text-foreground group-hover:text-[var(--accent-color)] transition-colors">Sample PDF Title</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Style 6: Slide Up Text (Modified) */}
            <div className="space-y-3 relative">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="slide-up-text" 
                  checked={localSettings.thumbnailStyle === 'slide-up-text'}
                  onCheckedChange={(checked) => 
                    checked && setLocalSettings(prev => ({ ...prev, thumbnailStyle: 'slide-up-text' }))
                  }
                />
                <Label htmlFor="slide-up-text">Slide Up Text</Label>
              </div>
              <div className="flex justify-center">
                <div className="group cursor-pointer overflow-hidden rounded-xl w-48">
                  <div className="relative bg-card border border-border rounded-xl overflow-hidden">
                    <div className="aspect-video overflow-hidden bg-muted">
                      <img
                        src={pdfPlaceholder}
                        alt="Thumbnail preview"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <div className="p-3 pb-8 text-white">
                        <p className="text-xs opacity-80 mb-0.5">April 2025</p>
                        <h3 className="font-semibold text-xs">Sample PDF Title</h3>
                      </div>
                      <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13l-3 3m0 0l-3-3m3 3V8" />
                        </svg>
                      </div>
                    </div>
                    <div className="absolute top-3 left-3 opacity-100 group-hover:opacity-0 transition-opacity duration-300">
                      <div className="bg-white/90 rounded px-2 py-1">
                        <span className="text-xs font-medium text-gray-700">PDF</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Style 7: Gradient Zoom */}
            <div className="space-y-3 relative">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="gradient-zoom" 
                  checked={localSettings.thumbnailStyle === 'gradient-zoom'}
                  onCheckedChange={(checked) => 
                    checked && setLocalSettings(prev => ({ ...prev, thumbnailStyle: 'gradient-zoom' }))
                  }
                />
                <Label htmlFor="gradient-zoom">Gradient Zoom</Label>
              </div>
              <div className="flex justify-center">
                  <div className="group cursor-pointer w-48">
                    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[var(--accent-color)]/20 via-[var(--accent-color)]/10 to-[var(--accent-color)]/20 p-1 group-hover:from-[var(--accent-color)]/40 group-hover:via-[var(--accent-color)]/30 group-hover:to-[var(--accent-color)]/40 transition-all duration-300">
                      <div className="relative bg-card rounded-xl overflow-hidden">
                        <div className="aspect-video overflow-hidden bg-muted">
                          <img
                            src={pdfPlaceholder}
                            alt="Thumbnail preview"
                            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-125"
                          />
                          <div className="absolute inset-0 bg-gradient-to-tr from-[var(--accent-color)]/30 via-transparent to-[var(--accent-color)]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 animate-pulse">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-center">
                    <p className="text-xs text-muted-foreground mb-1 group-hover:text-[var(--accent-color)] transition-colors">April 2025</p>
                    <h3 className="font-semibold text-xs text-foreground group-hover:text-[var(--accent-color)] transition-all">Sample PDF Title</h3>
                  </div>
                </div>
              </div>
            </div>

            {/* Style 8: Split Layout */}
            <div className="space-y-3 relative">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="split-layout" 
                  checked={localSettings.thumbnailStyle === 'split-layout'}
                  onCheckedChange={(checked) => 
                    checked && setLocalSettings(prev => ({ ...prev, thumbnailStyle: 'split-layout' }))
                  }
                />
                <Label htmlFor="split-layout">Split Layout</Label>
              </div>
              <div className="flex justify-center">
                <div className="group cursor-pointer">
                  <div className="flex items-center gap-3 bg-card p-3 rounded-lg border border-border group-hover:border-[var(--accent-color)] transition-all duration-300 group-hover:shadow-md w-56">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-16 rounded overflow-hidden bg-muted relative">
                        <img
                          src={pdfPlaceholder}
                          alt="Thumbnail preview"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute top-1 right-1">
                          <div className="w-2 h-2 bg-[var(--accent-color)] rounded-full"></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-1 group-hover:text-[var(--accent-color)] transition-colors">April 2025</p>
                      <h3 className="font-semibold text-xs text-foreground mb-1 group-hover:text-[var(--accent-color)] transition-colors truncate">Sample PDF Title</h3>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <svg className="w-3 h-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3" />
                        </svg>
                        <span className="text-xs text-muted-foreground">Download PDF</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
            </div>

            {/* Style 9: Minimal Underline (Modified) */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="minimal-underline" 
                  checked={localSettings.thumbnailStyle === 'minimal-underline'}
                  onCheckedChange={(checked) => 
                    checked && setLocalSettings(prev => ({ ...prev, thumbnailStyle: 'minimal-underline' }))
                  }
                />
                <Label htmlFor="minimal-underline">Minimal Underline</Label>
              </div>
              <div className="flex justify-center">
                <div className="group cursor-pointer w-48">
                  <div className="space-y-2">
                    <div className="relative aspect-video bg-muted rounded-md overflow-hidden">
                      <img
                        src={pdfPlaceholder}
                        alt="Thumbnail preview"
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                      />
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-4 h-4 bg-white/90 rounded-full flex items-center justify-center">
                          <svg className="w-2 h-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">April 2025</p>
                      <h3 className="font-medium text-xs text-foreground relative inline-block">
                        Sample PDF Title
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[var(--accent-color)] group-hover:w-full transition-all duration-300"></span>
                      </h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accent Color */}
      <Card className={!license.isPro ? 'opacity-50 pointer-events-none' : ''}>
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

      {/* Thumbnail Size */}
      <Card className={!license.isPro ? 'opacity-50 pointer-events-none' : ''}>
        <CardHeader>
          <CardTitle>Thumbnail Size</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup 
            value={localSettings.thumbnailSize || 'four-rows'}
            onValueChange={(value) => setLocalSettings(prev => ({ ...prev, thumbnailSize: value }))}
          >
            <div className="grid grid-cols-3 gap-6">
              {/* 3 Columns */}
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="three-rows" id="three-rows" />
                    <Label htmlFor="three-rows" className="text-sm font-medium cursor-pointer">3 columns</Label>
                  </div>
                </div>
                <div className="flex justify-center">
                  <div className="grid grid-cols-3 gap-1 w-20">
                    <div className="w-6 h-8 bg-muted"></div>
                    <div className="w-6 h-8 bg-muted"></div>
                    <div className="w-6 h-8 bg-muted"></div>
                    <div className="w-6 h-8 bg-muted"></div>
                    <div className="w-6 h-8 bg-muted"></div>
                  </div>
                </div>
              </div>

              {/* 4 Columns */}
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="four-rows" id="four-rows" />
                    <Label htmlFor="four-rows" className="text-sm font-medium cursor-pointer">4 columns</Label>
                  </div>
                </div>
                <div className="flex justify-center">
                  <div className="grid grid-cols-4 gap-1 w-20">
                    <div className="w-4 h-6 bg-muted"></div>
                    <div className="w-4 h-6 bg-muted"></div>
                    <div className="w-4 h-6 bg-muted"></div>
                    <div className="w-4 h-6 bg-muted"></div>
                    <div className="w-4 h-6 bg-muted"></div>
                    <div className="w-4 h-6 bg-muted"></div>
                    <div className="w-4 h-6 bg-muted"></div>
                  </div>
                </div>
              </div>

              {/* 5 Columns */}
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="five-rows" id="five-rows" />
                    <Label htmlFor="five-rows" className="text-sm font-medium cursor-pointer">5 columns</Label>
                  </div>
                </div>
                <div className="flex justify-center">
                  <div className="grid grid-cols-5 gap-1 w-20">
                    <div className="w-3 h-4 bg-muted"></div>
                    <div className="w-3 h-4 bg-muted"></div>
                    <div className="w-3 h-4 bg-muted"></div>
                    <div className="w-3 h-4 bg-muted"></div>
                    <div className="w-3 h-4 bg-muted"></div>
                    <div className="w-3 h-4 bg-muted"></div>
                    <div className="w-3 h-4 bg-muted"></div>
                    <div className="w-3 h-4 bg-muted"></div>
                    <div className="w-3 h-4 bg-muted"></div>
                  </div>
                </div>
              </div>
            </div>
          </RadioGroup>
          <div className="text-xs text-muted-foreground mt-4 p-3 bg-muted/50 rounded">
            <strong>Note:</strong> On mobile devices, thumbnails will always be displayed one by one for optimal viewing experience.
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={() => { if (license.isPro) handleSave(); }}
          className={!license.isPro ? "opacity-50 cursor-not-allowed pointer-events-none" : "bg-primary hover:bg-primary/90"}
          disabled={!license.isPro}
          aria-disabled={!license.isPro}
        >
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default PDFSettings;