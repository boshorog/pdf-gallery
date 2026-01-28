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
import { useLicense } from '@/hooks/useLicense';
import { STORAGE_KEYS, PLUGIN_SLUG } from '@/config/pluginIdentity';

interface UpdateNoticeProps {
  currentVersion: string;
}

// WordPress.org plugin info API URL - update this for your plugin
const WP_API_URL = `https://api.wordpress.org/plugins/info/1.0/${PLUGIN_SLUG}.json`;

export const UpdateNotice = ({ currentVersion }: UpdateNoticeProps) => {
  const license = useLicense();
  const [latestVersion, setLatestVersion] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(true);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
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

  const handleUpdate = () => {
    // Start updating animation
    setUpdating(true);
    
    // Check if we have WordPress globals
    let wpGlobal: any = null;
    try { wpGlobal = (window as any).kindpdfgData || (window as any).wpPDFGallery || null; } catch {}
    if (!wpGlobal) {
      try { wpGlobal = (window.parent && ((window.parent as any).kindpdfgData || (window.parent as any).wpPDFGallery)) || null; } catch {}
    }
    
    // Pro users: go to plugins page (Freemius handles updates there)
    if (license.isPro) {
      const pluginsUrl = window.location.origin + '/wp-admin/plugins.php#kindpixels-pdf-gallery';
      window.location.href = pluginsUrl;
      return;
    }
    
    // Free users: Use WordPress AJAX update if available
    const wpUpdates = (window as any).wp?.updates;
    if (wpUpdates && typeof wpUpdates.updatePlugin === 'function') {
      // Use WordPress's built-in AJAX update mechanism
      wpUpdates.updatePlugin({
        plugin: wpGlobal?.pluginBasename || 'kindpixels-pdf-gallery/kindpixels-pdf-gallery.php',
        slug: PLUGIN_SLUG,
        success: () => {
          setUpdating(false);
          setDismissed(true);
          // Show success and reload after brief delay
          setTimeout(() => window.location.reload(), 1000);
        },
        error: (response: any) => {
          setUpdating(false);
          console.error('Update failed:', response);
          // Fallback to plugins page
          window.location.href = window.location.origin + '/wp-admin/plugins.php';
        }
      });
      return;
    }
    
    // Fallback: Use direct update URL if available, otherwise go to plugins page
    if (wpGlobal?.updateUrl) {
      window.location.href = wpGlobal.updateUrl;
    } else {
      window.location.href = window.location.origin + '/wp-admin/plugins.php';
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
          <strong>New version ({latestVersion})</strong> is available. Update now for new features and bug fixes.
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
