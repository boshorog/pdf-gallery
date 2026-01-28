/**
 * ============================================================================
 * BUILD FLAGS MODULE
 * ============================================================================
 * 
 * This module controls feature gating for Free/Pro build variants.
 * 
 * ARCHITECTURE:
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  COMPILE TIME              RUNTIME                    RESULT           │
 * │  ─────────────            ─────────                  ──────            │
 * │  VITE_BUILD_VARIANT  +    useLicense()          =    Feature Access    │
 * │  (free/pro)               (Freemius validation)      (UI + Logic)      │
 * └─────────────────────────────────────────────────────────────────────────┘
 * 
 * BUILD COMMANDS:
 * - npm run build:free  → For WordPress.org (limited features)
 * - npm run build:pro   → For paying customers (all features)
 * 
 * SECURITY MODEL:
 * 1. Free build: Pro code is physically excluded at compile time
 * 2. Pro build: Features require valid Freemius license at runtime
 * 
 * DEV MODE:
 * In development, features can be toggled via DevLicenseSelector component
 * which stores 'kindpdfg_dev_license_mode' in localStorage.
 * 
 * REUSE NOTES:
 * - Copy this file when forking
 * - Update DEV_LICENSE_KEY to match your plugin prefix
 * - Customize BUILD_FLAGS for your feature set
 * 
 * @module buildFlags
 * @see TEMPLATE_GUIDE.md for forking instructions
 * @see MODULE_ARCHITECTURE.md for dependency details
 * ============================================================================
 */

import { STORAGE_KEYS, isDevPreview } from './pluginIdentity';

export type BuildVariant = 'free' | 'pro';

/**
 * Get dev mode Pro status from localStorage
 * Only works in development preview environments
 */
const getDevModePro = (): boolean => {
  if (!isDevPreview()) return false;
  try {
    return localStorage.getItem(STORAGE_KEYS.devLicenseMode) === 'pro';
  } catch {
    return false;
  }
};

/**
 * Build variant determined at compile time
 * Set via VITE_BUILD_VARIANT environment variable
 * Defaults to 'free' if not specified
 */
export const BUILD_VARIANT: BuildVariant = 
  (import.meta.env.VITE_BUILD_VARIANT as BuildVariant) || 'free';

// In dev mode, allow runtime override of build flags for testing
const isDevPro = getDevModePro();

/**
 * Feature flags based on build variant
 * 
 * CUSTOMIZATION: Add your feature flags here when forking.
 * Each flag should check both BUILD_VARIANT and isDevPro for dev testing.
 */
export const BUILD_FLAGS = {
  /**
   * Multi-gallery management UI (Add Gallery button, gallery selector)
   * - Free: false → Single gallery only
   * - Pro: true → Unlimited galleries
   */
  MULTI_GALLERY_UI: BUILD_VARIANT === 'pro' || isDevPro,

  /**
   * Bulk upload UI (drag & drop multiple files)
   * - Free: false → One file at a time, no drag-drop
   * - Pro: true → Select multiple files, drag-drop enabled
   */
  BULK_UPLOAD_UI: BUILD_VARIANT === 'pro' || isDevPro,

  /**
   * File limit per gallery
   * - Both: Unlimited (originally limited in Free, now removed)
   */
  FILE_LIMIT: Infinity,

  /**
   * Analytics features (view/click tracking)
   * - Free: false → No analytics
   * - Pro: true → Full analytics dashboard
   */
  ANALYTICS: BUILD_VARIANT === 'pro' || isDevPro,
} as const;

/**
 * Helper: Check if running pro build
 * Use this for simple checks, BUILD_FLAGS for feature-specific checks
 */
export const isProBuild = () => BUILD_VARIANT === 'pro' || isDevPro;

/**
 * Helper: Check if running free build
 */
export const isFreeBuild = () => BUILD_VARIANT === 'free' && !isDevPro;
