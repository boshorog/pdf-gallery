# Module Architecture Documentation

This document describes the modular architecture of the plugin, explaining each module's purpose, dependencies, and how to reuse or customize them.

---

## Table of Contents

1. [Module Overview](#module-overview)
2. [Core Infrastructure Modules](#core-infrastructure-modules)
3. [UI Component Modules](#ui-component-modules)
4. [Feature Modules](#feature-modules)
5. [Backend Modules](#backend-modules)
6. [Module Dependencies Graph](#module-dependencies-graph)

---

## Module Overview

The codebase is organized into distinct modules with clear responsibilities:

| Module Category | Location | Reusability |
|----------------|----------|-------------|
| **Configuration** | `src/config/` | High - Copy and customize |
| **Hooks** | `src/hooks/` | High - Copy as-is |
| **UI Components** | `src/components/ui/` | High - Copy entire folder |
| **Utilities** | `src/utils/` | High - Copy and adapt |
| **Feature Components** | `src/components/*.tsx` | Medium - Use as templates |
| **Backend** | `supabase/functions/` | Medium - Adapt to needs |

---

## Core Infrastructure Modules

### 1. Plugin Identity Module

**File:** `src/config/pluginIdentity.ts`

**Purpose:** Single source of truth for all plugin branding, prefixes, and constants.

**Exports:**
```typescript
// Identity
PLUGIN_SLUG          // 'kindpixels-pdf-gallery'
PLUGIN_PREFIX        // 'kindpdfg'
JS_GLOBAL_NAME       // 'kindpdfgData'
PLUGIN_NAME          // 'PDF Gallery'
PRO_NAME             // 'PDF Gallery Pro'
PLUGIN_VERSION       // '2.4.8'

// Branding
BRANDING.author      // 'Kind Pixels'
BRANDING.links.*     // External URLs

// Helpers
getStorageKey(key)   // Prefixed localStorage key
getCssClass(name)    // Prefixed CSS class
getWPGlobal()        // Get WordPress data object
isDevPreview()       // Check if in dev environment
isEmbedded()         // Check if in iframe
```

**Usage Example:**
```typescript
import { 
  PLUGIN_NAME, 
  getStorageKey, 
  getWPGlobal 
} from '@/config/pluginIdentity';

// Use in component
const title = license.isPro ? PRO_NAME : PLUGIN_NAME;

// Use for storage
localStorage.setItem(getStorageKey('settings'), JSON.stringify(settings));

// Use for WordPress API
const wp = getWPGlobal();
if (wp?.ajaxUrl) { /* make AJAX call */ }
```

**Dependencies:** None (base module)

---

### 2. Build Flags Module

**File:** `src/config/buildFlags.ts`

**Purpose:** Feature gating for Free/Pro build variants.

**Exports:**
```typescript
BUILD_VARIANT        // 'free' | 'pro'
BUILD_FLAGS {
  MULTI_GALLERY_UI   // boolean
  BULK_UPLOAD_UI     // boolean
  FILE_LIMIT         // number
  ANALYTICS          // boolean
}
isProBuild()         // boolean
isFreeBuild()        // boolean
```

**Usage Example:**
```typescript
import { BUILD_FLAGS } from '@/config/buildFlags';

// Conditional rendering
{BUILD_FLAGS.MULTI_GALLERY_UI && <AddGalleryButton />}

// Conditional logic
if (!BUILD_FLAGS.BULK_UPLOAD_UI && files.length > 1) {
  toast({ title: 'Pro Feature Required' });
  return;
}
```

**Dependencies:** None (uses import.meta.env)

---

### 3. License Management Module

**File:** `src/hooks/useLicense.ts`

**Purpose:** Freemius license validation and Pro feature unlocking.

**Exports:**
```typescript
interface LicenseInfo {
  isValid: boolean;
  isPro: boolean;
  status: 'free' | 'pro' | 'expired' | 'invalid';
  expiryDate?: string;
  checked: boolean;
  isDevMode?: boolean;
}

useLicense(): LicenseInfo
```

**Usage Example:**
```typescript
import { useLicense } from '@/hooks/useLicense';

const MyComponent = () => {
  const license = useLicense();
  
  if (!license.checked) return <Loading />;
  
  return (
    <div>
      {license.isPro ? <ProFeature /> : <UpgradePrompt />}
    </div>
  );
};
```

**Dependencies:** 
- `pluginIdentity.ts` (for storage keys, environment detection)

**Key Features:**
- Polls Freemius globals on mount
- Handles license activation redirect flow
- Dev mode override via localStorage
- Focus/visibility re-check for tab switching

---

### 4. WordPress API Bridge Module

**File:** `src/utils/wpApi.ts`

**Purpose:** AJAX communication with WordPress backend.

**Pattern:**
```typescript
import { getWPGlobal, AJAX_ACTION } from '@/config/pluginIdentity';

export const saveData = async (data: any): Promise<boolean> => {
  const wp = getWPGlobal();
  if (!wp?.ajaxUrl || !wp?.nonce) return false;

  const form = new FormData();
  form.append('action', AJAX_ACTION);
  form.append('action_type', 'save_data');
  form.append('nonce', wp.nonce);
  form.append('data', JSON.stringify(data));

  const res = await fetch(wp.ajaxUrl, {
    method: 'POST',
    credentials: 'same-origin',
    body: form,
  });
  
  const json = await res.json();
  return !!json?.success;
};
```

**Dependencies:**
- `pluginIdentity.ts` (for `getWPGlobal`, `AJAX_ACTION`)

---

### 5. Toast Notifications Module

**Files:** 
- `src/hooks/use-toast.ts`
- `src/components/ui/toast.tsx`
- `src/components/ui/toaster.tsx`

**Purpose:** User feedback via toast notifications.

**Usage:**
```typescript
import { useToast } from '@/hooks/use-toast';

const { toast } = useToast();

// Success
toast({ 
  title: 'Saved!', 
  description: 'Your changes have been saved.' 
});

// Error
toast({ 
  title: 'Error', 
  description: 'Something went wrong.',
  variant: 'destructive' 
});
```

**Dependencies:** 
- Radix UI Toast primitives
- Tailwind CSS

---

## UI Component Modules

### Shadcn/UI Components (`src/components/ui/`)

Pre-built, accessible components. Copy the entire folder when forking.

| Component | File | Purpose |
|-----------|------|---------|
| Button | `button.tsx` | Action buttons with variants |
| Dialog | `dialog.tsx` | Modal dialogs |
| Input | `input.tsx` | Text inputs |
| Label | `label.tsx` | Form labels |
| Select | `select.tsx` | Dropdown selects |
| Tabs | `tabs.tsx` | Tabbed interfaces |
| Card | `card.tsx` | Content containers |
| Progress | `progress.tsx` | Progress bars |
| Checkbox | `checkbox.tsx` | Checkboxes |
| Switch | `switch.tsx` | Toggle switches |
| Separator | `separator.tsx` | Visual dividers |
| Tooltip | `tooltip.tsx` | Hover tooltips |
| Accordion | `accordion.tsx` | Collapsible sections |

**Customization:**

These components use CSS variables from `src/index.css`. Update the theme there:

```css
:root {
  --primary: 207 59% 68%;
  --primary-foreground: 0 0% 100%;
  /* ... */
}
```

---

## Feature Modules

### 1. Upload System Module

**Files:**
- `src/components/AddDocumentModal.tsx` (modal interface)
- Parts of `src/components/PDFAdmin.tsx` (inline interface)

**Features:**
- Chunked uploads (5MB chunks)
- Progress tracking
- Pause/resume
- Multi-file queue (Pro)
- File type detection
- YouTube URL detection

**Key Functions:**
```typescript
// Detect file type from File object
const getFileType = (file: File): string => {
  const extension = file.name.split('.').pop()?.toLowerCase();
  // ... mapping logic
};

// Detect file type from URL
const getFileTypeFromUrl = (url: string): string => {
  if (url.includes('youtube.com/')) return 'youtube';
  // ... extension detection
};

// Fetch YouTube title via oEmbed
const fetchYouTubeTitle = async (url: string): Promise<string | null> => {
  const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
  // ...
};

// Chunked upload
const uploadChunk = async (file, chunkIndex, uploadId, totalChunks) => {
  // 5MB chunks with AJAX
};
```

**Dependencies:**
- `pluginIdentity.ts`
- `buildFlags.ts`
- `useLicense.ts`
- `use-toast.ts`

---

### 2. Pro Banner Module

**File:** `src/components/ProBanner.tsx`

**Purpose:** Upgrade prompts for free users.

**Usage:**
```typescript
import ProBanner from '@/components/ProBanner';

// In your layout
{!license.isPro && <ProBanner />}
```

**Customization:**
Update the feature list and pricing link in the component.

---

### 3. Pro Welcome Module

**File:** `src/components/ProWelcome.tsx`

**Purpose:** One-time welcome message after Pro activation.

**Usage:**
```typescript
import ProWelcome from '@/components/ProWelcome';

// After license check
{license.isPro && <ProWelcome />}
```

**Features:**
- Auto-dismisses after showing once
- Cleans up URL parameters after activation
- Highlights unlocked features

---

### 4. Update Notice Module

**File:** `src/components/UpdateNotice.tsx`

**Purpose:** Notify users of available updates.

**Usage:**
```typescript
import { UpdateNotice } from '@/components/UpdateNotice';

<UpdateNotice currentVersion={PLUGIN_VERSION} />
```

**Features:**
- Fetches latest version from WordPress.org API
- Version comparison
- Dismissible per version
- Hidden for Pro users (Freemius handles updates)

---

### 5. Dev License Selector Module

**File:** `src/components/DevLicenseSelector.tsx`

**Purpose:** Toggle Free/Pro mode in development.

**Usage:**
```typescript
// Only loaded in dev mode (see Index.tsx)
const DevLicenseSelector = import.meta.env.DEV 
  ? lazy(() => import('@/components/DevLicenseSelector'))
  : null;

// In component
{import.meta.env.DEV && DevLicenseSelector && (
  <Suspense fallback={null}>
    <DevLicenseSelector />
  </Suspense>
)}
```

---

## Backend Modules

### Supabase Edge Functions (`supabase/functions/`)

| Function | Purpose | Reusability |
|----------|---------|-------------|
| `generate-thumbnail` | PDF thumbnail generation | Medium |
| `document-rating` | Document rating API | Low |
| `keep-alive` | Prevents cold starts | High |

**Creating New Functions:**

```typescript
// supabase/functions/my-function/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { data } = await req.json();
    // Your logic here
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
```

---

## Module Dependencies Graph

```
                    ┌─────────────────────┐
                    │  pluginIdentity.ts  │
                    │  (Base Config)      │
                    └──────────┬──────────┘
                               │
           ┌───────────────────┼───────────────────┐
           │                   │                   │
           ▼                   ▼                   ▼
    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
    │ buildFlags  │    │ useLicense  │    │   wpApi     │
    │    .ts      │    │    .ts      │    │    .ts      │
    └──────┬──────┘    └──────┬──────┘    └──────┬──────┘
           │                   │                   │
           └───────────────────┼───────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  Feature Components │
                    │  (PDFAdmin, etc.)   │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   UI Components     │
                    │  (components/ui/)   │
                    └─────────────────────┘
```

---

## Adding New Modules

### Checklist for New Modules

1. **Create in appropriate folder:**
   - Config: `src/config/`
   - Hooks: `src/hooks/`
   - Utils: `src/utils/`
   - Components: `src/components/`

2. **Follow naming conventions:**
   - Hooks: `use[Feature].ts`
   - Utils: `[feature]Api.ts` or `[feature]Utils.ts`
   - Components: `PascalCase.tsx`

3. **Add JSDoc comments:**
   ```typescript
   /**
    * Brief description of the module
    * 
    * @module ModuleName
    * @example
    * import { something } from '@/path/to/module';
    */
   ```

4. **Document dependencies** at the top of the file

5. **Export from index** if creating a module with multiple files

6. **Update this documentation** with the new module

---

## Best Practices

### 1. Keep Modules Focused
Each module should have a single responsibility. If a module grows too large, split it.

### 2. Minimize Dependencies
Modules should depend on as few other modules as possible. The dependency graph should be a tree, not a web.

### 3. Use Type Safety
Always define TypeScript interfaces for module exports.

### 4. Document Public APIs
Every exported function should have JSDoc comments explaining its purpose, parameters, and return value.

### 5. Test in Isolation
Modules should be testable independently of the rest of the application.
