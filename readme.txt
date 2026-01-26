=== KindPixels PDF Gallery ===
Contributors: kindpixels
Donate link: https://kindpixels.com/donate
Tags: pdf, gallery, document, viewer, lightbox
Requires at least: 5.8
Tested up to: 6.9
Stable tag: 2.4.0
Requires PHP: 7.4
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Create beautiful, interactive PDF and document galleries with customizable layouts, lightbox viewer, and drag-and-drop management.

== Description ==

KindPixels PDF Gallery is a powerful WordPress plugin that allows you to create stunning document galleries with ease. Display PDFs, images, videos, audio files, and Office documents in beautiful grid, list, or masonry layouts with a built-in lightbox viewer.

= Key Features =

* **Multiple Gallery Support** – Create unlimited galleries for different pages or sections (Pro: unlimited, Free: 1 gallery with up to 15 files)
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
* Videos (MP4, WebM, YouTube)
* Audio files (MP3, WAV, OGG)
* Microsoft Office (Word, Excel, PowerPoint)
* Archives (ZIP, RAR, 7Z)
* eBooks (EPUB, MOBI)

= Free vs Pro =

**Free version includes:**
* 1 gallery with up to 15 files
* All display settings and styling options
* Single file upload

**Pro version adds:**
* Unlimited galleries and files
* Multi-file drag & drop upload
* Priority support

== Installation ==

1. Upload the `kindpixels-pdf-gallery` folder to the `/wp-content/plugins/` directory
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

= 2.4.0 =
* Simplified to single-plugin architecture (no separate Pro addon)
* Freemius SDK integration for license management
* All PHP functions, classes, and hooks properly prefixed with kindpdfg_
* PDF.js workers bundled locally (no remote file loading)
* All file operations confined to /wp-content/uploads/kindpixels-pdf-gallery/

= 2.3.8 =
* WordPress.org compliance: Renamed JavaScript global from wpPDFGallery to kindpdfgData
* WordPress.org compliance: All DOM IDs and CSS classes prefixed with kindpdfg
* WordPress.org compliance: All localStorage keys prefixed with kindpdfg_
* WordPress.org compliance: All postMessage types prefixed with kindpdfg:
* Shortcode is now [kindpdfg_gallery] (legacy [pdf_gallery] removed)

= 2.3.7 =
* WordPress.org compliance: All PHP functions, classes, constants, options, and AJAX actions prefixed with kindpdfg_
* WordPress.org compliance: All remote file loading eliminated (PDF.js workers bundled locally)
* WordPress.org compliance: Removed external developer images from meta tags
* WordPress.org compliance: All file operations confined to /wp-content/uploads/kindpixels-pdf-gallery/
* Updated React code to use new kindpdfg_action AJAX handler
* Fixed blank page issue after activation caused by syntax error

= 2.3.6 =
* Renamed plugin to "KindPixels PDF Gallery" for WordPress.org directory compliance
* Updated plugin slug to "kindpixels-pdf-gallery"
* Updated text domain to "kindpixels-pdf-gallery"
* Updated all internal references and URLs

= 2.3.5 =
* Added is_org_compliant flag for WordPress.org Freemius compliance

= 2.3.4 =
* Updated Plugin URI to https://kindpixels.com/plugins/pdf-gallery/
* Updated Free/Pro feature descriptions to reflect current functionality
* Clarified supported file types including video and audio

= 2.3.3 =
* Simplified upload text - file types now summarized as "Office files" instead of listing each extension
* Added documentation note about responsive thumbnail behavior (1 column on mobile, 2 on tablet)

= 2.3.2 =
* Fixed YouTube video detection when editing files - now properly sets fileType to "youtube" and auto-fetches title/thumbnail
* Updated inline edit form labels: "Edit Document" → "Edit File", "Document URL" → "File URL", "Document Title" → "File Title"
* YouTube videos now correctly display VID badge in admin and frontend

= 2.3.1 =
* Fixed YouTube video support - thumbnails, lightbox playback, and gallery display now work correctly
* YouTube videos display "VID" badge in both admin list and frontend gallery
* Auto-fetches YouTube video title when pasting a YouTube URL
* Fixed labels: "Edit Document" → "Edit File", "Document URL" → "File URL"

= 2.3.0 =
* Added YouTube video support in galleries - paste YouTube URLs when editing files
* Supports youtube.com/watch and youtu.be URL formats with auto-thumbnail from YouTube
* Renamed "Edit Document" to "Edit File" and "Document URL" to "File URL" for broader file type support
* YouTube videos play in embedded player within the lightbox

= 2.2.17 =
* Multi-drag now shows all selected items moving together as a visual stack
* Selected items automatically gather together when starting a multi-drag
* Removed visual clutter (selection ring, count badge) - cleaner look

= 2.2.16 =
* Added multi-select drag: select multiple items and drag them all together to reorder
* Visual indicator shows count of selected items on drag handle

= 2.2.15 =
* Fixed divider title background now transparent in iframe galleries

= 2.2.14 =
* Gallery iframe background is now transparent for seamless theme integration

= 2.2.13 =
* Fixed video files showing "PDF" badge during upload and in gallery - now shows correct file type (VID, AVI, etc.)
* Files larger than 10MB now use chunked upload for better reliability
* Added video thumbnail generation from first frame (no more infinite loading animation)
* Improved video player in lightbox with buffering support and poster image from first frame

= 2.2.12 =
* Fixed file browser filter to show video files by default (added video/* and audio/* MIME types)
* Fixed file type badge showing correct extension (first 3 chars) during upload
* Fixed file icon and badge size to match gallery items (w-12 h-12 with min-w-[24px] badge)
* Expanded PHP allowed MIME types to support more video/audio formats (AVI, MKV, FLV, WMV, M4V, FLAC, AAC, etc.)

= 2.2.11 =
* Added media library browse button to Thumbnail URL field when adding/editing files

= 2.2.10 =
* Refined test gallery logic: adds test gallery only on fresh install or when exactly one empty gallery exists
* Replaces single empty gallery (any name) with the default Test Gallery

= 2.2.9 =
* Improved test gallery seeding: only creates test gallery on fresh install OR when all galleries are empty
* Updated Getting Started documentation with chapter-style sections and full file type support (video, audio, etc.)

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

= 2.4.0 =
Single-plugin architecture with Freemius license management. All remote dependencies bundled locally.

= 2.3.8 =
Full WordPress.org naming compliance. Shortcode changed to [kindpdfg_gallery].

= 2.3.7 =
All PHP functions and globals now prefixed with kindpdfg_ for WordPress.org compliance. Fixes blank page on activation.

= 2.3.6 =
Plugin renamed to "KindPixels PDF Gallery" for WordPress.org directory compliance. All functionality remains the same.

= 2.2.14 =
Gallery iframe background is now transparent for seamless theme integration.

= 2.2.13 =
Video files now show correct badges, use chunked upload for large files, generate thumbnails from first frame, and play reliably in lightbox.

= 2.2.12 =
File uploader now shows all video/audio files in browser, displays correct file type badge, and icon sizes match gallery items.

= 2.2.11 =
Browse button added to Thumbnail URL field opens WordPress Media Library for easy thumbnail selection.

= 2.2.10 =
Clearer test gallery seeding: only on fresh install or when a single empty gallery exists.

= 2.2.9 =
Smarter test gallery seeding and updated documentation with full file type support.

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
