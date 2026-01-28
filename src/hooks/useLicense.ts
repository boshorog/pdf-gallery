import { useState, useEffect } from 'react';

export interface LicenseInfo {
  isValid: boolean;
  isPro: boolean;
  status: 'free' | 'pro' | 'expired' | 'invalid';
  expiryDate?: string;
  checked: boolean; // true when status has been conclusively determined
  isDevMode?: boolean; // true when using dev mode selector (Lovable preview)
}

const DEV_LICENSE_KEY = 'kindpdfg_dev_license_mode';

// Check if running in Lovable preview
const isLovablePreview = () => {
  const hostname = window.location.hostname;
  return hostname.includes('lovable.app') || hostname.includes('lovableproject.com') || hostname === 'localhost';
};

export const useLicense = (): LicenseInfo => {
  const [license, setLicense] = useState<LicenseInfo>({
    isValid: false,
    isPro: false,
    status: 'invalid',
    checked: false,
  });

  useEffect(() => {
    let cancelled = false;
    let finished = false;
    let intervalId: number | null = null;

    // In Lovable preview, use dev mode selector
    if (isLovablePreview()) {
      try {
        const devMode = localStorage.getItem(DEV_LICENSE_KEY) === 'pro';
        setLicense({
          isValid: true,
          isPro: devMode,
          status: devMode ? 'pro' : 'free',
          checked: true,
          isDevMode: true,
        });
      } catch {
        setLicense({
          isValid: true,
          isPro: false,
          status: 'free',
          checked: true,
          isDevMode: true,
        });
      }
      return;
    }

    const commit = (next: Partial<LicenseInfo>) => {
      if (cancelled) return;

      // IMPORTANT:
      // During an activation/upgrade redirect flow, a remote check can briefly return
      // a stale "free" status. If we stop polling on that result, Pro UI won't unlock
      // until a manual hard refresh. So we only treat `checked: true` as final when:
      // - we're NOT in a license-change flow, OR
      // - the resolved status is not "free" (or is explicitly Pro).
      const nextStatus = String((next as any).status ?? '').toLowerCase();
      const shouldFinish =
        next.isPro === true ||
        (next.checked === true && (!hasLicenseChangeParam || (nextStatus && nextStatus !== 'free')));

      if (shouldFinish) {
        finished = true;
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      }
      setLicense((prev) => ({ ...prev, ...next }));
    };

    const getWPGlobal = () => {
      let wpGlobal: any = null;
      try { wpGlobal = (window as any).kindpdfgData || (window as any).wpPDFGallery || null; } catch {}
      if (!wpGlobal) {
        try { wpGlobal = (window.parent && ((window.parent as any).kindpdfgData || (window.parent as any).wpPDFGallery)) || null; } catch {}
      }
      return wpGlobal;
    };

    // Check for license activation URL params and trigger refresh if needed
    const urlParams = new URLSearchParams(window.location.search);
    const licenseActivated = urlParams.get('license_activated');
    const licenseUpdated = urlParams.get('license_updated');
    
    const hasLicenseChangeParam = licenseActivated === '1' || !!licenseUpdated;

    // Force a one-time reload after returning from Freemius so the page
    // re-evaluates localized WP globals and fetches freshly cache-busted assets.
    if (hasLicenseChangeParam) {
      try {
        const key = 'kindpdfg_post_license_reload';
        const alreadyReloaded = sessionStorage.getItem(key) === '1';
        if (!alreadyReloaded) {
          sessionStorage.setItem(key, '1');
          const nextUrl = new URL(window.location.href);
          nextUrl.searchParams.set('kindpdfg_reload', String(Date.now()));
          window.location.replace(nextUrl.toString());
          return;
        }
      } catch {
        // If sessionStorage is unavailable, proceed without forced reload.
      }
    }

    if (hasLicenseChangeParam) {
      // Clear localStorage suppression to ensure Pro features show
      try { localStorage.removeItem('kindpdfg_pro_welcome_dismissed'); } catch {}
    }

    const resolveFromGlobal = () => {
      const wpGlobal = getWPGlobal();
      const status = String(wpGlobal?.fsStatus ?? '').toLowerCase();
      const fsIsPro = !!(wpGlobal && (wpGlobal.fsIsPro === true || wpGlobal.fsIsPro === 'true' || wpGlobal.fsIsPro === '1' || wpGlobal.fsIsPro === 1));
      const proFlag = fsIsPro || (!!status && status !== 'free');
      if (proFlag) {
        commit({ isValid: true, isPro: true, status: (status || 'pro') as any, checked: true });
        return true;
      }
      return false;
    };

    const doRemoteCheck = () => {
      const wpGlobal = getWPGlobal();
      const urlParams = new URLSearchParams(window.location.search);
      const ajaxUrl = wpGlobal?.ajaxUrl || (window as any).ajaxurl || urlParams.get('ajax') || urlParams.get('ajaxurl') || urlParams.get('ajax_url') || '';
      const nonce = wpGlobal?.nonce || urlParams.get('nonce') || '';
      if (!(ajaxUrl && nonce)) {
        // Without AJAX context we cannot confirm free; keep hidden (checked remains false)
        return;
      }
      const form = new FormData();
      form.append('action', 'kindpdfg_freemius_check');
      form.append('nonce', nonce);

      fetch(ajaxUrl, { method: 'POST', credentials: 'same-origin', body: form })
        .then((res) => res.json())
        .then((data) => {
          if (cancelled) return;
          const lic = data?.data?.license;
          if (data?.success && lic) {
            const wpGlobal = getWPGlobal();
            const fsAvailable = !!(wpGlobal && wpGlobal.fsAvailable === true);
            // Only mark as definitively free if licensing system is available
            if (lic.status === 'free' && !fsAvailable) {
              return; // keep hidden; avoid false-positive free when FS SDK missing
            }

            // Normalize remote result shape (defensive): some responses may only provide `status`.
            const remoteStatus = String(lic.status ?? '').toLowerCase();
            const remoteIsPro =
              lic.isPro === true ||
              remoteStatus === 'pro' ||
              (!!remoteStatus && remoteStatus !== 'free');

            commit({ ...lic, isPro: remoteIsPro, isValid: remoteIsPro || remoteStatus === 'free', checked: true });
          } else {
            // Not confirmed free; keep hidden (checked remains false)
          }
        })
        .catch(() => {
          // Network error - keep hidden (checked remains false)
        });
    };

    // 1) Try global immediately
    if (resolveFromGlobal()) return;

    // 2) Wait for Freemius globals to become available.
    // After activation the SDK can take longer to attach to window, so we poll longer.
    let attempts = 0;
    const maxAttempts = hasLicenseChangeParam ? 120 : 20; // 12s vs 2s
    intervalId = window.setInterval(() => {
      if (cancelled || finished) {
        if (intervalId) clearInterval(intervalId);
        intervalId = null;
        return;
      }
      attempts += 1;
      if (resolveFromGlobal()) {
        // resolveFromGlobal commits with checked=true and will stop polling via commit()
        return;
      }

      // Try remote checks a few times (especially after activation) in case globals lag.
      if (attempts === 10 || (hasLicenseChangeParam && (attempts === 30 || attempts === 60))) {
        doRemoteCheck();
      }

      if (attempts >= maxAttempts) {
        if (intervalId) clearInterval(intervalId);
        intervalId = null;
        // One last attempt at a remote check (no-op if missing AJAX context).
        doRemoteCheck();
      }
    }, 100);

    // 3) If user activates license in another tab/window and then returns here,
    // re-check once on focus/visibility without requiring a hard refresh.
    const recheck = () => {
      // If Pro resolves from globals, we're done; otherwise try remote check.
      if (!resolveFromGlobal()) {
        doRemoteCheck();
      }
    };
    const onFocus = () => recheck();
    const onVisibility = () => {
      if (document.visibilityState === 'visible') recheck();
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return license;
};