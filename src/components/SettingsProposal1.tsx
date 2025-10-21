import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { FileText, ExternalLink, Upload, Image, Palette, Grid3X3, Settings2 } from 'lucide-react';
import pdfPlaceholder from '@/assets/pdf-placeholder.png';
import { useLicense } from '@/hooks/useLicense';
import ProBanner from '@/components/ProBanner';

interface SettingsProposal1Props {
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

const SettingsProposal1 = ({ settings, onSettingsChange }: SettingsProposal1Props) => {
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
      {license.isValid && license.status === 'free' ? (<ProBanner className="mb-6" />) : null}
      
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Settings2 className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Gallery Settings</h2>
        </div>
        <Button 
          onClick={() => { if (license.isPro) handleSave(); }}
          className={!license.isPro ? "opacity-50 cursor-not-allowed pointer-events-none" : "bg-primary hover:bg-primary/90"}
          disabled={!license.isPro}
        >
          Save Settings
        </Button>
      </div>

      <Tabs defaultValue="placeholder" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="placeholder" className="flex items-center gap-2">
            <Image className="w-4 h-4" />
            <span className="hidden sm:inline">Placeholder</span>
          </TabsTrigger>
          <TabsTrigger value="style" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Style</span>
          </TabsTrigger>
          <TabsTrigger value="color" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            <span className="hidden sm:inline">Color</span>
          </TabsTrigger>
          <TabsTrigger value="size" className="flex items-center gap-2">
            <Grid3X3 className="w-4 h-4" />
            <span className="hidden sm:inline">Size</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="placeholder" className="space-y-6">
          <Card className={!license.isPro ? 'opacity-50 pointer-events-none' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="w-5 h-5" />
                Default Placeholder Image
              </CardTitle>
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
        </TabsContent>

        <TabsContent value="style" className="space-y-6">
          <Card className={!license.isPro ? 'opacity-50 pointer-events-none' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Thumbnail Styles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* Default Style */}
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
                        <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">Sample PDF Title</h3>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Elevated Card */}
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
                          <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg group-hover:bg-primary group-hover:text-white transition-all duration-300">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3" />
                            </svg>
                          </div>
                        </div>
                        <div className="p-3 bg-gradient-to-t from-card to-transparent">
                          <p className="text-xs text-muted-foreground mb-1">April 2025</p>
                          <h3 className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors">Sample PDF Title</h3>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Slide Up Text */}
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
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="color" className="space-y-6">
          <Card className={!license.isPro ? 'opacity-50 pointer-events-none' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Accent Color Configuration
              </CardTitle>
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
        </TabsContent>

        <TabsContent value="size" className="space-y-6">
          <Card className={!license.isPro ? 'opacity-50 pointer-events-none' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Grid3X3 className="w-5 h-5" />
                Thumbnail Grid Size
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup 
                value={localSettings.thumbnailSize || 'four-rows'}
                onValueChange={(value) => setLocalSettings(prev => ({ ...prev, thumbnailSize: value }))}
              >
                <div className="grid grid-cols-3 gap-6">
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
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button 
          onClick={() => { if (license.isPro) handleSave(); }}
          className={!license.isPro ? "opacity-50 cursor-not-allowed pointer-events-none" : "bg-primary hover:bg-primary/90"}
          disabled={!license.isPro}
          size="lg"
        >
          Save All Settings
        </Button>
      </div>
    </div>
  );
};

export default SettingsProposal1;