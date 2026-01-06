import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings2, ChevronDown, Globe, FileText, Check } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

const SettingsScopeSelectorShowcase = () => {
  const [option1Scope, setOption1Scope] = useState('current');
  const [option2Scope, setOption2Scope] = useState('current');
  const [option3Scope, setOption3Scope] = useState('current');
  const [option4Scope, setOption4Scope] = useState(false);
  const [option5Scope, setOption5Scope] = useState('current');

  return (
    <div className="space-y-8 p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings Scope Selector</h1>
        <p className="text-muted-foreground">4 design options for the scope selector next to the save button</p>
      </div>

      {/* Option 1: Radio Pills Inline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Option 1: Radio Pills (Inline)</CardTitle>
          <p className="text-sm text-muted-foreground">Compact radio buttons styled as pills, inline with the header</p>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-4 bg-muted/30">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <Settings2 className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">Gallery Settings</h2>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-background border rounded-lg p-1">
                  <button
                    onClick={() => setOption1Scope('current')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      option1Scope === 'current'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <FileText className="w-4 h-4 inline-block mr-1.5" />
                    Current Gallery
                  </button>
                  <button
                    onClick={() => setOption1Scope('all')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      option1Scope === 'all'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Globe className="w-4 h-4 inline-block mr-1.5" />
                    All Galleries
                  </button>
                </div>
                <Button className="bg-primary hover:bg-primary/90" size="lg">
                  Save Settings
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Option 2: Dropdown Select */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Option 2: Dropdown Select</CardTitle>
          <p className="text-sm text-muted-foreground">Clean dropdown with clear labeling</p>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-4 bg-muted/30">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <Settings2 className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">Gallery Settings</h2>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Label className="text-sm text-muted-foreground whitespace-nowrap">Apply to:</Label>
                  <Select value={option2Scope} onValueChange={setOption2Scope}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="current">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Current Gallery
                        </div>
                      </SelectItem>
                      <SelectItem value="all">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          All Galleries
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="bg-primary hover:bg-primary/90" size="lg">
                  Save Settings
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Option 3: Integrated Save Button with Dropdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Option 3: Split Save Button</CardTitle>
          <p className="text-sm text-muted-foreground">Save button with integrated scope dropdown menu</p>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-4 bg-muted/30">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <Settings2 className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">Gallery Settings</h2>
              </div>
              <div className="flex items-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="rounded-r-none border-r-0">
                      {option3Scope === 'current' ? (
                        <>
                          <FileText className="w-4 h-4 mr-2" />
                          Current Gallery
                        </>
                      ) : (
                        <>
                          <Globe className="w-4 h-4 mr-2" />
                          All Galleries
                        </>
                      )}
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setOption3Scope('current')}>
                      <FileText className="w-4 h-4 mr-2" />
                      Current Gallery Only
                      {option3Scope === 'current' && <Check className="w-4 h-4 ml-auto" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setOption3Scope('all')}>
                      <Globe className="w-4 h-4 mr-2" />
                      All Galleries
                      {option3Scope === 'all' && <Check className="w-4 h-4 ml-auto" />}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button className="bg-primary hover:bg-primary/90 rounded-l-none" size="default">
                  Save Settings
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Option 4: Toggle Switch with Label */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Option 4: Toggle Switch</CardTitle>
          <p className="text-sm text-muted-foreground">Simple switch to toggle between current and all galleries</p>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-4 bg-muted/30">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <Settings2 className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">Gallery Settings</h2>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 bg-background border rounded-lg px-4 py-2">
                  <span className={`text-sm font-medium ${!option4Scope ? 'text-primary' : 'text-muted-foreground'}`}>
                    Current Gallery
                  </span>
                  <Switch
                    checked={option4Scope}
                    onCheckedChange={setOption4Scope}
                  />
                  <span className={`text-sm font-medium ${option4Scope ? 'text-primary' : 'text-muted-foreground'}`}>
                    All Galleries
                  </span>
                </div>
                <Button className="bg-primary hover:bg-primary/90" size="lg">
                  Save Settings
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Option 5: Badge Style with Stacked Layout */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Option 5: Badge Selector (Stacked on Mobile)</CardTitle>
          <p className="text-sm text-muted-foreground">Badge-style selector that stacks well on smaller screens</p>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-4 bg-muted/30">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <Settings2 className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">Gallery Settings</h2>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-sm text-muted-foreground">Scope:</span>
                  <div className="flex gap-2">
                    <Badge 
                      variant={option5Scope === 'current' ? 'default' : 'outline'}
                      className={`cursor-pointer transition-all ${
                        option5Scope === 'current' 
                          ? 'bg-primary hover:bg-primary/90' 
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => setOption5Scope('current')}
                    >
                      <FileText className="w-3 h-3 mr-1" />
                      Current
                    </Badge>
                    <Badge 
                      variant={option5Scope === 'all' ? 'default' : 'outline'}
                      className={`cursor-pointer transition-all ${
                        option5Scope === 'all' 
                          ? 'bg-primary hover:bg-primary/90' 
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => setOption5Scope('all')}
                    >
                      <Globe className="w-3 h-3 mr-1" />
                      All
                    </Badge>
                  </div>
                </div>
                <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto" size="lg">
                  Save Settings
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">
            Each option is designed to be responsive. The selected scope will be passed to the save function and properly applied to either the current gallery or all galleries.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsScopeSelectorShowcase;
