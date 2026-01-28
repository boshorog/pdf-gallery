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
    // 1) Explicit redirect params (license_updated / license_activated) AND user is actually Pro
    // 2) Fallback: first time we detect Pro in this browser (covers cases where Freemius
    //    returns to the page without params and users previously needed a hard refresh)

    const urlParams = new URLSearchParams(window.location.search);
    const licenseUpdated = urlParams.get('license_updated');
    const licenseActivated = urlParams.get('license_activated');
    const reloadParam = urlParams.get('kindpdfg_reload');

    const getWpGlobalSafe = () => {
      let wpGlobal: any = null;
      try {
        wpGlobal = (window as any).kindpdfgData || (window as any).wpPDFGallery || null;
      } catch {}
      if (!wpGlobal) {
        try {
          wpGlobal = (window.parent && ((window.parent as any).kindpdfgData || (window.parent as any).wpPDFGallery)) || null;
        } catch {}
      }
      return wpGlobal;
    };

    const isWpProFromGlobal = (wpGlobal: any) =>
      !!(
        wpGlobal &&
        (wpGlobal.fsIsPro === true || wpGlobal.fsIsPro === 'true' || wpGlobal.fsIsPro === '1' || wpGlobal.fsIsPro === 1)
      );

    // localStorage flags
    let dismissed: string | null = null;
    let shown: string | null = null;
    try {
      dismissed = localStorage.getItem('kindpdfg_pro_welcome_dismissed');
      shown = localStorage.getItem('kindpdfg_pro_welcome_shown');
    } catch {}

    // Has license activation params (coming from Freemius activation flow)
    const hasLicenseParams = !!licenseUpdated || !!licenseActivated;

    const triggerIfEligible = () => {
      const wpGlobal = getWpGlobalSafe();
      // CRITICAL: Only trust fsIsPro from PHP (derived from can_use_premium_code())
      // Never infer Pro from fsStatus strings.
      const wpIsPro = isWpProFromGlobal(wpGlobal);

      const shouldTrigger =
        wpIsPro && (
          hasLicenseParams ||
          (!dismissed && !shown)
        );

      if (!shouldTrigger) return false;

      // If this is a fresh license activation, clear the old dismissed flag
      // so the welcome banner can show again (user might have dismissed it during a trial)
      if (hasLicenseParams) {
        try {
          localStorage.removeItem('kindpdfg_pro_welcome_dismissed');
        } catch {}
      }

      // Mark as shown immediately (so even if user navigates away quickly it won't re-trigger)
      try {
        localStorage.setItem('kindpdfg_pro_welcome_shown', '1');
      } catch {}

      setShouldRender(true);
      setTimeout(() => setIsVisible(true), 100);

      // Clean up URL params after showing (if present)
      // IMPORTANT: Only clean after the post-license reload attempt ran.
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

      return true;
    };

    // Try immediately
    if (triggerIfEligible()) return;

    // If Pro status isn't ready yet (Freemius globals can lag after activation),
    // poll briefly so the welcome banner still appears once the server-side fsIsPro flips.
    const shouldPoll = hasLicenseParams || (!dismissed && !shown);
    if (!shouldPoll) return;

    const maxMs = hasLicenseParams ? 30000 : 5000;
    const startedAt = Date.now();
    const intervalId = window.setInterval(() => {
      if (triggerIfEligible()) {
        clearInterval(intervalId);
        return;
      }
      if (Date.now() - startedAt > maxMs) {
        clearInterval(intervalId);
      }
    }, 250);

    return () => clearInterval(intervalId);
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
        <div className="flex flex-col items-center gap-3">
          <Button
            onClick={handleDismiss}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-medium px-8"
          >
            Get Started
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            If you don't see the new features, a hard refresh may be needed: <span className="font-medium">Ctrl+Shift+R</span> (Windows) or <span className="font-medium">Cmd+Shift+R</span> (Mac)
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProWelcome;
