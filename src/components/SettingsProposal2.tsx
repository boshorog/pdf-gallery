import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { FileText, ExternalLink, Upload, Image, Palette, Grid3X3, Settings2, ChevronRight, MoreHorizontal } from 'lucide-react';
import pdfPlaceholder from '@/assets/pdf-placeholder.png';
import { useLicense } from '@/hooks/useLicense';
import ProBanner from '@/components/ProBanner';

interface SettingsProposal2Props {
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

const SettingsProposal2 = ({ settings, onSettingsChange }: SettingsProposal2Props) => {
  const [localSettings, setLocalSettings] = useState({
    ...settings,
    thumbnailSize: settings.thumbnailSize || 'four-rows'
  });
  const [activeSection, setActiveSection] = useState('placeholder');
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

  const sidebarItems = [
    { id: 'placeholder', label: 'Placeholder Image', icon: Image },
    { id: 'style', label: 'Thumbnail Style', icon: MoreHorizontal },
    { id: 'color', label: 'Accent Color', icon: Palette },
    { id: 'size', label: 'Grid Size', icon: Grid3X3 },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'placeholder':
        return (
          <Card className={!license.isPro ? 'opacity-50 pointer-events-none' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="w-5 h-5" />
                Default Placeholder Image
              </CardTitle>
              <p className="text-sm text-muted-foreground">Configure the default image shown for documents without thumbnails</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label>Current placeholder</Label>
                  <div className="flex justify-center">
                    <img 
                      src={localSettings.defaultPlaceholder === 'default' ? pdfPlaceholder : localSettings.defaultPlaceholder}
                      alt="Current placeholder" 
                      className="w-40 h-32 object-cover rounded-lg border border-border shadow-sm"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label>Upload new placeholder</Label>
                  <Label
                    htmlFor="placeholderFile2"
                    className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors block h-32 flex flex-col justify-center"
                  >
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <span className="text-sm font-medium text-primary hover:underline block mb-1">
                      Click to upload new image
                    </span>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG up to 2MB
                    </p>
                    <Input
                      id="placeholderFile2"
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
        );

      case 'style':
        return (
          <Card className={!license.isPro ? 'opacity-50 pointer-events-none' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MoreHorizontal className="w-5 h-5" />
                Thumbnail Styles
              </CardTitle>
              <p className="text-sm text-muted-foreground">Choose how your document thumbnails appear in the gallery</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Default Style */}
                <div className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <Checkbox 
                      id="default2" 
                      checked={localSettings.thumbnailStyle === 'default'}
                      onCheckedChange={(checked) => 
                        checked && setLocalSettings(prev => ({ ...prev, thumbnailStyle: 'default' }))
                      }
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label htmlFor="default2" className="text-base font-medium cursor-pointer">Default Style</Label>
                      <p className="text-sm text-muted-foreground mt-1 mb-3">Clean and simple design with subtle hover effects</p>
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
                            <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">Sample PDF Title</h3>
                            <p className="text-xs text-muted-foreground">April 2025</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Elevated Card */}
                <div className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <Checkbox 
                      id="elevated-card2" 
                      checked={localSettings.thumbnailStyle === 'elevated-card'}
                      onCheckedChange={(checked) => 
                        checked && setLocalSettings(prev => ({ ...prev, thumbnailStyle: 'elevated-card' }))
                      }
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label htmlFor="elevated-card2" className="text-base font-medium cursor-pointer">Elevated Card</Label>
                      <p className="text-sm text-muted-foreground mt-1 mb-3">Modern card design with shadow effects and hover animations</p>
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
                  </div>
                </div>

                {/* Slide Up Text Style */}
                <div className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <Checkbox 
                      id="slide-up-text2" 
                      checked={localSettings.thumbnailStyle === 'slide-up-text'}
                      onCheckedChange={(checked) => 
                        checked && setLocalSettings(prev => ({ ...prev, thumbnailStyle: 'slide-up-text' }))
                      }
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label htmlFor="slide-up-text2" className="text-base font-medium cursor-pointer">Slide Up Text</Label>
                      <p className="text-sm text-muted-foreground mt-1 mb-3">Text slides up on hover with smooth animations</p>
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
                                <h3 className="font-semibold text-xs">Sample PDF Title</h3>
                                <p className="text-xs opacity-80 mb-0.5">April 2025</p>
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
                  </div>
                </div>

                {/* Gradient Zoom Style */}
                <div className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <Checkbox 
                      id="gradient-zoom2" 
                      checked={localSettings.thumbnailStyle === 'gradient-zoom'}
                      onCheckedChange={(checked) => 
                        checked && setLocalSettings(prev => ({ ...prev, thumbnailStyle: 'gradient-zoom' }))
                      }
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label htmlFor="gradient-zoom2" className="text-base font-medium cursor-pointer">Gradient Zoom</Label>
                      <p className="text-sm text-muted-foreground mt-1 mb-3">Colorful gradient borders with zoom effects</p>
                      <div className="flex justify-center">
                        <div className="group cursor-pointer w-48">
                          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 p-1 group-hover:from-primary/40 group-hover:via-secondary/40 group-hover:to-accent/40 transition-all duration-300">
                            <div className="relative bg-card rounded-xl overflow-hidden">
                              <div className="aspect-video overflow-hidden bg-muted">
                                <img
                                  src={pdfPlaceholder}
                                  alt="Thumbnail preview"
                                  className="w-full h-full object-cover transition-all duration-500 group-hover:scale-125"
                                />
                                <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 via-transparent to-secondary/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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
                            <h3 className="font-semibold text-xs text-foreground group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-secondary group-hover:bg-clip-text group-hover:text-transparent transition-all">Sample PDF Title</h3>
                            <p className="text-xs text-muted-foreground mb-1 group-hover:text-primary transition-colors">April 2025</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Split Layout Style */}
                <div className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <Checkbox 
                      id="split-layout2" 
                      checked={localSettings.thumbnailStyle === 'split-layout'}
                      onCheckedChange={(checked) => 
                        checked && setLocalSettings(prev => ({ ...prev, thumbnailStyle: 'split-layout' }))
                      }
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label htmlFor="split-layout2" className="text-base font-medium cursor-pointer">Split Layout</Label>
                      <p className="text-sm text-muted-foreground mt-1 mb-3">Horizontal layout with small thumbnail and text side by side</p>
                      <div className="flex justify-center">
                        <div className="group cursor-pointer">
                          <div className="flex items-center gap-3 bg-card p-3 rounded-lg border border-border group-hover:border-primary transition-all duration-300 group-hover:shadow-md w-56">
                            <div className="flex-shrink-0">
                              <div className="w-12 h-16 rounded overflow-hidden bg-muted relative">
                                <img
                                  src={pdfPlaceholder}
                                  alt="Thumbnail preview"
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                                <div className="absolute top-1 right-1">
                                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                                </div>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-xs text-foreground mb-1 group-hover:text-primary transition-colors truncate">Sample PDF Title</h3>
                              <p className="text-xs text-muted-foreground mb-1 group-hover:text-primary transition-colors">April 2025</p>
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
                  </div>
                </div>

                {/* Minimal Underline Style */}
                <div className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <Checkbox 
                      id="minimal-underline2" 
                      checked={localSettings.thumbnailStyle === 'minimal-underline'}
                      onCheckedChange={(checked) => 
                        checked && setLocalSettings(prev => ({ ...prev, thumbnailStyle: 'minimal-underline' }))
                      }
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label htmlFor="minimal-underline2" className="text-base font-medium cursor-pointer">Minimal Underline</Label>
                      <p className="text-sm text-muted-foreground mt-1 mb-3">Clean design with animated underline on hover</p>
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
                              <h3 className="font-medium text-xs text-foreground relative inline-block">
                                Sample PDF Title
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
                              </h3>
                              <p className="text-xs text-muted-foreground mb-1">April 2025</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'color':
        return (
          <Card className={!license.isPro ? 'opacity-50 pointer-events-none' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Accent Color Configuration
              </CardTitle>
              <p className="text-sm text-muted-foreground">Customize the primary color used throughout your gallery</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label>Current Color</Label>
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-16 h-16 rounded-lg border border-border shadow-sm"
                      style={{ backgroundColor: localSettings.accentColor }}
                    />
                    <div>
                      <span className="text-lg font-mono font-medium">{localSettings.accentColor}</span>
                      <p className="text-sm text-muted-foreground">HEX Color Code</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="color-picker2">Choose New Color</Label>
                  <div className="space-y-3">
                    <Input
                      id="color-picker2"
                      type="color"
                      value={localSettings.accentColor}
                      onChange={(e) => setLocalSettings(prev => ({ ...prev, accentColor: e.target.value }))}
                      className="w-full h-16 rounded-lg"
                    />
                    <Input
                      value={localSettings.accentColor}
                      onChange={(e) => setLocalSettings(prev => ({ ...prev, accentColor: e.target.value }))}
                      placeholder="#7FB3DC"
                      className="font-mono text-center"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'size':
        return (
          <Card className={!license.isPro ? 'opacity-50 pointer-events-none' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Grid3X3 className="w-5 h-5" />
                Thumbnail Grid Size
              </CardTitle>
              <p className="text-sm text-muted-foreground">Set how many columns of thumbnails to display</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup 
                value={localSettings.thumbnailSize || 'four-rows'}
                onValueChange={(value) => setLocalSettings(prev => ({ ...prev, thumbnailSize: value }))}
                className="space-y-4"
              >
                <div className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="three-rows" id="three-rows2" />
                      <div>
                        <Label htmlFor="three-rows2" className="text-base font-medium cursor-pointer">3 Columns</Label>
                        <p className="text-sm text-muted-foreground">Larger thumbnails with more detail</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-1 w-16">
                      <div className="w-4 h-6 bg-muted rounded-sm"></div>
                      <div className="w-4 h-6 bg-muted rounded-sm"></div>
                      <div className="w-4 h-6 bg-muted rounded-sm"></div>
                      <div className="w-4 h-6 bg-muted rounded-sm"></div>
                      <div className="w-4 h-6 bg-muted rounded-sm"></div>
                    </div>
                  </div>
                </div>

                <div className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="four-rows" id="four-rows2" />
                      <div>
                        <Label htmlFor="four-rows2" className="text-base font-medium cursor-pointer">4 Columns</Label>
                        <p className="text-sm text-muted-foreground">Balanced layout (recommended)</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-1 w-16">
                      <div className="w-3 h-5 bg-muted rounded-sm"></div>
                      <div className="w-3 h-5 bg-muted rounded-sm"></div>
                      <div className="w-3 h-5 bg-muted rounded-sm"></div>
                      <div className="w-3 h-5 bg-muted rounded-sm"></div>
                      <div className="w-3 h-5 bg-muted rounded-sm"></div>
                      <div className="w-3 h-5 bg-muted rounded-sm"></div>
                      <div className="w-3 h-5 bg-muted rounded-sm"></div>
                    </div>
                  </div>
                </div>

                <div className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="five-rows" id="five-rows2" />
                      <div>
                        <Label htmlFor="five-rows2" className="text-base font-medium cursor-pointer">5 Columns</Label>
                        <p className="text-sm text-muted-foreground">Compact layout for many documents</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-5 gap-1 w-16">
                      <div className="w-2 h-4 bg-muted rounded-sm"></div>
                      <div className="w-2 h-4 bg-muted rounded-sm"></div>
                      <div className="w-2 h-4 bg-muted rounded-sm"></div>
                      <div className="w-2 h-4 bg-muted rounded-sm"></div>
                      <div className="w-2 h-4 bg-muted rounded-sm"></div>
                      <div className="w-2 h-4 bg-muted rounded-sm"></div>
                      <div className="w-2 h-4 bg-muted rounded-sm"></div>
                      <div className="w-2 h-4 bg-muted rounded-sm"></div>
                      <div className="w-2 h-4 bg-muted rounded-sm"></div>
                    </div>
                  </div>
                </div>
              </RadioGroup>
              <div className="text-xs text-muted-foreground p-3 bg-muted/30 rounded border-l-4 border-primary/50">
                <strong>Mobile Note:</strong> On mobile devices, thumbnails automatically display in a single column for optimal viewing experience.
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <ProBanner className="mb-6" />
      
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Settings2 className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Gallery Settings</h2>
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

      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar Navigation */}
        <div className="col-span-12 lg:col-span-3">
          <Card className="sticky top-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Configuration</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <nav className="space-y-1">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 ${
                        isActive 
                          ? 'bg-primary/10 text-primary border-r-2 border-primary' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{item.label}</span>
                      {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="col-span-12 lg:col-span-9">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default SettingsProposal2;