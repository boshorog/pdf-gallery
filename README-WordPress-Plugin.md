# Newsletter Gallery WordPress Plugin

This plugin converts your React newsletter gallery into a native WordPress plugin with proper admin authentication.

## Installation Steps

### 1. Build the React App
```bash
npm run build
```

### 2. Create Plugin Directory
In your WordPress installation, create:
```
wp-content/plugins/newsletter-gallery-manager/
```

### 3. Copy Files
Copy these files to the plugin directory:
- `newsletter-gallery-plugin.php` (the main plugin file)
- `dist/` folder (from your build)

Your plugin structure should look like:
```
wp-content/plugins/newsletter-gallery-manager/
├── newsletter-gallery-plugin.php
└── dist/
    ├── index.html
    ├── assets/
    │   ├── index.js
    │   └── index.css
    └── ...
```

### 4. Activate Plugin
1. Go to WordPress Admin → Plugins
2. Find "Newsletter Gallery Manager"
3. Click "Activate"

## Usage

### Admin Management
- Go to WordPress Admin → Tools → Newsletter Gallery
- Only WordPress administrators can access this page
- Full newsletter management capabilities

### Frontend Display
Add this shortcode to any page/post:
```
[newsletter_gallery]
```

For admin-enabled frontend display:
```
[newsletter_gallery show_admin="true"]
```

## Features

✅ **WordPress Native Authentication** - Uses WordPress user roles
✅ **Admin Menu Integration** - Appears in Tools menu
✅ **Shortcode Support** - Easy frontend embedding
✅ **Security** - Nonce verification and capability checks
✅ **Upload Directory Management** - Automatic directory creation

## Configuration

The plugin automatically:
- Creates upload directories
- Handles WordPress authentication
- Provides AJAX endpoints for data management
- Enqueues scripts only where needed

## Development

To modify the React app:
1. Make changes to your React code
2. Run `npm run build`
3. Copy the new `dist` folder to your plugin directory
4. Refresh your WordPress admin page

## Security Notes

- Only users with `manage_options` capability can access admin features
- All AJAX requests are nonce-verified
- Direct file access is prevented
- WordPress sanitization functions are used throughout