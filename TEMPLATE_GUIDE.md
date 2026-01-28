# WordPress Plugin Template Guide

This document explains how to fork and customize this plugin codebase for creating new WordPress plugins. The architecture is designed to be modular and reusable.

---

## Table of Contents

1. [Quick Start: Forking for a New Plugin](#quick-start-forking-for-a-new-plugin)
2. [Architecture Overview](#architecture-overview)
3. [Reusable Modules](#reusable-modules)
4. [Customization Checklist](#customization-checklist)
5. [Build System](#build-system)
6. [Freemius Licensing](#freemius-licensing)
7. [File Structure](#file-structure)

---

## Quick Start: Forking for a New Plugin

### Step 1: Clone and Rename

```bash
# Clone the repository
git clone https://github.com/boshorog/pdf-gallery.git my-new-plugin

# Remove git history for fresh start
cd my-new-plugin
rm -rf .git
git init
```

### Step 2: Update Plugin Identity

Edit `src/config/pluginIdentity.ts` - this is the **single source of truth** for all branding:

```typescript
// Update these values for your new plugin
export const PLUGIN_SLUG = 'my-awesome-plugin';
export const PLUGIN_PREFIX = 'myawp';  // 6-10 chars, no hyphens
export const JS_GLOBAL_NAME = 'myawpData';
export const PLUGIN_NAME = 'My Awesome Plugin';
export const PRO_NAME = 'My Awesome Plugin Pro';
export const PLUGIN_VERSION = '1.0.0';
```

### Step 3: Update PHP Files

Search and replace in the main PHP file (`kindpixels-pdf-gallery.php`):

| Find | Replace With |
|------|--------------|
| `kindpdfg_` | `myawp_` |
| `kindpixels-pdf-gallery` | `my-awesome-plugin` |
| `KindPixels PDF Gallery` | `My Awesome Plugin` |
| `KINDPDFG_` | `MYAWP_` |

Rename the file: `kindpixels-pdf-gallery.php` → `my-awesome-plugin.php`

### Step 4: Update Build Configuration

In `vite.config.ts`, update the base path:

```typescript
base: mode === 'production' ? '/wp-content/plugins/my-awesome-plugin/dist/' : '/',
```

### Step 5: Update readme.txt

Update all references to the old plugin name, slug, and descriptions.

### Step 6: Test

```bash
npm install
npm run dev
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        PLUGIN STRUCTURE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │   PHP Entry  │    │  React App   │    │  Supabase    │       │
│  │    Point     │───▶│   (Vite)     │───▶│  Functions   │       │
│  └──────────────┘    └──────────────┘    └──────────────┘       │
│         │                   │                   │                │
│         ▼                   ▼                   ▼                │
│  ┌─────────────────────────────────────────────────────┐        │
│  │                   SHARED MODULES                     │        │
│  ├─────────────────────────────────────────────────────┤        │
│  │  • Plugin Identity (config/pluginIdentity.ts)       │        │
│  │  • Build Flags (config/buildFlags.ts)               │        │
│  │  • License Management (hooks/useLicense.ts)         │        │
│  │  • WordPress API Bridge (utils/wpApi.ts)            │        │
│  │  • UI Components (components/ui/*)                  │        │
│  └─────────────────────────────────────────────────────┘        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
WordPress                    React App                    Backend
    │                           │                           │
    │  wp_localize_script       │                           │
    │  (kindpdfgData)           │                           │
    │─────────────────────────▶ │                           │
    │                           │                           │
    │                           │  AJAX (kindpdfg_action)   │
    │◀────────────────────────  │                           │
    │                           │                           │
    │                           │  Supabase Edge Function   │
    │                           │─────────────────────────▶ │
    │                           │                           │
```

---

## Reusable Modules

### 1. Plugin Identity (`src/config/pluginIdentity.ts`)

**Purpose:** Centralized branding and configuration

**Reuse:** Copy as-is, update values

**Exports:**
- `PLUGIN_SLUG`, `PLUGIN_PREFIX`, `PLUGIN_NAME`, etc.
- `STORAGE_KEYS` - prefixed localStorage keys
- `getWPGlobal()` - get WordPress injected data
- `isDevPreview()`, `isEmbedded()` - environment detection

### 2. Build Flags (`src/config/buildFlags.ts`)

**Purpose:** Feature gating for Free/Pro variants

**Reuse:** Copy as-is, customize feature flags

**Key Features:**
- Build-time variant detection via `VITE_BUILD_VARIANT`
- Dev mode override via localStorage
- Runtime feature checks

**Customization:**
```typescript
export const BUILD_FLAGS = {
  // Add your feature flags here
  MY_PRO_FEATURE: BUILD_VARIANT === 'pro' || isDevPro,
} as const;
```

### 3. License Management (`src/hooks/useLicense.ts`)

**Purpose:** Freemius license validation

**Reuse:** Copy as-is, update localStorage key

**Features:**
- Polls Freemius globals for license status
- Handles activation redirect flow
- Dev mode support for testing

**Dependencies:** `pluginIdentity.ts` (for storage keys)

### 4. WordPress API Bridge (`src/utils/wpApi.ts`)

**Purpose:** AJAX communication with WordPress

**Reuse:** Copy as-is, update action names

**Usage:**
```typescript
import { getWPGlobal } from '@/config/pluginIdentity';

const wp = getWPGlobal();
const form = new FormData();
form.append('action', AJAX_ACTION);
form.append('action_type', 'your_action');
form.append('nonce', wp.nonce);

fetch(wp.ajaxUrl, { method: 'POST', body: form });
```

### 5. Upload System (`src/components/AddDocumentModal.tsx`)

**Purpose:** Chunked file uploads with progress

**Reuse:** Extract upload logic to separate hook

**Features:**
- 5MB chunked uploads (bypasses PHP limits)
- Pause/resume support
- Progress tracking
- Multi-file queue (Pro only)

### 6. UI Components (`src/components/ui/`)

**Purpose:** Shadcn/ui component library

**Reuse:** Copy entire folder

**Components:** Button, Dialog, Input, Tabs, Toast, etc.

### 7. Toast Notifications (`src/hooks/use-toast.ts`)

**Purpose:** User feedback system

**Reuse:** Copy as-is

**Usage:**
```typescript
const { toast } = useToast();
toast({ title: 'Success', description: 'Item saved' });
```

---

## Customization Checklist

### Files to Update When Forking

| File | What to Update |
|------|----------------|
| `src/config/pluginIdentity.ts` | All branding constants |
| `src/config/buildFlags.ts` | Feature flags for your plugin |
| `kindpixels-pdf-gallery.php` | PHP prefix, plugin header |
| `readme.txt` | Plugin description, changelog |
| `vite.config.ts` | Base path for assets |
| `index.html` | Title, meta tags |
| `src/pages/Index.tsx` | Main app component |
| `src/types/` | Domain-specific types |

### Files to Keep As-Is (Infrastructure)

| File/Folder | Purpose |
|-------------|---------|
| `src/hooks/useLicense.ts` | License management |
| `src/hooks/use-toast.ts` | Toast notifications |
| `src/components/ui/*` | UI component library |
| `scripts/build-plugin.cjs` | Build automation |
| `tailwind.config.ts` | Styling system |
| `postcss.config.js` | CSS processing |

### Files to Remove/Replace (Domain-Specific)

| File | Notes |
|------|-------|
| `src/components/PDFGallery.tsx` | Replace with your feature |
| `src/components/PDFAdmin.tsx` | Replace with your admin UI |
| `src/components/PdfJsViewer.tsx` | PDF-specific, remove if not needed |
| `src/utils/pdfThumbnailGenerator.ts` | PDF-specific |

---

## Build System

### NPM Scripts

```bash
# Development
npm run dev              # Start dev server

# Production builds
npm run build:free       # Build free version (WordPress.org)
npm run build:pro        # Build pro version (Freemius)

# Packaging
node scripts/build-plugin.cjs           # Build both ZIPs
node scripts/build-plugin.cjs free      # Build free ZIP only
node scripts/build-plugin.cjs pro       # Build pro ZIP only
```

### Build Output

```
releases/
├── kindpixels-pdf-gallery-free-v2.4.5.zip
└── kindpixels-pdf-gallery-pro-v2.4.5.zip
```

### How Build Variants Work

1. **Compile Time:** `VITE_BUILD_VARIANT` environment variable
2. **Build Flags:** `src/config/buildFlags.ts` reads the env var
3. **Marker File:** Pro build creates `dist/.pro-build`
4. **PHP Detection:** Main PHP file checks for marker
5. **Runtime:** Pro features require valid Freemius license

---

## Freemius Licensing

### Setup Steps

1. Create plugin on Freemius dashboard
2. Get Plugin ID and Public Key
3. Update `src/config/pluginIdentity.ts`:
   ```typescript
   export const FREEMIUS_PLUGIN_ID = 'YOUR_ID';
   export const FREEMIUS_PUBLIC_KEY = 'pk_YOUR_KEY';
   ```
4. Update PHP file with Freemius SDK integration

### License Flow

```
User Installs Free Version
         │
         ▼
┌─────────────────────┐
│  BUILD_VARIANT=free │
│  Pro UI hidden      │
└─────────────────────┘
         │
   User Upgrades
         │
         ▼
┌─────────────────────┐
│  Freemius validates │
│  license.isPro=true │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│  Pro UI unlocked    │
│  Features enabled   │
└─────────────────────┘
```

### Testing Pro Features in Dev

Use the `DevLicenseSelector` component (only visible in dev mode):
1. Open browser console
2. Toggle to "Pro" mode
3. Refresh page

---

## File Structure

```
├── src/
│   ├── config/
│   │   ├── pluginIdentity.ts    # 🔧 EDIT: Branding config
│   │   └── buildFlags.ts        # 🔧 EDIT: Feature flags
│   │
│   ├── components/
│   │   ├── ui/                  # ✅ KEEP: Shadcn components
│   │   ├── PDFAdmin.tsx         # 🔄 REPLACE: Your admin UI
│   │   ├── PDFGallery.tsx       # 🔄 REPLACE: Your frontend
│   │   ├── ProBanner.tsx        # ✅ KEEP: Upgrade prompts
│   │   └── ProWelcome.tsx       # ✅ KEEP: Activation welcome
│   │
│   ├── hooks/
│   │   ├── useLicense.ts        # ✅ KEEP: License management
│   │   ├── use-toast.ts         # ✅ KEEP: Notifications
│   │   └── use-mobile.tsx       # ✅ KEEP: Responsive utils
│   │
│   ├── utils/
│   │   ├── wpApi.ts             # ✅ KEEP: WordPress bridge
│   │   └── supabaseClient.ts    # ✅ KEEP: Backend client
│   │
│   ├── types/
│   │   └── gallery.ts           # 🔄 REPLACE: Your types
│   │
│   ├── pages/
│   │   └── Index.tsx            # 🔧 EDIT: Main app entry
│   │
│   └── App.tsx                  # ✅ KEEP: App wrapper
│
├── scripts/
│   └── build-plugin.cjs         # ✅ KEEP: Build automation
│
├── supabase/
│   └── functions/               # 🔧 EDIT: Your edge functions
│
├── kindpixels-pdf-gallery.php   # 🔧 EDIT: PHP entry point
├── readme.txt                   # 🔧 EDIT: WordPress readme
├── vite.config.ts              # 🔧 EDIT: Build config
└── tailwind.config.ts          # ✅ KEEP: Styling
```

Legend:
- 🔧 EDIT: Update for your plugin
- 🔄 REPLACE: Replace with your implementation  
- ✅ KEEP: Reuse as-is

---

## Next Steps

1. **Read** `SINGLE_PLUGIN_ARCHITECTURE.md` for build details
2. **Review** `MODULE_ARCHITECTURE.md` for code patterns
3. **Check** `TOAST_NOTIFICATIONS_DOCUMENTATION.md` for UX patterns
4. **Test** both Free and Pro builds before distribution

---

## Support

- Plugin Template: https://github.com/boshorog/pdf-gallery
- Author: Kind Pixels (https://kindpixels.dev)
