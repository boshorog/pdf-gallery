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

**IMPORTANT: Use this EXACT code for identical appearance**

```typescript
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Crown, ExternalLink, Star, Zap, Unlock, Key, Check, X } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useLicense } from '@/hooks/useLicense';
import { verifyMasterKey, activateMasterPro, deactivateMasterPro, isMasterProActive } from '@/utils/licenseMaster';

interface ProBannerProps {
  className?: string;
}

const ProBanner = ({ className = '' }: ProBannerProps) => {
  const [licenseKey, setLicenseKey] = useState('');
  const [isActivating, setIsActivating] = useState(false);
  const { toast } = useToast();
  const license = useLicense();
  const isPro = license.isPro;
  const heading = isPro ? 'Welcome to PDF Gallery Pro' : 'Upgrade to PDF Gallery';
  const description = isPro
    ? 'You have access to advanced features to create stunning, unlimited PDF galleries with advanced settings and custom styling options.'
    : 'Unlock advanced features to create stunning, unlimited PDF galleries with custom styling options.';

  const handleActivateLicense = async () => {
    if (!licenseKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a license key",
        variant: "destructive"
      });
      return;
    }

    setIsActivating(true);
    
    try {
      // 1) Temporary master key activation (frontend-only)
      if (verifyMasterKey(licenseKey)) {
        activateMasterPro();
        toast({ title: 'Success!', description: 'Master license activated. Refreshing...' });
        setTimeout(() => window.location.reload(), 800);
        return;
      }

      // 2) Freemius integration - use their API
      const wp = (window as any).wpPDFGallery;
      const urlParams = new URLSearchParams(window.location.search);
      const ajaxUrl = wp?.ajaxUrl || urlParams.get('ajax');
      const nonce = wp?.nonce || urlParams.get('nonce') || '';

      if (ajaxUrl && nonce) {
        const form = new FormData();
        form.append('action', 'pdf_gallery_freemius_activate');
        form.append('license_key', licenseKey.trim());
        form.append('nonce', nonce);

        const response = await fetch(ajaxUrl, {
          method: 'POST',
          credentials: 'same-origin',
          body: form,
        });

        const data = await response.json();
        
        if (data?.success) {
          toast({
            title: 'Success!',
            description: 'Pro license activated successfully. Refreshing page...',
          });
          setTimeout(() => window.location.reload(), 1500);
        } else {
          toast({
            title: 'Invalid License',
            description: data?.data?.message || 'The license key is invalid or expired',
            variant: 'destructive'
          });
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to activate license. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <Card className={`border-gradient-to-r from-orange-500/20 to-red-500/20 bg-gradient-to-r from-orange-50/50 to-red-50/50 dark:from-orange-950/20 dark:to-red-950/20 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
            <Crown className="w-6 h-6 text-white" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-bold text-foreground">{heading}</h3>
              <div className="px-2 py-1 text-xs font-medium bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full">
                Pro
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              {description}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="flex items-center gap-3">
                <Unlock className="w-6 h-6 text-orange-500" />
                <span className="text-lg font-semibold">Unlimited Galleries</span>
              </div>
              <div className="flex items-center gap-3">
                <Star className="w-6 h-6 text-orange-500" />
                <span className="text-lg font-semibold">All Thumbnail Styles</span>
              </div>
              <div className="flex items-center gap-3">
                <Zap className="w-6 h-6 text-orange-500" />
                <span className="text-lg font-semibold">Advanced Settings</span>
              </div>
            </div>

            {/* Licensed state */}
            {license.isPro ? (
              <div className="max-w-md mx-auto mt-4 space-y-1">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <div className="text-sm font-medium text-foreground">PDF Gallery Pro is active</div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { deactivateMasterPro(); window.location.reload(); }}
                    className="border-muted-foreground/30 text-muted-foreground bg-transparent hover:bg-muted/50 ml-1"
                    aria-label="Deactivate license"
                    title="Deactivate license"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                {isMasterProActive() && (
                  <div className="text-xs text-muted-foreground ml-6">
                    Registered to: daniel@kindpixels.com
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {/* Get Pro button first */}
                <div className="w-full flex justify-center">
                  <div className="w-full max-w-md">
                    <Button 
                      className="w-full h-9 text-sm bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium"
                      onClick={() => window.open('https://kindpixels.com/pdf-gallery-pro', '_blank')}
                    >
                      Get PDF Gallery Pro
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
                
                {/* Divider matching width */}
                <div className="w-full flex justify-center">
                  <div className="flex items-center gap-2 w-full max-w-md">
                    <div className="h-px bg-border flex-1"></div>
                    <span className="text-xs text-muted-foreground px-2">or</span>
                    <div className="h-px bg-border flex-1"></div>
                  </div>
                </div>
                
                {/* License input section below divider */}
                <div className="w-full flex justify-center">
                  <div className="flex gap-2 w-full max-w-md">
                    <div className="relative flex-1">
                      <Input
                        id="license-key"
                        type="text"
                        placeholder="Enter your license key"
                        value={licenseKey}
                        onChange={(e) => setLicenseKey(e.target.value)}
                        className="pr-10 h-9 text-sm"
                        disabled={isActivating}
                      />
                      <Key className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    </div>
                    <Button 
                      onClick={handleActivateLicense}
                      disabled={isActivating || !licenseKey.trim()}
                      variant="outline"
                      size="sm"
                      className="border-muted-foreground/30 text-muted-foreground bg-transparent hover:bg-muted/50"
                    >
                      {isActivating ? (
                        'Activating...'
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-1" />
                          Activate
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProBanner;
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
