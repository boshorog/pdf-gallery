import { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Upload, Trash2, Edit, Eye, GripVertical, FileText, Minus, RefreshCw, Copy, Check, FileType, Presentation, Image, X, Star, Maximize2, FolderOpen, ChevronDown } from 'lucide-react';
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
  onSelect: (id: string, selected: boolean) => void;
}

const SortableItem = ({ item, onEdit, onDelete, onRefresh, isSelected, onSelect }: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
  };

  return (
    <Card ref={setNodeRef} style={style} className="bg-background">
      <CardContent className="flex items-center justify-between px-2 pl-3 py-3">
        <div className="flex items-center space-x-3 ml-2.5">
          <Checkbox className="mt-0" 
            checked={isSelected}
            onCheckedChange={(checked) => onSelect(item.id, !!checked)}
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

          {('type' in item && item.type === 'divider') ? (
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-muted rounded flex items-center justify-center flex-shrink-0">
                <Minus className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="ml-2.5">
                <h3 className="text-sm font-semibold">Divider: {item.text}</h3>
                <p className="text-xs text-muted-foreground">Section divider</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <div className="relative w-12 h-12 bg-muted rounded flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-muted-foreground" />
                <div className="absolute -top-1 -right-1 min-w-[24px] px-1 py-0.5 rounded text-[9px] font-medium bg-primary text-primary-foreground text-center">
                  {(() => {
                    const pdfItem = item as PDF;
                    let fileType = pdfItem.fileType?.toLowerCase();
                    if (!fileType) {
                      const url = pdfItem.pdfUrl || '';
                      const title = pdfItem.title || '';
                      let extension = url.split('.').pop()?.toLowerCase();
                      if (!extension || !['pdf','doc','docx','ppt','pptx','xls','xlsx','jpg','jpeg','png','gif','webp'].includes(extension)) {
                        extension = title.split('.').pop()?.toLowerCase();
                      }
                      fileType = extension || 'pdf';
                    }
                    if (['img','jpg','jpeg','png','gif','webp'].includes(fileType || '')) return 'IMG';
                    if (fileType === 'pdf') return 'PDF';
                    if (['doc','docx'].includes(fileType || '')) return 'DOC';
                    if (['ppt','pptx'].includes(fileType || '')) return 'PPT';
                    if (['xls','xlsx'].includes(fileType || '')) return 'XLS';
                    return 'PDF';
                  })()}
                </div>
              </div>
              <div className="ml-2.5">
                <h3 className="text-sm font-semibold">{(item as PDF).title}</h3>
                <p className="text-xs text-muted-foreground">{(item as PDF).date}</p>
              </div>
            </div>
          )}
        </div>

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dividerFormData, setDividerFormData] = useState({
    text: ''
  });
  const [settings, setSettings] = useState({
    thumbnailStyle: 'default',
    accentColor: '#7FB3DC',
    thumbnailShape: 'landscape-16-9',
    pdfIconPosition: 'top-right',
    defaultPlaceholder: 'default'
  });
  
  const { toast } = useToast();
  const license = useLicense();

  const getFileType = (file: File): string => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) return 'img';
    if (extension === 'pdf') return 'pdf';
    if (['doc', 'docx'].includes(extension || '')) return 'doc';
    if (['ppt', 'pptx'].includes(extension || '')) return 'ppt';
    if (['xls', 'xlsx'].includes(extension || '')) return 'xls';
    return 'pdf';
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
        description: "Multiple file uploads require a Pro license. Please upload one file at a time, or upgrade to Pro for bulk uploads.",
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

  const uploadFileToWP = (file: { file: File; title: string; subtitle: string; fileType: string }, index: number): Promise<string> => {
    const wp = (window as any).wpPDFGallery;
    return new Promise((resolve, reject) => {
      // Fallback: simulate in non-WordPress environments
      if (!wp?.ajaxUrl || !wp?.nonce) {
        let progress = 0;
        const interval = setInterval(() => {
          progress = Math.min(100, progress + 10);
          setFiles(prev => prev.map((f, i) => i === index ? { ...f, progress } : f));
          if (progress >= 100) {
            clearInterval(interval);
            resolve(`https://example.com/uploads/${file.file.name}`);
          }
        }, 50);
        return;
      }

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
      form.append('action', 'pdf_gallery_action');
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
    const wp = (window as any).wpPDFGallery;
    if (wp?.ajaxUrl && wp?.nonce) {
      try {
        const form = new FormData();
        form.append('action', 'pdf_gallery_action');
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
          try { localStorage.setItem('pdf_gallery_backup', JSON.stringify(updatedGalleries)); } catch {}
        }
        return data?.success;
      } catch (error) {
        console.error('Failed to save to WordPress:', error);
        return false;
      }
    }
    return true; // Return true for non-WP environments
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

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);
      const updatedGalleries = updateCurrentGalleryItems(newItems);
      
      // Save to WordPress first
      const saved = await saveGalleriesToWP(updatedGalleries);
      
      if (saved) {
        toast({
          title: "Reordered",
          description: "Items have been reordered successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to save the new order",
          variant: "destructive",
        });
      }
    }
  };

  const handleSubmitDocuments = async () => {
    await processAutoUploads(files);
  };

  const handleSubmitDocument = async () => {
    if (!documentFormData.title || !documentFormData.pdfUrl) {
      toast({
        title: "Error",
        description: "Title and URL are required",
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

  const handleSelect = (id: string, selected: boolean) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
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
      const wp = (window as any).wpPDFGallery;
      
        if (wp?.ajaxUrl && wp?.nonce) {
          const formData = new FormData();
          formData.append('action', 'pdf_gallery_action');
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

          {/* Second Row: Select All | Gallery Selector | Toggles - above dotted line */}
          {items.length > 0 && (() => {
            const gallerySettings = (currentGallery as any)?.settings || {};
            const ratingsEnabled = gallerySettings.ratingsEnabled ?? true;
            const lightboxEnabled = gallerySettings.lightboxEnabled ?? true;
            
            const updateGallerySettings = (key: string, value: boolean) => {
              if (!currentGallery) return;
              const updatedGalleries = galleries.map(gallery => 
                gallery.id === currentGalleryId 
                  ? { ...gallery, settings: { ...((gallery as any).settings || {}), [key]: value } }
                  : gallery
              );
              onGalleriesChange(updatedGalleries);
              saveGalleriesToWP(updatedGalleries);
              
              if (key === 'ratingsEnabled') {
                toast({
                  title: value ? "Ratings Enabled" : "Ratings Disabled",
                  description: value 
                    ? "Users can now rate documents in this gallery" 
                    : "Ratings are hidden for this gallery",
                });
              } else if (key === 'lightboxEnabled') {
                toast({
                  title: value ? "Lightbox Enabled" : "Lightbox Disabled",
                  description: value 
                    ? "Documents will open in fullscreen lightbox" 
                    : "Documents will open in a new tab",
                });
              }
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
                {/* Left: Select All */}
                <div className="flex items-center space-x-3 ml-[22px]">
                  <Checkbox 
                    checked={selectedItems.size === items.length && items.length > 0}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                  />
                  <span className="text-sm text-muted-foreground">
                    {selectedItems.size > 0 ? `${selectedItems.size} selected` : 'Select all'}
                  </span>
                </div>
                
                {/* Center: Gallery Selector */}
                {renderGallerySelector()}
                
                {/* Right: Toggles */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateGallerySettings('ratingsEnabled', !ratingsEnabled)}
                    className={`p-1.5 rounded transition-colors ${ratingsEnabled ? 'text-yellow-500' : 'text-muted-foreground/40'}`}
                    title={ratingsEnabled ? "Disable Ratings" : "Enable Ratings"}
                  >
                    <Star className={`h-4 w-4 ${ratingsEnabled ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={() => updateGallerySettings('lightboxEnabled', !lightboxEnabled)}
                    className={`p-1.5 rounded transition-colors ${lightboxEnabled ? 'text-blue-500' : 'text-muted-foreground/40'}`}
                    title={lightboxEnabled ? "Disable Lightbox" : "Enable Lightbox"}
                  >
                    <Maximize2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Multi-File Upload Form */}
          {isAddingDocument && !editingId && (
            <Card className="edit-section">
              <CardHeader>
                <CardTitle>Add Documents</CardTitle>
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
                          Supports PDF, PPT/PPTX, DOC/DOCX, XLS/XLSX, and image files
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-4"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Browse Files
                      </Button>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple={license.isPro}
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.webp"
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
                              <div className="relative w-10 h-10 bg-muted rounded flex items-center justify-center flex-shrink-0">
                                <FileText className="w-5 h-5 text-muted-foreground" />
                                <div className="absolute -top-1 -right-1 text-xs px-1 py-0.5 rounded text-[9px] font-medium bg-primary text-primary-foreground">
                                  {file.fileType.toUpperCase()}
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

          {/* Single Document Edit Form */}
          {isAddingDocument && editingId && (
            <Card className="edit-section">
              <CardHeader>
                <CardTitle>Edit Document</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={documentFormData.title}
                    onChange={(e) => setDocumentFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Document Title"
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
                  <Label htmlFor="pdfUrl">Document URL</Label>
                  <Input
                    id="pdfUrl"
                    value={documentFormData.pdfUrl}
                    onChange={(e) => setDocumentFormData(prev => ({ ...prev, pdfUrl: e.target.value }))}
                    placeholder="https://example.com/document.pdf"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="thumbnail">Thumbnail URL (optional)</Label>
                  <Input
                    id="thumbnail"
                    value={documentFormData.thumbnail}
                    onChange={(e) => setDocumentFormData(prev => ({ ...prev, thumbnail: e.target.value }))}
                    placeholder="https://example.com/thumbnail.jpg"
                  />
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
            </DndContext>
          </div>

          {/* Stats Row + Action Buttons - below gallery */}
          {items.length > 0 && (() => {
            const documentCount = items.filter(item => !('type' in item && item.type === 'divider')).length;
            const dividerCount = items.filter(item => 'type' in item && item.type === 'divider').length;
            return (
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-3 text-xs text-muted-foreground ml-6">
                  <div className="flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5" />
                    <span>{documentCount} document{documentCount !== 1 ? 's' : ''}</span>
                  </div>
                  {dividerCount > 0 && (
                    <div className="flex items-center gap-1">
                      <Minus className="h-3.5 w-3.5" />
                      <span>{dividerCount} divider{dividerCount !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
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
            );
          })()}

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