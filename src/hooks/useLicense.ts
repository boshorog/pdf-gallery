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
    // Check license from WordPress backend
    const wp = (window as any).wpPDFGallery;
    const urlParams = new URLSearchParams(window.location.search);
    const ajaxUrl = wp?.ajaxUrl || urlParams.get('ajax');
    const nonce = wp?.nonce || urlParams.get('nonce') || '';

    if (ajaxUrl && nonce) {
      const form = new FormData();
      form.append('action', 'pdf_gallery_action');
      form.append('action_type', 'check_license');
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