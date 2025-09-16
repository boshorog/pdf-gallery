import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Settings, Image, Layout, Palette, Monitor } from 'lucide-react';
import pdfPlaceholder from '@/assets/pdf-placeholder.png';

const SettingsLayoutOptions = () => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  return (
    <div className="space-y-8 p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">Choose Your Settings Layout</h1>
        <p className="text-muted-foreground">Select the layout style that works best for your workflow</p>
      </div>

      {/* Option 1: Enhanced Card Layout */}
      <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-lg px-3 py-1">1</Badge>
            <h2 className="text-xl font-semibold">Enhanced Card Layout</h2>
          </div>
          <Button 
            variant={selectedOption === 1 ? "default" : "outline"}
            onClick={() => setSelectedOption(selectedOption === 1 ? null : 1)}
          >
            {selectedOption === 1 ? "Selected" : "Choose This"}
          </Button>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <Card className="border-l-4 border-l-primary">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Image className="w-4 h-4 text-primary" />
                  <CardTitle className="text-sm">Default Placeholder</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-3">
                  <img src={pdfPlaceholder} alt="Preview" className="w-12 h-8 object-cover rounded" />
                  <div className="text-xs text-muted-foreground">Current placeholder image</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-secondary">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Layout className="w-4 h-4 text-secondary" />
                  <CardTitle className="text-sm">Thumbnail Size</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-xs">3 Columns</Badge>
                  <Badge variant="secondary" className="text-xs">4 Columns</Badge>
                  <Badge variant="outline" className="text-xs">5 Columns</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <Card className="border-l-4 border-l-accent">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-accent" />
                  <CardTitle className="text-sm">Thumbnail Style</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-2">
                  <div className="border rounded p-2 text-center">
                    <div className="w-full h-6 bg-muted rounded mb-1"></div>
                    <div className="text-xs">Default</div>
                  </div>
                  <div className="border rounded p-2 text-center opacity-50">
                    <div className="w-full h-6 bg-muted rounded mb-1"></div>
                    <div className="text-xs">Elevated</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-muted-foreground">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  <CardTitle className="text-sm">Shape & Colors</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-primary rounded"></div>
                  <div className="text-xs text-muted-foreground">Landscape 16:9</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Option 2: Tabbed Interface */}
      <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-lg px-3 py-1">2</Badge>
            <h2 className="text-xl font-semibold">Tabbed Interface</h2>
          </div>
          <Button 
            variant={selectedOption === 2 ? "default" : "outline"}
            onClick={() => setSelectedOption(selectedOption === 2 ? null : 2)}
          >
            {selectedOption === 2 ? "Selected" : "Choose This"}
          </Button>
        </div>

        <Tabs defaultValue="appearance" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="appearance" className="flex items-center gap-1">
              <Palette className="w-3 h-3" />
              <span className="hidden sm:inline">Appearance</span>
            </TabsTrigger>
            <TabsTrigger value="layout" className="flex items-center gap-1">
              <Layout className="w-3 h-3" />
              <span className="hidden sm:inline">Layout</span>
            </TabsTrigger>
            <TabsTrigger value="media" className="flex items-center gap-1">
              <Image className="w-3 h-3" />
              <span className="hidden sm:inline">Media</span>
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-1">
              <Settings className="w-3 h-3" />
              <span className="hidden sm:inline">Advanced</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appearance" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Thumbnail Style</Label>
                    <div className="grid grid-cols-3 gap-3 mt-2">
                      <div className="border rounded-lg p-3 text-center cursor-pointer hover:border-primary">
                        <div className="w-full h-12 bg-muted rounded mb-2"></div>
                        <span className="text-xs">Default</span>
                      </div>
                      <div className="border rounded-lg p-3 text-center cursor-pointer hover:border-primary opacity-60">
                        <div className="w-full h-12 bg-muted rounded mb-2"></div>
                        <span className="text-xs">Elevated</span>
                      </div>
                      <div className="border rounded-lg p-3 text-center cursor-pointer hover:border-primary opacity-60">
                        <div className="w-full h-12 bg-muted rounded mb-2"></div>
                        <span className="text-xs">Gradient</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="layout" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                <div>
                  <Label className="text-sm font-medium">Thumbnail Size</Label>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">3 Columns</Badge>
                    <Badge variant="secondary" className="cursor-pointer">4 Columns</Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">5 Columns</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Mobile displays single column automatically</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="media" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                <div>
                  <Label className="text-sm font-medium">Default Placeholder</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <img src={pdfPlaceholder} alt="Current" className="w-16 h-12 object-cover rounded border" />
                    <Button variant="outline" size="sm">Upload New</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="cache" />
                    <Label htmlFor="cache" className="text-sm">Enable thumbnail caching</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="lazy" />
                    <Label htmlFor="lazy" className="text-sm">Lazy load thumbnails</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Option 3: Sidebar Navigation */}
      <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-lg px-3 py-1">3</Badge>
            <h2 className="text-xl font-semibold">Sidebar Navigation</h2>
          </div>
          <Button 
            variant={selectedOption === 3 ? "default" : "outline"}
            onClick={() => setSelectedOption(selectedOption === 3 ? null : 3)}
          >
            {selectedOption === 3 ? "Selected" : "Choose This"}
          </Button>
        </div>

        <div className="flex border rounded-lg overflow-hidden h-80">
          {/* Sidebar */}
          <div className="w-64 bg-muted/30 border-r">
            <div className="p-4">
              <h3 className="font-medium text-sm mb-3">Settings Categories</h3>
              <div className="space-y-1">
                <div className="flex items-center gap-2 p-2 rounded bg-primary text-primary-foreground text-sm">
                  <Palette className="w-4 h-4" />
                  <span>Appearance</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded hover:bg-muted text-sm cursor-pointer">
                  <Layout className="w-4 h-4" />
                  <span>Layout Options</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded hover:bg-muted text-sm cursor-pointer">
                  <Image className="w-4 h-4" />
                  <span>Media Settings</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded hover:bg-muted text-sm cursor-pointer">
                  <Monitor className="w-4 h-4" />
                  <span>Display Options</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded hover:bg-muted text-sm cursor-pointer">
                  <Settings className="w-4 h-4" />
                  <span>Advanced</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-1">Appearance Settings</h3>
              <p className="text-sm text-muted-foreground">Customize the visual appearance of your PDF gallery</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium mb-3 block">Thumbnail Style</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border-2 border-primary rounded-lg p-4 cursor-pointer">
                    <div className="w-full h-16 bg-muted rounded mb-2"></div>
                    <div className="text-center">
                      <div className="text-xs font-medium">Default Style</div>
                      <div className="text-xs text-muted-foreground">Currently Selected</div>
                    </div>
                  </div>
                  <div className="border rounded-lg p-4 cursor-pointer hover:border-primary/50 opacity-60">
                    <div className="w-full h-16 bg-muted rounded mb-2"></div>
                    <div className="text-center">
                      <div className="text-xs font-medium">Elevated Card</div>
                      <div className="text-xs text-muted-foreground">Click to select</div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Thumbnail Shape</Label>
                <div className="flex gap-2">
                  <Badge variant="secondary">Landscape 16:9</Badge>
                  <Badge variant="outline">Square 1:1</Badge>
                  <Badge variant="outline">Portrait 2:3</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedOption && (
        <div className="text-center p-4 bg-primary/10 rounded-lg border border-primary/20">
          <p className="text-primary font-medium">
            You've selected Option {selectedOption}! This layout style will be applied to your settings.
          </p>
        </div>
      )}
    </div>
  );
};

export default SettingsLayoutOptions;