import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { FileText, ExternalLink, Upload, Image, Palette, Grid3X3, Settings2, Zap, Eye, Sparkles } from 'lucide-react';
import pdfPlaceholder from '@/assets/pdf-placeholder.svg';
import { useLicense } from '@/hooks/useLicense';
import ProBanner from '@/components/ProBanner';

interface SettingsProposal5Props {
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

const SettingsProposal5 = ({ settings, onSettingsChange }: SettingsProposal5Props) => {
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
    <div className="space-y-8">
      {license.checked && license.status === 'free' ? (<ProBanner className="mb-6" />) : null}
      
      {/* Dashboard Header */}
      <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-2xl p-8 border border-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/20 rounded-xl">
              <Settings2 className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Gallery Dashboard
              </h2>
              <p className="text-muted-foreground mt-1">Customize your gallery with modern controls</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Pro Features
            </Badge>
            <Button 
              onClick={() => { if (license.isPro) handleSave(); }}
              className={`${!license.isPro ? "opacity-50 cursor-not-allowed pointer-events-none" : ""} bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg`}
              disabled={!license.isPro}
              size="lg"
            >
              <Zap className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-200 rounded-lg">
                <Image className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <p className="text-sm text-blue-700 font-medium">Placeholder</p>
                <p className="text-xs text-blue-600">{localSettings.defaultPlaceholder === 'default' ? 'Default' : 'Custom'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-200 rounded-lg">
                <FileText className="w-5 h-5 text-purple-700" />
              </div>
              <div>
                <p className="text-sm text-purple-700 font-medium">Style</p>
                <p className="text-xs text-purple-600 capitalize">{localSettings.thumbnailStyle.replace('-', ' ')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-200 rounded-lg">
                <Palette className="w-5 h-5 text-green-700" />
              </div>
              <div>
                <p className="text-sm text-green-700 font-medium">Color</p>
                <div className="flex items-center gap-1">
                  <div 
                    className="w-3 h-3 rounded-full border"
                    style={{ backgroundColor: localSettings.accentColor }}
                  />
                  <p className="text-xs text-green-600 font-mono">{localSettings.accentColor}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-200 rounded-lg">
                <Grid3X3 className="w-5 h-5 text-orange-700" />
              </div>
              <div>
                <p className="text-sm text-orange-700 font-medium">Grid</p>
                <p className="text-xs text-orange-600">{localSettings.thumbnailSize?.replace('-rows', '')} columns</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Controls Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column - Image & Color */}
        <div className="space-y-6">
          {/* Placeholder Image */}
          <Card className={`overflow-hidden ${!license.isPro ? 'opacity-50 pointer-events-none' : ''}`}>
            <CardHeader className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-b border-blue-200/30">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Image className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <span className="text-lg">Placeholder Image</span>
                  <p className="text-sm font-normal text-muted-foreground">Default image for documents</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="relative group">
                    <img 
                      src={localSettings.defaultPlaceholder === 'default' ? pdfPlaceholder : localSettings.defaultPlaceholder}
                      alt="Current placeholder" 
                      className="w-32 h-24 object-cover rounded-xl border-2 border-border shadow-md group-hover:shadow-lg transition-shadow"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                      <Eye className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
                
                <Label
                  htmlFor="placeholderFile5"
                  className="relative border-2 border-dashed border-blue-300 rounded-xl p-6 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/30 transition-all block group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent rounded-xl"></div>
                  <Upload className="w-10 h-10 text-blue-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-blue-600 hover:underline block mb-1">
                    Upload New Image
                  </span>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG up to 2MB
                  </p>
                  <Input
                    id="placeholderFile5"
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
            </CardContent>
          </Card>

          {/* Accent Color */}
          <Card className={`overflow-hidden ${!license.isPro ? 'opacity-50 pointer-events-none' : ''}`}>
            <CardHeader className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 border-b border-purple-200/30">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Palette className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <span className="text-lg">Accent Color</span>
                  <p className="text-sm font-normal text-muted-foreground">Primary theme color</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div 
                    className="w-20 h-20 rounded-2xl border-4 border-white shadow-lg ring-2 ring-gray-200"
                    style={{ backgroundColor: localSettings.accentColor }}
                  />
                </div>
                
                <div className="space-y-3">
                  <Input
                    type="color"
                    value={localSettings.accentColor}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, accentColor: e.target.value }))}
                    className="w-full h-14 rounded-xl cursor-pointer"
                  />
                  
                  <Input
                    value={localSettings.accentColor}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, accentColor: e.target.value }))}
                    className="font-mono text-center text-lg h-12 rounded-xl bg-muted/50"
                    placeholder="#7FB3DC"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle Column - Thumbnail Styles */}
        <div className="xl:col-span-2 space-y-6">
          {/* Thumbnail Styles */}
          <Card className={`overflow-hidden ${!license.isPro ? 'opacity-50 pointer-events-none' : ''}`}>
            <CardHeader className="bg-gradient-to-r from-green-500/10 to-green-600/10 border-b border-green-200/30">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <span className="text-lg">Thumbnail Styles</span>
                  <p className="text-sm font-normal text-muted-foreground">Choose your gallery appearance</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Default Style */}
                <div className={`relative border-2 rounded-2xl p-5 cursor-pointer transition-all hover:shadow-lg ${
                  localSettings.thumbnailStyle === 'default' 
                    ? 'border-primary bg-primary/5 shadow-lg ring-2 ring-primary/20' 
                    : 'border-border hover:border-primary/50'
                }`} onClick={() => setLocalSettings(prev => ({ ...prev, thumbnailStyle: 'default' }))}>
                  {localSettings.thumbnailStyle === 'default' && (
                    <div className="absolute -top-2 -right-2 bg-primary text-white p-2 rounded-full">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  )}
                  <div className="flex items-center gap-3 mb-4">
                    <Checkbox 
                      checked={localSettings.thumbnailStyle === 'default'}
                      className="data-[state=checked]:bg-primary"
                    />
                    <div>
                      <h4 className="font-semibold text-base">Default Style</h4>
                      <p className="text-sm text-muted-foreground">Clean professional look</p>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <div className="group cursor-pointer w-36">
                      <div className="relative bg-card rounded-lg overflow-hidden shadow-sm group-hover:shadow-md transition-all duration-200 border border-border">
                        <div className="aspect-video overflow-hidden bg-muted relative">
                          <img
                            src={pdfPlaceholder}
                            alt="Default style preview"
                            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <ExternalLink className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        <div className="absolute top-2 right-2 bg-card/90 backdrop-blur-sm rounded px-1.5 py-1">
                          <span className="text-xs font-medium">PDF</span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground">April 2025</p>
                        <h3 className="font-semibold text-xs group-hover:text-primary transition-colors">Sample PDF</h3>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Elevated Card */}
                <div className={`relative border-2 rounded-2xl p-5 cursor-pointer transition-all hover:shadow-lg ${
                  localSettings.thumbnailStyle === 'elevated-card' 
                    ? 'border-primary bg-primary/5 shadow-lg ring-2 ring-primary/20' 
                    : 'border-border hover:border-primary/50'
                }`} onClick={() => setLocalSettings(prev => ({ ...prev, thumbnailStyle: 'elevated-card' }))}>
                  {localSettings.thumbnailStyle === 'elevated-card' && (
                    <div className="absolute -top-2 -right-2 bg-primary text-white p-2 rounded-full">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  )}
                  <div className="flex items-center gap-3 mb-4">
                    <Checkbox 
                      checked={localSettings.thumbnailStyle === 'elevated-card'}
                      className="data-[state=checked]:bg-primary"
                    />
                    <div>
                      <h4 className="font-semibold text-base">Elevated Card</h4>
                      <p className="text-sm text-muted-foreground">Modern with depth</p>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <div className="group cursor-pointer w-36">
                      <div className="relative bg-card rounded-2xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-300 transform group-hover:-translate-y-1 border border-border">
                        <div className="aspect-[4/3] overflow-hidden bg-muted">
                          <img
                            src={pdfPlaceholder}
                            alt="Elevated style preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute bottom-2 right-2">
                          <div className="bg-white/90 backdrop-blur-sm rounded-full p-1.5 group-hover:bg-primary group-hover:text-white transition-all">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3" />
                            </svg>
                          </div>
                        </div>
                        <div className="p-2">
                          <p className="text-xs text-muted-foreground">April 2025</p>
                          <h3 className="font-semibold text-xs group-hover:text-primary transition-colors">Sample PDF</h3>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Grid Size */}
          <Card className={`overflow-hidden ${!license.isPro ? 'opacity-50 pointer-events-none' : ''}`}>
            <CardHeader className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 border-b border-orange-200/30">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Grid3X3 className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <span className="text-lg">Grid Configuration</span>
                  <p className="text-sm font-normal text-muted-foreground">Column layout settings</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <RadioGroup 
                value={localSettings.thumbnailSize || 'four-rows'}
                onValueChange={(value) => setLocalSettings(prev => ({ ...prev, thumbnailSize: value }))}
                className="grid grid-cols-3 gap-4"
              >
                <div className={`border-2 rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${
                  localSettings.thumbnailSize === 'three-rows' 
                    ? 'border-primary bg-primary/5 shadow-md' 
                    : 'border-border hover:border-primary/50'
                }`}>
                  <RadioGroupItem value="three-rows" id="three-rows5" className="sr-only" />
                  <Label htmlFor="three-rows5" className="cursor-pointer block">
                    <div className="text-center space-y-3">
                      <div className="flex justify-center">
                        <div className="grid grid-cols-3 gap-1 w-12">
                          <div className="w-3 h-4 bg-gradient-to-br from-muted to-muted-foreground/20 rounded"></div>
                          <div className="w-3 h-4 bg-gradient-to-br from-muted to-muted-foreground/20 rounded"></div>
                          <div className="w-3 h-4 bg-gradient-to-br from-muted to-muted-foreground/20 rounded"></div>
                          <div className="w-3 h-4 bg-gradient-to-br from-muted to-muted-foreground/20 rounded"></div>
                          <div className="w-3 h-4 bg-gradient-to-br from-muted to-muted-foreground/20 rounded"></div>
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold text-sm">3 Columns</p>
                        <p className="text-xs text-muted-foreground">Large thumbnails</p>
                      </div>
                    </div>
                  </Label>
                </div>

                <div className={`border-2 rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${
                  localSettings.thumbnailSize === 'four-rows' 
                    ? 'border-primary bg-primary/5 shadow-md' 
                    : 'border-border hover:border-primary/50'
                }`}>
                  <RadioGroupItem value="four-rows" id="four-rows5" className="sr-only" />
                  <Label htmlFor="four-rows5" className="cursor-pointer block">
                    <div className="text-center space-y-3">
                      <div className="flex justify-center">
                        <div className="grid grid-cols-4 gap-1 w-12">
                          <div className="w-2 h-3 bg-gradient-to-br from-muted to-muted-foreground/20 rounded"></div>
                          <div className="w-2 h-3 bg-gradient-to-br from-muted to-muted-foreground/20 rounded"></div>
                          <div className="w-2 h-3 bg-gradient-to-br from-muted to-muted-foreground/20 rounded"></div>
                          <div className="w-2 h-3 bg-gradient-to-br from-muted to-muted-foreground/20 rounded"></div>
                          <div className="w-2 h-3 bg-gradient-to-br from-muted to-muted-foreground/20 rounded"></div>
                          <div className="w-2 h-3 bg-gradient-to-br from-muted to-muted-foreground/20 rounded"></div>
                          <div className="w-2 h-3 bg-gradient-to-br from-muted to-muted-foreground/20 rounded"></div>
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold text-sm">4 Columns</p>
                        <p className="text-xs text-muted-foreground">Recommended</p>
                      </div>
                    </div>
                  </Label>
                </div>

                <div className={`border-2 rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${
                  localSettings.thumbnailSize === 'five-rows' 
                    ? 'border-primary bg-primary/5 shadow-md' 
                    : 'border-border hover:border-primary/50'
                }`}>
                  <RadioGroupItem value="five-rows" id="five-rows5" className="sr-only" />
                  <Label htmlFor="five-rows5" className="cursor-pointer block">
                    <div className="text-center space-y-3">
                      <div className="flex justify-center">
                        <div className="grid grid-cols-5 gap-0.5 w-12">
                          <div className="w-2 h-3 bg-gradient-to-br from-muted to-muted-foreground/20 rounded"></div>
                          <div className="w-2 h-3 bg-gradient-to-br from-muted to-muted-foreground/20 rounded"></div>
                          <div className="w-2 h-3 bg-gradient-to-br from-muted to-muted-foreground/20 rounded"></div>
                          <div className="w-2 h-3 bg-gradient-to-br from-muted to-muted-foreground/20 rounded"></div>
                          <div className="w-2 h-3 bg-gradient-to-br from-muted to-muted-foreground/20 rounded"></div>
                          <div className="w-2 h-3 bg-gradient-to-br from-muted to-muted-foreground/20 rounded"></div>
                          <div className="w-2 h-3 bg-gradient-to-br from-muted to-muted-foreground/20 rounded"></div>
                          <div className="w-2 h-3 bg-gradient-to-br from-muted to-muted-foreground/20 rounded"></div>
                          <div className="w-2 h-3 bg-gradient-to-br from-muted to-muted-foreground/20 rounded"></div>
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold text-sm">5 Columns</p>
                        <p className="text-xs text-muted-foreground">Compact layout</p>
                      </div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer Info */}
      <Card className="bg-gradient-to-r from-muted/30 to-muted/10 border-muted">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Mobile Optimization</h3>
                <p className="text-sm text-muted-foreground">All settings automatically adapt to mobile devices for optimal viewing</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              Auto-Responsive
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsProposal5;