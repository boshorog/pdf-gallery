import { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Upload, Trash2, Edit, Eye, GripVertical, FileText, Minus, RefreshCw, Copy, Check, FileType, Presentation, Image, X, Star, Maximize2, FolderOpen, ChevronDown, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useLicense } from '@/hooks/useLicense';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import PDFGallery from './PDFGallery';
import { PDFThumbnailGenerator } from '@/utils/pdfThumbnailGenerator';
import { GallerySelector } from './GallerySelector';
import { Gallery, GalleryItem, PDF, Divider } from '@/types/gallery';

interface PDFAdminProps {
  galleries: Gallery[];
  currentGalleryId: string;
  onGalleriesChange: (galleries: Gallery[]) => void;
  onCurrentGalleryChange: (galleryId: string) => void;
}

interface SortableItemProps {
  item: GalleryItem;
  onEdit: (item: GalleryItem) => void;
  onDelete: (id: string) => void;
  onRefresh: (item: GalleryItem) => void;
  isSelected: boolean;
  onSelect: (id: string, selected: boolean, shiftKey: boolean) => void;
  isDragOverlay?: boolean;
  hideActions?: boolean;
}

// Helper to render item content (divider vs file)
const renderItemContent = (item: GalleryItem) => {
  if ('type' in item && item.type === 'divider') {
    return (
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-muted rounded flex items-center justify-center flex-shrink-0">
          <Minus className="w-6 h-6 text-muted-foreground" />
        </div>
        <div className="ml-2.5">
          <h3 className="text-sm font-semibold">Divider: {item.text}</h3>
          <p className="text-xs text-muted-foreground">Section divider</p>
        </div>
      </div>
    );
  }
  
  const pdfItem = item as PDF;
  
  // Helper to detect YouTube URLs
  const isYouTubeUrl = (url: string): boolean => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    ];
    return patterns.some(pattern => pattern.test(url));
  };
  
  let fileType = pdfItem.fileType?.toLowerCase();
  if (!fileType) {
    const url = pdfItem.pdfUrl || '';
    // Check for YouTube URL first
    if (isYouTubeUrl(url)) {
      fileType = 'youtube';
    } else {
      const itemTitle = pdfItem.title || '';
      let extension = url.split('.').pop()?.toLowerCase();
      const validExts = ['pdf','doc','docx','ppt','pptx','xls','xlsx','jpg','jpeg','png','gif','webp','odt','ods','odp','rtf','txt','csv','svg','ico','zip','rar','7z','epub','mobi','mp3','wav','ogg','mp4','mov','webm'];
      if (!extension || !validExts.includes(extension)) {
        extension = itemTitle.split('.').pop()?.toLowerCase();
      }
      fileType = (extension && validExts.includes(extension)) ? extension : 'pdf';
    }
  }
  const isImage = ['img','jpg','jpeg','png','gif','webp','svg','ico'].includes(fileType || '');
  const isYouTube = fileType === 'youtube';
  const isVideo = ['mp4','mov','webm','avi','mkv'].includes(fileType || '') || isYouTube;
  // Use "VID" for YouTube and video files, otherwise first 3 chars of extension
  const label = isYouTube || isVideo ? 'VID' : (fileType || 'pdf').toUpperCase().slice(0, 3);
  
  return (
    <div className="flex items-center space-x-3">
      <div className="relative">
        <div className="w-12 h-12 bg-muted rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
          {isImage ? (
            <img 
              src={pdfItem.pdfUrl} 
              alt={pdfItem.title} 
              className="w-full h-full object-cover"
            />
          ) : (
            <FileText className="w-6 h-6 text-muted-foreground" />
          )}
        </div>
        <div className="absolute -top-1 -right-1 min-w-[24px] px-1 py-0.5 rounded text-[9px] font-medium bg-primary text-primary-foreground text-center z-10">
          {label}
        </div>
      </div>
      <div className="ml-2.5">
        <h3 className="text-sm font-semibold">{pdfItem.title}</h3>
        <p className="text-xs text-muted-foreground">{pdfItem.date}</p>
      </div>
    </div>
  );
};

const SortableItem = ({ item, onEdit, onDelete, onRefresh, isSelected, onSelect, isDragOverlay, hideActions }: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  // Static item for drag overlay (no sortable hooks needed)
  if (isDragOverlay) {
    return (
      <Card className="bg-background shadow-lg mb-1">
        <CardContent className="flex items-center justify-between px-2 pl-3 py-3">
          <div className="flex items-center space-x-3 ml-2.5">
            <Checkbox className="mt-0" checked={true} disabled aria-label="Select item" />
            <div className="w-10 flex items-center justify-center cursor-grabbing h-10">
              <div aria-hidden="true" className="grid grid-cols-3 gap-x-0.5 gap-y-1">
                {Array.from({ length: 9 }).map((_, i) => (
                  <span key={i} className="w-1 h-1 rounded-full bg-muted-foreground/70 block" />
                ))}
              </div>
            </div>
            {renderItemContent(item)}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card ref={setNodeRef} style={style} className="bg-background">
      <CardContent className="flex items-center justify-between px-2 pl-3 py-3">
        <div className="flex items-center space-x-3 ml-2.5">
          <Checkbox className="mt-0" 
            checked={isSelected}
            onCheckedChange={(checked) => onSelect(item.id, !!checked, false)}
            onClick={(e) => {
              if (e.shiftKey) {
                e.preventDefault();
                onSelect(item.id, !isSelected, true);
              }
            }}
            aria-label="Select item"
          />
          <div
            {...attributes}
            {...listeners}
            className="w-10 flex items-center justify-center cursor-grab hover:cursor-grabbing h-10"
            title="Drag to reorder"
            aria-label="Drag handle"
          >
            <div aria-hidden="true" className="grid grid-cols-3 gap-x-0.5 gap-y-1">
              {Array.from({ length: 9 }).map((_, i) => (
                <span key={i} className="w-1 h-1 rounded-full bg-muted-foreground/70 block" />
              ))}
            </div>
          </div>
          {renderItemContent(item)}
        </div>

        {!hideActions && (
          <div className="flex items-center space-x-2">
            {!('type' in item && item.type === 'divider') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open((item as PDF).pdfUrl, '_blank')}
                title="View document"
              >
                <Eye className="w-4 h-4" />
              </Button>
            )}
            
            {!('type' in item && item.type === 'divider') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRefresh(item)}
                title="Refresh thumbnail"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onEdit(item);
                setTimeout(() => {
                  const editSection = document.querySelector('.edit-section');
                  if (editSection) editSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  else window.scrollTo({ top: 0, behavior: 'smooth' });
                }, 50);
              }}
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(item.id)}
              title="Delete"
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const PDFAdmin = ({ galleries, currentGalleryId, onGalleriesChange, onCurrentGalleryChange }: PDFAdminProps) => {
  const currentGallery = galleries.find(g => g.id === currentGalleryId);
  const items = currentGallery?.items || [];

  // Ensure a default gallery is selected when none is set
  useEffect(() => {
    if (!currentGalleryId && galleries.length > 0) {
      onCurrentGalleryChange(galleries[0].id);
    }
  }, [currentGalleryId, galleries, onCurrentGalleryChange]);
  
  const [activeTab, setActiveTab] = useState<'management' | 'preview'>('management');
  const [isAddingDocument, setIsAddingDocument] = useState(false);
  const [isAddingDivider, setIsAddingDivider] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);
  const [shortcodeCopied, setShortcodeCopied] = useState(false);
  const [documentFormData, setDocumentFormData] = useState({
    title: '',
    date: '',
    pdfUrl: '',
    thumbnail: '',
    fileType: 'pdf'
  });
  const [isUploading, setIsUploading] = useState(false);
  const [files, setFiles] = useState<Array<{
    file: File;
    title: string;
    subtitle: string;
    fileType: string;
    progress: number;
    url?: string;
  }>>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dividerFormData, setDividerFormData] = useState({
    text: ''
  });
  const [showRenameWarning, setShowRenameWarning] = useState(false);
  const [settings, setSettings] = useState({
    thumbnailStyle: 'default',
    accentColor: '#7FB3DC',
    thumbnailShape: '3-2',
    pdfIconPosition: 'top-right',
    defaultPlaceholder: 'default'
  });
  
  const { toast } = useToast();
  const license = useLicense();

  // File type detection based on extension - matches all supported formats
  const getFileType = (file: File): string => {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    // Images
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico'].includes(extension)) return 'img';
    // Documents
    if (extension === 'pdf') return 'pdf';
    if (['doc', 'docx', 'odt', 'rtf', 'txt'].includes(extension)) return 'doc';
    if (['ppt', 'pptx', 'odp'].includes(extension)) return 'ppt';
    if (['xls', 'xlsx', 'ods', 'csv'].includes(extension)) return 'xls';
    // Archives
    if (['zip', 'rar', '7z'].includes(extension)) return 'zip';
    // eBooks
    if (['epub', 'mobi'].includes(extension)) return 'epub';
    // Audio
    if (['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'].includes(extension)) return 'audio';
    // Video
    if (['mp4', 'mov', 'webm', 'avi', 'mkv', 'flv', 'wmv', 'm4v'].includes(extension)) return 'video';
    // Return extension if known, otherwise 'file'
    return extension || 'file';
  };

  const handleFiles = useCallback((fileList: FileList) => {
    // Prevent actions before galleries are loaded to avoid accidental overwrites
    if (galleries.length === 0 || !currentGalleryId) {
      toast({ title: 'Please wait', description: 'Galleries are loading. Try again in a moment.' });
      return;
    }

    // Convert FileList to array
    const newFiles = Array.from(fileList);
    
    // Only allow multi-file upload for Pro users
    if (newFiles.length > 1 && !license.isPro) {
      toast({
        title: "Pro Feature Required",
        description: "Batch uploads require a Pro license. Please upload one file at a time.",
        variant: "destructive",
      });
      return;
    }
    
    // Check 15-file limit for free users
    const currentFileCount = items.filter(item => !('type' in item && item.type === 'divider')).length;
    const filesAfterUpload = currentFileCount + newFiles.length;
    if (!license.isPro && filesAfterUpload > 15) {
      const remaining = Math.max(0, 15 - currentFileCount);
      toast({
        title: "File Limit Reached",
        description: remaining > 0 
          ? `Free version allows 15 files per gallery. You can add ${remaining} more file${remaining !== 1 ? 's' : ''}.`
          : "Free version allows 15 files per gallery. Upgrade to Pro for unlimited files.",
        variant: "destructive",
      });
      return;
    }

    const processedFiles = newFiles.map(file => ({
      file,
      title: file.name.replace(/\.[^/.]+$/, ''),
      subtitle: '',
      fileType: getFileType(file),
      progress: 0,
    }));
    setFiles(processedFiles);

    // Auto-process uploads for both Free (single) and Pro (single/multiple)
    if (processedFiles.length > 0) {
      processAutoUploads(processedFiles);
    }
  }, [license.isPro, galleries.length, currentGalleryId, items]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFiles(files);
    }
  }, [handleFiles]);

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const updateFileData = (index: number, field: string, value: string) => {
    setFiles(prev => prev.map((file, i) => 
      i === index ? { ...file, [field]: value } : file
    ));
  };

  const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks
  const CHUNKED_UPLOAD_THRESHOLD = 10 * 1024 * 1024; // Use chunked upload for files > 10MB

  const uploadChunk = async (
    file: File,
    chunkIndex: number,
    uploadId: string,
    totalChunks: number,
    wp: any
  ): Promise<{ success: boolean; complete?: boolean; url?: string; error?: string }> => {
    const start = chunkIndex * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const chunk = file.slice(start, end);

    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', wp.ajaxUrl, true);
      xhr.withCredentials = true;

      xhr.onload = () => {
        try {
          const res = JSON.parse(xhr.responseText || '{}');
          if (res?.success) {
            resolve({
              success: true,
              complete: res.data?.complete || false,
              url: res.data?.url
            });
          } else {
            resolve({ success: false, error: res?.data || 'Chunk upload failed' });
          }
        } catch (err) {
          resolve({ success: false, error: 'Parse error' });
        }
      };

      xhr.onerror = () => resolve({ success: false, error: 'Network error' });

      const form = new FormData();
      form.append('action', 'kindpdfg_action');
      form.append('action_type', 'upload_chunk');
      form.append('nonce', wp.nonce);
      form.append('chunk', chunk, file.name);
      form.append('upload_id', uploadId);
      form.append('chunk_index', chunkIndex.toString());
      form.append('total_chunks', totalChunks.toString());
      form.append('filename', file.name);

      xhr.send(form);
    });
  };

  const uploadFileToWP = async (file: { file: File; title: string; subtitle: string; fileType: string }, index: number): Promise<string> => {
    const wp = (window as any).kindpdfgData || (window as any).wpPDFGallery;
    
    // Fallback: simulate in non-WordPress environments
    if (!wp?.ajaxUrl || !wp?.nonce) {
      return new Promise((resolve) => {
        let progress = 0;
        const interval = setInterval(() => {
          progress = Math.min(100, progress + 10);
          setFiles(prev => prev.map((f, i) => i === index ? { ...f, progress } : f));
          if (progress >= 100) {
            clearInterval(interval);
            // Use object URL for local preview of images
            const localUrl = URL.createObjectURL(file.file);
            resolve(localUrl);
          }
        }, 50);
      });
    }

    // Use chunked upload for files larger than threshold
    if (file.file.size > CHUNKED_UPLOAD_THRESHOLD) {
      const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const totalChunks = Math.ceil(file.file.size / CHUNK_SIZE);
      
      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const result = await uploadChunk(file.file, chunkIndex, uploadId, totalChunks, wp);
        
        if (!result.success) {
          throw new Error(result.error || 'Chunk upload failed');
        }
        
        const progress = Math.round(((chunkIndex + 1) / totalChunks) * 100);
        setFiles(prev => prev.map((f, i) => i === index ? { ...f, progress } : f));
        
        if (result.complete && result.url) {
          return result.url;
        }
      }
      
      throw new Error('Chunked upload completed but no URL returned');
    }

    // Direct upload for smaller files
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', wp.ajaxUrl, true);
      xhr.withCredentials = true;

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          setFiles(prev => prev.map((f, i) => i === index ? { ...f, progress: percent } : f));
        }
      };

      xhr.onload = () => {
        try {
          const res = JSON.parse(xhr.responseText || '{}');
          if (res?.success && res?.data?.url) {
            setFiles(prev => prev.map((f, i) => i === index ? { ...f, progress: 100 } : f));
            resolve(res.data.url as string);
          } else {
            reject(res?.data || res || 'Upload failed');
          }
        } catch (err) {
          reject(err);
        }
      };

      xhr.onerror = () => reject('Network error');

      const form = new FormData();
      form.append('action', 'kindpdfg_action');
      form.append('action_type', 'upload_pdf');
      form.append('nonce', wp.nonce);
      form.append('pdf_file', file.file);
      xhr.send(form);
    });
  };

  const processAutoUploads = async (filesToUpload: Array<{file: File; title: string; subtitle: string; fileType: string; progress: number}>) => {
    setIsUploading(true);
    try {
      let accItems = items.slice();
      for (let i = 0; i < filesToUpload.length; i++) {
        const f = filesToUpload[i];
        if (!f.title.trim()) continue;
        const url = await uploadFileToWP(f, i);
        const newPDF: PDF = {
          id: `${Date.now()}-${i}-${Math.random().toString(36).slice(2,6)}`,
          title: f.title,
          date: f.subtitle || '',
          pdfUrl: url,
          thumbnail: '',
          fileType: (f.fileType as PDF['fileType']) || 'pdf'
        };
        accItems = [newPDF, ...accItems];
      }
      // Single atomic save after all uploads complete
      const updatedGalleries = updateCurrentGalleryItems(accItems);
      await saveGalleriesToWP(updatedGalleries);
      setFiles([]);
      setIsAddingDocument(false); // Auto-close form after upload
      toast({ title: 'Uploaded', description: `${filesToUpload.length} file${filesToUpload.length !== 1 ? 's' : ''} uploaded and added to gallery` });
    } catch (error) {
      console.error('Upload error:', error);
      toast({ title: 'Error', description: 'Failed to upload one or more files', variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const saveGalleriesToWP = async (updatedGalleries: Gallery[]) => {
    // Safety guard: never persist an empty galleries array
    if (!Array.isArray(updatedGalleries) || updatedGalleries.length === 0) {
      console.warn('Aborting save: empty galleries payload');
      return false;
    }
    const wp = (window as any).kindpdfgData || (window as any).wpPDFGallery;
    if (wp?.ajaxUrl && wp?.nonce) {
      try {
        const form = new FormData();
        form.append('action', 'kindpdfg_action');
        form.append('action_type', 'save_galleries');
        form.append('nonce', wp.nonce);
        form.append('galleries', JSON.stringify(updatedGalleries));
        form.append('current_gallery_id', currentGalleryId);

        const res = await fetch(wp.ajaxUrl, {
          method: 'POST',
          credentials: 'same-origin',
          body: form,
        });
        
        const data = await res.json();
        if (data?.success) {
          try { localStorage.setItem('kindpdfg_backup', JSON.stringify(updatedGalleries)); } catch {}
        }
        return data?.success;
      } catch (error) {
        console.error('Failed to save to WordPress:', error);
        return false;
      }
    }
    // Non-WP environment: persist to localStorage
    try { 
      localStorage.setItem('kindpdfg_backup', JSON.stringify(updatedGalleries));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
    return true;
  };

  const updateCurrentGalleryItems = (updatedItems: GalleryItem[]) => {
    const updatedGalleries = galleries.map(gallery => 
      gallery.id === currentGalleryId 
        ? { ...gallery, items: updatedItems }
        : gallery
    );
    onGalleriesChange(updatedGalleries);
    return updatedGalleries;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeId = active.id as string;
    setActiveDragId(activeId);
    
    // If dragging a selected item and there are multiple selected, gather them together
    if (selectedItems.has(activeId) && selectedItems.size > 1) {
      const selectedIds = Array.from(selectedItems);
      
      // Check if selected items are already contiguous
      const selectedIndices = selectedIds.map(id => items.findIndex(item => item.id === id)).sort((a, b) => a - b);
      const isContiguous = selectedIndices.every((val, idx, arr) => idx === 0 || val === arr[idx - 1] + 1);
      
      if (!isContiguous) {
        // Gather selected items to the position of the dragged item
        const activeIndex = items.findIndex(item => item.id === activeId);
        const selectedItemsInOrder = items.filter(item => selectedIds.includes(item.id));
        const nonSelectedItems = items.filter(item => !selectedIds.includes(item.id));
        
        // Find where to insert in non-selected list to match active item's relative position
        let insertAt = 0;
        let nonSelectedIdx = 0;
        for (let i = 0; i < items.length && nonSelectedIdx < nonSelectedItems.length; i++) {
          if (!selectedIds.includes(items[i].id)) {
            if (i >= activeIndex) break;
            insertAt++;
            nonSelectedIdx++;
          }
        }
        
        const gatheredItems = [
          ...nonSelectedItems.slice(0, insertAt),
          ...selectedItemsInOrder,
          ...nonSelectedItems.slice(insertAt)
        ];
        
        // Update items immediately (visual gather effect)
        updateCurrentGalleryItems(gatheredItems);
      }
    }
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    setActiveDragId(null);

    if (!over || active.id === over.id) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    
    // Check if the dragged item is part of a selection
    const isDraggingSelected = selectedItems.has(activeId);
    
    let newItems: GalleryItem[];
    
    if (isDraggingSelected && selectedItems.size > 1) {
      // Multi-select drag: move all selected items together
      const selectedIds = Array.from(selectedItems);
      
      // Get selected items in their current order
      const selectedItemsInOrder = items.filter(item => selectedIds.includes(item.id));
      
      // Get non-selected items
      const nonSelectedItems = items.filter(item => !selectedIds.includes(item.id));
      
      // Find the target position in the non-selected items
      const overIndex = nonSelectedItems.findIndex(item => item.id === overId);
      const activeIndex = items.findIndex(item => item.id === activeId);
      const overOriginalIndex = items.findIndex(item => item.id === overId);
      
      // Determine insert position
      let insertIndex: number;
      if (overIndex === -1) {
        // Dropping on a selected item - find the closest non-selected position
        insertIndex = nonSelectedItems.length;
      } else if (activeIndex < overOriginalIndex) {
        // Dragging down - insert after the target
        insertIndex = overIndex + 1;
      } else {
        // Dragging up - insert before the target
        insertIndex = overIndex;
      }
      
      // Insert selected items at the new position
      newItems = [
        ...nonSelectedItems.slice(0, insertIndex),
        ...selectedItemsInOrder,
        ...nonSelectedItems.slice(insertIndex)
      ];
    } else {
      // Single item drag (original behavior)
      const oldIndex = items.findIndex((item) => item.id === activeId);
      const newIndex = items.findIndex((item) => item.id === overId);
      newItems = arrayMove(items, oldIndex, newIndex);
    }
    
    const updatedGalleries = updateCurrentGalleryItems(newItems);
    
    // Save to WordPress first
    const saved = await saveGalleriesToWP(updatedGalleries);
    
    if (saved) {
      const itemCount = isDraggingSelected && selectedItems.size > 1 ? selectedItems.size : 1;
      toast({
        title: "Reordered",
        description: `${itemCount} item${itemCount > 1 ? 's have' : ' has'} been reordered successfully`,
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to save the new order",
        variant: "destructive",
      });
    }
  };

  const handleSubmitDocuments = async () => {
    await processAutoUploads(files);
  };

  const handleSubmitDocument = async () => {
    // Only URL is required, title is optional
    if (!documentFormData.pdfUrl) {
      toast({
        title: "Error",
        description: "Document URL is required",
        variant: "destructive",
      });
      return;
    }

    let updated: GalleryItem[];
    
    if (editingId) {
      // Update existing document
      updated = items.map(item =>
        item.id === editingId && !('type' in item && item.type === 'divider')
          ? { ...item, ...documentFormData, fileType: documentFormData.fileType as PDF['fileType'] || 'pdf' }
          : item
      );
    } else {
      // Add new document
      const newPDF: PDF = {
        id: Date.now().toString(),
        ...documentFormData,
        fileType: documentFormData.fileType as PDF['fileType'] || 'pdf'
      };
      updated = [newPDF, ...items];
    }

    // Save to WordPress first
    const updatedGalleries = updateCurrentGalleryItems(updated);
    const saved = await saveGalleriesToWP(updatedGalleries);
    
    if (saved) {
      resetDocumentForm();
      toast({
        title: editingId ? "Updated" : "Added",
        description: `Document ${editingId ? 'updated' : 'added'} successfully`,
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to save the document",
        variant: "destructive",
      });
    }
  };

  const handleSubmitDivider = async () => {
    if (!dividerFormData.text) {
      toast({
        title: "Error",
        description: "Divider text is required",
        variant: "destructive",
      });
      return;
    }

    const newDivider: Divider = {
      id: Date.now().toString(),
      type: 'divider',
      text: dividerFormData.text
    };
    
    const updated = editingId 
      ? items.map(item => 
          item.id === editingId && 'type' in item && item.type === 'divider'
            ? { ...item, text: dividerFormData.text }
            : item
        )
      : [newDivider, ...items];

    // Save to WordPress first
    const updatedGalleries = updateCurrentGalleryItems(updated);
    const saved = await saveGalleriesToWP(updatedGalleries);
    
    if (saved) {
      resetDividerForm();
      toast({
        title: editingId ? "Updated" : "Added",
        description: `Divider ${editingId ? 'updated' : 'added'} successfully`,
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to save the divider",
        variant: "destructive",
      });
    }
  };

  const resetDocumentForm = () => {
    setDocumentFormData({
      title: '',
      date: '',
      pdfUrl: '',
      thumbnail: '',
      fileType: 'pdf'
    });
    setFiles([]);
    setIsAddingDocument(false);
    setEditingId(null);
  };


  const resetDividerForm = () => {
    setDividerFormData({ text: '' });
    setIsAddingDivider(false);
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      const updated = items.filter(item => item.id !== id);
      
      // Save to WordPress first
      const updatedGalleries = updateCurrentGalleryItems(updated);
      const saved = await saveGalleriesToWP(updatedGalleries);
      
      if (saved) {
        setSelectedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
        toast({
          title: "Deleted",
          description: "Item deleted successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete the item",
          variant: "destructive",
        });
      }
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedItems.size === 0) return;
    
    if (confirm(`Are you sure you want to delete ${selectedItems.size} selected item${selectedItems.size > 1 ? 's' : ''}?`)) {
      const updated = items.filter(item => !selectedItems.has(item.id));
      
      // Save to WordPress first
      const updatedGalleries = updateCurrentGalleryItems(updated);
      const saved = await saveGalleriesToWP(updatedGalleries);
      
      if (saved) {
        setSelectedItems(new Set());
        toast({
          title: "Deleted",
          description: `${selectedItems.size} item${selectedItems.size > 1 ? 's' : ''} deleted successfully`,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete the selected items",
          variant: "destructive",
        });
      }
    }
  };

  const handleRefreshThumbnail = async (item: GalleryItem) => {
    if ('type' in item && item.type === 'divider') return;
    
    const updated = items.map(i => 
      i.id === item.id ? { ...i, thumbnail: '' } : i
    );
    
    // Save to WordPress first
    const updatedGalleries = updateCurrentGalleryItems(updated);
    const saved = await saveGalleriesToWP(updatedGalleries);
    
    if (saved) {
      toast({
        title: "Refreshed",
        description: "Thumbnail cache cleared",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to refresh thumbnail",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (item: GalleryItem) => {
    if ('type' in item && item.type === 'divider') {
      setDividerFormData({ text: item.text });
      setIsAddingDivider(true);
      setEditingId(item.id);
    } else {
      const pdfItem = item as PDF;
      setDocumentFormData({
        title: pdfItem.title,
        date: pdfItem.date,
        pdfUrl: pdfItem.pdfUrl,
        thumbnail: pdfItem.thumbnail,
        fileType: pdfItem.fileType || 'pdf'
      });
      setIsAddingDocument(true);
      setEditingId(item.id);
    }
  };

  const handleSelect = (id: string, selected: boolean, shiftKey: boolean = false) => {
    if (shiftKey && lastSelectedId && lastSelectedId !== id) {
      // Find range between lastSelectedId and current id
      const lastIndex = items.findIndex(item => item.id === lastSelectedId);
      const currentIndex = items.findIndex(item => item.id === id);
      
      if (lastIndex !== -1 && currentIndex !== -1) {
        const start = Math.min(lastIndex, currentIndex);
        const end = Math.max(lastIndex, currentIndex);
        
        setSelectedItems(prev => {
          const newSet = new Set(prev);
          for (let i = start; i <= end; i++) {
            newSet.add(items[i].id);
          }
          return newSet;
        });
        return;
      }
    }
    
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
    setLastSelectedId(id);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(items.map(item => item.id)));
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Set uploading state
    setIsUploading(true);

    try {
      const wp = (window as any).kindpdfgData || (window as any).wpPDFGallery;
      
        if (wp?.ajaxUrl && wp?.nonce) {
          const formData = new FormData();
          formData.append('action', 'kindpdfg_action');
          formData.append('action_type', 'upload_pdf');
          formData.append('nonce', wp.nonce);
          formData.append('pdf_file', file);

          const response = await fetch(wp.ajaxUrl, {
            method: 'POST',
            credentials: 'same-origin',
            body: formData,
          });

          const result = await response.json();

          if (result.success && result.data) {
            const filename = result.data.filename || file.name;
            const fileExtension = (filename.split('.').pop() || '').toLowerCase();
            setDocumentFormData(prev => ({
              ...prev,
              title: filename.replace(/\.[^/.]+$/, ''),
              pdfUrl: result.data.url,
              thumbnail: '',
              fileType: fileExtension as any
            }));

            toast({
              title: 'Success',
              description: 'File uploaded successfully',
            });
          } else {
            throw new Error(result.data?.message || 'Upload failed');
          }
      } else {
        // Fallback for development environment
        const fileUrl = URL.createObjectURL(file);
        const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'pdf';
        
        setDocumentFormData(prev => ({
          ...prev,
          title: file.name.replace(/\.[^/.]+$/, ""),
          pdfUrl: fileUrl,
          thumbnail: '',
          fileType: fileExtension as any
        }));

        // Generate thumbnail if it's a PDF
        if (fileExtension === 'pdf') {
          try {
            const result = await PDFThumbnailGenerator.generateThumbnail(fileUrl);
            const thumbnailUrl = result.success ? result.dataUrl : null;
            if (thumbnailUrl) {
              setDocumentFormData(prev => ({
                ...prev,
                thumbnail: thumbnailUrl
              }));
            }
          } catch (error) {
            console.warn('Failed to generate thumbnail:', error);
          }
        }

        toast({
          title: "File Selected", 
          description: "File loaded for development preview",
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Clear the input value so the same file can be selected again
      event.target.value = '';
    }
  };

  const openWordPressMediaLibrary = () => {
    const wp = (window as any).wp;
    const wpData = (window as any).kindpdfgData || (window as any).wpPDFGallery;
    
    // Check if WordPress media library is available
    // wp.media is a function that needs to exist, not just wp object
    if (typeof wp?.media !== 'function') {
      // Try to check if we're in WordPress but media isn't loaded
      if (typeof (window as any).ajaxurl !== 'undefined' || wpData) {
        toast({
          title: "Media Library Not Loaded",
          description: "Please ensure WordPress media scripts are loaded. Try refreshing the page.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Not Available",
          description: "WordPress Media Library is only available in WordPress admin",
          variant: "destructive",
        });
      }
      return;
    }

    const frame = wp.media({
      title: 'Select File from Media Library',
      button: { text: 'Select File' },
      multiple: license.isPro, // Allow multiple selection for Pro users
      library: {
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'image']
      }
    });

    frame.on('select', async () => {
      const selection = frame.state().get('selection');
      const attachments = selection.map((attachment: any) => attachment.toJSON());
      
      if (attachments.length === 0) return;

      // Prevent actions before galleries are loaded
      if (galleries.length === 0 || !currentGalleryId) {
        toast({ title: 'Please wait', description: 'Galleries are loading. Try again in a moment.' });
        return;
      }

      // Check 15-file limit for free users (including media library selection)
      const currentFileCount = items.filter(item => !('type' in item && item.type === 'divider')).length;
      const filesAfterAdd = currentFileCount + attachments.length;
      if (!license.isPro && filesAfterAdd > 15) {
        const remaining = Math.max(0, 15 - currentFileCount);
        toast({
          title: "File Limit Reached",
          description: remaining > 0 
            ? `Free version allows 15 files per gallery. You can add ${remaining} more file${remaining !== 1 ? 's' : ''}.`
            : "Free version allows 15 files per gallery. Upgrade to Pro for unlimited files.",
          variant: "destructive",
        });
        return;
      }

      let accItems = items.slice();
      
      for (const attachment of attachments) {
        const url = attachment.url;
        const filename = attachment.filename || attachment.title || 'Document';
        const title = filename.replace(/\.[^/.]+$/, '');
        const extension = (filename.split('.').pop() || '').toLowerCase();
        
        let fileType: PDF['fileType'] = 'pdf';
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) fileType = extension as PDF['fileType'];
        else if (['doc', 'docx'].includes(extension)) fileType = extension as PDF['fileType'];
        else if (['ppt', 'pptx'].includes(extension)) fileType = extension as PDF['fileType'];
        else if (['xls', 'xlsx'].includes(extension)) fileType = extension as PDF['fileType'];
        
        const newPDF: PDF = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          title,
          date: '',
          pdfUrl: url,
          thumbnail: '',
          fileType
        };
        accItems = [newPDF, ...accItems];
      }

      const updatedGalleries = updateCurrentGalleryItems(accItems);
      await saveGalleriesToWP(updatedGalleries);
      setIsAddingDocument(false);
      
      toast({
        title: 'Added',
        description: `${attachments.length} file${attachments.length !== 1 ? 's' : ''} added from Media Library`,
      });
    });

    frame.open();
  };

  const copyShortcode = async () => {
    const galleryName = currentGallery?.name || 'main';
    const shortcode = `[pdf_gallery name="${galleryName.toLowerCase().replace(/[^a-z0-9-_]/g, '-')}"]`;
    try {
      await navigator.clipboard.writeText(shortcode);
      setShortcodeCopied(true);
      setTimeout(() => setShortcodeCopied(false), 2000);
      toast({
        title: "Copied!",
        description: "Shortcode copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please copy the shortcode manually",
        variant: "destructive",
      });
    }
  };

  // Gallery management functions
  const handleGalleryCreate = (name: string) => {
    const newGallery: Gallery = {
      id: Date.now().toString(),
      name,
      items: [],
      createdAt: new Date().toISOString(),
    };
    const updatedGalleries = [...galleries, newGallery];
    onGalleriesChange(updatedGalleries);
    onCurrentGalleryChange(newGallery.id);
    saveGalleriesToWP(updatedGalleries);
  };

  const handleGalleryRename = (galleryId: string, newName: string) => {
    const updatedGalleries = galleries.map(gallery => 
      gallery.id === galleryId 
        ? { ...gallery, name: newName }
        : gallery
    );
    onGalleriesChange(updatedGalleries);
    saveGalleriesToWP(updatedGalleries);
    
    // Show rename warning if user hasn't dismissed it 3 times yet
    const dismissCount = parseInt(localStorage.getItem('kindpdfg_rename_warning_dismissed') || '0', 10);
    if (dismissCount < 3) {
      setShowRenameWarning(true);
    }
  };

  const handleDismissRenameWarning = () => {
    setShowRenameWarning(false);
    const currentCount = parseInt(localStorage.getItem('kindpdfg_rename_warning_dismissed') || '0', 10);
    localStorage.setItem('kindpdfg_rename_warning_dismissed', String(currentCount + 1));
  };

  const handleGalleryDelete = (galleryId: string) => {
    const updatedGalleries = galleries.filter(g => g.id !== galleryId);
    onGalleriesChange(updatedGalleries);
    
    // Switch to first available gallery
    if (updatedGalleries.length > 0) {
      onCurrentGalleryChange(updatedGalleries[0].id);
    }
    
    saveGalleriesToWP(updatedGalleries);
  };

  return (
    <div className="space-y-6">
      {/* Navigation removed: top-level tabs now control sections */}

      <>
          {/* Top Row: Action Buttons only */}
          <div className="flex justify-end items-center">
            <div className="flex gap-2">
              {selectedItems.size > 0 && (
                <Button 
                  onClick={handleDeleteSelected}
                  variant="destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete {selectedItems.size} item{selectedItems.size > 1 ? 's' : ''}
                </Button>
              )}
              <Button 
                onClick={() => setIsAddingDocument(true)}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add File(s)
              </Button>
              <Button 
                onClick={() => setIsAddingDivider(true)}
                variant="outline"
              >
                <Separator className="w-4 h-0.5" />
                Add Divider
              </Button>
            </div>
          </div>

          {/* Second Row: Select All | Gallery Selector | Sorting - above dotted line */}
          {(() => {
            const gallerySettings = (currentGallery as any)?.settings || {};
            const sortOrder = gallerySettings.sortOrder || 'newest';
            
            const updateSortOrder = (value: string) => {
              if (!currentGallery) return;
              const updatedGalleries = galleries.map(gallery => 
                gallery.id === currentGalleryId 
                  ? { ...gallery, settings: { ...((gallery as any).settings || {}), sortOrder: value } }
                  : gallery
              );
              onGalleriesChange(updatedGalleries);
              saveGalleriesToWP(updatedGalleries);
              
              toast({
                title: "Sort Order Updated",
                description: value === 'newest' 
                  ? "Showing newest documents first" 
                  : value === 'oldest'
                  ? "Showing oldest documents first"
                  : "Sorting alphabetically A-Z",
              });
            };

            // Gallery Selector - Breadcrumb style
            const renderGallerySelector = () => (
              <div className="flex items-center gap-1.5 text-sm">
                <span className="text-muted-foreground">Galleries</span>
                <ChevronDown className="h-3 w-3 text-muted-foreground/60 rotate-[-90deg]" />
                <GallerySelector
                  galleries={galleries}
                  currentGalleryId={currentGalleryId}
                  onGalleryChange={onCurrentGalleryChange}
                  onGalleryCreate={handleGalleryCreate}
                  onGalleryRename={handleGalleryRename}
                  onGalleryDelete={handleGalleryDelete}
                />
              </div>
            );

            return (
              <div className="flex items-center justify-between border-b border-dashed pb-2">
                {/* Left: Select All (only show if there are items) */}
                <div className="flex items-center space-x-3 ml-[22px]">
                  {items.length > 0 ? (
                    <>
                      <Checkbox 
                        checked={selectedItems.size === items.length && items.length > 0}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all"
                      />
                      <span className="text-sm text-muted-foreground">
                        {selectedItems.size > 0 ? `${selectedItems.size} selected` : 'Select all'}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-muted-foreground">No documents yet</span>
                  )}
                </div>
                
                {/* Center: Gallery Selector */}
                {renderGallerySelector()}
                
                {/* Right: Sorting Dropdown (only show if there are items) */}
                {items.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowUpDown className="h-3.5 w-3.5" />
                        <span>{sortOrder === 'newest' ? 'Newest first' : sortOrder === 'oldest' ? 'Oldest first' : 'A-Z'}</span>
                        <ChevronDown className="h-3 w-3" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => updateSortOrder('newest')}
                        className="flex items-center justify-between gap-4 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <ArrowDown className="h-4 w-4" />
                          <span>Newest first</span>
                        </div>
                        {sortOrder === 'newest' && <Check className="h-4 w-4 text-primary" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => updateSortOrder('oldest')}
                        className="flex items-center justify-between gap-4 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <ArrowUp className="h-4 w-4" />
                          <span>Oldest first</span>
                        </div>
                        {sortOrder === 'oldest' && <Check className="h-4 w-4 text-primary" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => updateSortOrder('alphabetical')}
                        className="flex items-center justify-between gap-4 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <ArrowUpDown className="h-4 w-4" />
                          <span>Alphabetical (A-Z)</span>
                        </div>
                        {sortOrder === 'alphabetical' && <Check className="h-4 w-4 text-primary" />}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                {items.length === 0 && <div />}
              </div>
            );
          })()}

          {/* Rename Warning Message */}
          {showRenameWarning && (
            <div className="flex items-center justify-between gap-3 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-lg">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <span className="font-medium">Gallery renamed.</span> If you already embedded this gallery, remember to update the shortcode in your page or post.
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-amber-800 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/50 flex-shrink-0"
                onClick={handleDismissRenameWarning}
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Multi-File Upload Form */}
          {isAddingDocument && !editingId && (
            <Card className="edit-section">
              <CardHeader>
                <CardTitle>Add Files</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Upload Area */}
                <div
                  className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    isDragOver 
                      ? 'bg-primary border-primary text-primary-foreground' 
                      : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDragEnter={(e) => { e.preventDefault(); setIsDragOver(true); }}
                >
                  {isDragOver ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-6">
                      <Upload className="mx-auto h-12 w-12 text-primary-foreground/90" />
                      <p className="text-lg font-semibold">Drop your files here</p>
                      <p className="text-sm opacity-90">Release to upload</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <div className="space-y-2">
                        <p className="text-lg font-medium">Drop files here or click to browse</p>
                        <p className="text-sm text-muted-foreground">
                          Supports PDF, Office files, images, audio, video, archives, and eBooks
                        </p>
                      </div>
                      <div className="flex justify-center gap-3 mt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Files
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={openWordPressMediaLibrary}
                        >
                          <FolderOpen className="w-4 h-4 mr-2" />
                          WordPress Media Library
                        </Button>
                      </div>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple={license.isPro}
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.webp,.odt,.ods,.odp,.rtf,.txt,.csv,.svg,.ico,.zip,.rar,.7z,.epub,.mobi,.mp3,.wav,.ogg,.mp4,.mov,.webm,.avi,.mkv,.flv,.wmv,.m4v,.m4a,.flac,.aac,video/*,audio/*"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                  {isUploading && (
                    <div className="absolute left-0 right-0 bottom-0">
                      <Progress
                        value={Math.round(files.reduce((sum, f) => sum + (f.progress || 0), 0) / Math.max(files.length || 1, 1))}
                        className="h-1 rounded-none"
                      />
                    </div>
                  )}
                </div>

                 {/* File List - Only show during upload process */}
                {(files.length > 0 || isUploading) && (
                  <div className="space-y-4">
                    <Label className="text-base font-medium">
                      {isUploading ? 'Uploading Files...' : `Selected Files (${files.length})`}
                    </Label>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {files.map((file, index) => (
                        <div key={index} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="relative">
                                <div className="w-12 h-12 bg-muted rounded flex items-center justify-center flex-shrink-0">
                                  <FileText className="w-6 h-6 text-muted-foreground" />
                                </div>
                                <div className="absolute -top-1 -right-1 min-w-[24px] px-1 py-0.5 rounded text-[9px] font-medium bg-primary text-primary-foreground text-center z-10">
                                  {file.fileType.toUpperCase().slice(0, 3)}
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{file.file.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {(file.file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            {!isUploading && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>

                          {/* Progress bar during upload */}
                          {isUploading && (
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>Uploading...</span>
                                <span>{file.progress}%</span>
                              </div>
                              <Progress value={file.progress} className="h-2" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!isUploading && files.length === 0 && (
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={resetDocumentForm}>
                      Close
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Single File Edit Form */}
          {isAddingDocument && editingId && (
            <Card className="edit-section">
              <CardHeader>
                <CardTitle>Edit File</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Label htmlFor="title">File Title</Label>
                  <Input
                    id="title"
                    value={documentFormData.title}
                    onChange={(e) => setDocumentFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="File Title"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="date">Subtitle (optional)</Label>
                  <Input
                    id="date"
                    value={documentFormData.date}
                    onChange={(e) => setDocumentFormData(prev => ({ ...prev, date: e.target.value }))}
                    placeholder="Optional subtitle"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="pdfUrl">File URL</Label>
                  <Input
                    id="pdfUrl"
                    value={documentFormData.pdfUrl}
                    onChange={(e) => {
                      const newUrl = e.target.value;
                      setDocumentFormData(prev => ({ ...prev, pdfUrl: newUrl }));
                      
                      // Auto-detect YouTube URLs
                      const youtubePatterns = [
                        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
                      ];
                      let youtubeId: string | null = null;
                      for (const pattern of youtubePatterns) {
                        const match = newUrl.match(pattern);
                        if (match) { youtubeId = match[1]; break; }
                      }
                      
                      if (youtubeId) {
                        // Set fileType to youtube
                        setDocumentFormData(prev => ({ ...prev, fileType: 'youtube' }));
                        // Auto-set thumbnail if empty
                        if (!documentFormData.thumbnail) {
                          setDocumentFormData(prev => ({ ...prev, thumbnail: `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg` }));
                        }
                        // Auto-fetch YouTube title
                        fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${youtubeId}&format=json`)
                          .then(res => res.json())
                          .then(data => {
                            if (data?.title) {
                              setDocumentFormData(prev => ({ ...prev, title: data.title }));
                            }
                          })
                          .catch(() => {});
                      }
                    }}
                    placeholder="https://example.com/document.pdf or YouTube link"
                  />
                  {documentFormData.fileType === 'youtube' && (
                    <p className="text-xs text-muted-foreground">
                      YouTube video detected! Title and thumbnail auto-fetched.
                    </p>
                  )}
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="thumbnail">Thumbnail URL (optional)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="thumbnail"
                      value={documentFormData.thumbnail}
                      onChange={(e) => setDocumentFormData(prev => ({ ...prev, thumbnail: e.target.value }))}
                      placeholder="https://example.com/thumbnail.jpg"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const wp = (window as any).wp;
                        if (wp?.media) {
                          const frame = wp.media({
                            title: 'Select Thumbnail',
                            button: { text: 'Use as Thumbnail' },
                            multiple: false,
                            library: { type: 'image' }
                          });
                          frame.on('select', () => {
                            const attachment = frame.state().get('selection').first().toJSON();
                            if (attachment?.url) {
                              setDocumentFormData(prev => ({ ...prev, thumbnail: attachment.url }));
                            }
                          });
                          frame.open();
                        }
                      }}
                      title="Browse Media Library"
                    >
                      <FolderOpen className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={handleSubmitDocument}>
                    Update
                  </Button>
                  <Button variant="outline" onClick={resetDocumentForm}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Divider Add/Edit Form */}
          {isAddingDivider && (
            <Card className="edit-section">
              <CardHeader>
                <CardTitle>
                  {editingId ? 'Edit Divider' : 'Add New Divider'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Label htmlFor="dividerText">Divider Text</Label>
                  <Input
                    id="dividerText"
                    value={dividerFormData.text}
                    onChange={(e) => setDividerFormData(prev => ({ ...prev, text: e.target.value }))}
                    placeholder="2024 Documents"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={handleSubmitDivider}>
                    {editingId ? 'Update' : 'Add'}
                  </Button>
                  <Button variant="outline" onClick={resetDividerForm}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sortable Items List */}
          <div className="space-y-1.5">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={items} strategy={verticalListSortingStrategy}>
                {items.map((item) => (
                  <SortableItem
                    key={item.id}
                    item={item}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onRefresh={handleRefreshThumbnail}
                    isSelected={selectedItems.has(item.id)}
                    onSelect={handleSelect}
                  />
                ))}
              </SortableContext>
              <DragOverlay>
                {activeDragId && selectedItems.has(activeDragId) && selectedItems.size > 1 ? (
                  // Show all selected items stacked in the overlay
                  <div className="space-y-1">
                    {items.filter(item => selectedItems.has(item.id)).map((item, index) => (
                      <div key={item.id} style={{ opacity: index === 0 ? 1 : 0.8 }}>
                        <SortableItem
                          item={item}
                          onEdit={() => {}}
                          onDelete={() => {}}
                          onRefresh={() => {}}
                          isSelected={true}
                          onSelect={() => {}}
                          isDragOverlay
                          hideActions
                        />
                      </div>
                    ))}
                  </div>
                ) : activeDragId ? (
                  // Single item drag
                  <SortableItem
                    item={items.find(item => item.id === activeDragId)!}
                    onEdit={() => {}}
                    onDelete={() => {}}
                    onRefresh={() => {}}
                    isSelected={false}
                    onSelect={() => {}}
                    isDragOverlay
                    hideActions
                  />
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>

          {/* Action Buttons - below gallery */}
          {items.length > 0 && (
            <div className="flex items-center justify-end pt-2">
              <div className="flex gap-2">
                {selectedItems.size > 0 && (
                  <Button onClick={handleDeleteSelected} variant="destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete {selectedItems.size} item{selectedItems.size > 1 ? 's' : ''}
                  </Button>
                )}
                <Button 
                  onClick={() => {
                    setIsAddingDocument(true);
                    setTimeout(() => {
                      const editSection = document.querySelector('.edit-section');
                      if (editSection) editSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      else window.scrollTo({ top: 0, behavior: 'smooth' });
                    }, 50);
                  }}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add File(s)
                </Button>
                <Button 
                  onClick={() => { setIsAddingDivider(true); setTimeout(() => { const editSection = document.querySelector('.edit-section'); if (editSection) editSection.scrollIntoView({ behavior: 'smooth', block: 'start' }); else window.scrollTo({ top: 0, behavior: 'smooth' }); }, 50); }}
                  variant="outline"
                >
                  <Separator className="w-4 h-0.5" />
                  Add Divider
                </Button>
              </div>
            </div>
          )}


          {items.length === 0 && !isAddingDocument && !isAddingDivider && (
            <Card>
              <CardContent className="text-center py-8">
                <Upload className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No items yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start by adding your first document or divider.
                </p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => setIsAddingDocument(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add File(s)
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddingDivider(true)}>
                    <Separator className="w-4 h-0.5" />
                    Add Divider
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>


    </div>
  );
};

export default PDFAdmin;