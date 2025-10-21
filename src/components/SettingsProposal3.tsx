import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { FileText, ExternalLink, Upload, Image, Palette, Grid3X3, Settings2 } from 'lucide-react';
import pdfPlaceholder from '@/assets/pdf-placeholder.png';
import { useLicense } from '@/hooks/useLicense';
import ProBanner from '@/components/ProBanner';

interface SettingsProposal3Props {
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

const SettingsProposal3 = ({ settings, onSettingsChange }: SettingsProposal3Props) => {
  const [localSettings, setLocalSettings] = useState({
    ...settings,
    thumbnailSize: settings.thumbnailSize || 'four-rows'
  });
  const { toast } = useToast();
  const license = useLicense();

  useEffect(() => {
    setLocalSettings({
      ...settings,
      thumbnailSize: settings.thumbnailSize || 'four-rows'
    });
  }, [settings]);

  const handleSave = async () => {
    onSettingsChange(localSettings);
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

  return (
    <div className="space-y-6">
      {license.checked && license.status === 'free' ? (<ProBanner className="mb-6" />) : null}
      
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Settings2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Gallery Settings</h2>
            <p className="text-sm text-muted-foreground">Customize your gallery appearance and behavior</p>
          </div>
        </div>
        <Button 
          onClick={() => { if (license.isPro) handleSave(); }}
          className={!license.isPro ? "opacity-50 cursor-not-allowed pointer-events-none" : "bg-primary hover:bg-primary/90"}
          disabled={!license.isPro}
          size="lg"
        >
          Save Settings
        </Button>
      </div>

      {/* Compact Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Default Placeholder */}
        <Card className={!license.isPro ? 'opacity-50 pointer-events-none' : ''}>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-1.5 bg-blue-100 rounded">
                <Image className="w-4 h-4 text-blue-600" />
              </div>
              Placeholder Image
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <img 
                src={localSettings.defaultPlaceholder === 'default' ? pdfPlaceholder : localSettings.defaultPlaceholder}
                alt="Current placeholder" 
                className="w-16 h-12 object-cover rounded border border-border flex-shrink-0"
              />
              <div className="flex-1">
                <Label
                  htmlFor="placeholderFile3"
                  className="border border-dashed border-border rounded p-3 text-center cursor-pointer hover:border-primary/50 transition-colors block"
                >
                  <Upload className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                  <span className="text-xs font-medium text-primary">Upload new</span>
                  <Input
                    id="placeholderFile3"
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

        {/* Accent Color */}
        <Card className={!license.isPro ? 'opacity-50 pointer-events-none' : ''}>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-1.5 bg-purple-100 rounded">
                <Palette className="w-4 h-4 text-purple-600" />
              </div>
              Accent Color
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded border border-border flex-shrink-0"
                style={{ backgroundColor: localSettings.accentColor }}
              />
              <div className="flex-1 space-y-2">
                <Input
                  type="color"
                  value={localSettings.accentColor}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, accentColor: e.target.value }))}
                  className="w-full h-8"
                />
                <Input
                  value={localSettings.accentColor}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, accentColor: e.target.value }))}
                  className="font-mono text-xs"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Thumbnail Size */}
        <Card className={!license.isPro ? 'opacity-50 pointer-events-none' : ''}>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-1.5 bg-green-100 rounded">
                <Grid3X3 className="w-4 h-4 text-green-600" />
              </div>
              Grid Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup 
              value={localSettings.thumbnailSize || 'four-rows'}
              onValueChange={(value) => setLocalSettings(prev => ({ ...prev, thumbnailSize: value }))}
              className="grid grid-cols-3 gap-3"
            >
              <div className="flex flex-col items-center space-y-2">
                <RadioGroupItem value="three-rows" id="three-rows3" className="sr-only" />
                <Label htmlFor="three-rows3" className="cursor-pointer">
                  <div className="grid grid-cols-3 gap-0.5 w-8 mb-1">
                    <div className="w-2 h-3 bg-muted rounded-sm"></div>
                    <div className="w-2 h-3 bg-muted rounded-sm"></div>
                    <div className="w-2 h-3 bg-muted rounded-sm"></div>
                    <div className="w-2 h-3 bg-muted rounded-sm"></div>
                    <div className="w-2 h-3 bg-muted rounded-sm"></div>
                  </div>
                  <span className="text-xs font-medium">3 cols</span>
                </Label>
              </div>

              <div className="flex flex-col items-center space-y-2">
                <RadioGroupItem value="four-rows" id="four-rows3" className="sr-only" />
                <Label htmlFor="four-rows3" className="cursor-pointer">
                  <div className="grid grid-cols-4 gap-0.5 w-8 mb-1">
                    <div className="w-1.5 h-2.5 bg-muted rounded-sm"></div>
                    <div className="w-1.5 h-2.5 bg-muted rounded-sm"></div>
                    <div className="w-1.5 h-2.5 bg-muted rounded-sm"></div>
                    <div className="w-1.5 h-2.5 bg-muted rounded-sm"></div>
                    <div className="w-1.5 h-2.5 bg-muted rounded-sm"></div>
                    <div className="w-1.5 h-2.5 bg-muted rounded-sm"></div>
                    <div className="w-1.5 h-2.5 bg-muted rounded-sm"></div>
                  </div>
                  <span className="text-xs font-medium">4 cols</span>
                </Label>
              </div>

              <div className="flex flex-col items-center space-y-2">
                <RadioGroupItem value="five-rows" id="five-rows3" className="sr-only" />
                <Label htmlFor="five-rows3" className="cursor-pointer">
                  <div className="grid grid-cols-5 gap-0.5 w-8 mb-1">
                    <div className="w-1 h-2 bg-muted rounded-sm"></div>
                    <div className="w-1 h-2 bg-muted rounded-sm"></div>
                    <div className="w-1 h-2 bg-muted rounded-sm"></div>
                    <div className="w-1 h-2 bg-muted rounded-sm"></div>
                    <div className="w-1 h-2 bg-muted rounded-sm"></div>
                    <div className="w-1 h-2 bg-muted rounded-sm"></div>
                    <div className="w-1 h-2 bg-muted rounded-sm"></div>
                    <div className="w-1 h-2 bg-muted rounded-sm"></div>
                  </div>
                  <span className="text-xs font-medium">5 cols</span>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Thumbnail Style */}
        <Card className={`col-span-1 lg:col-span-1 ${!license.isPro ? 'opacity-50 pointer-events-none' : ''}`}>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-1.5 bg-orange-100 rounded">
                <FileText className="w-4 h-4 text-orange-600" />
              </div>
              Thumbnail Style
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {/* Default Style */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="default3" 
                    checked={localSettings.thumbnailStyle === 'default'}
                    onCheckedChange={(checked) => 
                      checked && setLocalSettings(prev => ({ ...prev, thumbnailStyle: 'default' }))
                    }
                  />
                  <Label htmlFor="default3" className="text-sm font-medium">Default</Label>
                </div>
                <div className="w-24 h-16 bg-muted rounded border overflow-hidden group cursor-pointer">
                  <div className="relative w-full h-full">
                    <img
                      src={pdfPlaceholder}
                      alt="Default style preview"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute top-1 right-1 bg-white/90 rounded px-1">
                      <span className="text-xs">PDF</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Elevated Card */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="elevated-card3" 
                    checked={localSettings.thumbnailStyle === 'elevated-card'}
                    onCheckedChange={(checked) => 
                      checked && setLocalSettings(prev => ({ ...prev, thumbnailStyle: 'elevated-card' }))
                    }
                  />
                  <Label htmlFor="elevated-card3" className="text-sm font-medium">Elevated</Label>
                </div>
                <div className="w-24 h-16 bg-muted rounded-lg shadow-md border overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow">
                  <div className="relative w-full h-full">
                    <img
                      src={pdfPlaceholder}
                      alt="Elevated style preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-1 right-1 bg-primary/20 rounded-full p-1">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slide Up Text */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="slide-up-text3" 
                    checked={localSettings.thumbnailStyle === 'slide-up-text'}
                    onCheckedChange={(checked) => 
                      checked && setLocalSettings(prev => ({ ...prev, thumbnailStyle: 'slide-up-text' }))
                    }
                  />
                  <Label htmlFor="slide-up-text3" className="text-sm font-medium">Slide Up</Label>
                </div>
                <div className="w-24 h-16 bg-muted rounded border overflow-hidden group cursor-pointer">
                  <div className="relative w-full h-full">
                    <img
                      src={pdfPlaceholder}
                      alt="Slide up style preview"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <div className="p-1">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* More styles preview */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="gradient-zoom3" 
                    checked={localSettings.thumbnailStyle === 'gradient-zoom'}
                    onCheckedChange={(checked) => 
                      checked && setLocalSettings(prev => ({ ...prev, thumbnailStyle: 'gradient-zoom' }))
                    }
                  />
                  <Label htmlFor="gradient-zoom3" className="text-sm font-medium">Gradient</Label>
                </div>
                <div className="w-24 h-16 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 rounded border overflow-hidden group cursor-pointer p-0.5">
                  <div className="relative w-full h-full bg-muted rounded">
                    <img
                      src={pdfPlaceholder}
                      alt="Gradient style preview"
                      className="w-full h-full object-cover rounded group-hover:scale-125 transition-transform duration-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional note at bottom */}
      <div className="text-xs text-muted-foreground p-4 bg-muted/30 rounded-lg border-l-4 border-primary/30">
        <strong>Mobile Optimization:</strong> All settings are automatically optimized for mobile devices to ensure the best user experience across all screen sizes.
      </div>
    </div>
  );
};

export default SettingsProposal3;