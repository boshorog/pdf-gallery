/**
 * ============================================================================
 * UPDATE NOTICE COMPONENT
 * ============================================================================
 * 
 * Displays a notification when a new plugin version is available on WordPress.org.
 * 
 * FEATURES:
 * - Fetches latest version from WordPress.org API
 * - Compares with current version
 * - Dismissible per version
 * - Hidden for Pro users (Freemius handles updates)
 * 
 * REUSE NOTES:
 * - Update WP_API_URL to point to your plugin's WordPress.org JSON
 * - Uses STORAGE_KEYS from pluginIdentity for localStorage
 * 
 * @module UpdateNotice
 * ============================================================================
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Loader2 } from 'lucide-react';
import { STORAGE_KEYS, PLUGIN_SLUG, AJAX_ACTION, getWPGlobal, isDevPreview } from '@/config/pluginIdentity';
import { isDemoMode } from '@/config/demoMode';

interface UpdateNoticeProps {
  currentVersion: string;
}

// WordPress.org plugin info API URL - update this for your plugin
const WP_API_URL = `https://api.wordpress.org/plugins/info/1.0/${PLUGIN_SLUG}.json`;

export const UpdateNotice = ({ currentVersion }: UpdateNoticeProps) => {
  const [latestVersion, setLatestVersion] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(true);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);

  useEffect(() => {
    // Never show in demo mode
    if (isDemoMode()) return;
    // Check if this version was already dismissed
    try {
      const dismissedVersion = localStorage.getItem(STORAGE_KEYS.updateDismissed);
      if (dismissedVersion && dismissedVersion === latestVersion) {
        setDismissed(true);
        return;
      }
    } catch {}

    // Fetch latest version from WordPress.org API
    fetch(WP_API_URL)
      .then(res => res.json())
      .then(data => {
        if (data?.version) {
          setLatestVersion(data.version);
          // Check if dismissed for this specific version
          try {
            const dismissedVersion = localStorage.getItem(STORAGE_KEYS.updateDismissed);
            setDismissed(dismissedVersion === data.version);
          } catch {
            setDismissed(false);
          }
        }
      })
      .catch(() => {
        // Silently fail - no update notice if API unavailable
      })
      .finally(() => setLoading(false));
  }, [latestVersion]);

  const compareVersions = (v1: string, v2: string): number => {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const p1 = parts1[i] || 0;
      const p2 = parts2[i] || 0;
      if (p1 < p2) return -1;
      if (p1 > p2) return 1;
    }
    return 0;
  };

  const handleDismiss = () => {
    setDismissed(true);
    try {
      if (latestVersion) {
        localStorage.setItem(STORAGE_KEYS.updateDismissed, latestVersion);
      }
    } catch {}
  };

  const navigateTop = (url: string) => {
    try {
      (window.top || window.parent || window).location.href = url;
    } catch {
      window.location.href = url;
    }
  };

  // Fallback: WordPress Updates page
  const redirectToUpdatePage = () => {
    navigateTop(window.location.origin + '/wp-admin/update-core.php');
  };

  const handleUpdate = async () => {
    if (isDevPreview()) {
      alert('Update is only available in WordPress. This is a dev preview.');
      return;
    }

    const wp = getWPGlobal();

    // 1) WordPress already knows about the update: run the upgrade immediately.
    if (wp?.updateUrl) {
      setUpdating(true);
      navigateTop(wp.updateUrl);
      return;
    }

    // 2) WordPress hasn't refreshed its update list yet (it only checks every
    //    12h). Force a fresh check, then go straight to the upgrade.
    if (!wp?.ajaxUrl || !wp?.nonce) {
      redirectToUpdatePage();
      return;
    }

    setUpdating(true);
    setPendingMessage(null);
    try {
      const form = new FormData();
      form.append('action', AJAX_ACTION);
      form.append('action_type', 'prepare_update');
      form.append('nonce', wp.nonce);
      const res = await fetch(wp.ajaxUrl, { method: 'POST', credentials: 'same-origin', body: form });
      const json = await res.json();
      const data = json?.data || {};

      if (json?.success && data.updateUrl) {
        navigateTop(data.updateUrl);
        return;
      }

      if (json?.success) {
        // WordPress.org's update service hasn't distributed the new version yet.
        setUpdating(false);
        setPendingMessage(
          `WordPress.org is still rolling out version ${latestVersion}. This usually takes a few hours after release — please try again later.`
        );
        return;
      }

      setUpdating(false);
      redirectToUpdatePage();
    } catch {
      setUpdating(false);
      redirectToUpdatePage();
    }
  };

  // Don't show if loading, dismissed, no latest version, or current is up-to-date
  if (loading || dismissed || !latestVersion) return null;
  if (compareVersions(currentVersion, latestVersion) >= 0) return null;

  return (
    <div className="mb-4 flex items-center justify-between gap-4 rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/50 px-4 py-2.5 text-sm">
      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
        <span className="text-base">🎉</span>
        <span>
          {pendingMessage ? (
            pendingMessage
          ) : (
            <>
              <strong>New version ({latestVersion})</strong> is available. Update now for new features and bug fixes.
            </>
          )}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          className="h-7 bg-slate-700 hover:bg-slate-800 text-white dark:bg-slate-600 dark:hover:bg-slate-500 min-w-[70px]"
          onClick={handleUpdate}
          disabled={updating}
        >
          {updating ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Updating...</span>
            </>
          ) : (
            'Update'
          )}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0 text-slate-500 hover:bg-green-100 dark:text-slate-400 dark:hover:bg-green-900"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
