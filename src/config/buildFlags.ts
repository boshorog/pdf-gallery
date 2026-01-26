/**
 * Build Flags Configuration
 * 
 * This file controls feature availability based on whether this is
 * the Free version or the Pro addon.
 * 
 * Build Strategy:
 * - Free version: VITE_BUILD_VARIANT=free (default)
 * - Pro addon: VITE_BUILD_VARIANT=pro
 * 
 * The free version checks license.isPro for runtime features,
 * but certain UI elements (like "Add Gallery" button) are completely
 * hidden at build time in the free version.
 */

export type BuildVariant = 'free' | 'pro';

// Determine build variant from environment variable
// Default to 'free' if not specified
export const BUILD_VARIANT: BuildVariant = 
  (import.meta.env.VITE_BUILD_VARIANT as BuildVariant) || 'free';

// Feature flags based on build variant
export const BUILD_FLAGS = {
  /**
   * Whether the build includes multi-gallery management UI
   * - Free: false (single gallery only, no "Add Gallery" button)
   * - Pro: true (full gallery management)
   */
  MULTI_GALLERY_UI: BUILD_VARIANT === 'pro',

  /**
   * Whether bulk upload UI is shown
   * - Free: false (single file upload only)
   * - Pro: true (multi-file selection enabled)
   */
  BULK_UPLOAD_UI: BUILD_VARIANT === 'pro',

  /**
   * Whether analytics features are available
   * - Free: false
   * - Pro: true (to be implemented)
   */
  ANALYTICS: BUILD_VARIANT === 'pro',
} as const;

// Helper to check if running pro build
export const isProBuild = () => BUILD_VARIANT === 'pro';

// Helper to check if running free build
export const isFreeBuild = () => BUILD_VARIANT === 'free';
