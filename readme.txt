=== KindPixels PDF Gallery – Turn Files into Clean Galleries ===
Contributors: kindpixels
Plugin URI: https://kindpixels.com/plugins/pdf-gallery/
Tags: pdf, gallery, showcase, viewer, lightbox
Requires at least: 5.8
Tested up to: 7.0
Stable tag: 2.7.2
Requires PHP: 7.4
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Create beautiful galleries from PDFs (and other files), with customizable layouts, lightbox viewer, and drag-and-drop management.

== Description ==

Display PDF files, Office documents, images, videos, audio files (and even YouTube videos!) in beautiful grid or masonry layouts, with a built-in lightbox viewer. Give PDF Gallery a try!

= Key Features =

* **Create File Galleries** – Turn your files into clean, visual galleries.
* **Built-in Lightbox** – Full-screen document viewer with zoom and navigation.
* **Responsive Design** – Galleries look great on all devices.
* **Thumbnail Styles** – Choose from multiple thumbnail layouts.
* **Advanced Customization** – Fine-tune gallery design and behavior.
* **Section Dividers** – Organize documents into logical sections using dividers and labels.
* **Drag & Drop Ordering** – Reorder documents with simple drag and drop.
* **Shortcode Support** – Embed galleries anywhere on your website using a shortcode.

= Supported File Types =

* PDF documents
* Images (JPG, PNG, GIF, WebP)
* Videos (MP4, YouTube links)
* Audio files (MP3, WAV, OGG)
* Microsoft Office (Word, Excel, PowerPoint)
* Archives (ZIP, RAR, 7Z)
* eBooks (EPUB, MOBI)

= Free vs Pro =

**Free version includes:**
* One gallery with unlimited files
* All display settings and styling options
* Files uploaded one by one

**Pro version adds:**
* Unlimited galleries
* Batch upload for multiple files at once
* File analytics
* Priority support

For a complete comparison, see [the full feature table](https://kindpixels.com/plugins/pdf-gallery#comparison).

== Installation ==

1. In your WordPress dashboard, go to "Plugins → Add New" and search for "KindPixels PDF Gallery" then click "Install Now" and "Activate".
2. Alternatively, upload the `kindpixels-pdf-gallery` folder to the `/wp-content/plugins/` directory via FTP, then activate it from the "Plugins" menu.
3. Go to "PDF Gallery" in your admin menu to create your first gallery.
4. Each gallery has a unique shortcode starting with `[kindpdfg_gallery]` – copy and paste it into any page or post.

== Frequently Asked Questions ==

= How do I display a gallery on my page? =

Each gallery has a unique shortcode that starts with `[kindpdfg_gallery]`. Simply copy the shortcode from the Galleries tab and paste it on any page or post on your website.

= What if I have more questions? =

Once you install the plugin, head over to the Documentation tab where we have an extensive guide covering all features, settings, and customization options.

== Changelog ==

= 2.7.2 =
* Fixed: Update workflow for Pro users.
* Minor stability improvements

= 2.7.1 =
* Improved: Enhancements to the updating process.
* Minor stability improvements

= 2.7.0 =
* New: Gallery toolbar makeover, enhanced with collapsible options panel with live search (shows matching file count), sorting, and normal / compact list view
* Compatibility: Tested with WordPress 7.0
* Minor stability improvements

= 2.6.8 =
* Fix: Lightbox thumbnails no longer overlap with the document content
* Improvements for the update UX
* Other bug fixes

= 2.6.6 =
* Improved: Zoom controls now always visible in lightbox top bar
* Improved: Click-to-zoom now doubles current zoom level instead of fixed 200%
* Minor stability improvements

= 2.6.5 =
* Fix: Keyboard navigation (arrow keys, Page Up/Down) now works immediately in fullscreen mode
* Fix: Analytics summary cards now display correct totals from backend data
* Minor stability improvements

= 2.6.4 =
* New: Fullscreen mode in lightbox with immersive document viewing
* Minor stability improvements

= 2.6.3 =
* New: Redesigned placeholder image settings with side-by-side card selection
* New: Custom placeholder supports drag & drop upload
* New: Engagement notice for active free users encouraging ratings and feedback
* Improved: Token Map hover highlights for grouped elements (titles, subtitles, thumbnails)
* Fix: Transparent background checkbox now properly toggleable

= 2.6.2 =
* New: YouTube uploads via link now include a Subtitle field, auto-populated with channel name
* New: WP Media Library title and description now auto-populate Title and Subtitle fields
* Fix: Enhanced keyboard scrolling inside lightbox
* Fix: Analytics chart correctly aggregates data monthly for 365-day view
* Improved upload form UX with subtitle support across all methods

= 2.6.0 =
* New: Comprehensive Color Settings with preset themes (Default, Dark, Warm, Forest, Ocean)
* New: Interactive Token Map — click any gallery element to edit its color visually
* New: Transparent gallery background option (default for Default preset)
* New: Custom preset — any manual change is saved as a Custom preset
* Fix: Gradient Zoom style now centers both title and subtitle under thumbnail
* Improved color picker alignment and usability

== Additional Information ==

= Using the Shortcode =

Each gallery has a unique shortcode. Simply copy it from the Galleries tab and paste it into any page or post:

`[kindpdfg_gallery id="your-gallery-id"]`

All display settings (columns, styles, animations) are configured in the Settings tab — no shortcode parameters needed.

= Source Code =

The full source code for this plugin is available on GitHub:
https://github.com/boshorog/pdf-gallery

= Support =

For support questions, please visit our support forum or contact us through our website.

= Privacy =

This plugin does not collect any personal data. All documents are stored on your WordPress installation.
