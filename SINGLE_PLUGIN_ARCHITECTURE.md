# KindPixels PDF Gallery - Single Plugin Architecture

## Overview

The plugin uses a **single-codebase architecture** where both Free and Pro versions are generated from the same source code. This simplifies maintenance and ensures feature parity.

## Security Model (Two-Layer Protection)

**IMPORTANT**: The Pro version requires BOTH conditions to unlock features:

1. **Build-time inclusion** (`BUILD_FLAGS`) - Pro code is only included in Pro builds
2. **Runtime license validation** (`useLicense.isPro`) - Freemius checks if user has active license

This means:
- Free ZIP → Pro code is **physically absent** (cannot be hacked)
- Pro ZIP without license → Pro UI is visible but **features are locked**
- Pro ZIP with valid license → Full Pro features enabled

## Build Commands

```bash
# Free version (for WordPress.org)
npm run build:free

# Pro version (for paying customers)  
npm run build:pro
```

**⚠️ IMPORTANT**: On Windows, do NOT use `set VITE_BUILD_VARIANT=pro && npm run build`.
Always use the npm scripts which use `cross-env` for cross-platform compatibility.

## How It Works

### 1. Build-Time Feature Gating

The `src/config/buildFlags.ts` file exports feature flags based on `VITE_BUILD_VARIANT`:

```typescript
export const BUILD_FLAGS = {
  MULTI_GALLERY_UI: BUILD_VARIANT === 'pro',  // Add Gallery button (code included)
  BULK_UPLOAD_UI: BUILD_VARIANT === 'pro',    // Multi-file upload (code included)
  FILE_LIMIT: BUILD_VARIANT === 'pro' ? Infinity : 15,
};
```

### 2. Runtime License Validation

Components must check BOTH conditions:

```tsx
import { BUILD_FLAGS } from '@/config/buildFlags';
import { useLicense } from '@/hooks/useLicense';

const MyComponent = () => {
  const license = useLicense();
  
  // Pro feature only shows if: code is included AND license is valid
  if (BUILD_FLAGS.MULTI_GALLERY_UI && license.isPro) {
    return <ProFeature />;
  }
  return <FreeFeature />;
};
```

### 2. Pro Build Marker

When running `npm run build:pro`, Vite creates a `dist/.pro-build` marker file.

The PHP file detects this marker:

```php
$is_premium_build = file_exists( dirname( __FILE__ ) . '/dist/.pro-build' );
```

### 3. Freemius Configuration

Based on the marker, Freemius is configured differently:

| Setting | Free Build | Pro Build |
|---------|-----------|-----------|
| `is_premium` | false | true |
| `is_org_compliant` | true | false |
| `anonymous_mode` | true | false |
| `account` menu | false | true |

## Distribution

### Free ZIP (WordPress.org)

```
kindpixels-pdf-gallery/
├── kindpixels-pdf-gallery.php
├── readme.txt
├── dist/
│   ├── assets/
│   │   ├── index.js
│   │   └── index.css
│   └── index.html
└── vendor/
    └── freemius/
```

**No `.pro-build` marker** → Freemius uses `is_premium: false`

### Pro ZIP (Your Site / Freemius)

```
kindpixels-pdf-gallery/
├── kindpixels-pdf-gallery.php      # Same file!
├── readme.txt
├── dist/
│   ├── .pro-build                  # ← Marker file
│   ├── assets/
│   │   ├── index.js                # Pro features included
│   │   └── index.css
│   └── index.html
└── vendor/
    └── freemius/
```

**Has `.pro-build` marker** → Freemius uses `is_premium: true`

## User Flow

### Free Users

1. Install from WordPress.org
2. Get 1 gallery, 15 files, single-file upload
3. See "Upgrade to Pro" in plugin

### Pro Users

1. Purchase license from your site
2. Download Pro ZIP
3. Upload to WordPress (replaces Free version automatically)
4. Activate license via Freemius prompt
5. All features unlocked

## Packaging Script

Create ZIPs with this script:

```bash
#!/bin/bash

# Build Free version
npm run build:free
mkdir -p package/kindpixels-pdf-gallery
cp -r dist package/kindpixels-pdf-gallery/
cp kindpixels-pdf-gallery.php package/kindpixels-pdf-gallery/
cp readme.txt package/kindpixels-pdf-gallery/
cp -r vendor package/kindpixels-pdf-gallery/
cd package && zip -r kindpixels-pdf-gallery-free.zip kindpixels-pdf-gallery
cd .. && rm -rf package/kindpixels-pdf-gallery

# Build Pro version
npm run build:pro
mkdir -p package/kindpixels-pdf-gallery
cp -r dist package/kindpixels-pdf-gallery/
cp kindpixels-pdf-gallery.php package/kindpixels-pdf-gallery/
cp readme.txt package/kindpixels-pdf-gallery/
cp -r vendor package/kindpixels-pdf-gallery/
cd package && zip -r kindpixels-pdf-gallery-pro.zip kindpixels-pdf-gallery
cd .. && rm -rf package
```

## WordPress.org Compliance

The Free version meets all WordPress.org requirements:

- ✅ No premium code in Free build (excluded at compile time)
- ✅ No locked/grayed UI features
- ✅ `is_org_compliant: true` in Freemius config
- ✅ All functions prefixed with `kindpdfg_`
- ✅ All assets bundled locally
