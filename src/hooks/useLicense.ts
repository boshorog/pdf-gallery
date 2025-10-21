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
    const wp = (window as any).wpPDFGallery;
    const urlParams = new URLSearchParams(window.location.search);
    const ajaxUrl = wp?.ajaxUrl || (window as any).ajaxurl || urlParams.get('ajax') || urlParams.get('ajaxurl') || urlParams.get('ajax_url') || '';
    const nonce = wp?.nonce || urlParams.get('nonce') || '';

    // 1) Server-evaluated Pro state from localized data (most reliable)
    // Accept booleans, numeric strings, or truthy values provided by WordPress localization
    const fsIsPro = !!(wp && (wp.fsIsPro === true || wp.fsIsPro === 'true' || wp.fsIsPro === '1' || wp.fsIsPro === 1));
    if (fsIsPro) {
      setLicense({ isValid: true, isPro: true, status: (wp?.fsStatus as any) || 'pro' });
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
            // Default to free version
            setLicense({ isValid: true, isPro: false, status: 'free' });
          }
        })
        .catch(() => {
          // Fallback to free version
          setLicense({ isValid: true, isPro: false, status: 'free' });
        });
    } else {
      // Development mode - default to free
      setLicense({ isValid: true, isPro: false, status: 'free' });
    }
  }, []);

  return license;
};