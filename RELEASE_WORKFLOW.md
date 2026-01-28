# Release Workflow

This document describes how to build and release both Free and Pro variants of PDF Gallery.

## Prerequisites

- Node.js 18+
- npm

## Quick Release

```bash
# Build and package both variants
node scripts/build-plugin.cjs

# Or build individually
node scripts/build-plugin.cjs free
node scripts/build-plugin.cjs pro
```

Output files are created in the `releases/` folder:
- `kindpixels-pdf-gallery-free-{version}.zip`
- `kindpixels-pdf-gallery-pro-{version}.zip`

---

## Full Release Checklist

### 1. Update Version Number

Update the version in all locations (see `VERSION_UPDATE_LOCATIONS.md`):

- `kindpixels-pdf-gallery.php` – Plugin header & `KINDPDFG_VERSION` constant
- `readme.txt` – Stable tag & changelog
- `src/pages/Index.tsx` – `PLUGIN_VERSION` constant
- `src/components/PluginDocumentation.tsx` – `PLUGIN_VERSION` constant

### 2. Update Changelog

Add release notes to `readme.txt`:

```
= X.Y.Z =
* Feature: New feature description
* Fix: Bug fix description
* Improvement: Enhancement description
```

### 3. Build Plugin

```bash
node scripts/build-plugin.cjs
```

### 4. Test Locally

1. Install the Free ZIP on a test WordPress site
2. Verify Free features work correctly
3. Install the Pro ZIP (should upgrade seamlessly)
4. Verify Pro features unlock correctly

### 5. Deploy

#### Free Version → WordPress.org

1. Use SVN to update the plugin repository:
   ```bash
   svn checkout https://plugins.svn.wordpress.org/kindpixels-pdf-gallery
   ```
2. Replace `trunk/` contents with the Free ZIP contents
3. Tag the new version:
   ```bash
   svn cp trunk tags/X.Y.Z
   svn commit -m "Release X.Y.Z"
   ```

#### Pro Version → Freemius

1. Log in to [dashboard.freemius.com](https://dashboard.freemius.com)
2. Select "KindPixels PDF Gallery"
3. Go to **Deployment → Add Version**
4. Upload `kindpixels-pdf-gallery-pro-{version}.zip`
5. Set version number and release notes
6. Mark as **Premium** release type
7. Click **Release**

---

## Build Output Structure

Both ZIPs have the same root folder name for seamless upgrades:

```
kindpixels-pdf-gallery/
├── kindpixels-pdf-gallery.php    # Main plugin file
├── readme.txt                     # WordPress readme
├── freemius/                      # Freemius SDK
└── dist/
    ├── assets/
    │   ├── index.js               # React app
    │   └── index.css              # Styles
    └── .pro-build                 # (Pro only) Marker file
```

The `.pro-build` marker tells PHP to configure Freemius with `is_premium=true`.

---

## Variant Differences

| Aspect | Free Build | Pro Build |
|--------|------------|-----------|
| `VITE_BUILD_VARIANT` | `free` | `pro` |
| `.pro-build` marker | ❌ Not included | ✅ Included |
| Multi-gallery UI | Hidden at build time | Available |
| Bulk upload | Hidden at build time | Available |
| Analytics | Hidden at build time | Available |
| Distribution | WordPress.org | Freemius |

---

## Troubleshooting

### "Cannot redeclare" error after upgrade
The same folder name ensures WordPress treats Pro as an upgrade, not a separate plugin. If you see conflicts, ensure:
- Both ZIPs use `kindpixels-pdf-gallery/` as root folder
- Deactivate the old version before installing the new one

### Pro features not appearing after activation
1. Check that `.pro-build` exists in `dist/`
2. Verify Freemius license is active
3. Try a hard refresh (Ctrl+Shift+R)
4. Check browser console for license status

### Build fails
1. Ensure `npm install` has been run
2. Check Node.js version (18+ required)
3. Run `npm run build:free` manually to see detailed errors
