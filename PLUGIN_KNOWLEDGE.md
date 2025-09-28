# PDF Gallery Plugin - Knowledge Base

## Overview
The PDF Gallery Plugin is a comprehensive WordPress solution for creating beautiful, interactive galleries from various document types and images. Version 1.5.3 supports PDF, PPT/PPTX, DOC/DOCX, XLS/XLSX, and image files (JPG, JPEG, PNG, GIF, WEBP).

## Core Features

### Multi-Gallery Management
- Create unlimited galleries with custom names
- Switch between galleries using a dropdown selector
- Each gallery maintains its own set of documents and settings

### File Type Support
- **PDF Files**: Direct PDF rendering and thumbnail generation
- **Microsoft Office**: PPT/PPTX, DOC/DOCX, XLS/XLSX support
- **Images**: JPG, JPEG, PNG, GIF, WEBP files
- Automatic file type detection and appropriate badge display

### Upload System
- **Free Version**: Single file upload with manual URL input option
- **Pro Version**: Multi-file drag & drop upload with batch processing
- Automatic thumbnail generation for all supported file types
- File validation and error handling

### Gallery Display Options
- **Grid Layout**: Responsive card-based display
- **List Layout**: Compact list view
- **Masonry Layout**: Pinterest-style layout
- Multiple thumbnail styles (rounded, squared, shadow effects)
- Animation options (fade, slide, zoom effects)

### Document Organization
- Drag & drop reordering within galleries
- Section dividers for logical grouping
- Bulk selection and deletion
- Individual item editing (title, subtitle, date)

## Technical Architecture

### Frontend Components
- **PDFGallery.tsx**: Main gallery display component
- **PDFAdmin.tsx**: Admin interface for gallery management
- **GallerySelector.tsx**: Gallery switching interface
- **ThumbnailStyleShowcase.tsx**: Style preview component
- **ThumbnailAnimationShowcase.tsx**: Animation preview component

### Backend Integration
- WordPress REST API integration
- Supabase backend for cloud storage and processing
- Edge function for thumbnail generation
- Automatic file type detection and processing

### Data Structure
```typescript
interface PDF {
  id: string;
  title: string;
  date: string;
  pdfUrl: string;
  thumbnail: string;
  fileType: 'pdf' | 'doc' | 'docx' | 'ppt' | 'pptx' | 'xls' | 'xlsx' | 'jpg' | 'jpeg' | 'png' | 'gif' | 'webp';
}

interface Gallery {
  id: string;
  name: string;
  items: (PDF | Divider)[];
  createdAt: string;
}
```

## Configuration Options

### Display Settings
- **Columns**: 1-6 column layouts
- **Thumbnail Style**: Various border and shadow options
- **Animation Effects**: Hover and loading animations
- **Color Schemes**: Multiple predefined themes

### Layout Customization
- Custom CSS class support
- Responsive breakpoint configuration
- Typography and spacing controls
- Mobile-optimized layouts

## Usage Instructions

### For Administrators
1. Navigate to the PDF Gallery admin section
2. Select or create a gallery using the dropdown
3. Upload files using the "Add File(s)" button
4. Organize items with drag & drop
5. Add section dividers for better organization
6. Configure display settings and styles
7. Copy the shortcode for frontend display

### For End Users
1. Use shortcode `[pdf_gallery]` for default gallery
2. Use `[pdf_gallery gallery="gallery_name"]` for specific gallery
3. Gallery displays responsively across all devices
4. Click items to view/download documents
5. Navigate using built-in pagination (if enabled)

## Shortcode Parameters
- `gallery`: Specify gallery name (default: "Main Gallery")
- `columns`: Override column count
- `style`: Override thumbnail style
- `animation`: Override animation effect

## Pro Features
- Multi-file upload and batch processing
- Advanced styling options
- Priority support and updates
- Extended file type support
- Custom branding options

## Troubleshooting

### Common Issues
- **Thumbnail Generation**: Ensure proper server resources for file processing
- **File Upload Limits**: Check PHP upload_max_filesize and post_max_size
- **Display Issues**: Verify theme CSS compatibility
- **Performance**: Optimize images and consider pagination for large galleries

### Browser Compatibility
- Modern browsers with HTML5 support required
- Mobile Safari, Chrome, Firefox, Edge supported
- IE11+ for legacy support (limited functionality)

## Development Notes

### File Structure
- Main plugin file: `pdf-gallery-plugin.php`
- React components in `src/components/`
- Utilities in `src/utils/`
- Types defined in `src/types/`

### Build Process
- Vite-based build system
- TypeScript for type safety
- Tailwind CSS for styling
- React 18 with hooks-based architecture

### API Endpoints
- `/wp-json/pdf-gallery/v1/galleries` - Gallery CRUD operations
- `/wp-json/pdf-gallery/v1/upload` - File upload handling
- `/wp-json/pdf-gallery/v1/settings` - Plugin configuration

## Version History
- **1.5.3**: Updated file support text, improved UI polish
- **1.5.2**: Enhanced gallery restoration, improved upload flow
- **1.5.1**: Added multi-gallery support, improved admin interface
- **1.5.0**: Major UI overhaul, Pro version features
- **1.0.0**: Initial release with basic PDF gallery functionality

## Support and Documentation
- Plugin documentation available in WordPress admin
- Community support through WordPress forums
- Pro users receive priority email support
- GitHub repository for bug reports and feature requests