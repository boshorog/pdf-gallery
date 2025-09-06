import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';

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
  React.useEffect(() => {
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

  const iconPositions = [
    { value: 'top-right', label: 'Top Right', class: 'top-3 right-3' },
    { value: 'top-left', label: 'Top Left', class: 'top-3 left-3' },
    { value: 'bottom-right', label: 'Bottom Right', class: 'bottom-3 right-3' },
    { value: 'bottom-left', label: 'Bottom Left', class: 'bottom-3 left-3' },
  ];

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
              {iconPositions.map((position) => (
                <div key={position.value} className="text-center">
                  <div className="flex items-center space-x-2 mb-2">
                    <RadioGroupItem value={position.value} id={position.value} />
                    <Label htmlFor={position.value} className="text-sm font-medium">
                      {position.label}
                    </Label>
                  </div>
                  <div className="relative w-20 h-12 bg-muted rounded mx-auto">
                    <div className={`absolute w-4 h-2 bg-primary rounded-sm ${position.class}`}></div>
                  </div>
                </div>
              ))}
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
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="default-placeholder" 
              checked={localSettings.defaultPlaceholder === 'default'}
              onCheckedChange={(checked) => 
                checked && setLocalSettings(prev => ({ ...prev, defaultPlaceholder: 'default' }))
              }
            />
            <Label htmlFor="default-placeholder">Use default placeholder</Label>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-20 h-12 bg-muted rounded flex items-center justify-center">
              <div className="w-6 h-4 bg-primary/20 rounded"></div>
            </div>
            <p className="text-sm text-muted-foreground">
              Current default placeholder image
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PDFSettings;