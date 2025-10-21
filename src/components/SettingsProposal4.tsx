import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { FileText, ExternalLink, Upload, Image, Palette, Grid3X3, Settings2, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import pdfPlaceholder from '@/assets/pdf-placeholder.png';
import { useLicense } from '@/hooks/useLicense';
import ProBanner from '@/components/ProBanner';

interface SettingsProposal4Props {
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

const SettingsProposal4 = ({ settings, onSettingsChange }: SettingsProposal4Props) => {
  const [localSettings, setLocalSettings] = useState({
    ...settings,
    thumbnailSize: settings.thumbnailSize || 'four-rows'
  });
  const [currentStep, setCurrentStep] = useState(1);
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

  const steps = [
    { id: 1, title: 'Placeholder Image', description: 'Set default image for documents', icon: Image },
    { id: 2, title: 'Choose Style', description: 'Select thumbnail appearance', icon: FileText },
    { id: 3, title: 'Pick Colors', description: 'Customize accent colors', icon: Palette },
    { id: 4, title: 'Grid Layout', description: 'Configure column count', icon: Grid3X3 },
  ];

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Set Your Default Placeholder</h3>
              <p className="text-muted-foreground">This image will be shown for documents that don't have thumbnails</p>
            </div>
            
            <div className="flex justify-center">
              <div className="space-y-4">
                <div className="flex justify-center">
                  <img 
                    src={localSettings.defaultPlaceholder === 'default' ? pdfPlaceholder : localSettings.defaultPlaceholder}
                    alt="Current placeholder" 
                    className="w-48 h-32 object-cover rounded-lg border border-border shadow-sm"
                  />
                </div>
                
                <Label
                  htmlFor="placeholderFile4"
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors block max-w-sm mx-auto"
                >
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <span className="text-sm font-medium text-primary hover:underline block mb-1">
                    Click to upload new placeholder
                  </span>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG up to 2MB recommended
                  </p>
                  <Input
                    id="placeholderFile4"
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
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Choose Your Thumbnail Style</h3>
              <p className="text-muted-foreground">Select how your document thumbnails will appear in the gallery</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Default Style */}
              <div className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                localSettings.thumbnailStyle === 'default' 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              }`} onClick={() => setLocalSettings(prev => ({ ...prev, thumbnailStyle: 'default' }))}>
                <div className="flex items-center gap-3 mb-4">
                  <Checkbox 
                    checked={localSettings.thumbnailStyle === 'default'}
                  />
                  <div>
                    <h4 className="font-semibold">Default Style</h4>
                    <p className="text-sm text-muted-foreground">Clean and professional</p>
                  </div>
                </div>
                <div className="flex justify-center">
                  <div className="group cursor-pointer w-40">
                    <div className="relative bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border border-border">
                      <div className="aspect-video overflow-hidden bg-muted relative">
                        <img
                          src={pdfPlaceholder}
                          alt="Default style preview"
                          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <ExternalLink className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="absolute top-2 right-2 bg-card/90 backdrop-blur-sm rounded px-2 py-1">
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
              <div className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                localSettings.thumbnailStyle === 'elevated-card' 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              }`} onClick={() => setLocalSettings(prev => ({ ...prev, thumbnailStyle: 'elevated-card' }))}>
                <div className="flex items-center gap-3 mb-4">
                  <Checkbox 
                    checked={localSettings.thumbnailStyle === 'elevated-card'}
                  />
                  <div>
                    <h4 className="font-semibold">Elevated Card</h4>
                    <p className="text-sm text-muted-foreground">Modern with shadows</p>
                  </div>
                </div>
                <div className="flex justify-center">
                  <div className="group cursor-pointer w-40">
                    <div className="relative bg-card rounded-2xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-300 transform group-hover:-translate-y-2 border border-border">
                      <div className="aspect-[4/3] overflow-hidden bg-muted">
                        <img
                          src={pdfPlaceholder}
                          alt="Elevated style preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute bottom-2 right-2">
                        <div className="bg-white/90 backdrop-blur-sm rounded-full p-1.5">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3" />
                          </svg>
                        </div>
                      </div>
                      <div className="p-2">
                        <p className="text-xs text-muted-foreground">April 2025</p>
                        <h3 className="font-semibold text-xs">Sample PDF</h3>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Pick Your Accent Color</h3>
              <p className="text-muted-foreground">This color will be used for highlights and interactive elements</p>
            </div>
            
            <div className="max-w-md mx-auto space-y-6">
              <div className="flex justify-center">
                <div 
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
                  style={{ backgroundColor: localSettings.accentColor }}
                />
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="color-picker4" className="text-center block mb-2">Choose Color</Label>
                  <Input
                    id="color-picker4"
                    type="color"
                    value={localSettings.accentColor}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, accentColor: e.target.value }))}
                    className="w-full h-16 rounded-lg"
                  />
                </div>
                
                <div>
                  <Label htmlFor="hex-input" className="text-center block mb-2">Or enter HEX code</Label>
                  <Input
                    id="hex-input"
                    value={localSettings.accentColor}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, accentColor: e.target.value }))}
                    placeholder="#7FB3DC"
                    className="font-mono text-center text-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Configure Grid Layout</h3>
              <p className="text-muted-foreground">Choose how many columns of thumbnails to display</p>
            </div>
            
            <div className="max-w-2xl mx-auto">
              <RadioGroup 
                value={localSettings.thumbnailSize || 'four-rows'}
                onValueChange={(value) => setLocalSettings(prev => ({ ...prev, thumbnailSize: value }))}
                className="space-y-4"
              >
                <div className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                  localSettings.thumbnailSize === 'three-rows' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="three-rows" id="three-rows4" />
                      <div>
                        <Label htmlFor="three-rows4" className="text-lg font-medium cursor-pointer">3 Columns</Label>
                        <p className="text-sm text-muted-foreground">Large thumbnails with more detail</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 w-24">
                      <div className="w-6 h-8 bg-muted rounded"></div>
                      <div className="w-6 h-8 bg-muted rounded"></div>
                      <div className="w-6 h-8 bg-muted rounded"></div>
                      <div className="w-6 h-8 bg-muted rounded"></div>
                      <div className="w-6 h-8 bg-muted rounded"></div>
                    </div>
                  </div>
                </div>

                <div className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                  localSettings.thumbnailSize === 'four-rows' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="four-rows" id="four-rows4" />
                      <div>
                        <Label htmlFor="four-rows4" className="text-lg font-medium cursor-pointer">4 Columns</Label>
                        <p className="text-sm text-muted-foreground">Balanced layout (recommended)</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-1 w-24">
                      <div className="w-5 h-7 bg-muted rounded"></div>
                      <div className="w-5 h-7 bg-muted rounded"></div>
                      <div className="w-5 h-7 bg-muted rounded"></div>
                      <div className="w-5 h-7 bg-muted rounded"></div>
                      <div className="w-5 h-7 bg-muted rounded"></div>
                      <div className="w-5 h-7 bg-muted rounded"></div>
                      <div className="w-5 h-7 bg-muted rounded"></div>
                    </div>
                  </div>
                </div>

                <div className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                  localSettings.thumbnailSize === 'five-rows' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="five-rows" id="five-rows4" />
                      <div>
                        <Label htmlFor="five-rows4" className="text-lg font-medium cursor-pointer">5 Columns</Label>
                        <p className="text-sm text-muted-foreground">Compact layout for many documents</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-5 gap-1 w-24">
                      <div className="w-4 h-6 bg-muted rounded"></div>
                      <div className="w-4 h-6 bg-muted rounded"></div>
                      <div className="w-4 h-6 bg-muted rounded"></div>
                      <div className="w-4 h-6 bg-muted rounded"></div>
                      <div className="w-4 h-6 bg-muted rounded"></div>
                      <div className="w-4 h-6 bg-muted rounded"></div>
                      <div className="w-4 h-6 bg-muted rounded"></div>
                      <div className="w-4 h-6 bg-muted rounded"></div>
                      <div className="w-4 h-6 bg-muted rounded"></div>
                    </div>
                  </div>
                </div>
              </RadioGroup>
              
              <div className="text-xs text-muted-foreground mt-6 p-4 bg-muted/30 rounded-lg border-l-4 border-primary/50">
                <strong>Mobile Note:</strong> On mobile devices, thumbnails automatically display in a single column for optimal viewing experience.
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {license.isValid && license.status === 'free' ? (<ProBanner className="mb-6" />) : null}
      
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Settings2 className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Gallery Setup Wizard</h2>
        </div>
        <p className="text-muted-foreground">Configure your gallery settings step by step</p>
      </div>

      {/* Progress Steps */}
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    isCompleted 
                      ? 'bg-green-100 text-green-600' 
                      : isActive 
                        ? 'bg-primary text-white' 
                        : 'bg-muted text-muted-foreground'
                  }`}>
                    {isCompleted ? <CheckCircle className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                  </div>
                  <div className="text-center mt-2">
                    <p className={`text-sm font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-muted-foreground hidden sm:block">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 mx-4 h-0.5 ${
                    isCompleted ? 'bg-green-200' : 'bg-muted'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <Card className={`max-w-4xl mx-auto min-h-[500px] ${!license.isPro ? 'opacity-50 pointer-events-none' : ''}`}>
        <CardContent className="p-8">
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center max-w-4xl mx-auto pt-6">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        <div className="text-sm text-muted-foreground">
          Step {currentStep} of {steps.length}
        </div>

        {currentStep < 4 ? (
          <Button
            onClick={nextStep}
            className="flex items-center gap-2"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={() => { if (license.isPro) handleSave(); }}
            className={`flex items-center gap-2 ${!license.isPro ? "opacity-50 cursor-not-allowed pointer-events-none" : "bg-green-600 hover:bg-green-700"}`}
            disabled={!license.isPro}
          >
            <CheckCircle className="w-4 h-4" />
            Save Settings
          </Button>
        )}
      </div>
    </div>
  );
};

export default SettingsProposal4;