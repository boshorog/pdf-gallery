import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

        let data: any = null;
        const contentType = response.headers.get('content-type') || '';
        try {
          if (contentType.includes('application/json')) {
            data = await response.json();
          } else {
            const text = await response.text();
            // Try to parse JSON from text, otherwise wrap as error
            try { data = JSON.parse(text); }
            catch { data = { success: false, data: { message: text || `HTTP ${response.status}` } }; }
          }
        } catch (e) {
          // Parsing failed – read as text for better diagnostics
          const text = await response.text().catch(() => '');
          data = { success: false, data: { message: text || `HTTP ${response.status}` } };
        }

        if (response.ok && data?.success) {
          toast({
            title: 'Success!',
            description: 'Pro license activated successfully. Refreshing page...',
          });
          setTimeout(() => window.location.reload(), 1500);
        } else {
          console.error('License activation failed:', { status: response.status, data });
          toast({
            title: 'Invalid License',
            description: data?.data?.message || `Activation failed (HTTP ${response.status}).`,
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
                      onClick={() => window.open('https://checkout.freemius.com/plugin/20814/plan/34946/?sandbox=true', '_blank')}
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