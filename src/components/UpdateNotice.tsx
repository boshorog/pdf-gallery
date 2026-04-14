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
import { STORAGE_KEYS, PLUGIN_SLUG, isDevPreview } from '@/config/pluginIdentity';
import { isDemoMode } from '@/config/demoMode';

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

  // Redirect to plugins page, scrolling to and highlighting our plugin row
  const redirectToPluginsPage = () => {
    const pluginsUrl = window.location.origin + '/wp-admin/plugins.php';
    const pluginSlug = PLUGIN_SLUG;
    
    // Use top-level window for navigation (we're in an iframe)
    const targetWindow = window.top || window.parent || window;
    
    // Navigate to plugins page, then highlight the plugin row
    targetWindow.location.href = pluginsUrl + '#' + pluginSlug;
    
    // After navigation, inject a highlight script via postMessage
    try {
      const highlightScript = `
        (function() {
          var row = document.querySelector('tr[data-slug="${pluginSlug}"]') || document.querySelector('tr[data-plugin*="${pluginSlug}"]');
          if (row) {
            row.scrollIntoView({ behavior: 'smooth', block: 'center' });
            row.style.transition = 'background-color 0.3s ease';
            row.style.backgroundColor = '#fff3cd';
            setTimeout(function() { row.style.backgroundColor = ''; }, 3000);
          }
        })();
      `;
      // Slight delay so the page loads first
      setTimeout(() => {
        try {
          const script = targetWindow.document.createElement('script');
          script.textContent = highlightScript;
          targetWindow.document.body.appendChild(script);
        } catch {}
      }, 1500);
    } catch {}
  };

  const handleUpdate = () => {
    // In dev preview, show alert instead of attempting WordPress update
    if (isDevPreview()) {
      alert('Update is only available in WordPress. This is a dev preview.');
      return;
    }
    
    // Start updating animation
    setUpdating(true);
    
    // Check if we have WordPress globals (check parent window too since we're in iframe)
    let wpGlobal: any = null;
    try { wpGlobal = (window as any).kindpdfgData || (window as any).wpPDFGallery || null; } catch {}
    if (!wpGlobal) {
      try { wpGlobal = (window.parent && ((window.parent as any).kindpdfgData || (window.parent as any).wpPDFGallery)) || null; } catch {}
    }
    
    // Pro users: go to plugins page (Freemius handles updates there)
    if (license.isPro) {
      redirectToPluginsPage();
      return;
    }
    
    // Try to find wp.updates — check current window, parent, and top (iframe context)
    let wpUpdates: any = null;
    try { wpUpdates = (window as any).wp?.updates; } catch {}
    if (!wpUpdates) {
      try { wpUpdates = (window.parent as any)?.wp?.updates; } catch {}
    }
    if (!wpUpdates) {
      try { wpUpdates = (window.top as any)?.wp?.updates; } catch {}
    }
    
    if (wpUpdates && typeof wpUpdates.updatePlugin === 'function') {
      // Safety timeout: if nothing happens in 12s, redirect to plugins page
      const fallbackTimeout = setTimeout(() => {
        setUpdating(false);
        redirectToPluginsPage();
      }, 12000);
      
      wpUpdates.updatePlugin({
        plugin: wpGlobal?.pluginBasename || 'kindpixels-pdf-gallery/kindpixels-pdf-gallery.php',
        slug: PLUGIN_SLUG,
        success: () => {
          clearTimeout(fallbackTimeout);
          setUpdating(false);
          setDismissed(true);
          setTimeout(() => {
            // Reload the top-level page to reflect the update
            try { (window.top || window.parent || window).location.reload(); } catch { window.location.reload(); }
          }, 1000);
        },
        error: (response: any) => {
          clearTimeout(fallbackTimeout);
          setUpdating(false);
          console.error('Update failed:', response);
          redirectToPluginsPage();
        }
      });
      return;
    }
    
    // Fallback: redirect to plugins page with highlight
    if (wpGlobal?.updateUrl) {
      (window.top || window.parent || window).location.href = wpGlobal.updateUrl;
    } else {
      redirectToPluginsPage();
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
