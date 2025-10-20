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
    const ajaxUrl = wp?.ajaxUrl || urlParams.get('ajax');
    const nonce = wp?.nonce || urlParams.get('nonce') || '';

    // 1) Immediate server-evaluated Pro state from localized data (most reliable)
    if (wp && typeof wp.fsIsPro === 'boolean') {
      if (wp.fsIsPro) {
        setLicense({ isValid: true, isPro: true, status: (wp.fsStatus as any) || 'pro' });
        // We can skip remote check for speed; the page will refresh after any license changes
        return;
      }
      // If not pro, continue to remote check below
    }

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