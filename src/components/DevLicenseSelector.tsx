import { useState, useEffect } from 'react';
import { Crown, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type DevLicenseMode = 'free' | 'pro';

const DEV_LICENSE_KEY = 'kindpdfg_dev_license_mode';

/**
 * Development-only license mode selector
 * Allows switching between Free and Pro modes in Lovable preview
 */
export const DevLicenseSelector = () => {
  const [mode, setMode] = useState<DevLicenseMode>(() => {
    try {
      const stored = localStorage.getItem(DEV_LICENSE_KEY);
      return stored === 'pro' ? 'pro' : 'free';
    } catch {
      return 'free';
    }
  });

  const handleChange = (newMode: DevLicenseMode) => {
    setMode(newMode);
    try {
      localStorage.setItem(DEV_LICENSE_KEY, newMode);
      // Reload to apply the new mode
      window.location.reload();
    } catch {}
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-card border border-border rounded-lg shadow-lg px-3 py-2">
      <span className="text-xs text-muted-foreground font-medium">Dev Mode:</span>
      <Select value={mode} onValueChange={(v) => handleChange(v as DevLicenseMode)}>
        <SelectTrigger className="w-24 h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="free">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              Free
            </div>
          </SelectItem>
          <SelectItem value="pro">
            <div className="flex items-center gap-1">
              <Crown className="h-3 w-3 text-amber-500" />
              Pro
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

/**
 * Hook to get the dev license mode
 * Returns { isPro: boolean, isDevMode: true }
 */
export const useDevLicense = () => {
  const [isPro, setIsPro] = useState<boolean>(() => {
    try {
      return localStorage.getItem(DEV_LICENSE_KEY) === 'pro';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const checkMode = () => {
      try {
        setIsPro(localStorage.getItem(DEV_LICENSE_KEY) === 'pro');
      } catch {}
    };

    // Check on storage changes (cross-tab)
    window.addEventListener('storage', checkMode);
    return () => window.removeEventListener('storage', checkMode);
  }, []);

  return {
    isPro,
    isDevMode: true,
  };
};
