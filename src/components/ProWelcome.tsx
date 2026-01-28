import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Unlock, Zap, BarChart3, X, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ProWelcomeProps {
  className?: string;
  onDismiss?: () => void;
}

const ProWelcome = ({ className = '', onDismiss }: ProWelcomeProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    // Show criteria:
    // 1) Explicit redirect params (license_updated / license_activated)
    // 2) Fallback: first time we detect Pro in this browser (covers cases where Freemius
    //    returns to the page without params and users previously needed a hard refresh)

    const urlParams = new URLSearchParams(window.location.search);
    const licenseUpdated = urlParams.get('license_updated');
    const licenseActivated = urlParams.get('license_activated');
    const reloadParam = urlParams.get('kindpdfg_reload');

    // Check WP localized globals for Pro state (server-side truth)
    let wpGlobal: any = null;
    try {
      wpGlobal = (window as any).kindpdfgData || (window as any).wpPDFGallery || null;
    } catch {}
    if (!wpGlobal) {
      try {
        wpGlobal = (window.parent && ((window.parent as any).kindpdfgData || (window.parent as any).wpPDFGallery)) || null;
      } catch {}
    }

    const wpStatus = String(wpGlobal?.fsStatus ?? '').toLowerCase();
    const wpIsPro = !!(
      wpGlobal &&
      (wpGlobal.fsIsPro === true || wpGlobal.fsIsPro === 'true' || wpGlobal.fsIsPro === '1' || wpGlobal.fsIsPro === 1)
    );
    // Only treat a small allowlist of statuses as Pro-like; Freemius may return other
    // non-free statuses (pending/expired/etc.) that must NOT unlock Pro.
    const PRO_LIKE_STATUSES = new Set(['pro', 'paid', 'premium', 'trial', 'active_trial', 'trialing']);
    const isProLike = wpIsPro || PRO_LIKE_STATUSES.has(wpStatus);

    // localStorage flags
    const dismissed = localStorage.getItem('kindpdfg_pro_welcome_dismissed');
    const shown = localStorage.getItem('kindpdfg_pro_welcome_shown');

    const shouldTrigger =
      (!!licenseUpdated || !!licenseActivated) ||
      (isProLike && !dismissed && !shown);

    if (!shouldTrigger) return;

    // Mark as shown immediately (so even if user navigates away quickly it won't re-trigger)
    try {
      localStorage.setItem('kindpdfg_pro_welcome_shown', '1');
    } catch {}

    setShouldRender(true);
    setTimeout(() => setIsVisible(true), 100);

    // Clean up URL params after showing (if present)
    // IMPORTANT: Only clean after the post-license reload attempt ran.
    // Otherwise we can remove the params before useLicense sees them,
    // which prevents the auto-reload needed to pick up the Pro bundle.
    if (licenseUpdated || licenseActivated) {
      let reloadAttempted = false;
      try {
        // useLicense stores a timestamp, not a boolean.
        reloadAttempted = !!sessionStorage.getItem('kindpdfg_post_license_reload');
      } catch {
        // ignore
      }

      if (reloadAttempted || !!reloadParam) {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('license_updated');
        newUrl.searchParams.delete('license_activated');
        window.history.replaceState({}, '', newUrl.toString());
      }
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      localStorage.setItem('kindpdfg_pro_welcome_dismissed', '1');
      localStorage.setItem('kindpdfg_pro_welcome_shown', '1');
    } catch {}
    setTimeout(() => {
      setShouldRender(false);
      onDismiss?.();
    }, 300);
  };

  if (!shouldRender) return null;

  const features = [
    {
      icon: Unlock,
      title: 'Unlimited Galleries',
      description: 'Create as many galleries as you need for different sections of your site.',
    },
    {
      icon: Zap,
      title: 'Batch Upload of Multiple Files',
      description: 'Upload multiple files at once with drag & drop support.',
    },
    {
      icon: BarChart3,
      title: 'File Analytics',
      description: 'Track views and downloads for all your documents.',
    },
  ];

  return (
    <Card 
      className={`
        border-2 border-orange-500/30 bg-gradient-to-br from-orange-50 to-amber-50 
        dark:from-orange-950/30 dark:to-amber-950/30 
        overflow-hidden transition-all duration-300
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}
        ${className}
      `}
    >
      <CardContent className="p-6 relative">
        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          aria-label="Dismiss welcome message"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/25">
            <Crown className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-foreground">Welcome to PDF Gallery Pro!</h2>
              <Sparkles className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-sm text-muted-foreground">
              Thank you for upgrading. Here's what you've unlocked:
            </p>
          </div>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex flex-col items-center text-center p-4 rounded-xl bg-white/60 dark:bg-white/5 border border-orange-200/50 dark:border-orange-800/30"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center mb-3 shadow-md">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
              <p className="text-xs text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex justify-center">
          <Button
            onClick={handleDismiss}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-medium px-8"
          >
            Get Started
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProWelcome;
