# WordPress Plugin Header & Footer Implementation Guide

This guide documents the header and footer structure used in Kind Pixels WordPress plugins, designed for reuse across multiple Lovable projects.

---

## Table of Contents

1. [Header Structure](#header-structure)
2. [Footer Structure](#footer-structure)
3. [Kind Pixels Logo SVG Component](#kind-pixels-logo-svg-component)
4. [CSS Overrides for WordPress](#css-overrides-for-wordpress)
5. [Versioning & Cache Busting](#versioning--cache-busting)
6. [Complete Implementation Example](#complete-implementation-example)

---

## Header Structure

The header consists of two parts:
1. **Logo Header** - Plugin icon + title + version badge
2. **Tab Navigation** - Underline-style tabs with icons

### Logo Header Component

```tsx
import { SplitSquareHorizontal } from 'lucide-react'; // Or your plugin's icon

{/* Logo Header */}
<div className="max-w-6xl mx-auto px-6 pt-6 pb-4">
  <div className="flex items-center gap-3">
    <SplitSquareHorizontal className="w-10 h-10 text-purple-600" />
    <div className="flex items-baseline gap-2">
      <h1 className="text-2xl text-slate-800"><span className="font-bold">Plugin Name</span></h1>
      <span className="text-xs text-slate-400">v1.0.0</span>
    </div>
  </div>
</div>
```

### Key Design Decisions:
- **Icon**: Uses Lucide React icons (SVG-based, tree-shakable)
- **Title**: `text-2xl text-slate-800` with plugin name wrapped in `<span className="font-bold">`
- **Version badge**: `text-xs text-slate-400` - subtle, professional
- **Spacing**: `gap-3` between icon and text, `gap-2` between title and version

### Tab Navigation

```tsx
type TabType = 'main' | 'settings' | 'documentation';

const tabs = [
  { id: 'main' as TabType, label: 'Main', icon: Layers, isPro: false },
  { id: 'settings' as TabType, label: 'Settings', icon: Settings, isPro: true },
  { id: 'documentation' as TabType, label: 'Documentation', icon: BookOpen, isPro: false },
];

{/* Tab Navigation with Underline Style */}
<div className="max-w-6xl mx-auto px-6">
  <div className="flex border-b border-slate-200">
    {tabs.map((tab) => {
      const Icon = tab.icon;
      const isActive = activeTab === tab.id;
      return (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`
            flex-1 px-6 py-4 text-sm font-medium border-b-2 -mb-px 
            flex items-center justify-center gap-2 transition-colors
            ${isActive 
              ? 'border-purple-500 text-purple-600 bg-purple-50/50' 
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }
          `}
        >
          <Icon className="w-4 h-4" />
          {tab.label}
          {tab.isPro && (
            <Crown className={`w-3 h-3 ${isActive ? 'text-amber-500' : 'text-amber-400'}`} />
          )}
        </button>
      );
    })}
  </div>
</div>
```

### Tab Design Features:
- **Underline indicator**: Active tab has `border-purple-500` bottom border
- **Pro badge**: Crown icon (`text-amber-500`) for premium features
- **Equal width**: `flex-1` ensures tabs are evenly distributed
- **Hover states**: Subtle background change on hover

---

## Footer Structure

```tsx
import { ExternalLink } from 'lucide-react';

{/* Footer */}
<div className="max-w-6xl mx-auto px-6 mt-8">
  <div className="border-t border-slate-200 pt-4 pb-6">
    <div className="flex items-center justify-between">
      {/* Left: Support Links */}
      <div className="flex items-center gap-6">
        <a 
          href="https://kindpixels.com/support" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm text-slate-500 hover:text-purple-600 transition-colors flex items-center gap-1"
        >
          Support
          <ExternalLink className="w-3 h-3" />
        </a>
        <a 
          href="https://kindpixels.com/feature-request" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm text-slate-500 hover:text-purple-600 transition-colors flex items-center gap-1"
        >
          Request a Feature
          <ExternalLink className="w-3 h-3" />
        </a>
        <a 
          href="https://wordpress.org/plugins/YOUR-PLUGIN-SLUG/#reviews" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm text-slate-500 hover:text-purple-600 transition-colors flex items-center gap-1"
        >
          Rate Us ★★★★★
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
      
      {/* Right: Kind Pixels Logo */}
      <a 
        href="https://kindpixels.com" 
        target="_blank" 
        rel="noopener noreferrer"
        className="ba-footer-logo text-slate-600"
      >
        <KindPixelsLogo className="h-5 w-auto" />
      </a>
    </div>
  </div>
</div>
```

### Footer Design Features:
- **Separator**: `border-t border-slate-200` creates visual separation
- **Link styling**: `text-slate-500 hover:text-purple-600` with smooth transition
- **External link icons**: Small `ExternalLink` icon (3x3) indicates new tab
- **Logo placement**: Right-aligned, uses special class for WordPress overrides

---

## Kind Pixels Logo SVG Component

This inline SVG component ensures the logo renders correctly in WordPress without external file dependencies:

```tsx
const KindPixelsLogo = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 9000 1000" 
    className={className}
    style={{ shapeRendering: 'geometricPrecision', ...style }}
  >
    <g fill="currentColor">
      <path d="M2233.79 555.7l-96.37 2.35 0.57 -175.04 -154.7 2.06 -1.6 -173.14 -146.85 1.12 -1.7 -195.94c-45.96,-0.29 -167.39,-6.91 -203.53,4.62 -9.91,32.31 -5.94,860.17 -4.64,962.85l209.94 -1.1 -3.27 -571.32 90.2 1.07 1.69 176.67 153.21 -3.04 -2.48 178.11 158.77 -2.95 1.29 222.53 205.19 -1.84 0.06 -725.81c0.21,-51.66 6.58,-198.67 -2.68,-239.63l-199.38 0.41 -3.71 538.02z"/>
      <path d="M2782.42 218.02l361.8 -1.5 -3.39 565 -357.76 1.61 -0.65 -565.11zm-204.16 766.15l621.63 0.37 -3.28 -179.36 156.21 1.76 -0 -620.01 -153.1 -2.28 -7.42 -169.54 -612.09 2.48c-13.52,53.35 -2.85,843.35 -1.95,966.58z"/>
      <path d="M619.3 189.85l-150.81 -4.09 1.22 131.72 -144.92 -0.23 0.28 59.14 -73.73 0.44 -0.11 -356.13 -204.28 -1.54 0.75 963.3 205.56 0.66 -0.56 -409.22 76.41 -1.06 -1.66 77.51 137.26 0.91 2.84 155.23c22.52,-0.04 150.39,-8.21 151.61,6.93 0.16,2 1.31,2.78 1.5,3.74l2.05 165.74 203.24 -0.39 -0.63 -199.41 -146.02 -1.19 -3.59 -178.85 -156.08 -0.62 2.37 -214.72 157.29 0.48 -1.54 -171.63 147.46 -2.21c-0.21,-14.75 4.64,-181.63 -4.09,-190.68 -7.06,-7.31 5.94,-7.1 -42.13,-6.45 -17.91,0.24 -35.87,0.04 -53.78,0.01 -31.45,-0.07 -74.27,-2.18 -104.27,1.23l-1.65 171.39z"/>
      <polygon points="959.98,213.66 1122.11,214.09 1122.78,786.4 959.55,787.18 959.87,985.04 1492.95,982.91 1493.59,785.24 1332.07,785.79 1330.01,213.45 1491.87,212.75 1493.84,18.12 960.3,18.77"/>
      <path d="M6780.81 214.09l570.8 -1.32 -0.56 -203.05 -775.41 3.46c-9.35,47.31 -2.57,187.02 -2.4,243.82 0.25,82.41 0.67,164.78 0.49,247.2 -0.35,161.84 3.15,324.5 1.13,487.85l773.44 -2.51 1.34 -193.26c-46.72,-9.99 -475.93,-1.02 -568.22,-2.57l1.3 -191.18c89.48,2.74 383.56,-7.63 437.09,1.26l0.44 -203.78 -437.96 -0.28 -1.47 -185.63z"/>
      <path d="M8384.28 211.22l358.14 -1.12c9.77,35.06 3.65,78.94 4.45,116.75l205.78 0.18 0.4 -201.25c-207.07,4.89 -154.56,22.98 -162.54,-121.09l-461.17 -0.36 -1.4 138.64 -153.78 0.33 -0.59 317.83c41.35,0.22 124.44,-9.5 158.65,6.85l-1.31 129.08 409.7 -1.8 -3.54 192.86 -364.06 0.03 -0.35 -135.48 -199.3 0.31 -0.91 205.73 156.36 1.69 3.32 129.53 462.12 1.61 1.27 -135.03 155.6 -0.51 1.39 -335.31c-40.3,-4.55 -133.24,-0.19 -149.88,-2.7 -34.04,-5.13 -4.96,-80.74 -19.83,-123.98l-398.45 -2.94 -0.06 -179.87z"/>
      <path d="M4612.05 482.24c-106.36,2.77 -216.67,-1.76 -323.87,-0.54 -39.48,0.45 -51.22,10.31 -53.29,-25.18 -1.49,-25.56 -0.39,-55.3 -0.37,-81.31 0.03,-53.26 1.26,-108.16 -0.31,-161.14l377.61 -0.33 0.24 268.48zm53.83 200.72c2.61,-40.3 -7.16,-92.63 4.95,-128.75 38.97,-11.43 108.01,-3.39 153.53,-4.49l0.39 -401.2 -159.45 -1.79 -1.78 -136.28 -630.07 2.47c-13.82,39.11 -4.29,866.98 -2.98,980.31l204.31 -0.19 -1.36 -305.71 432.44 -4.38z"/>
      <path d="M6234.77 182.01l-144.91 -0.06 0.33 146.67 -125.78 0.92 -1.84 -145.49c-50.58,-4.74 -95.18,-1.8 -147.83,-1.27l0.49 -169.49 -206.99 -0.92 1.1 203.79c38.24,-8.05 104.66,-3.16 145.78,-1.67l0.35 171.21 155.85 0.4 1.12 232.19 -154.47 1.04 -2.57 176.77c-33.59,-9.77 -113.46,-5.15 -149.7,-1.08l0.77 196.78 208.87 1.75 -0.61 -167.46 148.08 -0.11 1.5 -153.99 126.93 0.15 3.17 153.41 139.26 0.63 0.02 167.76 204.48 -0.79 1.11 -200.61 -140.16 1.43c-3.31,-50.58 -2.96,-116.48 -4.31,-174.11l-149.62 1c-12.45,-28.24 -8.8,-197.48 -6.02,-237.63l156.52 1.26 -0.68 -168.83 148.19 -1.51 -2.19 -200.93 -201.48 -1.83 -4.76 170.64z"/>
      <path d="M5312.77 212.13l164.58 -1.18 -1.85 -200.15 -535.15 2.22 -0.9 200.38 164.32 2.61 -1.49 577.85 -159.61 0.98c-1.98,35.46 -4.19,173.94 3.38,200.83l528.31 -0.86 0.52 -199.92 -164.27 -3.35 2.16 -579.42z"/>
      <polygon points="7486.76,990.74 8082.39,991.11 8084.34,792.19 7690.05,793.57 7689.89,9.8 7483.81,9.93"/>
    </g>
  </svg>
);
```

### Why Inline SVG?
- **No external dependencies**: Works in WordPress admin without CORS issues
- **Inherits color**: Uses `fill="currentColor"` for easy theming
- **Crisp rendering**: `shapeRendering: 'geometricPrecision'` ensures sharp edges

---

## CSS Overrides for WordPress

WordPress admin applies its own styles that can interfere with your plugin UI. Add these overrides to your `index.css`:

```css
/* WordPress-specific overrides */
@supports (-webkit-appearance: none) {
  /* Footer logo - prevent WordPress hover effects */
  .ba-footer-logo,
  .ba-footer-logo:hover,
  .ba-footer-logo:focus,
  .ba-footer-logo:active,
  .ba-footer-logo svg,
  .ba-footer-logo:hover svg,
  a.ba-footer-logo,
  a.ba-footer-logo:hover {
    filter: none !important;
    opacity: 1 !important;
    transform: none !important;
    color: rgb(71 85 105) !important; /* text-slate-600 */
    fill: currentColor !important;
    transition: none !important;
  }
}
```

### Common WordPress Overrides Needed:
- **Link hover effects**: WordPress often adds opacity/color changes
- **SVG filters**: Some themes apply grayscale or brightness filters
- **Transitions**: WordPress may add unwanted transition effects

---

## Versioning & Cache Busting

### Version Display in Header

The version badge serves multiple purposes:
1. **User information**: Users can see which version they're running
2. **Support reference**: Easier debugging when users report issues
3. **Professional appearance**: Shows the plugin is maintained

```tsx
<span className="text-xs text-slate-400">v1.1.3</span>
```

### Version in WordPress Plugin File

The version number should be synced in three places:

#### 1. React Component (MainAdmin.tsx)
```tsx
<span className="text-xs text-slate-400">v1.1.3</span>
```

#### 2. PHP Plugin Header (plugin-file.php)
```php
/**
 * Plugin Name: Your Plugin Name
 * Version: 1.1.3
 * ...
 */
define('YOUR_PLUGIN_VERSION', '1.1.3');
```

#### 3. Asset Enqueuing for Cache Busting

WordPress uses the version parameter in `wp_enqueue_script` and `wp_enqueue_style` for cache busting:

```php
// In your plugin's PHP file
wp_enqueue_script(
    'your-plugin-admin',
    plugin_dir_url(__FILE__) . 'dist/assets/index.js',
    array(),
    YOUR_PLUGIN_VERSION,  // <-- Version for cache busting
    true
);

wp_enqueue_style(
    'your-plugin-admin-styles',
    plugin_dir_url(__FILE__) . 'dist/assets/index.css',
    array(),
    YOUR_PLUGIN_VERSION   // <-- Version for cache busting
);
```

### How Cache Busting Works

When you update the version:
- Old: `index.js?ver=1.1.2`
- New: `index.js?ver=1.1.3`

Browsers treat these as different files, forcing a fresh download instead of serving from cache.

### Version Update Checklist

When releasing a new version:
1. ☐ Update version in `MainAdmin.tsx` header badge
2. ☐ Update version in PHP plugin file header comment
3. ☐ Update `YOUR_PLUGIN_VERSION` constant in PHP
4. ☐ Run `npm run build` to generate new assets
5. ☐ Test that new version displays correctly in WordPress admin

---

## Complete Implementation Example

### File Structure
```
src/
├── components/
│   └── MainAdmin.tsx    # Contains header, tabs, content, footer
├── index.css            # WordPress override styles
└── ...
```

### Required Dependencies
```json
{
  "lucide-react": "^0.462.0"
}
```

### Required Imports
```tsx
import { 
  LayoutTemplate, 
  BookOpen, 
  Layers, 
  Crown, 
  SplitSquareHorizontal, 
  ExternalLink 
} from 'lucide-react';
```

### Color Palette Reference
| Element | Color Class | Hex/RGB |
|---------|-------------|---------|
| Icon accent | `text-purple-600` | #9333ea |
| Title | `text-slate-800` | #1e293b |
| Version | `text-slate-400` | #94a3b8 |
| Active tab border | `border-purple-500` | #a855f7 |
| Tab text | `text-slate-500` | #64748b |
| Pro badge | `text-amber-500` | #f59e0b |
| Footer links | `text-slate-500` | #64748b |
| Footer logo | `text-slate-600` | #475569 |

---

## Customization Notes

When adapting for a new plugin:

1. **Change the header icon**: Replace `SplitSquareHorizontal` with an appropriate Lucide icon
2. **Update plugin title**: Change the `h1` text content
3. **Update version**: Set your initial version (e.g., `v1.0.0`)
4. **Modify tabs**: Adjust tab configuration array for your plugin's sections
5. **Update footer links**: Change the WordPress.org review link to your plugin's slug
6. **Keep the Kind Pixels logo**: Maintains brand consistency across plugins

---

*Last updated: January 2025*
*Compatible with: Lovable, WordPress 6.x, React 18.x*
