// Gallery types for multi-gallery functionality

export interface PDF {
  id: string;
  title: string;
  date: string;
  pdfUrl: string;
  thumbnail: string;
  fileType?: 'pdf' | 'doc' | 'docx' | 'ppt' | 'pptx' | 'xls' | 'xlsx' | 'jpg' | 'jpeg' | 'png' | 'gif' | 'webp';
}

export interface Divider {
  id: string;
  type: 'divider';
  text: string;
}

export type GalleryItem = PDF | Divider;

export interface Gallery {
  id: string;
  name: string;
  items: GalleryItem[];
  createdAt: string;
}

export interface GalleryState {
  galleries: Gallery[];
  currentGalleryId: string;
}