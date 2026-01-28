/**
 * ============================================================================
 * WORDPRESS API BRIDGE
 * ============================================================================
 * 
 * Utility functions for AJAX communication with WordPress backend.
 * Uses wp_localize_script data injected as window.kindpdfgData.
 * 
 * PATTERN:
 * 1. Get WP context using getWPGlobal()
 * 2. Create FormData with action, action_type, and nonce
 * 3. POST to ajaxUrl
 * 4. Parse JSON response
 * 
 * REUSE NOTES:
 * - Import getWPGlobal and AJAX_ACTION from pluginIdentity
 * - Update interface types for your data structures
 * 
 * @module wpApi
 * @see MODULE_ARCHITECTURE.md for usage patterns
 * ============================================================================
 */

import { getWPGlobal, AJAX_ACTION } from '@/config/pluginIdentity';

export interface WPNewsletter {
  id: string;
  title: string;
  date: string;
  pdfUrl: string;
  thumbnail: string;
}

export const fetchNewsletters = async (): Promise<WPNewsletter[] | null> => {
  const wp = getWPGlobal();
  if (!wp?.ajaxUrl || !wp?.nonce) return null;

  const form = new FormData();
  form.append('action', AJAX_ACTION);
  form.append('action_type', 'get_newsletters');
  form.append('nonce', wp.nonce);

  const res = await fetch(wp.ajaxUrl, { method: 'POST', credentials: 'same-origin', body: form });
  const json = await res.json();
  if (json?.success && Array.isArray(json?.data?.newsletters)) {
    return json.data.newsletters as WPNewsletter[];
  }
  return [];
};

export const saveNewsletters = async (newsletters: WPNewsletter[]): Promise<boolean> => {
  const wp = getWPGlobal();
  if (!wp?.ajaxUrl || !wp?.nonce) return false;

  const form = new FormData();
  form.append('action', AJAX_ACTION);
  form.append('action_type', 'save_newsletters');
  form.append('nonce', wp.nonce);
  form.append('newsletters', JSON.stringify(newsletters));

  const res = await fetch(wp.ajaxUrl, { method: 'POST', credentials: 'same-origin', body: form });
  const json = await res.json();
  return !!json?.success;
};
