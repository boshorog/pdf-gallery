# Pro Banner + Freemius Integration Guide

This guide documents the complete Pro Banner implementation with Freemius SDK integration for WordPress plugins. Use this as a reference for implementing Pro banners in other plugins.

## Overview

The Pro Banner system provides:
- Automatic detection of free vs. pro licenses via Freemius SDK
- Conditional banner visibility based on license status
- License key activation directly from the banner
- WordPress integration with AJAX endpoints
- Graceful fallback when Freemius SDK is unavailable

## File Structure

### Core Components

1. **ProBanner.tsx** - Main banner component
   - Located: `src/components/ProBanner.tsx`
   - Displays upgrade prompt with features and license activation

2. **useLicense.ts** - License status hook
   - Located: `src/hooks/useLicense.ts`
   - Checks license status from Freemius globals and remote WordPress endpoints

3. **WordPress Plugin File** - Backend integration
   - Located: `pdf-gallery-plugin.php`
   - Handles Freemius initialization, AJAX endpoints, and global variables

## How It Works

### 1. Freemius SDK Detection

The system checks for Freemius availability in multiple ways:

```typescript
// In useLicense.ts
const fsAvailable = !!(
  (window as any).pdfgallery_fs || 
  (window as any).Freemius?.plugins?.['pdf-gallery']
);
```

### 2. License Status Resolution

Priority order for license status:
1. **Global WordPress variables** (`window.wpPDFGallery`)
2. **Freemius global function** (`window.pdfgallery_fs()`)
3. **Remote AJAX check** (fallback via WordPress REST API)

```typescript
// Check global variables first
const getWPGlobal = () => {
  const wp = (window as any).wpPDFGallery;
  if (wp?.license_status) {
    return { 
      isPro: wp.license_status === 'pro', 
      status: wp.license_status 
    };
  }
  return null;
};

// Fallback to remote check
const doRemoteCheck = async () => {
  const response = await fetch(ajaxUrl, {
    method: 'POST',
    body: formData
  });
  // Parse response and update license state
};
```

### 3. Banner Visibility Logic

**ProBanner component determines visibility based on:**

```typescript
// Always render the banner, let internal logic handle visibility
<ProBanner className="mb-6" />

// Inside ProBanner.tsx:
// Hide banner if user already has Pro/Trial
if (license.isPro || license.status === 'trial') {
  return null;
}

// Check WordPress admin context
const isAdmin = !!(window as any).wpPDFGallery?.isAdmin;
const fsAvailable = !!(window as any).pdfgallery_fs;

// Only show in admin context with Freemius available
if (!isAdmin || !fsAvailable) return null;

// Hide if explicitly suppressed
if (hideParam === 'true' || lsSuppress === 'true') return null;
```

### 4. License Activation

Users can activate Pro licenses directly from the banner:

```typescript
const handleActivateLicense = async () => {
  const formData = new FormData();
  formData.append('action', 'pdf_gallery_activate_license');
  formData.append('license_key', licenseKey);
  formData.append('nonce', nonce);
  
  const response = await fetch(ajaxUrl, {
    method: 'POST',
    body: formData
  });
  
  // Show success/error toast and refresh page
};
```

## WordPress Backend Integration

### Freemius SDK Initialization

```php
// In pdf-gallery-plugin.php
if (!function_exists('pdfgallery_fs')) {
    function pdfgallery_fs() {
        global $pdfgallery_fs;
        
        $pdfgallery_fs = fs_dynamic_init(array(
            'id'           => '20814',
            'slug'         => 'pdf-gallery',
            'premium_slug' => 'pdf-gallery-pro',
            'public_key'   => 'pk_xxxxx',
            'is_premium'   => false,
            'has_paid_plans' => true,
            // ... other config
        ));
        
        return $pdfgallery_fs;
    }
    
    pdfgallery_fs();
}
```

### Global Variables for React

```php
wp_localize_script('pdf-gallery-script', 'wpPDFGallery', array(
    'ajaxUrl' => admin_url('admin-ajax.php'),
    'nonce' => wp_create_nonce('pdf_gallery_nonce'),
    'isAdmin' => current_user_can('manage_options'),
    'license_status' => $this->get_license_status(),
    'license_expiry' => $this->get_license_expiry(),
));
```

### AJAX Endpoints

```php
// License status check
add_action('wp_ajax_pdf_gallery_check_license', array($this, 'ajax_check_license'));

function ajax_check_license() {
    check_ajax_referer('pdf_gallery_nonce', 'nonce');
    
    $status = 'free';
    if (function_exists('pdfgallery_fs')) {
        $fs = pdfgallery_fs();
        if ($fs->is_premium() || $fs->is_trial()) {
            $status = 'pro';
        }
    }
    
    wp_send_json_success(array(
        'license_status' => $status,
        'is_pro' => $status === 'pro'
    ));
}

// License activation
add_action('wp_ajax_pdf_gallery_activate_license', array($this, 'ajax_activate_license'));

function ajax_activate_license() {
    check_ajax_referer('pdf_gallery_nonce', 'nonce');
    
    $license_key = sanitize_text_field($_POST['license_key']);
    
    if (function_exists('pdfgallery_fs')) {
        $fs = pdfgallery_fs();
        $result = $fs->activate_license($license_key);
        
        if ($result) {
            wp_send_json_success(array('message' => 'License activated'));
        } else {
            wp_send_json_error(array('message' => 'Activation failed'));
        }
    }
}
```

## Implementation Checklist

When implementing this in a new plugin:

### Frontend (React)
- [ ] Create `ProBanner.tsx` component with upgrade UI
- [ ] Create `useLicense.ts` hook for license status
- [ ] Add conditional rendering in settings page
- [ ] Implement license activation form with AJAX
- [ ] Handle toast notifications for success/error
- [ ] Add "Get Pro" button linking to checkout
- [ ] Display Pro features list

### Backend (WordPress)
- [ ] Install and initialize Freemius SDK
- [ ] Create AJAX endpoint for license status check
- [ ] Create AJAX endpoint for license activation
- [ ] Localize script with license data and globals
- [ ] Add nonce verification to all AJAX handlers
- [ ] Implement `get_license_status()` helper function
- [ ] Pass `isAdmin` flag to React app

### Testing
- [ ] Test banner visibility in free version
- [ ] Test banner hidden in pro version
- [ ] Test license activation flow
- [ ] Test fallback when Freemius unavailable
- [ ] Test AJAX error handling
- [ ] Test nonce verification
- [ ] Test on WordPress admin and frontend

## Key Points to Remember

1. **Always render ProBanner** - Let the component's internal logic handle visibility
2. **Check license status early** - Use global variables before remote checks
3. **Graceful degradation** - Handle missing Freemius SDK elegantly
4. **Security first** - Always verify nonces on AJAX requests
5. **User feedback** - Show toasts for all license operations
6. **Refresh after activation** - Page reload ensures updated state

## Common Issues & Solutions

### Banner not showing in free version
- Check `isAdmin` flag is true
- Verify Freemius SDK is loaded
- Ensure no URL parameters hiding banner (`?hideprobanner=true`)
- Check localStorage doesn't have `suppressProBanner=true`

### Banner showing in pro version
- Verify Freemius `is_premium()` returns true
- Check license status in global variables
- Ensure `useLicense` hook receives correct status

### License activation fails
- Verify AJAX URL is correct
- Check nonce is valid
- Ensure Freemius SDK is initialized
- Check network tab for error responses

## URLs & External Resources

- **Freemius SDK Documentation**: https://freemius.com/help/documentation/
- **WordPress AJAX Guide**: https://codex.wordpress.org/AJAX_in_Plugins
- **React + WordPress Integration**: https://developer.wordpress.org/block-editor/

---

**Last Updated**: Based on PDF Gallery Plugin v1.7.2
**Compatible Freemius Version**: 2.5.x+
