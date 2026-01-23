import { useState, useEffect } from 'react';

export interface LicenseInfo {
  isValid: boolean;
  isPro: boolean;
  status: 'free' | 'pro' | 'expired' | 'invalid';
  expiryDate?: string;
  checked: boolean; // true when status has been conclusively determined
}

export const useLicense = (): LicenseInfo => {
  const [license, setLicense] = useState<LicenseInfo>({
    isValid: false,
    isPro: false,
    status: 'invalid',
    checked: false,
  });

  useEffect(() => {
    let cancelled = false;

    const commit = (next: Partial<LicenseInfo>) => {
      if (cancelled) return;
      setLicense((prev) => ({ ...prev, ...next }));
    };

    const getWPGlobal = () => {
      let wpGlobal: any = null;
      try { wpGlobal = (window as any).wpPDFGallery || null; } catch {}
      if (!wpGlobal) {
        try { wpGlobal = (window.parent && (window.parent as any).wpPDFGallery) || null; } catch {}
      }
      return wpGlobal;
    };

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
            commit({ ...lic, checked: true });
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

    // 2) Wait briefly for global to become available to avoid flicker
    let attempts = 0;
    const interval = window.setInterval(() => {
      attempts += 1;
      if (resolveFromGlobal()) {
        clearInterval(interval);
      } else if (attempts >= 10) {
        clearInterval(interval);
        doRemoteCheck();
      }
    }, 100);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return license;
};