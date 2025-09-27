import { useState } from 'react';
import { Plus, Upload, Trash2, Edit, Eye, GripVertical, FileText, Minus, RefreshCw, Copy, Check, FileType, Presentation } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
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
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-4">
          <Checkbox 
            checked={isSelected}
            onCheckedChange={(checked) => onSelect(item.id, !!checked)}
          />
          <div 
            {...attributes} 
            {...listeners}
            className="cursor-grab hover:cursor-grabbing"
          >
            <GripVertical className="w-5 h-5 text-muted-foreground" />
          </div>
          
          {('type' in item && item.type === 'divider') ? (
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-muted rounded flex items-center justify-center flex-shrink-0">
                <Minus className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold">Divider: {item.text}</h3>
                <p className="text-sm text-muted-foreground">Section divider</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <div className="relative w-12 h-12 bg-muted rounded flex items-center justify-center flex-shrink-0">
                {(item as PDF).thumbnail ? (
                  <img 
                    src={(item as PDF).thumbnail} 
                    alt={(item as PDF).title}
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  <FileText className="w-6 h-6 text-muted-foreground" />
                )}
                
                {/* File type badge */}
                <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs px-1 py-0.5 rounded text-[10px] font-medium">
                  {(() => {
                    const fileType = (item as PDF).fileType?.toLowerCase();
                    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileType || '')) {
                      return 'IMG';
                    } else if (fileType === 'pdf') {
                      return 'PDF';
                    } else if (['doc', 'docx'].includes(fileType || '')) {
                      return 'DOC';
                    } else if (['ppt', 'pptx'].includes(fileType || '')) {
                      return 'PPT';
                    } else if (['xls', 'xlsx'].includes(fileType || '')) {
                      return 'XLS';
                    } else {
                      return 'PDF';
                    }
                  })()}
                </div>
              </div>
              <div>
                <h3 className="font-semibold">{(item as PDF).title}</h3>
                <p className="text-sm text-muted-foreground">{(item as PDF).date}</p>
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
            onClick={() => onEdit(item)}
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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const saveGalleriesToWP = async (updatedGalleries: Gallery[]) => {
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

  const handleSubmitDocument = async () => {
    if (!documentFormData.title || !documentFormData.date || !documentFormData.pdfUrl) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }

    // Check license restrictions for free version - unlimited documents per gallery, but only 1 gallery total
    // This check is removed as free version allows unlimited documents within the single allowed gallery

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
      updated = [...items, newPDF];
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
      : [...items, newDivider];

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
        formData.append('action', 'pdf_gallery_upload');
        formData.append('nonce', wp.nonce);
        formData.append('file', file);

        const response = await fetch(wp.ajaxUrl, {
          method: 'POST',
          credentials: 'same-origin',
          body: formData,
        });

        const result = await response.json();

        if (result.success && result.data) {
          // Use the uploaded file data
          setDocumentFormData(prev => ({
            ...prev,
            title: result.data.title || file.name.replace(/\.[^/.]+$/, ""),
            pdfUrl: result.data.url,
            thumbnail: result.data.thumbnail || '',
            fileType: result.data.fileType || 'pdf'
          }));

          toast({
            title: "Success",
            description: "File uploaded successfully",
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
          <div className="flex justify-between items-center">
            {/* Left: Select All Checkbox */}
            <div className="flex items-center gap-2">
              {items.length > 0 && (
                <>
                  <Checkbox 
                    checked={selectedItems.size === items.length && items.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-sm text-muted-foreground">
                    {selectedItems.size > 0 ? `${selectedItems.size} selected` : 'Select all'}
                  </span>
                </>
              )}
            </div>

            {/* Center: Gallery Management */}
            <div className="flex items-center gap-4">
              <GallerySelector
                galleries={galleries}
                currentGalleryId={currentGalleryId}
                onGalleryChange={onCurrentGalleryChange}
                onGalleryCreate={handleGalleryCreate}
                onGalleryRename={handleGalleryRename}
                onGalleryDelete={handleGalleryDelete}
              />
            </div>

            {/* Right: Action Buttons */}
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
                Add Document
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

          {/* PDF Add/Edit Form */}
          {isAddingDocument && (
            <Card className="edit-section">
              <CardHeader>
                <CardTitle>
                  {editingId ? 'Edit Document' : 'Add New Document'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* File Upload Section */}
                <Label
                  htmlFor="pdfFile"
                  className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors block"
                >
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <span className="text-sm font-medium text-primary hover:underline">
                    {isUploading ? 'Uploading...' : 'Upload Document file'}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">
                    Accepted: PDF, DOC/DOCX, PPT/PPTX, XLS/XLSX, JPG/JPEG, PNG, GIF, WEBP
                  </p>
                  <Input
                    id="pdfFile"
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                </Label>

                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={documentFormData.title}
                    onChange={(e) => setDocumentFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Document Title"
                  />
                </div>
                
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    value={documentFormData.date}
                    onChange={(e) => setDocumentFormData(prev => ({ ...prev, date: e.target.value }))}
                    placeholder="January 2024"
                  />
                </div>
                
                <div>
                  <Label htmlFor="pdfUrl">Document URL</Label>
                  <Input
                    id="pdfUrl"
                    value={documentFormData.pdfUrl}
                    onChange={(e) => setDocumentFormData(prev => ({ ...prev, pdfUrl: e.target.value }))}
                    placeholder="https://example.com/document.pdf"
                  />
                </div>
                
                <div>
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
                    {editingId ? 'Update' : 'Add'}
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
                <div>
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
          <div className="space-y-4">
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

          {/* Duplicate Action Buttons at Bottom */}
          {items.length > 0 && (
            <div className="flex gap-2 pt-4 justify-end">
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
                Add Document
              </Button>
              <Button 
                onClick={() => { setIsAddingDivider(true); setTimeout(() => { const editSection = document.querySelector('.edit-section'); if (editSection) editSection.scrollIntoView({ behavior: 'smooth', block: 'start' }); else window.scrollTo({ top: 0, behavior: 'smooth' }); }, 50); }}
                variant="outline"
              >
                <Separator className="w-4 h-0.5" />
                Add Divider
              </Button>
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
                    Add Document
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