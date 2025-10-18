# Settings Page with Sidebar Menu Implementation Guide

This guide will help you implement a settings page with a left sidebar menu, identical in appearance and behavior to the PDF Gallery Plugin settings page, including Free/Pro version differences.

---

## Overview

The settings page features:
- **Left Sidebar Menu**: Navigation sections with icons
- **Right Content Area**: Settings sections that change based on sidebar selection
- **Pro Banner**: At the top of the page
- **Save Button**: Top-right, disabled in Free version
- **Pro/Free Differences**: Settings are greyed out and non-interactive in Free version

---

## Complete Implementation

### 1. Required Files

You need these files from the Pro Banner implementation:
- `src/utils/licenseMaster.ts` 
- `src/hooks/useLicense.ts`
- `src/components/ProBanner.tsx`

Refer to `PRO_BANNER_IMPLEMENTATION_GUIDE.md` for these files.

---

### 2. Settings Page Component Structure

```typescript
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useLicense } from '@/hooks/useLicense';
import ProBanner from '@/components/ProBanner';
import { 
  LayoutGrid, 
  Image, 
  Palette, 
  Maximize2, 
  Settings,
  ChevronRight 
} from 'lucide-react';

interface YourSettingsProps {
  settings: {
    // Your settings structure
    option1: string;
    option2: string;
    option3: boolean;
  };
  onSettingsChange: (settings: any) => void;
}

const YourSettings = ({ settings, onSettingsChange }: YourSettingsProps) => {
  const [localSettings, setLocalSettings] = useState(settings);
  const [activeSection, setActiveSection] = useState('section1');
  const { toast } = useToast();
  const license = useLicense();

  // Sync local settings with parent settings
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = async () => {
    // Update parent state
    onSettingsChange(localSettings);

    // Save to backend (WordPress, API, etc.)
    try {
      // Your save logic here
      // Example: await saveSettingsToBackend(localSettings);

      toast({
        title: "Settings Saved",
        description: "Your settings have been updated successfully",
      });
    } catch (e) {
      toast({ 
        title: "Error", 
        description: "Failed to save settings", 
        variant: "destructive" 
      });
    }
  };

  // Sidebar menu items
  const sidebarItems = [
    { id: 'section1', label: 'First Section', icon: LayoutGrid },
    { id: 'section2', label: 'Second Section', icon: Image },
    { id: 'section3', label: 'Third Section', icon: Palette },
    { id: 'section4', label: 'Fourth Section', icon: Maximize2 },
    { id: 'section5', label: 'Other Settings', icon: Settings },
  ];

  // Content renderer based on active section
  const renderContent = () => {
    switch (activeSection) {
      case 'section1':
        return (
          <Card 
            className={!license.isPro ? 'opacity-50 cursor-not-allowed' : ''} 
            onClick={!license.isPro ? () => {
              toast({
                title: "Upgrade Required",
                description: "These settings are only available in the Pro version.",
                variant: "destructive"
              });
            } : undefined}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutGrid className="w-5 h-5" />
                First Section
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Description of what this section controls
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="option1">Option 1</Label>
                <Input 
                  id="option1" 
                  value={localSettings.option1}
                  onChange={(e) => setLocalSettings(prev => ({ 
                    ...prev, 
                    option1: e.target.value 
                  }))}
                />
              </div>
              {/* More settings fields */}
            </CardContent>
          </Card>
        );

      case 'section2':
        return (
          <Card 
            className={!license.isPro ? 'opacity-50 cursor-not-allowed' : ''} 
            onClick={!license.isPro ? () => {
              toast({
                title: "Upgrade Required",
                description: "These settings are only available in the Pro version.",
                variant: "destructive"
              });
            } : undefined}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="w-5 h-5" />
                Second Section
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Description of what this section controls
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Your settings fields */}
            </CardContent>
          </Card>
        );

      // Add more cases for other sections...
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Pro Banner */}
      <ProBanner className="mb-6" />
      
      {/* Header with Save Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Settings</h2>
        <Button 
          onClick={() => { if (license.isPro) handleSave(); }}
          className={!license.isPro 
            ? "opacity-50 cursor-not-allowed pointer-events-none" 
            : "bg-primary hover:bg-primary/90"
          }
          disabled={!license.isPro}
          aria-disabled={!license.isPro}
        >
          Save Settings
        </Button>
      </div>

      {/* Main Layout: Sidebar + Content */}
      <div className="flex gap-6">
        {/* Left Sidebar */}
        <div className="w-64 flex-shrink-0">
          <Card>
            <CardContent className="p-3">
              <nav className="space-y-1">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-lg 
                        transition-colors text-left group
                        ${isActive 
                          ? 'bg-primary text-primary-foreground' 
                          : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                        }
                      `}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="flex-1 font-medium text-sm">
                        {item.label}
                      </span>
                      <ChevronRight 
                        className={`w-4 h-4 transition-opacity ${
                          isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
                        }`} 
                      />
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 min-w-0">
          {renderContent()}
        </div>
      </div>

      {/* Optional: Bottom Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={() => { if (license.isPro) handleSave(); }}
          className={!license.isPro 
            ? "opacity-50 cursor-not-allowed pointer-events-none" 
            : "bg-primary hover:bg-primary/90"
          }
          disabled={!license.isPro}
          aria-disabled={!license.isPro}
        >
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default YourSettings;
```

---

## Key Implementation Details

### 1. Sidebar Menu Structure

```typescript
const sidebarItems = [
  { id: 'section1', label: 'First Section', icon: LayoutGrid },
  { id: 'section2', label: 'Second Section', icon: Image },
  // Add more sections...
];
```

**Styling:**
- Active item: `bg-primary text-primary-foreground`
- Inactive item: `hover:bg-muted text-muted-foreground hover:text-foreground`
- ChevronRight icon visible only on active/hover
- Fixed width: `w-64` (256px)

### 2. Content Switching

Use a `switch` statement in `renderContent()` to render different content based on `activeSection`:

```typescript
const renderContent = () => {
  switch (activeSection) {
    case 'section1':
      return <Card>...</Card>;
    case 'section2':
      return <Card>...</Card>;
    // More cases...
    default:
      return null;
  }
};
```

### 3. Pro/Free Version Differences

**Free Version (license.isPro = false):**

1. **Settings Cards**: Greyed out and show toast on click
```typescript
<Card 
  className={!license.isPro ? 'opacity-50 cursor-not-allowed' : ''} 
  onClick={!license.isPro ? () => {
    toast({
      title: "Upgrade Required",
      description: "These settings are only available in the Pro version.",
      variant: "destructive"
    });
  } : undefined}
>
```

2. **Save Button**: Disabled and greyed out
```typescript
<Button 
  onClick={() => { if (license.isPro) handleSave(); }}
  className={!license.isPro 
    ? "opacity-50 cursor-not-allowed pointer-events-none" 
    : "bg-primary hover:bg-primary/90"
  }
  disabled={!license.isPro}
  aria-disabled={!license.isPro}
>
  Save Settings
</Button>
```

**Pro Version (license.isPro = true):**
- All settings are fully interactive
- Save button is enabled
- No opacity or pointer-events restrictions

### 4. Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│ Pro Banner                                              │
├─────────────────────────────────────────────────────────┤
│ Settings                               [Save Settings]  │
├───────────────┬─────────────────────────────────────────┤
│               │                                         │
│  Sidebar      │  Content Area                          │
│  (w-64)       │  (flex-1)                              │
│               │                                         │
│  • Section 1  │  ┌──────────────────────────────────┐  │
│  • Section 2  │  │ Card for Selected Section        │  │
│  • Section 3  │  │                                  │  │
│  • Section 4  │  │ Settings fields and controls     │  │
│  • Section 5  │  │                                  │  │
│               │  └──────────────────────────────────┘  │
│               │                                         │
└───────────────┴─────────────────────────────────────────┘
                                       [Save Settings]
```

---

## Responsive Considerations

For mobile devices, you may want to:

1. **Stack sidebar above content** on small screens:
```typescript
<div className="flex flex-col md:flex-row gap-6">
  {/* Sidebar */}
  <div className="w-full md:w-64">
    {/* ... */}
  </div>
  
  {/* Content */}
  <div className="flex-1">
    {/* ... */}
  </div>
</div>
```

2. **Convert sidebar to tabs** on mobile:
```typescript
// Use Tabs component on mobile, sidebar on desktop
<div className="block md:hidden">
  <Tabs value={activeSection} onValueChange={setActiveSection}>
    {/* Tab navigation */}
  </Tabs>
</div>

<div className="hidden md:flex gap-6">
  {/* Sidebar + Content */}
</div>
```

---

## Complete Example with Multiple Sections

```typescript
const renderContent = () => {
  switch (activeSection) {
    case 'general':
      return (
        <Card className={!license.isPro ? 'opacity-50 cursor-not-allowed' : ''} 
              onClick={!license.isPro ? showUpgradeToast : undefined}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              General Settings
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Configure general options for your plugin
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="site-title">Site Title</Label>
              <Input 
                id="site-title" 
                value={localSettings.siteTitle}
                onChange={(e) => setLocalSettings(prev => ({ 
                  ...prev, 
                  siteTitle: e.target.value 
                }))}
              />
            </div>
            <div>
              <Label htmlFor="tagline">Tagline</Label>
              <Input 
                id="tagline" 
                value={localSettings.tagline}
                onChange={(e) => setLocalSettings(prev => ({ 
                  ...prev, 
                  tagline: e.target.value 
                }))}
              />
            </div>
          </CardContent>
        </Card>
      );

    case 'appearance':
      return (
        <Card className={!license.isPro ? 'opacity-50 cursor-not-allowed' : ''} 
              onClick={!license.isPro ? showUpgradeToast : undefined}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Appearance Settings
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Customize the visual appearance
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="primary-color">Primary Color</Label>
              <Input 
                id="primary-color" 
                type="color"
                value={localSettings.primaryColor}
                onChange={(e) => setLocalSettings(prev => ({ 
                  ...prev, 
                  primaryColor: e.target.value 
                }))}
              />
            </div>
          </CardContent>
        </Card>
      );

    case 'advanced':
      return (
        <Card className={!license.isPro ? 'opacity-50 cursor-not-allowed' : ''} 
              onClick={!license.isPro ? showUpgradeToast : undefined}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="w-5 h-5" />
              Advanced Settings
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Advanced configuration options
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="debug-mode">Enable Debug Mode</Label>
              <Switch 
                id="debug-mode"
                checked={localSettings.debugMode}
                onCheckedChange={(checked) => setLocalSettings(prev => ({ 
                  ...prev, 
                  debugMode: checked 
                }))}
              />
            </div>
          </CardContent>
        </Card>
      );

    default:
      return null;
  }
};

const showUpgradeToast = () => {
  toast({
    title: "Upgrade Required",
    description: "These settings are only available in the Pro version.",
    variant: "destructive"
  });
};
```

---

## Styling Customization

### Sidebar Active/Inactive States

```typescript
// Active button
className="bg-primary text-primary-foreground"

// Inactive button
className="hover:bg-muted text-muted-foreground hover:text-foreground"

// Transition
className="transition-colors"
```

### Sidebar Icon

```typescript
<Icon className="w-5 h-5 flex-shrink-0" />
```

### Chevron Indicator

```typescript
<ChevronRight 
  className={`w-4 h-4 transition-opacity ${
    isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
  }`} 
/>
```

---

## Alternative: Sticky Sidebar

For long content, make the sidebar sticky:

```typescript
<div className="w-64 flex-shrink-0">
  <div className="sticky top-6">
    <Card>
      <CardContent className="p-3">
        {/* Sidebar content */}
      </CardContent>
    </Card>
  </div>
</div>
```

---

## Required Lucide Icons

```typescript
import { 
  LayoutGrid,      // Grid icon
  Image,           // Image icon
  Palette,         // Color palette icon
  Maximize2,       // Size icon
  Settings,        // Settings icon
  Settings2,       // Alternative settings icon
  ChevronRight,    // Arrow indicator
} from 'lucide-react';
```

---

## Required Shadcn Components

- `Card`, `CardContent`, `CardHeader`, `CardTitle`
- `Button`
- `Input`
- `Label`
- `Switch` (optional, for toggle settings)
- `Checkbox` (optional, for checkbox settings)
- `RadioGroup`, `RadioGroupItem` (optional, for radio settings)
- `Select` (optional, for dropdown settings)

---

## Testing

1. **Free Version**:
   - Verify all settings cards are greyed out (50% opacity)
   - Verify clicking settings shows "Upgrade Required" toast
   - Verify Save button is disabled and greyed out
   - Verify Pro Banner shows upgrade options

2. **Pro Version** (activate with master key):
   - Enter master key: `PGP-125-AX7N-93QH-4M2C-PRO`
   - Verify all settings are fully interactive
   - Verify Save button is enabled
   - Verify settings can be changed and saved
   - Verify Pro Banner shows "Pro is active" status

3. **Sidebar Navigation**:
   - Verify clicking sidebar items switches content
   - Verify active item has correct styling
   - Verify ChevronRight appears only on active/hover
   - Verify smooth transitions

---

## WordPress Integration (Optional)

If integrating with WordPress:

```typescript
const handleSave = async () => {
  onSettingsChange(localSettings);
  
  try {
    const wp = (window as any).wpYourPlugin;
    const urlParams = new URLSearchParams(window.location.search);
    const ajaxUrl = wp?.ajaxUrl || urlParams.get('ajax');
    const nonce = wp?.nonce || urlParams.get('nonce') || '';

    if (ajaxUrl && nonce) {
      const form = new FormData();
      form.append('action', 'your_plugin_save_settings');
      form.append('nonce', nonce);
      form.append('settings', JSON.stringify(localSettings));
      
      await fetch(ajaxUrl, { 
        method: 'POST', 
        credentials: 'same-origin', 
        body: form 
      });
    }

    toast({
      title: "Settings Saved",
      description: "Your settings have been updated successfully",
    });
  } catch (e) {
    toast({ 
      title: "Error", 
      description: "Failed to save settings", 
      variant: "destructive" 
    });
  }
};
```

---

## Summary

This implementation provides:
- ✅ Left sidebar navigation with icons
- ✅ Right content area that changes based on selection
- ✅ Pro Banner at the top
- ✅ Save button (top-right and optional bottom)
- ✅ Free version: Settings greyed out with upgrade toast
- ✅ Pro version: All settings fully functional
- ✅ Identical appearance and behavior to PDF Gallery Plugin
- ✅ Smooth transitions and hover effects
- ✅ Responsive considerations

Copy this structure to your other plugin to achieve identical settings page behavior!
