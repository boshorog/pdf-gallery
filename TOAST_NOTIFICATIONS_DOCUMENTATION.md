# PDF Gallery - Toast Notifications Documentation

This document provides a comprehensive reference for all toast notifications used throughout the PDF Gallery plugin, including their context, message content, and purpose.

## Table of Contents
1. [Success Notifications](#success-notifications)
2. [Error Notifications](#error-notifications)
3. [Informational Notifications](#informational-notifications)
4. [License & Pro Feature Notifications](#license--pro-feature-notifications)

---

## Success Notifications

### Document Management

#### Document Added/Updated
- **Title**: "Added" / "Updated"
- **Description**: "Document [added/updated] successfully"
- **Context**: Triggered when a document is successfully added or updated in the gallery
- **File**: `src/components/PDFAdmin.tsx`

#### Document Deleted
- **Title**: "Deleted"
- **Description**: "Item deleted successfully"
- **Context**: Triggered when a single document is deleted from the gallery
- **File**: `src/components/PDFAdmin.tsx`

#### Multiple Documents Deleted
- **Title**: "Deleted"
- **Description**: "{count} item{s} deleted successfully"
- **Context**: Triggered when multiple selected documents are deleted
- **File**: `src/components/PDFAdmin.tsx`

#### Document Reordered
- **Title**: "Reordered"
- **Description**: "Items have been reordered successfully"
- **Context**: Triggered when documents are successfully reordered via drag-and-drop
- **File**: `src/components/PDFAdmin.tsx`

### Divider Management

#### Divider Added/Updated
- **Title**: "Added" / "Updated"
- **Description**: "Divider [added/updated] successfully"
- **Context**: Triggered when a divider section is successfully added or updated
- **File**: `src/components/PDFAdmin.tsx`

### File Upload

#### Single File Upload Success
- **Title**: "Success"
- **Description**: "File uploaded successfully"
- **Context**: Triggered when a single file is successfully uploaded to WordPress
- **File**: `src/components/PDFAdmin.tsx`

#### Bulk Upload Success
- **Title**: "Uploaded"
- **Description**: "{count} file{s} uploaded and added to gallery"
- **Context**: Triggered when multiple files are successfully uploaded (Pro feature)
- **File**: `src/components/PDFAdmin.tsx`, `src/components/AddDocumentModal.tsx`

#### File Selected (Development)
- **Title**: "File Selected"
- **Description**: "File loaded for development preview"
- **Context**: Triggered in development mode when a file is selected for preview
- **File**: `src/components/PDFAdmin.tsx`

### Thumbnail Management

#### Thumbnail Refreshed
- **Title**: "Refreshed"
- **Description**: "Thumbnail cache cleared"
- **Context**: Triggered when a thumbnail cache is manually refreshed
- **File**: `src/components/PDFAdmin.tsx`

### Gallery Management

#### Gallery Created
- **Title**: "Success"
- **Description**: "Gallery created successfully"
- **Context**: Triggered when a new gallery is successfully created
- **File**: `src/components/GallerySelector.tsx`

#### Gallery Renamed
- **Title**: "Success"
- **Description**: "Gallery renamed successfully"
- **Context**: Triggered when a gallery is successfully renamed
- **File**: `src/components/GallerySelector.tsx`

#### Gallery Deleted
- **Title**: "Success"
- **Description**: "Gallery deleted successfully"
- **Context**: Triggered when a gallery is successfully deleted
- **File**: `src/components/GallerySelector.tsx`

### Settings

#### Settings Saved
- **Title**: "Settings saved"
- **Description**: "Your settings have been saved successfully"
- **Context**: Triggered when gallery settings are saved to WordPress
- **File**: `src/components/PDFSettings.tsx`, `src/components/SettingsProposal*.tsx`

### Shortcode

#### Shortcode Copied
- **Title**: "Copied!"
- **Description**: "Shortcode copied to clipboard"
- **Context**: Triggered when the gallery shortcode is successfully copied
- **File**: `src/components/PDFAdmin.tsx`

### License Activation

#### Pro License Activated
- **Title**: "Pro Activated!"
- **Description**: "Your Pro license is now active. Reloading..."
- **Context**: Triggered when a Pro license key is successfully activated
- **File**: `src/components/ProBanner.tsx`

---

## Error Notifications

### Document Management

#### Missing Required Fields
- **Title**: "Error"
- **Description**: "Title and URL are required"
- **Context**: Triggered when attempting to add a document without required fields
- **Variant**: Destructive (red)
- **File**: `src/components/PDFAdmin.tsx`

#### Document Save Failed
- **Title**: "Error"
- **Description**: "Failed to save the document"
- **Context**: Triggered when WordPress save operation fails for a document
- **Variant**: Destructive (red)
- **File**: `src/components/PDFAdmin.tsx`

#### Document Delete Failed
- **Title**: "Error"
- **Description**: "Failed to delete the item"
- **Context**: Triggered when WordPress delete operation fails
- **Variant**: Destructive (red)
- **File**: `src/components/PDFAdmin.tsx`

#### Bulk Delete Failed
- **Title**: "Error"
- **Description**: "Failed to delete the selected items"
- **Context**: Triggered when bulk delete operation fails
- **Variant**: Destructive (red)
- **File**: `src/components/PDFAdmin.tsx`

#### Reorder Failed
- **Title**: "Error"
- **Description**: "Failed to save the new order"
- **Context**: Triggered when drag-and-drop reordering save fails
- **Variant**: Destructive (red)
- **File**: `src/components/PDFAdmin.tsx`

### Divider Management

#### Missing Divider Text
- **Title**: "Error"
- **Description**: "Divider text is required"
- **Context**: Triggered when attempting to add a divider without text
- **Variant**: Destructive (red)
- **File**: `src/components/PDFAdmin.tsx`

#### Divider Save Failed
- **Title**: "Error"
- **Description**: "Failed to save the divider"
- **Context**: Triggered when WordPress save operation fails for a divider
- **Variant**: Destructive (red)
- **File**: `src/components/PDFAdmin.tsx`

### File Upload

#### Upload Failed
- **Title**: "Upload failed"
- **Description**: Error message from server or "Failed to upload file"
- **Context**: Triggered when file upload to WordPress fails
- **Variant**: Destructive (red)
- **File**: `src/components/PDFAdmin.tsx`

#### Multiple Upload Failure
- **Title**: "Error"
- **Description**: "Failed to upload one or more files"
- **Context**: Triggered when one or more files fail during bulk upload
- **Variant**: Destructive (red)
- **File**: `src/components/PDFAdmin.tsx`, `src/components/AddDocumentModal.tsx`

### Thumbnail Management

#### Thumbnail Refresh Failed
- **Title**: "Error"
- **Description**: "Failed to refresh thumbnail"
- **Context**: Triggered when thumbnail refresh operation fails
- **Variant**: Destructive (red)
- **File**: `src/components/PDFAdmin.tsx`

### Gallery Management

#### Missing Gallery Name
- **Title**: "Error"
- **Description**: "Gallery name is required"
- **Context**: Triggered when creating/renaming a gallery without a name
- **Variant**: Destructive (red)
- **File**: `src/components/GallerySelector.tsx`

#### Duplicate Gallery Name
- **Title**: "Error"
- **Description**: "A gallery with this name already exists"
- **Context**: Triggered when attempting to create/rename a gallery with an existing name
- **Variant**: Destructive (red)
- **File**: `src/components/GallerySelector.tsx`

#### Cannot Delete Last Gallery
- **Title**: "Error"
- **Description**: "Cannot delete the last gallery"
- **Context**: Triggered when attempting to delete the only remaining gallery
- **Variant**: Destructive (red)
- **File**: `src/components/GallerySelector.tsx`

### Settings

#### Settings Save Failed
- **Title**: "Error"
- **Description**: "Failed to save settings"
- **Context**: Triggered when settings save to WordPress fails
- **Variant**: Destructive (red)
- **File**: `src/components/PDFSettings.tsx`, `src/components/SettingsProposal*.tsx`

### Shortcode

#### Copy Failed
- **Title**: "Copy failed"
- **Description**: "Please copy the shortcode manually"
- **Context**: Triggered when clipboard copy operation fails
- **Variant**: Destructive (red)
- **File**: `src/components/PDFAdmin.tsx`

### License Activation

#### Missing License Key
- **Title**: "License Key Required"
- **Description**: "Please enter your license key to activate Pro features"
- **Context**: Triggered when attempting to activate without entering a license key
- **Variant**: Destructive (red)
- **File**: `src/components/ProBanner.tsx`

#### License Activation Failed
- **Title**: "License Activation Failed"
- **Description**: "The license key you entered is invalid or has already been used. Please check your key and try again."
- **Context**: Triggered when license activation fails (invalid key, already used, etc.)
- **Variant**: Destructive (red)
- **File**: `src/components/ProBanner.tsx`

#### Connection Error
- **Title**: "Connection Error"
- **Description**: "Unable to connect to the licensing server. Please refresh the page and try again."
- **Context**: Triggered when the licensing endpoint is unavailable (missing AJAX URL or nonce)
- **Variant**: Destructive (red)
- **File**: `src/components/ProBanner.tsx`

#### Network Error
- **Title**: "Connection Failed"
- **Description**: Error message or "Unable to reach the licensing server. Please check your internet connection and try again."
- **Context**: Triggered when a network error occurs during license activation
- **Variant**: Destructive (red)
- **File**: `src/components/ProBanner.tsx`

---

## Informational Notifications

### Galleries Loading
- **Title**: "Please wait"
- **Description**: "Galleries are loading. Try again in a moment."
- **Context**: Triggered when attempting actions before galleries have finished loading
- **File**: `src/components/PDFAdmin.tsx`

### Settings Saved Locally (Fallback)
- **Title**: "Saved locally"
- **Description**: "Could not reach WordPress AJAX."
- **Context**: Triggered when settings are saved to localStorage because WordPress is unavailable (development mode)
- **File**: `src/components/PDFSettings.tsx`, `src/components/SettingsProposal*.tsx`

---

## License & Pro Feature Notifications

### Bulk Upload Restriction
- **Title**: "Pro Feature Required"
- **Description**: "Multiple file uploads require a Pro license. Please upload one file at a time, or upgrade to Pro for bulk uploads."
- **Context**: Triggered when free users attempt to upload multiple files at once
- **Variant**: Destructive (red)
- **File**: `src/components/PDFAdmin.tsx`, `src/components/AddDocumentModal.tsx`

### Multiple Galleries Restriction
- **Title**: "Pro Feature Required"
- **Description**: "The free version supports one gallery. Upgrade to Pro to create unlimited galleries."
- **Context**: Triggered when free users attempt to create a second gallery
- **Variant**: Destructive (red)
- **File**: `src/components/GallerySelector.tsx`

---

## Implementation Notes

### Toast Variants
The plugin uses two toast variants:
- **Default**: Success and informational messages (blue/primary color)
- **Destructive**: Error and warning messages (red color)

### Toast Structure
All toasts follow this structure:
```typescript
toast({
  title: "Short Title",
  description: "Detailed message explaining the action or error",
  variant: "destructive" // Optional: only for errors/warnings
});
```

### User-Friendly Guidelines

When creating new toast notifications:

1. **Avoid Technical Jargon**: Use plain language that non-technical users can understand
2. **Be Specific**: Clearly explain what happened and what the user should do
3. **Avoid Internal Names**: Don't mention technical terms like "Freemius", "AJAX", "nonce", etc.
4. **Provide Actionable Steps**: Tell users what they need to do to resolve errors
5. **Use Consistent Terminology**: Maintain consistency with existing notifications

### Examples of User-Friendly vs Technical Messages

❌ **Technical**: "Freemius activation failed: invalid nonce"
✅ **User-Friendly**: "Unable to connect to the licensing server. Please refresh the page and try again."

❌ **Technical**: "AJAX endpoint returned 500"
✅ **User-Friendly**: "Unable to save settings. Please try again or contact support."

❌ **Technical**: "fsIsPro check failed"
✅ **User-Friendly**: "Pro feature required. Please upgrade to access this feature."

---

## Changelog

### Version 1.7.4
- Improved error messages for license activation to be more user-friendly
- Removed technical jargon (Freemius, nonce, AJAX) from user-facing messages
- Enhanced bulk upload restriction messages for clarity
- Updated gallery creation restriction messages
- Added this comprehensive documentation file
