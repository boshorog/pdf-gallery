import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, X } from 'lucide-react';
import { useLicense } from '@/hooks/useLicense';

interface UpdateNoticeProps {
  currentVersion: string;
}

const DISMISS_KEY = 'kindpdfg_update_dismissed';
const WP_API_URL = 'https://api.wordpress.org/plugins/info/1.0/kindpixels-pdf-gallery.json';

export const UpdateNotice = ({ currentVersion }: UpdateNoticeProps) => {
  const license = useLicense();
  const [latestVersion, setLatestVersion] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(true);
  const [loading, setLoading] = useState(true);

  // Pro users get updates via Freemius SDK - don't show this notice
  if (license.isPro) return null;

  useEffect(() => {
    // Check if this version was already dismissed
    try {
      const dismissedVersion = localStorage.getItem(DISMISS_KEY);
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
            const dismissedVersion = localStorage.getItem(DISMISS_KEY);
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
  }, []);

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
        localStorage.setItem(DISMISS_KEY, latestVersion);
      }
    } catch {}
  };

  const handleUpdate = () => {
    // Navigate to WordPress plugins page
    const pluginsUrl = window.location.origin + '/wp-admin/plugins.php';
    window.location.href = pluginsUrl;
  };

  // Don't show if loading, dismissed, no latest version, or current is up-to-date
  if (loading || dismissed || !latestVersion) return null;
  if (compareVersions(currentVersion, latestVersion) >= 0) return null;

  return (
    <div className="mb-4 flex items-center justify-between gap-4 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm dark:border-green-800 dark:bg-green-950">
      <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
        <RefreshCw className="h-4 w-4" />
        <span>
          <strong>New version ({latestVersion})</strong> is available. Update now for new features and bug fixes.
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="default"
          className="h-7 bg-green-600 hover:bg-green-700 text-white"
          onClick={handleUpdate}
        >
          Update
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0 text-green-700 hover:bg-green-100 dark:text-green-300 dark:hover:bg-green-900"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
