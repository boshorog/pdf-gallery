import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ChevronDown, 
  ChevronRight, 
  FileText, 
  Minus, 
  Star, 
  Maximize2, 
  Settings, 
  BarChart3,
  SlidersHorizontal,
  LayoutGrid,
  Eye
} from 'lucide-react';

// Variant 1: Clean Collapsible with Stats Header
const Variant1 = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [ratings, setRatings] = useState(true);
  const [lightbox, setLightbox] = useState(true);
  
  return (
    <Card className="border-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Variant 1: Stats Header + Dropdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">12 Documents</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Minus className="h-4 w-4" />
                <span className="text-sm">3 Dividers</span>
              </div>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1">
                <Settings className="h-4 w-4" />
                Options
                <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="pt-3">
            <div className="flex flex-wrap gap-6 p-3 bg-background border rounded-lg">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="v1-ratings" 
                  checked={ratings} 
                  onCheckedChange={(c) => setRatings(c as boolean)} 
                />
                <Label htmlFor="v1-ratings" className="flex items-center gap-2 cursor-pointer">
                  <Star className="h-4 w-4 text-yellow-500" />
                  Enable Ratings
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="v1-lightbox" 
                  checked={lightbox} 
                  onCheckedChange={(c) => setLightbox(c as boolean)} 
                />
                <Label htmlFor="v1-lightbox" className="flex items-center gap-2 cursor-pointer">
                  <Maximize2 className="h-4 w-4 text-blue-500" />
                  Enable Lightbox
                </Label>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

// Variant 2: Compact Inline Bar with Toggle Pills
const Variant2 = () => {
  const [ratings, setRatings] = useState(true);
  const [lightbox, setLightbox] = useState(true);
  
  return (
    <Card className="border-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Variant 2: Compact Inline with Pills</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between flex-wrap gap-3 p-3 bg-gradient-to-r from-primary/5 to-transparent rounded-lg border">
          {/* Stats Section */}
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="gap-1.5 py-1">
              <FileText className="h-3.5 w-3.5" />
              12 files
            </Badge>
            <Badge variant="outline" className="gap-1.5 py-1">
              <Minus className="h-3.5 w-3.5" />
              3 dividers
            </Badge>
          </div>
          
          {/* Options Section */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setRatings(!ratings)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                ratings 
                  ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' 
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              <Star className={`h-3.5 w-3.5 ${ratings ? 'fill-current' : ''}`} />
              Ratings
            </button>
            <button
              onClick={() => setLightbox(!lightbox)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                lightbox 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              <Maximize2 className="h-3.5 w-3.5" />
              Lightbox
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Variant 3: Side Accordion Panel
const Variant3 = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [ratings, setRatings] = useState(true);
  const [lightbox, setLightbox] = useState(true);
  
  return (
    <Card className="border-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Variant 3: Side Accordion Panel</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex rounded-lg border overflow-hidden">
          {/* Stats Panel - Always Visible */}
          <div className="flex-1 p-4 bg-muted/30">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Statistics</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-2 bg-background rounded-md">
                <div className="text-2xl font-bold text-primary">12</div>
                <div className="text-xs text-muted-foreground">Documents</div>
              </div>
              <div className="text-center p-2 bg-background rounded-md">
                <div className="text-2xl font-bold text-muted-foreground">3</div>
                <div className="text-xs text-muted-foreground">Dividers</div>
              </div>
            </div>
          </div>
          
          {/* Options Panel - Expandable */}
          <Collapsible open={isOpen} onOpenChange={setIsOpen} className="flex">
            <CollapsibleTrigger asChild>
              <button className="w-10 flex items-center justify-center bg-primary/10 hover:bg-primary/20 transition-colors border-l">
                <div className="flex flex-col items-center gap-1">
                  <SlidersHorizontal className="h-4 w-4" />
                  <ChevronRight className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="w-48 border-l">
              <div className="p-4 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Settings className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">Options</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="v3-ratings" className="flex items-center gap-2 cursor-pointer text-sm">
                      <Star className="h-4 w-4 text-yellow-500" />
                      Ratings
                    </Label>
                    <Checkbox 
                      id="v3-ratings" 
                      checked={ratings} 
                      onCheckedChange={(c) => setRatings(c as boolean)} 
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="v3-lightbox" className="flex items-center gap-2 cursor-pointer text-sm">
                      <Maximize2 className="h-4 w-4 text-blue-500" />
                      Lightbox
                    </Label>
                    <Checkbox 
                      id="v3-lightbox" 
                      checked={lightbox} 
                      onCheckedChange={(c) => setLightbox(c as boolean)} 
                    />
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </CardContent>
    </Card>
  );
};

// Variant 4: Floating Action Bar
const Variant4 = () => {
  const [ratings, setRatings] = useState(true);
  const [lightbox, setLightbox] = useState(true);
  
  return (
    <Card className="border-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Variant 4: Floating Action Bar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative bg-muted/20 rounded-lg p-4 min-h-[100px] flex items-center justify-center">
          <span className="text-muted-foreground text-sm">[Gallery Content Area]</span>
          
          {/* Floating Bar at Bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-2">
            <div className="flex items-center justify-between bg-background/95 backdrop-blur-sm rounded-xl shadow-lg border p-3">
              {/* Stats */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">12</div>
                    <div className="text-xs text-muted-foreground">files</div>
                  </div>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <Minus className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold">3</div>
                    <div className="text-xs text-muted-foreground">dividers</div>
                  </div>
                </div>
              </div>
              
              {/* Toggle Options */}
              <div className="flex items-center gap-1">
                <Button
                  variant={ratings ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setRatings(!ratings)}
                  className="gap-1.5"
                >
                  <Star className={`h-4 w-4 ${ratings ? 'fill-current' : ''}`} />
                  <span className="hidden sm:inline">Ratings</span>
                </Button>
                <Button
                  variant={lightbox ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setLightbox(!lightbox)}
                  className="gap-1.5"
                >
                  <Maximize2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Lightbox</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Variant 5: Tabbed Panel with Icons
const Variant5 = () => {
  const [activeTab, setActiveTab] = useState<'stats' | 'options'>('stats');
  const [ratings, setRatings] = useState(true);
  const [lightbox, setLightbox] = useState(true);
  
  return (
    <Card className="border-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Variant 5: Icon Tabs Panel</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-hidden">
          {/* Tab Headers */}
          <div className="flex border-b bg-muted/30">
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'stats' 
                  ? 'bg-background text-primary border-b-2 border-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              Statistics
            </button>
            <button
              onClick={() => setActiveTab('options')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'options' 
                  ? 'bg-background text-primary border-b-2 border-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Eye className="h-4 w-4" />
              Display Options
              {(ratings || lightbox) && (
                <span className="w-2 h-2 rounded-full bg-green-500" />
              )}
            </button>
          </div>
          
          {/* Tab Content */}
          <div className="p-4">
            {activeTab === 'stats' ? (
              <div className="flex items-center justify-around">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-2xl font-bold">12</div>
                  <div className="text-sm text-muted-foreground">Documents</div>
                </div>
                <div className="w-px h-16 bg-border" />
                <div className="text-center">
                  <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-2">
                    <LayoutGrid className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="text-2xl font-bold">3</div>
                  <div className="text-sm text-muted-foreground">Dividers</div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div 
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                    ratings ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setRatings(!ratings)}
                >
                  <div className="flex items-center gap-3">
                    <Star className={`h-5 w-5 ${ratings ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`} />
                    <div>
                      <div className="font-medium">Star Ratings</div>
                      <div className="text-xs text-muted-foreground">Allow visitors to rate documents</div>
                    </div>
                  </div>
                  <Checkbox checked={ratings} onCheckedChange={(c) => setRatings(c as boolean)} />
                </div>
                <div 
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                    lightbox ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setLightbox(!lightbox)}
                >
                  <div className="flex items-center gap-3">
                    <Maximize2 className={`h-5 w-5 ${lightbox ? 'text-blue-500' : 'text-muted-foreground'}`} />
                    <div>
                      <div className="font-medium">Lightbox Preview</div>
                      <div className="text-xs text-muted-foreground">Open documents in fullscreen overlay</div>
                    </div>
                  </div>
                  <Checkbox checked={lightbox} onCheckedChange={(c) => setLightbox(c as boolean)} />
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const GalleryToolbarShowcase: React.FC = () => {
  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Gallery Toolbar Variants</h2>
        <p className="text-muted-foreground">
          Bara expandabilă cu statistici și opțiuni pentru fiecare galerie
        </p>
      </div>
      
      <Variant1 />
      <Variant2 />
      <Variant3 />
      <Variant4 />
      <Variant5 />
      
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-2">Legend</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• <strong>Statistics:</strong> Contor documente și dividere (dividere afișate doar dacă există)</li>
            <li>• <strong>Ratings:</strong> Activează/dezactivează sistemul de rating cu stele</li>
            <li>• <strong>Lightbox:</strong> Activează/dezactivează previzualizarea în overlay fullscreen</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default GalleryToolbarShowcase;
