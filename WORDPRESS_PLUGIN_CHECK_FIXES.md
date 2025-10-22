# WordPress Plugin Check (PCP) - Fixes Applied

This document details all the fixes applied to resolve WordPress Plugin Check (PCP) errors and ensure the plugin meets WordPress.org guidelines.

## Version 1.7.4 Fixes

### Error 1: Missing Text Domain in i18n Function
**File**: `pdf-gallery-plugin.php` (Line 261, Column 20)
**Error**: `WordPress.WP.I18n.MissingArgDomain - Missing $domain parameter in function call to __()`

**Fix Applied**:
```php
// Before
wp_die(__('You do not have sufficient permissions to access this page.'));

// After
wp_die(esc_html__('You do not have sufficient permissions to access this page.', 'pdf-gallery'));
```

**Explanation**: All WordPress internationalization functions (`__()`, `_e()`, etc.) must include the text domain parameter to ensure proper translation support. The text domain matches the plugin slug: `pdf-gallery`.

---

### Error 2: Output Not Escaped
**File**: `pdf-gallery-plugin.php` (Line 261, Column 20)
**Error**: `WordPress.Security.EscapeOutput.OutputNotEscaped - All output should be run through an escaping function`

**Fix Applied**:
```php
// Before
wp_die(__('...'));

// After
wp_die(esc_html__('...', 'pdf-gallery'));
```

**Explanation**: Changed from `__()` to `esc_html__()` to ensure the output is properly escaped for security. This prevents potential XSS vulnerabilities.

---

### Error 3: Hidden Files Not Permitted
**File**: `dist/.htaccess`
**Error**: `hidden_files - Hidden files are not permitted`

**Fix Applied**:
- Updated `vite.config.ts` to set `copyPublicDir: false` to prevent copying hidden files
- The `.htaccess` file in `/public/` will not be copied to `/dist/` during build

**WordPress Requirement**: WordPress.org plugin directory does not allow hidden files (files starting with a dot like `.htaccess`, `.gitignore`, etc.) in plugin submissions.

**Important Notes**:
- The `.htaccess` file in `/public/` is only for local development/preview
- It will NOT be included in the plugin distribution
- The plugin doesn't require `.htaccess` to function
- Public files like `robots.txt` and `index.html` are also excluded since the WordPress plugin doesn't need them

---

### Error 4: Invalid Network Header
**File**: `pdf-gallery-plugin.php`
**Error**: `plugin_header_invalid_network - The "Network" header in the plugin file is not valid`

**Fix Applied**:
```php
// Before
/**
 * ...
 * Network: false
 */

// After
/**
 * ...
 * (Network header removed)
 */
```

**Explanation**: The `Network` header should only be present and set to `true` for multisite-compatible plugins. Since this plugin doesn't require multisite activation, the header has been removed entirely.

---

### Error 5: Missing License Header
**File**: `pdf-gallery-plugin.php`
**Error**: `plugin_header_no_license - Missing "License" in Plugin Header`

**Fix Applied**:
```php
/**
 * Plugin Name: PDF Gallery
 * Plugin URI: https://kindpixels.com
 * Description: Create visually stunning galleries from PDF, PPT/PPTX, DOC/DOCX, XLS/XLSX, and image files. Easily organize, sort, and showcase your documents in beautiful grid layouts.
 * Version: 1.7.4
 * Author: KIND PIXELS
 * Author URI: https://kindpixels.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: pdf-gallery
 * Requires at least: 5.0
 * Tested up to: 6.4
 */
```

**Added Headers**:
- `License: GPL v2 or later` - Declares GPL compatibility (required by WordPress.org)
- `License URI: https://www.gnu.org/licenses/gpl-2.0.html` - Link to full license text
- `Text Domain: pdf-gallery` - Declares the text domain for translations
- `Author URI: https://kindpixels.com` - Author website URL

**Explanation**: WordPress requires all plugins to declare GPL-compatible licensing. GPL v2 or later is the standard choice for WordPress plugins.

---

## Additional Best Practices Implemented

### 1. Consistent Text Domain
All translatable strings throughout the plugin now use the same text domain: `pdf-gallery`

### 2. Proper Escaping Functions
Use appropriate escaping functions based on context:
- `esc_html__()` - For translating and escaping HTML text
- `esc_attr__()` - For translating and escaping HTML attributes
- `esc_html_e()` - For echoing translated and escaped HTML text
- `esc_attr_e()` - For echoing translated and escaped attributes

### 3. Security Headers
All user-facing output should be escaped to prevent XSS attacks.

---

## Build Process Notes

### For WordPress.org Distribution

When preparing the plugin for WordPress.org submission:

1. **Run Production Build**:
   ```bash
   npm run build
   ```

2. **Verify dist/ Contents**:
   - Ensure no hidden files (`.htaccess`, `.gitignore`, etc.)
   - Check that only necessary files are included
   - Verify file structure matches WordPress standards

3. **Create Distribution Package**:
   ```bash
   # Only include necessary files
   zip -r pdf-gallery.zip pdf-gallery/ -x "*.git*" "*node_modules*" "*src/*" "*.htaccess"
   ```

### Development vs Production

- **Development**: `.htaccess` in `/public/` is fine for local testing
- **Production**: `.htaccess` should not be in the distributed plugin
- **Vite Config**: Automatically excludes hidden files during build

---

## Testing Checklist

Before submitting to WordPress.org:

- [ ] Run Plugin Check (PCP) and ensure all errors are resolved
- [ ] Verify no hidden files in dist/ folder
- [ ] Test plugin installation on fresh WordPress site
- [ ] Verify translations work properly with text domain
- [ ] Check all user-facing strings are translatable
- [ ] Ensure all output is properly escaped
- [ ] Test plugin activation/deactivation
- [ ] Verify license information is correct

---

## Future Maintenance

### When Adding New Translatable Strings

Always use:
```php
esc_html__('Your text here', 'pdf-gallery')
```

Never use:
```php
__('Your text here') // Missing text domain
'Your text here' // Not translatable
```

### When Outputting User Data

Always escape:
```php
echo esc_html($user_input);
echo '<a href="' . esc_url($url) . '">';
echo '<input value="' . esc_attr($value) . '">';
```

---

## Resources

- [WordPress Plugin Handbook](https://developer.wordpress.org/plugins/)
- [WordPress Coding Standards](https://developer.wordpress.org/coding-standards/wordpress-coding-standards/)
- [Plugin Check Tool](https://wordpress.org/plugins/plugin-check/)
- [Internationalization (i18n)](https://developer.wordpress.org/plugins/internationalization/)
- [Data Validation](https://developer.wordpress.org/apis/security/data-validation/)
- [Escaping Output](https://developer.wordpress.org/apis/security/escaping/)

---

## Summary

All WordPress Plugin Check (PCP) errors have been resolved:

✅ Added text domain to all i18n functions
✅ Implemented proper output escaping
✅ Excluded hidden files from distribution
✅ Removed invalid Network header
✅ Added proper License headers

The plugin now complies with WordPress.org plugin directory requirements and is ready for submission.
