# Version update locations (KindPixels PDF Gallery)

When you ask to bump the plugin version (e.g. `2.1.6`), update **all** of the places below so WordPress, the admin UI, and readme stay in sync.

## 1) WordPress plugin PHP

- `kindpixels-pdf-gallery.php`
  - Plugin header: `Version: X.Y.Z`
  - Constant: `define( 'PDF_GALLERY_VERSION', 'X.Y.Z' );`
  - Activation default option: `add_option('pdf_gallery_version', 'X.Y.Z');`

## 2) WordPress.org readme

- `readme.txt`
  - `Stable tag: X.Y.Z`
  - Add a new entry at the top of **Changelog**: `= X.Y.Z =`
  - Add a new entry at the top of **Upgrade Notice**: `= X.Y.Z =`

## 3) React admin UI version badges

- `src/pages/Index.tsx`
  - `const PLUGIN_VERSION = 'X.Y.Z';` (header badge in the admin UI)

- `src/components/PluginDocumentation.tsx`
  - `const PLUGIN_VERSION = 'X.Y.Z';` (documentation + “Licensed to” area)

## Quick checklist

1. Update version in the 5 files above
2. Rebuild plugin assets (so cache-busting uses the new version)
3. Run Plugin Check / PHPCS again

