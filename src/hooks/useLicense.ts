/**
 * ============================================================================
 * LICENSE MANAGEMENT HOOK
 * ============================================================================
 * 
 * This hook manages Freemius license validation and Pro feature access.
 * 
 * ARCHITECTURE:
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  1. Check dev mode (localStorage override for testing)                  │
 * │  2. Poll Freemius globals (window.kindpdfgData.fsIsPro)                │
 * │  3. Fallback to AJAX check if globals not available                     │
 * │  4. Handle license activation redirect flow                             │
 * │  5. Re-check on window focus (cross-tab activation)                     │
 * └─────────────────────────────────────────────────────────────────────────┘
 * 
 * USAGE:
 * ```typescript
 * const license = useLicense();
 * if (license.isPro) {
 *   // Show pro feature
 * }
 * ```
 * 
 * REUSE NOTES:
 * - Copy this file when forking
 * - Update imports to use your pluginIdentity config
 * - The hook is framework-agnostic (works with any Freemius setup)
 * 
 * @module useLicense
 * @see MODULE_ARCHITECTURE.md for dependency details
 * ============================================================================
 */

import { useState, useEffect } from 'react';
import { 
  STORAGE_KEYS, 
  AJAX_FREEMIUS_CHECK, 
  getWPGlobal, 
  isDevPreview 
} from '@/config/pluginIdentity';

export interface LicenseInfo {
  isValid: boolean;
  isPro: boolean;
  status: 'free' | 'pro' | 'expired' | 'invalid';
  expiryDate?: string;
  checked: boolean; // true when status has been conclusively determined
  isDevMode?: boolean; // true when using dev mode selector
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
    let finished = false;
    let intervalId: number | null = null;
    const startedAt = Date.now();

    // In dev preview, use dev mode selector
    if (isDevPreview()) {
      try {
        const devMode = localStorage.getItem(STORAGE_KEYS.devLicenseMode) === 'pro';
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

      // During license-change flows, "free" can be stale for a few seconds. However,
      // if the user *actually* activated Free, we still want to converge and stop.
      const elapsedMs = Date.now() - startedAt;

      const shouldFinish = (() => {
        if (next.isPro === true) return true;
        if (next.checked !== true) return false;

        // Outside redirect flows, any checked state is final.
        if (!hasLicenseChangeParam) return true;

        // Inside redirect flows: finish only on Pro, or on Free after a short grace period.
        if (nextStatus === 'pro') return true;
        if (nextStatus === 'free' && elapsedMs > 8000) return true;
        return false;
      })();

      if (shouldFinish) {
        finished = true;
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      }
      setLicense((prev) => ({ ...prev, ...next }));
    };

    // Note: We use the imported getWPGlobal from pluginIdentity, but rename it locally
    // to avoid confusion with the import. The hook needs a local reference for closure.
    const getWPGlobalLocal = getWPGlobal;

    // Check for license activation URL params and trigger refresh if needed
    const urlParams = new URLSearchParams(window.location.search);
    const licenseActivated = urlParams.get('license_activated');
    const licenseUpdated = urlParams.get('license_updated');
    
    const hasLicenseChangeParam = licenseActivated === '1' || !!licenseUpdated;

    // Force a one-time reload after returning from Freemius so the page
    // re-evaluates localized WP globals and fetches freshly cache-busted assets.
    if (hasLicenseChangeParam) {
      try {
        const reloadTs = sessionStorage.getItem(STORAGE_KEYS.postLicenseReload);
        const now = Date.now();
        // Only skip reload if we already reloaded within the last 10 seconds
        const alreadyReloaded = reloadTs && (now - parseInt(reloadTs, 10)) < 10000;
        if (!alreadyReloaded) {
          sessionStorage.setItem(STORAGE_KEYS.postLicenseReload, String(now));
          // Use a small delay to ensure the page has fully loaded before reloading
          setTimeout(() => {
            const nextUrl = new URL(window.location.href);
            nextUrl.searchParams.set('kindpdfg_reload', String(now));
            // Force a hard reload to bypass any caching
            window.location.href = nextUrl.toString();
          }, 100);
          return;
        }
      } catch {
        // If sessionStorage is unavailable, proceed without forced reload.
      }
    }

    if (hasLicenseChangeParam) {
      // Clear localStorage suppression to ensure Pro features show
      try { localStorage.removeItem(STORAGE_KEYS.proWelcomeDismissed); } catch {}
    }

    const resolveFromGlobal = () => {
      const wpGlobal = getWPGlobal();
      const status = String(wpGlobal?.fsStatus ?? '').toLowerCase();
      // CRITICAL: Only trust fsIsPro from PHP - it uses can_use_premium_code() which is the
      // authoritative source. DO NOT infer Pro status from fsStatus strings, as Freemius can
      // return various statuses (e.g., when clicking "Activate Free Version") that are NOT Pro.
      const fsIsPro = !!(wpGlobal && (wpGlobal.fsIsPro === true || wpGlobal.fsIsPro === 'true' || wpGlobal.fsIsPro === '1' || wpGlobal.fsIsPro === 1));

      if (fsIsPro) {
        commit({ isValid: true, isPro: true, status: (status || 'pro') as any, checked: true });
        return true;
      }
      // If fsIsPro is explicitly false and we have a global, mark as free (checked)
      if (wpGlobal && wpGlobal.fsIsPro === false) {
        commit({ isValid: true, isPro: false, status: 'free', checked: true });
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
      form.append('action', AJAX_FREEMIUS_CHECK);
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

            // CRITICAL: Only trust explicit isPro boolean from server response.
            // DO NOT infer Pro from status strings to prevent unauthorized access.
            const remoteStatus = String(lic.status ?? '').toLowerCase();
            const remoteIsPro = lic.isPro === true;

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
    // After activation, Freemius globals can take longer to reflect the new plan.
    const maxAttempts = hasLicenseChangeParam ? 300 : 20; // 30s vs 2s
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
      if (attempts === 10) doRemoteCheck();
      if (hasLicenseChangeParam && [30, 60, 120, 180, 240].includes(attempts)) doRemoteCheck();

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