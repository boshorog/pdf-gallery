=== PDF Gallery ===
Contributors: developer
Donate link: https://kindpixels.com/donate
Tags: pdf, gallery, document, viewer, lightbox
Requires at least: 5.8
Tested up to: 6.9
Stable tag: 2.2.8
Requires PHP: 7.4
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Create beautiful, interactive PDF and document galleries with customizable layouts, lightbox viewer, and drag-and-drop management.

== Description ==

PDF Gallery is a powerful WordPress plugin that allows you to create stunning document galleries with ease. Display PDFs, images, and Office documents in beautiful grid, list, or masonry layouts with a built-in lightbox viewer.

= Key Features =

* **Multiple Gallery Support** – Create unlimited galleries for different pages or sections
* **Flexible Layouts** – Choose from Grid, List, or Masonry display styles
* **Built-in Lightbox** – Professional document viewer with zoom and navigation
* **Drag & Drop Ordering** – Easily reorder documents with intuitive drag and drop
* **Section Dividers** – Organize documents into logical sections with customizable dividers
* **Thumbnail Styles** – Multiple thumbnail presentation options (Flat, Shadow, Lifted, Curled, Stacked)
* **Hover Animations** – Engaging animations (Lift, Grow, Tilt, Glow, Float)
* **Responsive Design** – Looks great on all devices and screen sizes
* **Shortcode Support** – Easy embedding with customizable shortcode parameters

= Supported File Types =

* PDF documents
* Images (JPG, PNG, GIF, WebP)
* Microsoft Office (Word, Excel, PowerPoint) – Pro feature

= Pro Features =

* Multi-file drag & drop upload
* Advanced thumbnail generation
* Priority support
* Additional layout options

== Installation ==

1. Upload the `pdf-gallery` folder to the `/wp-content/plugins/` directory
2. Activate the plugin through the 'Plugins' menu in WordPress
3. Go to 'PDF Gallery' in your admin menu to start creating galleries
4. Use the shortcode `[pdf_gallery]` to display your gallery on any page or post

== Frequently Asked Questions ==

= How do I display a gallery on my page? =

Use the shortcode `[pdf_gallery]` on any page or post. You can specify a gallery by name: `[pdf_gallery gallery="my-gallery"]`

= Can I customize the number of columns? =

Yes! Use the columns parameter: `[pdf_gallery columns="4"]`

= What thumbnail styles are available? =

Available styles: flat, shadow, lifted, curled, and stacked. Use: `[pdf_gallery style="shadow"]`

= Can I add hover animations? =

Yes! Available animations: none, lift, grow, tilt, glow, and float. Use: `[pdf_gallery animation="lift"]`

= How do I create section dividers? =

In the admin panel, click "Add Divider" to create section headers that organize your documents into chapters.

= Is the lightbox viewer customizable? =

The lightbox automatically displays documents with zoom controls, navigation, and responsive sizing.

== Screenshots ==

1. Gallery grid view with shadow thumbnails
2. Admin management interface
3. Lightbox document viewer
4. Settings panel with customization options
5. Drag and drop reordering

== Changelog ==

= 2.2.8 =
* Added bottom "Delete X items" bulk-action button in Galleries
* Fixed Masonry (Auto) thumbnails to keep each file's natural aspect ratio

= 2.2.7 =
* CRITICAL FIX: Gallery data now persists correctly on page refresh and plugin updates
* Fixed 15-file limit bypass when adding files from WordPress Media Library
* Improved masonry layout CSS for better column flow
* Removed auto-recreation of Test Gallery - user data is never overwritten

= 2.2.6 =
* Fixed Test Gallery being recreated on plugin updates - now only installs on fresh installs
* Changed "Display document titles and dates" to "Display document titles and subtitles" in settings

= 2.2.5 =
* Implemented true masonry layout with CSS columns for intertwined thumbnails
* Added "Show File Type Badges" gallery display option (on by default)
* Added "Show Titles & Subtitles" gallery display option (on by default)

= 2.2.4 =
* Fixed crown icon placement to appear after "Pro" in all comparison tables
* Added crown icon after "Free vs Pro Comparison" title in Pro tab
* Added Shift+click multi-select for files in gallery management

= 2.2.3 =
* Removed crown icon before "Free vs Pro Comparison" title in Pro tab
* Fixed mandatory thumbnail shape selection (defaults to 3:2 if none selected)
* Changed default accent color to #7FB3DC

= 2.2.2 =
* Removed licensing info banner from Documentation tab (now only in Pro tab)
* Fixed crown icon placement in Free vs Pro comparison tables (now after "Pro")
* Renamed "Multi-File Upload" to "Upload Multiple Files at Once" in comparisons
* Simplified "All Styling Options" to "Many Styling Options"
* Fixed default thumbnail shape selection to always show 3:2 as selected

= 2.2.1 =
* Fixed: Default 3:2 thumbnail shape selection in Settings
* Improved: Added vertical spacing below tab navigation
* Improved: Pro tab now shows licensing info for Pro users
* Improved: Free vs Pro comparison table condensed and moved to better location in docs
* Changed: Crown icon placement in Pro tab (after title)

= 2.2.0 =
* Changed: All settings now available to free users
* Changed: Free version limited to 1 gallery with 15 files (was unlimited)
* Changed: Batch upload now Pro-only (free users upload one file at a time)
* Improved: WordPress.org guideline compliance - no locked UI features
* Updated: Reorganized admin tabs - added dedicated "Pro" tab for upgrades

= 2.1.6 =
* Fixed: Version display consistency across admin UI and plugin header
* Fixed: PDF lightbox click-to-zoom positioning on multi-page documents
* Fixed: Default thumbnail shape selection in Settings

= 2.1.5 =
* Fixed: Additional WordPress plugin check compliance
* Fixed: Nonce verification documentation improvements
* Fixed: Global function naming conventions
* Updated: Compatibility with WordPress 6.9

= 2.1.4 =
* Fixed: WordPress coding standards compliance for file operations
* Fixed: Proper use of WP_Filesystem methods
* Improved: Input sanitization and nonce verification
* Improved: Global function naming conventions

= 2.1.3 =
* Improved: Divider spacing for better visual hierarchy
* Fixed: Various UI refinements

= 2.1.2 =
* Added: Enhanced thumbnail animation options
* Improved: Gallery responsive behavior

= 2.1.1 =
* Added: Section dividers for document organization
* Improved: Drag and drop reliability

= 2.1.0 =
* Added: Multi-gallery support
* Added: Masonry layout option
* Improved: Admin interface redesign

= 2.0.0 =
* Major: Complete rewrite with React-based frontend
* Added: Lightbox document viewer
* Added: Multiple thumbnail styles
* Added: Hover animations

= 1.0.0 =
* Initial release

== Upgrade Notice ==

= 2.2.8 =
Fixes Masonry (Auto) thumbnail aspect ratio and adds a bottom bulk-delete button in Galleries.

= 2.2.7 =
CRITICAL: Fixes data persistence - your galleries are now preserved correctly on page refresh and plugin updates.

= 2.2.6 =
Test Gallery now only installs on fresh installs - your galleries are preserved on plugin updates.

= 2.2.5 =
True masonry layout and new gallery display options for hiding/showing file type badges and titles.

= 2.2.4 =
Crown icon placement fixes and Shift+click multi-select for files.

= 2.2.2 =
UI refinements: Moved licensing info to Pro tab only, fixed crown placement, improved feature naming.

= 2.2.1 =
Minor fixes: Default thumbnail shape, tab spacing, Pro tab improvements.

= 2.2.0 =
Major update: All settings now available to free users. Free version limited to 1 gallery (15 files max) without batch upload.

= 2.1.6 =
Fixes version display consistency, PDF zoom positioning on multi-page docs, and Settings defaults.

= 2.1.5 =
This update includes WordPress 6.9 compatibility and plugin check compliance fixes.

= 2.1.4 =
This update includes WordPress coding standards compliance fixes. Recommended for all users.

= 2.0.0 =
Major update with new features. Please backup before upgrading.

== Additional Information ==

= Shortcode Parameters =

* `gallery` – Gallery name/slug (default: "default")
* `columns` – Number of columns: 1-6 (default: 3)
* `style` – Thumbnail style: flat, shadow, lifted, curled, stacked (default: shadow)
* `animation` – Hover animation: none, lift, grow, tilt, glow, float (default: lift)
* `show_search` – Enable search: true/false (default: true)
* `show_lightbox` – Enable lightbox: true/false (default: true)

= Example Shortcodes =

`[pdf_gallery]` – Display default gallery

`[pdf_gallery gallery="newsletters" columns="4" style="lifted"]` – Custom gallery with 4 columns

`[pdf_gallery animation="glow" show_search="false"]` – Gallery with glow animation, no search

= Support =

For support questions, please visit our support forum or contact us through our website.

= Privacy =

This plugin does not collect any personal data. All documents are stored on your WordPress installation.
