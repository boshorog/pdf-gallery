/**
 * Build Flags Configuration
 * 
 * Single-Plugin Architecture:
 * - One codebase generates both Free and Pro versions
 * - Build variant is set at compile time via VITE_BUILD_VARIANT
 * 
 * Build Commands:
 * - npm run build:free  → For WordPress.org (limited features)
 * - npm run build:pro   → For paying customers (all features)
 * 
 * Distribution:
 * - Free ZIP: Uploaded to WordPress.org
 * - Pro ZIP: Sold via Freemius/your site (replaces Free when installed)
 * 
 * The Pro build creates a marker file (dist/.pro-build) that the PHP
 * uses to configure Freemius with is_premium=true.
 */

export type BuildVariant = 'free' | 'pro';

const DEV_LICENSE_KEY = 'kindpdfg_dev_license_mode';

// Check if running in Lovable preview (dev mode)
const isLovablePreview = () => {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  return hostname.includes('lovable.app') || hostname.includes('lovableproject.com') || hostname === 'localhost';
};

// Get dev mode Pro status from localStorage
const getDevModePro = (): boolean => {
  if (!isLovablePreview()) return false;
  try {
    return localStorage.getItem(DEV_LICENSE_KEY) === 'pro';
  } catch {
    return false;
  }
};

// Determine build variant from environment variable
// Default to 'free' if not specified
export const BUILD_VARIANT: BuildVariant = 
  (import.meta.env.VITE_BUILD_VARIANT as BuildVariant) || 'free';

// In dev mode, allow runtime override of build flags
const isDevPro = getDevModePro();

// Feature flags based on build variant (or dev mode override)
export const BUILD_FLAGS = {
  /**
   * Multi-gallery management UI (Add Gallery button, gallery selector)
   * - Free: false → Single gallery only
   * - Pro: true → Unlimited galleries
   */
  MULTI_GALLERY_UI: BUILD_VARIANT === 'pro' || isDevPro,

  /**
   * Bulk upload UI (drag & drop multiple files)
   * - Free: false → One file at a time
   * - Pro: true → Select multiple files
   */
  BULK_UPLOAD_UI: BUILD_VARIANT === 'pro' || isDevPro,

  /**
   * File limit per gallery
   * - Free: Unlimited (was 15, now unlimited)
   * - Pro: Unlimited
   */
  FILE_LIMIT: Infinity,

  /**
   * Analytics features (future)
   * - Free: false
   * - Pro: true
   */
  ANALYTICS: BUILD_VARIANT === 'pro' || isDevPro,
} as const;

// Helper to check if running pro build
export const isProBuild = () => BUILD_VARIANT === 'pro' || isDevPro;

// Helper to check if running free build
export const isFreeBuild = () => BUILD_VARIANT === 'free' && !isDevPro;
