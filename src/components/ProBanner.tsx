import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Crown, ExternalLink, Star, Zap, Unlock, Key, Check } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ProBannerProps {
  className?: string;
}

const ProBanner = ({ className = '' }: ProBannerProps) => {
  const [licenseKey, setLicenseKey] = useState('');
  const [isActivating, setIsActivating] = useState(false);
  const { toast } = useToast();

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
      const wp = (window as any).wpPDFGallery;
      const urlParams = new URLSearchParams(window.location.search);
      const ajaxUrl = wp?.ajaxUrl || urlParams.get('ajax');
      const nonce = wp?.nonce || urlParams.get('nonce') || '';

      if (ajaxUrl && nonce) {
        const form = new FormData();
        form.append('action', 'pdf_gallery_action');
        form.append('action_type', 'activate_license');
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
            title: "Success!",
            description: "Pro license activated successfully. Refreshing page...",
          });
          setTimeout(() => window.location.reload(), 1500);
        } else {
          toast({
            title: "Invalid License",
            description: data?.data?.message || "The license key is invalid or expired",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to activate license. Please try again.",
        variant: "destructive"
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
              <h3 className="text-lg font-bold text-foreground">Upgrade to PDF Gallery Pro</h3>
              <div className="px-2 py-1 text-xs font-medium bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full">
                Pro
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              Unlock advanced features to create stunning, unlimited PDF galleries with custom styling options.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Unlock className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium">Unlimited Galleries</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium">All Thumbnail Styles</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium">Advanced Settings</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="license-key" className="text-sm font-medium mb-2 block">
                  Already have a license key?
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Key className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="license-key"
                      type="text"
                      placeholder="Enter your license key"
                      value={licenseKey}
                      onChange={(e) => setLicenseKey(e.target.value)}
                      className="pl-10"
                      disabled={isActivating}
                    />
                  </div>
                  <Button 
                    onClick={handleActivateLicense}
                    disabled={isActivating || !licenseKey.trim()}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isActivating ? (
                      "Activating..."
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        Activate
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="h-px bg-border flex-1"></div>
                <span className="text-xs text-muted-foreground px-2">or</span>
                <div className="h-px bg-border flex-1"></div>
              </div>
              
              <Button 
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium"
                onClick={() => window.open('https://kindpixels.com/pdf-gallery-pro', '_blank')}
              >
                Get PDF Gallery Pro
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProBanner;