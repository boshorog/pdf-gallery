/**
 * ============================================================================
 * ENGAGEMENT NOTICE COMPONENT
 * ============================================================================
 * 
 * Shows a warm amber notification bar to active free users encouraging them
 * to rate the plugin or send feedback.
 * 
 * DISPLAY CRITERIA (all must be met):
 * 1. days_since_activation >= 14
 * 2. plugin_admin_page_visits >= 3
 * 3. more than 5 files uploaded
 * 
 * DISMISSAL LOGIC:
 * - Re-shows every 30 days (if criteria still met)
 * - Permanently hidden after 5 dismissals or after "Rate Us" click
 * 
 * @module EngagementNotice
 * ============================================================================
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Star, MessageSquare } from 'lucide-react';
import { useLicense } from '@/hooks/useLicense';
import { getStorageKey, isDevPreview } from '@/config/pluginIdentity';

const RATING_URL = 'https://wordpress.org/plugins/kindpixels-pdf-gallery/#reviews';
const FEEDBACK_URL = 'https://wordpress.org/support/plugin/kindpixels-pdf-gallery/';

const STORAGE = {
  activationDate: getStorageKey('engagement_activation'),
  pageVisits: getStorageKey('engagement_visits'),
  dismissCount: getStorageKey('engagement_dismiss_count'),
  lastDismissed: getStorageKey('engagement_last_dismissed'),
  permanentlyHidden: getStorageKey('engagement_hidden'),
};

const DAY_MS = 24 * 60 * 60 * 1000;

interface EngagementNoticeProps {
  /** Current number of files in all galleries */
  totalFiles: number;
}

export const EngagementNotice = ({ totalFiles }: EngagementNoticeProps) => {
  const license = useLicense();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Never show for Pro users
    if (license.isPro) return;

    // Track activation date (first ever load)
    let activationDate: number;
    try {
      const stored = localStorage.getItem(STORAGE.activationDate);
      if (stored) {
        activationDate = parseInt(stored, 10);
      } else {
        activationDate = Date.now();
        localStorage.setItem(STORAGE.activationDate, String(activationDate));
      }
    } catch { return; }

    // Track page visits
    let visits: number;
    try {
      visits = parseInt(localStorage.getItem(STORAGE.pageVisits) || '0', 10) + 1;
      localStorage.setItem(STORAGE.pageVisits, String(visits));
    } catch { return; }

    // Check permanent dismissal
    try {
      if (localStorage.getItem(STORAGE.permanentlyHidden) === '1') return;
    } catch { return; }

    // Check dismiss count (max 5)
    let dismissCount: number;
    try {
      dismissCount = parseInt(localStorage.getItem(STORAGE.dismissCount) || '0', 10);
      if (dismissCount >= 5) return;
    } catch { return; }

    // Check 30-day cooldown since last dismiss
    try {
      const lastDismissed = localStorage.getItem(STORAGE.lastDismissed);
      if (lastDismissed) {
        const elapsed = Date.now() - parseInt(lastDismissed, 10);
        if (elapsed < 30 * DAY_MS) return;
      }
    } catch { return; }

    // --- Criteria checks ---
    const daysSinceActivation = (Date.now() - activationDate) / DAY_MS;

    // In dev preview, relax criteria for testing
    if (isDevPreview()) {
      setVisible(true);
      return;
    }

    if (daysSinceActivation < 14) return;
    if (visits < 3) return;
    if (totalFiles <= 5) return;

    setVisible(true);
  }, [license.isPro, totalFiles]);

  const handleDismiss = () => {
    setVisible(false);
    try {
      const count = parseInt(localStorage.getItem(STORAGE.dismissCount) || '0', 10) + 1;
      localStorage.setItem(STORAGE.dismissCount, String(count));
      localStorage.setItem(STORAGE.lastDismissed, String(Date.now()));
      if (count >= 5) {
        localStorage.setItem(STORAGE.permanentlyHidden, '1');
      }
    } catch {}
  };

  const handleRate = () => {
    // Permanently hide after rating click
    try {
      localStorage.setItem(STORAGE.permanentlyHidden, '1');
    } catch {}
    setVisible(false);
    window.open(RATING_URL, '_blank', 'noopener');
  };

  const handleFeedback = () => {
    // Treat as a dismiss (30-day cooldown)
    handleDismiss();
    window.open(FEEDBACK_URL, '_blank', 'noopener');
  };

  if (!visible) return null;

  return (
    <div className="mb-4 flex items-center justify-between gap-4 rounded-lg border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 dark:border-amber-700/50 px-4 py-2.5 text-sm">
      <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
        <span className="text-base">💛</span>
        <span>
          You've been using <strong>PDF Gallery</strong> for a while now! A quick rating would mean the world to us.
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button
          size="sm"
          className="h-7 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white border-0 gap-1.5"
          onClick={handleRate}
        >
          <Star className="h-3.5 w-3.5" /> Rate Us
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-7 border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 gap-1.5"
          onClick={handleFeedback}
        >
          <MessageSquare className="h-3.5 w-3.5" /> Feedback
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0 text-amber-600 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
