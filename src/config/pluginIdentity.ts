/**
 * ============================================================================
 * PLUGIN IDENTITY CONFIGURATION
 * ============================================================================
 * 
 * This is the SINGLE SOURCE OF TRUTH for all plugin branding and identity.
 * When forking this plugin for a new project, update ONLY this file to rebrand.
 * 
 * CUSTOMIZATION CHECKLIST:
 * 1. Update PLUGIN_SLUG (used in WordPress, PHP, and localStorage)
 * 2. Update PLUGIN_NAME and PRO_NAME
 * 3. Update PLUGIN_PREFIX (affects PHP functions, AJAX actions, CSS classes)
 * 4. Update JS_GLOBAL_NAME (window object used by WordPress)
 * 5. Update FREEMIUS_IDS if using Freemius licensing
 * 6. Update BRANDING section (colors, links, credits)
 * 
 * IMPORTANT: After changing this file, also update:
 * - kindpixels-pdf-gallery.php → Search/replace the prefix
 * - readme.txt → Update plugin name and descriptions
 * - vite.config.ts → Update base path if slug changes
 * ============================================================================
 */

// =============================================================================
// CORE IDENTITY
// =============================================================================

/**
 * WordPress plugin slug (folder name, shortcode prefix, option names)
 * Example: 'kindpixels-pdf-gallery' → [kindpdfg_gallery] shortcode
 */
export const PLUGIN_SLUG = 'kindpixels-pdf-gallery';

/**
 * Short prefix for PHP functions, AJAX actions, DB options, CSS classes
 * Should be 6-10 chars, lowercase, no hyphens
 * Example: 'kindpdfg' → kindpdfg_action, kindpdfg_settings
 */
export const PLUGIN_PREFIX = 'kindpdfg';

/**
 * JavaScript global object name (set via wp_localize_script)
 * Example: 'kindpdfgData' → window.kindpdfgData
 */
export const JS_GLOBAL_NAME = 'kindpdfgData';

/**
 * Legacy global name for backwards compatibility
 * Set to null if not needed
 */
export const JS_GLOBAL_LEGACY = 'wpPDFGallery';

// =============================================================================
// DISPLAY NAMES
// =============================================================================

/**
 * Plugin display name in WordPress admin (Free version)
 */
export const PLUGIN_NAME = 'PDF Gallery';

/**
 * Plugin display name for Pro version
 */
export const PRO_NAME = 'PDF Gallery Pro';

/**
 * Plugin version - update this for each release
 * Also update in: kindpixels-pdf-gallery.php, readme.txt
 */
export const PLUGIN_VERSION = '2.4.5';

/**
 * Short description for meta/SEO
 */
export const PLUGIN_DESCRIPTION = 'Beautiful document gallery with lightbox viewer for WordPress';

// =============================================================================
// FREEMIUS LICENSING (Pro features)
// =============================================================================

/**
 * Freemius Plugin ID - get from Freemius dashboard
 * Set to null if not using Freemius
 */
export const FREEMIUS_PLUGIN_ID = '18355';

/**
 * Freemius Public Key - get from Freemius dashboard
 * Set to null if not using Freemius
 */
export const FREEMIUS_PUBLIC_KEY = 'pk_e49d0a3e59cc4e5f5f5d8e4a3c8e2';

// =============================================================================
// BRANDING & LINKS
// =============================================================================

export const BRANDING = {
  /**
   * Company/author name
   */
  author: 'Kind Pixels',
  
  /**
   * Footer credit line
   */
  footerCredit: 'Made in Romania by Kind Pixels',
  
  /**
   * Primary accent color (HSL values for Tailwind)
   */
  accentColor: '207 59% 68%', // #7FB3DC - soft blue
  
  /**
   * Pro/premium accent color (HSL values)
   */
  proAccentColor: '38 92% 50%', // Orange/amber
  
  /**
   * External links
   */
  links: {
    website: 'https://kindpixels.dev',
    support: 'https://kindpixels.dev/support',
    pricing: 'https://kindpixels.dev/plugins/pdf-gallery-pro',
    documentation: 'https://kindpixels.dev/docs/pdf-gallery',
    github: 'https://github.com/boshorog/pdf-gallery',
    wordpressOrg: 'https://wordpress.org/plugins/kindpixels-pdf-gallery',
  },
} as const;

// =============================================================================
// FEATURE CONFIGURATION (Domain-specific)
// =============================================================================

/**
 * Supported file types for this plugin
 * Customize based on plugin purpose (gallery, document manager, etc.)
 */
export const SUPPORTED_FILE_TYPES = {
  documents: ['pdf', 'doc', 'docx', 'odt', 'rtf', 'txt'],
  spreadsheets: ['xls', 'xlsx', 'ods', 'csv'],
  presentations: ['ppt', 'pptx', 'odp'],
  images: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico'],
  audio: ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'],
  video: ['mp4', 'mov', 'webm', 'avi', 'mkv', 'flv', 'wmv', 'm4v'],
  archives: ['zip', 'rar', '7z'],
  ebooks: ['epub', 'mobi'],
} as const;

/**
 * Get all supported extensions as flat array
 */
export const getAllSupportedExtensions = (): string[] => {
  return Object.values(SUPPORTED_FILE_TYPES).flat();
};

// =============================================================================
// LOCALSTORAGE KEYS (Auto-prefixed)
// =============================================================================

/**
 * Get a prefixed localStorage key
 * Usage: getStorageKey('backup') → 'kindpdfg_backup'
 */
export const getStorageKey = (key: string): string => {
  return `${PLUGIN_PREFIX}_${key}`;
};

/**
 * Common localStorage keys used by the plugin
 */
export const STORAGE_KEYS = {
  backup: getStorageKey('backup'),
  galleries: getStorageKey('galleries'),
  settings: getStorageKey('settings'),
  devLicenseMode: getStorageKey('dev_license_mode'),
  updateDismissed: getStorageKey('update_dismissed'),
  proWelcomeDismissed: getStorageKey('pro_welcome_dismissed'),
  postLicenseReload: getStorageKey('post_license_reload'),
} as const;

// =============================================================================
// AJAX ACTIONS (Auto-prefixed)
// =============================================================================

/**
 * Get a prefixed AJAX action name
 * Usage: getAjaxAction('save_galleries') → 'kindpdfg_action'
 */
export const AJAX_ACTION = `${PLUGIN_PREFIX}_action`;

/**
 * Freemius license check action
 */
export const AJAX_FREEMIUS_CHECK = `${PLUGIN_PREFIX}_freemius_check`;

// =============================================================================
// CSS CLASSES (Auto-prefixed)
// =============================================================================

/**
 * Get a prefixed CSS class
 * Usage: getCssClass('admin-page') → 'kindpdfg-admin-page'
 */
export const getCssClass = (className: string): string => {
  return `${PLUGIN_PREFIX}-${className}`;
};

// =============================================================================
// POST MESSAGE TYPES (for iframe communication)
// =============================================================================

/**
 * PostMessage type prefix for iframe height sync
 */
export const POST_MESSAGE_HEIGHT = `${PLUGIN_PREFIX}:height`;

// =============================================================================
// HELPER: Get WordPress global data
// =============================================================================

/**
 * Get the WordPress-injected global data object
 * Checks both current and legacy global names
 */
export const getWPGlobal = (): any => {
  if (typeof window === 'undefined') return null;
  
  // Check current global name
  if ((window as any)[JS_GLOBAL_NAME]) {
    return (window as any)[JS_GLOBAL_NAME];
  }
  
  // Check legacy global name
  if (JS_GLOBAL_LEGACY && (window as any)[JS_GLOBAL_LEGACY]) {
    return (window as any)[JS_GLOBAL_LEGACY];
  }
  
  // Check parent window (for iframe contexts)
  try {
    if (window.parent && window.parent !== window) {
      if ((window.parent as any)[JS_GLOBAL_NAME]) {
        return (window.parent as any)[JS_GLOBAL_NAME];
      }
      if (JS_GLOBAL_LEGACY && (window.parent as any)[JS_GLOBAL_LEGACY]) {
        return (window.parent as any)[JS_GLOBAL_LEGACY];
      }
    }
  } catch {
    // Cross-origin access denied
  }
  
  return null;
};

// =============================================================================
// HELPER: Check environment
// =============================================================================

/**
 * Check if running in development preview (Lovable, localhost)
 */
export const isDevPreview = (): boolean => {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  return (
    hostname.includes('lovable.app') ||
    hostname.includes('lovableproject.com') ||
    hostname === 'localhost'
  );
};

/**
 * Check if running inside an iframe
 */
export const isEmbedded = (): boolean => {
  try {
    return window.self !== window.top;
  } catch {
    return true; // Cross-origin = embedded
  }
};
