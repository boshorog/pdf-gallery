/**
 * ============================================================================
 * DEMO MODE CONFIGURATION
 * ============================================================================
 * 
 * Controls the "Demo Mode" feature used on the website for potential customers
 * to try the plugin's backend without affecting real data.
 * 
 * BEHAVIOR:
 * - Forces Free version (no Pro features)
 * - Hides UpdateNotice and EngagementNotice
 * - Resets to default gallery on every page load (sessionStorage only)
 * - Uploads are client-side only (blob URLs, never sent to server)
 * - All changes are temporary (lost on page close)
 * 
 * ACTIVATION:
 * - Via [kindpdfg_demo] shortcode in WordPress
 * - Via ?demo=true URL parameter (for dev testing)
 * - Via window.kindpdfgData.isDemo = true (set by PHP)
 * 
 * @module demoMode
 * ============================================================================
 */

import { getWPGlobal } from './pluginIdentity';

/**
 * Check if the app is running in Demo Mode
 */
export const isDemoMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Check WP global (set by PHP shortcode)
  const wp = getWPGlobal();
  if (wp?.isDemo === true || wp?.isDemo === 'true' || wp?.isDemo === '1') {
    return true;
  }
  
  // Check URL parameter (for dev testing)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('demo') === 'true') {
    return true;
  }
  
  return false;
};

/**
 * Session-scoped storage key prefix for demo mode
 * Uses sessionStorage so data is lost when tab/window closes
 */
const DEMO_SESSION_KEY = 'kindpdfg_demo_session';

/**
 * Save demo gallery state to sessionStorage
 */
export const saveDemoState = (galleries: any[]): void => {
  try {
    sessionStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(galleries));
  } catch {}
};

/**
 * Load demo gallery state from sessionStorage
 * Returns null if no state exists (triggers fresh default gallery)
 */
export const loadDemoState = (): any[] | null => {
  try {
    const raw = sessionStorage.getItem(DEMO_SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return null;
};

/**
 * Clear demo session data
 */
export const clearDemoState = (): void => {
  try {
    sessionStorage.removeItem(DEMO_SESSION_KEY);
  } catch {}
};
