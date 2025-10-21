import { useState, useEffect } from 'react';


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
    let wpGlobal: any = null;
    try { wpGlobal = (window as any).wpPDFGallery || null; } catch {}
    if (!wpGlobal) {
      try { wpGlobal = (window.parent && (window.parent as any).wpPDFGallery) || null; } catch {}
    }
    const urlParams = new URLSearchParams(window.location.search);
    const ajaxUrl = wpGlobal?.ajaxUrl || (window as any).ajaxurl || urlParams.get('ajax') || urlParams.get('ajaxurl') || urlParams.get('ajax_url') || '';
    const nonce = wpGlobal?.nonce || urlParams.get('nonce') || '';
    // 1) Server-evaluated Pro state from localized data (most reliable)
    // Accept booleans, numeric strings, or truthy values provided by WordPress localization
    const status = String(wpGlobal?.fsStatus ?? '').toLowerCase();
    const fsIsPro = !!(wpGlobal && (wpGlobal.fsIsPro === true || wpGlobal.fsIsPro === 'true' || wpGlobal.fsIsPro === '1' || wpGlobal.fsIsPro === 1));
    const proFlag = fsIsPro || (!!status && status !== 'free');
    if (proFlag) {
      setLicense({ isValid: true, isPro: true, status: (status || 'pro') as any });
      // Skip remote check for speed; page will refresh after any license changes
      return;
    }
    // If not pro, continue to remote check below

    // 2) Check license from WordPress backend (Freemius)
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
            // Keep hidden until explicit free is confirmed
            // No state change to avoid flashing banner for Pro users
          }
        })
        .catch(() => {
          // Network error - keep hidden until status is known
        });
      } else {
        // Missing AJAX context - keep hidden until status is known
      }
  }, []);

  return license;
};