import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { FileText, ExternalLink, Upload, Key, Eye, EyeOff, AlertCircle, CheckCircle2, ChevronDown, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import pdfPlaceholder from '@/assets/thumbnail-placeholder.png';
import { useLicense } from '@/hooks/useLicense';
import ProBanner from '@/components/ProBanner';

// Custom Layers icon component with customizable layer colors
const LayersIcon = ({ firstLayerGreen = false, allLayersGreen = false, className = "" }: { 
  firstLayerGreen?: boolean; 
  allLayersGreen?: boolean; 
  className?: string;
}) => {
  const greenColor = "hsl(142, 76%, 36%)"; // green-600 equivalent
  const grayColor = "currentColor";
  
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      fill="none" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
    >
      {/* Bottom layer */}
      <path 
        d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" 
        stroke={allLayersGreen || firstLayerGreen ? greenColor : grayColor}
      />
      {/* Middle layer */}
      <path 
        d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" 
        stroke={allLayersGreen ? greenColor : grayColor}
      />
      {/* Top layer */}
      <path 
        d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" 
        stroke={allLayersGreen ? greenColor : grayColor}
      />
    </svg>
  );
};

interface PDFSettingsProps {
  settings: {
    thumbnailStyle: string;
    accentColor: string;
    thumbnailShape: string;
    pdfIconPosition: string;
    defaultPlaceholder: string;
    thumbnailSize?: string;
    showRatings?: boolean;
    officeApiProvider?: 'cloudconvert' | 'convertapi' | 'none';
    cloudConvertApiKey?: string;
    convertApiKey?: string;
  };
  onSettingsChange: (settings: any) => void;
}

const PDFSettings = ({ settings, onSettingsChange }: PDFSettingsProps) => {
  const normalizeThumbnailShape = (shape?: string) => {
    const raw = String(shape || '').trim();
    if (!raw) return '3-2';

    const map: Record<string, string> = {
      // legacy -> current
      'landscape-16-9': '16-9',
      'landscape-3-2': '3-2',
      'portrait-2-3': '2-3',
      'square-1-1': '1-1',

      // colon -> hyphen
      '16:9': '16-9',
      '3:2': '3-2',
      '2:3': '2-3',
      '1:1': '1-1',
      '9:16': '9-16',

      // older semantic
      square: '1-1',
      landscape: '3-2',
      portrait: '2-3',
    };

    const normalized = map[raw] ?? raw;
    const allowed = new Set(['3-2', '1-1', '16-9', '2-3', '9-16', 'auto']);
    return allowed.has(normalized) ? normalized : '3-2';
  };

  const [localSettings, setLocalSettings] = useState({
    ...settings,
    thumbnailSize: settings.thumbnailSize || 'four-rows',
    thumbnailShape: normalizeThumbnailShape(settings.thumbnailShape),
    showRatings: settings.showRatings !== false,
    officeApiProvider: settings.officeApiProvider || 'none',
    cloudConvertApiKey: settings.cloudConvertApiKey || '',
    convertApiKey: settings.convertApiKey || ''
  });
  const [showCloudConvertKey, setShowCloudConvertKey] = useState(false);
  const [showConvertApiKey, setShowConvertApiKey] = useState(false);
  const [saveScope, setSaveScope] = useState<'current' | 'all'>('current');
  const { toast } = useToast();
  const license = useLicense();

  // keep local state in sync when parent settings change
  // (e.g., when loaded from WordPress)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setLocalSettings({
      ...settings,
      thumbnailSize: settings.thumbnailSize || 'four-rows',
      thumbnailShape: normalizeThumbnailShape(settings.thumbnailShape),
      showRatings: settings.showRatings !== false,
      officeApiProvider: settings.officeApiProvider || 'none',
      cloudConvertApiKey: settings.cloudConvertApiKey || '',
      convertApiKey: settings.convertApiKey || ''
    });
  }, [settings]);

  const handleSave = async () => {
    // Update local/parent state immediately
    onSettingsChange(localSettings);

    // Persist to WordPress if available (admin page or shortcode iframe with nonce)
    try {
      const wp = (window as any).kindpdfgData || (window as any).wpPDFGallery;
      const urlParams = new URLSearchParams(window.location.search);
      const ajaxUrl = wp?.ajaxUrl || urlParams.get('ajax');
      const nonce = wp?.nonce || urlParams.get('nonce') || '';

      if (ajaxUrl && nonce) {
        const form = new FormData();
        form.append('action', 'kindpdfg_action');
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
    { value: '3-2', label: '3:2', sublabel: 'Default', aspect: 'aspect-[3/2]' },
    { value: '1-1', label: '1:1', sublabel: 'Square', aspect: 'aspect-square' },
    { value: '16-9', label: '16:9', sublabel: 'Wide', aspect: 'aspect-video' },
    { value: '2-3', label: '2:3', sublabel: 'Portrait', aspect: 'aspect-[2/3]' },
    { value: '9-16', label: '9:16', sublabel: 'Tall', aspect: 'aspect-[9/16]' },
    { value: 'auto', label: 'Auto', sublabel: 'Masonry', aspect: 'aspect-auto' },
  ];

  // Note: positions arranged via layout, no need for array order

  return (
    <div className="space-y-6">
      {license.checked && license.status === 'free' ? (<ProBanner className="mb-6" />) : null}
      
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Settings</h2>
        <div className={`flex items-center ${!license.isPro ? "opacity-50 pointer-events-none" : ""}`}>
          <Button 
            onClick={() => { if (license.isPro) handleSave(); }}
            className="rounded-r-none bg-primary hover:bg-primary/90"
            disabled={!license.isPro}
            aria-disabled={!license.isPro}
          >
            Save Settings
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="default" 
                className="rounded-l-none border-l border-primary-foreground/20 px-2 bg-primary hover:bg-primary/90"
                disabled={!license.isPro}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem 
                onClick={() => setSaveScope('current')}
                className="flex items-center justify-between gap-6 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <LayersIcon firstLayerGreen className="flex-shrink-0" />
                  <span>Current Gallery</span>
                </div>
                {saveScope === 'current' && <Check className="h-4 w-4 text-primary flex-shrink-0" />}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setSaveScope('all')}
                className="flex items-center justify-between gap-6 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <LayersIcon allLayersGreen className="flex-shrink-0" />
                  <span>All Galleries</span>
                </div>
                {saveScope === 'all' && <Check className="h-4 w-4 text-primary flex-shrink-0" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
                    <div className="relative bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border border-border hover:border-[var(--accent-color)]/50">
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

      {/* Thumbnail Shape & Size */}
      <Card className={!license.isPro ? 'opacity-50 pointer-events-none' : ''}>
        <CardHeader>
          <CardTitle>Thumbnail Shape & Size</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Thumbnail Shape */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Thumbnail Shape</Label>
            <RadioGroup 
              value={localSettings.thumbnailShape || '3-2'}
              onValueChange={(value) => setLocalSettings(prev => ({ ...prev, thumbnailShape: value }))}
            >
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                {thumbnailShapes.map((shape) => (
                  <div key={shape.value} className="space-y-2">
                    <div className="flex items-center justify-center">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value={shape.value} id={`shape-${shape.value}`} />
                        <Label htmlFor={`shape-${shape.value}`} className="text-sm font-medium cursor-pointer">
                          {shape.label}
                        </Label>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <div className={`bg-muted border border-border rounded ${
                        shape.value === '3-2' ? 'w-12 h-8' :
                        shape.value === '1-1' ? 'w-10 h-10' :
                        shape.value === '16-9' ? 'w-16 h-9' :
                        shape.value === '2-3' ? 'w-8 h-12' :
                        shape.value === '9-16' ? 'w-6 h-10' :
                        'w-10 h-12'
                      }`}></div>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">{shape.sublabel}</p>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Thumbnail Size (Columns) */}
          <div className="space-y-4 pt-4 border-t border-border">
            <Label className="text-sm font-medium">Grid Columns</Label>
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
          </div>

          <div className="text-xs text-muted-foreground mt-4 p-3 bg-muted/50 rounded">
            <strong>Note:</strong> On mobile devices, thumbnails will always be displayed one by one for optimal viewing experience.
          </div>
        </CardContent>
      </Card>

      {/* Document Ratings */}
      <Card className={!license.isPro ? 'opacity-50 pointer-events-none' : ''}>
        <CardHeader>
          <CardTitle>Document Ratings</CardTitle>
          <CardDescription>
            Allow visitors to rate documents with a 5-star system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-3">
            <Checkbox
              id="showRatings"
              checked={localSettings.showRatings !== false}
              onCheckedChange={(checked) =>
                setLocalSettings(prev => ({ ...prev, showRatings: !!checked }))
              }
            />
            <Label htmlFor="showRatings" className="cursor-pointer">
              Enable star ratings on thumbnails
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Office Document Thumbnails API */}
      <Card className={!license.isPro ? 'opacity-50 pointer-events-none' : ''}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Office Document Thumbnails
          </CardTitle>
          <CardDescription>
            Configure an API to generate thumbnails for Office documents (DOC, DOCX, XLS, XLSX, PPT, PPTX).
            Without an API key, Office documents will use a placeholder image.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* API Provider Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Select API Provider</Label>
            <RadioGroup 
              value={localSettings.officeApiProvider || 'none'}
              onValueChange={(value) => setLocalSettings(prev => ({ 
                ...prev, 
                officeApiProvider: value as 'cloudconvert' | 'convertapi' | 'none' 
              }))}
              className="space-y-3"
            >
              <div className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="none" id="office-none" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="office-none" className="text-sm font-medium cursor-pointer">
                    None (Use Placeholder)
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Office documents will display a generic placeholder instead of a real thumbnail.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="cloudconvert" id="office-cloudconvert" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="office-cloudconvert" className="text-sm font-medium cursor-pointer">
                    CloudConvert
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    High-quality conversions. Free tier: 25 conversions/day. 
                    <a 
                      href="https://cloudconvert.com/api/v2" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline ml-1"
                    >
                      Get API Key →
                    </a>
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="convertapi" id="office-convertapi" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="office-convertapi" className="text-sm font-medium cursor-pointer">
                    ConvertAPI
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Fast and reliable. Free tier: 250 seconds/month. 
                    <a 
                      href="https://www.convertapi.com/a" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline ml-1"
                    >
                      Get API Key →
                    </a>
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* CloudConvert API Key Input */}
          {localSettings.officeApiProvider === 'cloudconvert' && (
            <div className="space-y-2 p-4 rounded-lg bg-muted/30 border border-border">
              <Label htmlFor="cloudconvert-key" className="text-sm font-medium">CloudConvert API Key</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="cloudconvert-key"
                    type={showCloudConvertKey ? 'text' : 'password'}
                    value={localSettings.cloudConvertApiKey || ''}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, cloudConvertApiKey: e.target.value }))}
                    placeholder="Enter your CloudConvert API key..."
                    className="pr-10 font-mono text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCloudConvertKey(!showCloudConvertKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showCloudConvertKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {localSettings.cloudConvertApiKey ? (
                <div className="flex items-center gap-2 text-xs text-green-600">
                  <CheckCircle2 className="w-3 h-3" />
                  API key configured
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-amber-600">
                  <AlertCircle className="w-3 h-3" />
                  API key required for thumbnail generation
                </div>
              )}
            </div>
          )}

          {/* ConvertAPI Key Input */}
          {localSettings.officeApiProvider === 'convertapi' && (
            <div className="space-y-2 p-4 rounded-lg bg-muted/30 border border-border">
              <Label htmlFor="convertapi-key" className="text-sm font-medium">ConvertAPI Secret Key</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="convertapi-key"
                    type={showConvertApiKey ? 'text' : 'password'}
                    value={localSettings.convertApiKey || ''}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, convertApiKey: e.target.value }))}
                    placeholder="Enter your ConvertAPI secret key..."
                    className="pr-10 font-mono text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConvertApiKey(!showConvertApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConvertApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {localSettings.convertApiKey ? (
                <div className="flex items-center gap-2 text-xs text-green-600">
                  <CheckCircle2 className="w-3 h-3" />
                  API key configured
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-amber-600">
                  <AlertCircle className="w-3 h-3" />
                  API key required for thumbnail generation
                </div>
              )}
            </div>
          )}

          <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <strong>Note:</strong> API keys are stored securely in your WordPress database and are only used server-side to generate thumbnails. 
              Both services offer free tiers suitable for small galleries.
            </div>
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