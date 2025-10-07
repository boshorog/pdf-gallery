# ProBanner Implementation Guide

This guide will help you implement the ProBanner component with master key functionality in your project.

---

## Files to Create

### 1. `src/utils/licenseMaster.ts`

```typescript
// Utilities for temporary master key activation (frontend-only, obfuscated)
// Note: This is a temporary client-side mechanism. Real licensing should be handled server-side via Freemius.

const getMasterKey = (): string => {
  // Mild obfuscation via chunking
  const chunks = ['PG', 'P-1', '25', '-AX', '7N', '-93', 'QH', '-4M', '2C', '-PR', 'O'];
  return chunks.join('');
};

export const verifyMasterKey = (input: string): boolean => {
  return input.trim() === getMasterKey();
};

const STORAGE_KEY = 'pdf_gallery_pro_active';

export const activateMasterPro = () => {
  try {
    localStorage.setItem(STORAGE_KEY, '1');
  } catch {}
};

export const deactivateMasterPro = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
};

export const isMasterProActive = (): boolean => {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
};
```

---

### 2. `src/hooks/useLicense.ts`

```typescript
import { useState, useEffect } from 'react';
import { isMasterProActive } from '@/utils/licenseMaster';

export interface LicenseInfo {
  isValid: boolean;
  isPro: boolean;
  status: 'free' | 'pro' | 'expired' | 'invalid';
  expiryDate?: string;
}

export const useLicense = (): LicenseInfo => {
  const [license, setLicense] = useState<LicenseInfo>({
    isValid: false,
    isPro: false,
    status: 'free'
  });

  useEffect(() => {
    // 1) Temporary master key override (frontend-only)
    if (isMasterProActive()) {
      setLicense({ isValid: true, isPro: true, status: 'pro' });
      return; // Skip remote check
    }

    // 2) Check license from WordPress backend (Freemius)
    const wp = (window as any).wpPDFGallery;
    const urlParams = new URLSearchParams(window.location.search);
    const ajaxUrl = wp?.ajaxUrl || urlParams.get('ajax');
    const nonce = wp?.nonce || urlParams.get('nonce') || '';

    if (ajaxUrl && nonce) {
      const form = new FormData();
      form.append('action', 'pdf_gallery_freemius_check');
      form.append('nonce', nonce);

      fetch(ajaxUrl, {
        method: 'POST',
        credentials: 'same-origin',
        body: form,
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.success && data?.data?.license) {
            setLicense(data.data.license);
          } else {
            // Default to free version
            setLicense({
              isValid: true,
              isPro: false,
              status: 'free'
            });
          }
        })
        .catch(() => {
          // Fallback to free version
          setLicense({
            isValid: true,
            isPro: false,
            status: 'free'
          });
        });
    } else {
      // Development mode - default to free
      setLicense({
        isValid: true,
        isPro: false,
        status: 'free'
      });
    }
  }, []);

  return license;
};
```

---

### 3. `src/components/ProBanner.tsx`

```typescript
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Unlock, Star, Zap, Crown, CheckCircle2 } from 'lucide-react';
import { useLicense } from '@/hooks/useLicense';
import { verifyMasterKey, activateMasterPro, deactivateMasterPro } from '@/utils/licenseMaster';
import { useToast } from '@/hooks/use-toast';

interface ProBannerProps {
  className?: string;
}

export const ProBanner = ({ className = '' }: ProBannerProps) => {
  const license = useLicense();
  const { toast } = useToast();
  const [licenseKey, setLicenseKey] = useState('');
  const [isActivating, setIsActivating] = useState(false);

  const handleActivateLicense = async () => {
    if (!licenseKey.trim()) {
      toast({
        title: "License Key Required",
        description: "Please enter a valid license key.",
        variant: "destructive"
      });
      return;
    }

    setIsActivating(true);

    // Check if it's the temporary master key
    if (verifyMasterKey(licenseKey)) {
      activateMasterPro();
      toast({
        title: "Pro Activated!",
        description: "Master key accepted. All Pro features are now unlocked.",
      });
      setLicenseKey('');
      setIsActivating(false);
      window.location.reload(); // Refresh to apply changes
      return;
    }

    // Otherwise, send to WordPress backend for Freemius validation
    const wp = (window as any).wpPDFGallery;
    const urlParams = new URLSearchParams(window.location.search);
    const ajaxUrl = wp?.ajaxUrl || urlParams.get('ajax');
    const nonce = wp?.nonce || urlParams.get('nonce') || '';

    if (!ajaxUrl || !nonce) {
      toast({
        title: "Configuration Error",
        description: "Unable to validate license. Please contact support.",
        variant: "destructive"
      });
      setIsActivating(false);
      return;
    }

    try {
      const form = new FormData();
      form.append('action', 'pdf_gallery_activate_license');
      form.append('nonce', nonce);
      form.append('license_key', licenseKey.trim());

      const response = await fetch(ajaxUrl, {
        method: 'POST',
        credentials: 'same-origin',
        body: form,
      });

      const data = await response.json();

      if (data?.success) {
        toast({
          title: "Pro Activated!",
          description: "Your license has been activated successfully.",
        });
        setLicenseKey('');
        window.location.reload(); // Refresh to apply changes
      } else {
        toast({
          title: "Activation Failed",
          description: data?.data?.message || "Invalid license key. Please check and try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Activation Error",
        description: "Unable to activate license. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsActivating(false);
    }
  };

  const handleDeactivate = () => {
    deactivateMasterPro();
    toast({
      title: "Pro Deactivated",
      description: "Master key has been removed.",
    });
    window.location.reload();
  };

  if (license.isPro) {
    return (
      <Card className={`border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20 ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
            <CheckCircle2 className="w-5 h-5" />
            Pro Version Active
          </CardTitle>
          <CardDescription className="text-green-600 dark:text-green-500">
            You have access to all premium features.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleDeactivate}
            variant="outline"
            size="sm"
            className="border-green-300 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-900/30"
          >
            Deactivate Master Key
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-primary" />
          Upgrade to Pro
          <Badge variant="secondary" className="ml-2">Limited Time</Badge>
        </CardTitle>
        <CardDescription>
          Unlock premium features and take your galleries to the next level
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          <div className="flex items-start gap-2">
            <Unlock className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-sm">Custom Thumbnails</p>
              <p className="text-xs text-muted-foreground">Upload your own images for any document</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Star className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-sm">Advanced Styling</p>
              <p className="text-xs text-muted-foreground">20+ thumbnail styles and animations</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Zap className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-sm">Premium Support</p>
              <p className="text-xs text-muted-foreground">Priority email and chat support</p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Enter your license key"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleActivateLicense()}
                disabled={isActivating}
              />
              <Button 
                onClick={handleActivateLicense}
                disabled={isActivating || !licenseKey.trim()}
              >
                {isActivating ? 'Activating...' : 'Activate'}
              </Button>
            </div>
            <Button className="w-full" size="lg">
              Get Pro Now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
```

---

## Implementation Steps

### Step 1: Create the Files
1. Create `src/utils/licenseMaster.ts` with the code above
2. Create `src/hooks/useLicense.ts` with the code above
3. Create `src/components/ProBanner.tsx` with the code above

### Step 2: Add ProBanner to Your Settings Page
In your settings component (wherever you want the banner to appear):

```typescript
import { ProBanner } from '@/components/ProBanner';

// Inside your component:
<ProBanner className="mb-6" />
```

### Step 3: Use License Hook in Components
To check Pro status in any component:

```typescript
import { useLicense } from '@/hooks/useLicense';

const MyComponent = () => {
  const license = useLicense();
  
  // Check if Pro
  if (license.isPro) {
    // Show Pro features
  }
  
  // Or disable features
  <Button disabled={!license.isPro}>
    Pro Feature
  </Button>
};
```

### Step 4: Style Pro-Only Sections
For sections that require Pro:

```typescript
<Card className={!license.isPro ? 'opacity-50 cursor-not-allowed' : ''} 
      onClick={!license.isPro ? () => {
        toast({
          title: "Upgrade Required",
          description: "This feature is only available in the Pro version.",
          variant: "destructive"
        });
      } : undefined}>
  {/* Your content */}
</Card>
```

---

## Master Key

The master key is: **PGP-125-AX7N-93QH-4M2C-PRO**

This key will activate Pro features locally via localStorage. It's obfuscated in the code but can be used for testing or temporary activation.

---

## WordPress Integration (Optional)

If you want to integrate with Freemius licensing:

1. Add the following PHP action to your WordPress plugin:

```php
add_action('wp_ajax_pdf_gallery_freemius_check', 'pdf_gallery_freemius_check_callback');
add_action('wp_ajax_pdf_gallery_activate_license', 'pdf_gallery_activate_license_callback');

function pdf_gallery_freemius_check_callback() {
    check_ajax_referer('pdf_gallery_nonce', 'nonce');
    
    // Check Freemius license status
    $is_pro = function_exists('fs_pdfgallery') && fs_pdfgallery()->is_premium();
    
    wp_send_json_success([
        'license' => [
            'isValid' => true,
            'isPro' => $is_pro,
            'status' => $is_pro ? 'pro' : 'free'
        ]
    ]);
}

function pdf_gallery_activate_license_callback() {
    check_ajax_referer('pdf_gallery_nonce', 'nonce');
    
    $license_key = sanitize_text_field($_POST['license_key']);
    
    // Activate via Freemius
    // ... your Freemius activation logic here
    
    wp_send_json_success([
        'message' => 'License activated successfully'
    ]);
}
```

2. Ensure your WordPress plugin passes these values to the frontend:

```php
wp_localize_script('your-script-handle', 'wpPDFGallery', [
    'ajaxUrl' => admin_url('admin-ajax.php'),
    'nonce' => wp_create_nonce('pdf_gallery_nonce')
]);
```

---

## Dependencies Required

Make sure you have these shadcn components installed:
- Card
- Button
- Input
- Label
- Badge
- Toast (useToast hook)

And these Lucide icons:
```bash
lucide-react
```

---

## Testing

1. Open your settings page
2. Enter the master key: `PGP-125-AX7N-93QH-4M2C-PRO`
3. Click "Activate"
4. The page will refresh and Pro features should be unlocked
5. To deactivate, click the deactivate button that appears

---

## Notes

- The master key is stored in localStorage and persists across sessions
- This is a client-side only solution - for production use, integrate with Freemius or another licensing system
- The ProBanner will automatically detect the license status and show appropriate UI
- The license check happens on component mount via the `useLicense` hook

---

## Customization

### Change Master Key
Edit the `getMasterKey()` function in `licenseMaster.ts` to use your own key:

```typescript
const getMasterKey = (): string => {
  const chunks = ['YOUR', '-CUS', 'TOM', '-KEY'];
  return chunks.join('');
};
```

### Change Storage Key
Edit the `STORAGE_KEY` constant:

```typescript
const STORAGE_KEY = 'your_app_pro_active';
```

### Customize ProBanner Appearance
The ProBanner uses a gradient design with orange/red colors. Modify the className props in the component to match your branding.

---

## Support

If you have any issues implementing this, refer to the original project or check the component implementations for styling and behavior details.
