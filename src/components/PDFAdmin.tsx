import { useState } from 'react';
import { Plus, Upload, Trash2, Edit, Eye, GripVertical, FileText, Minus } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
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
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface PDF {
  id: string;
  title: string;
  date: string;
  pdfUrl: string;
  thumbnail: string;
}

interface Divider {
  id: string;
  type: 'divider';
  text: string;
}

type GalleryItem = PDF | Divider;

interface PDFAdminProps {
  items: GalleryItem[];
  onItemsChange: (items: GalleryItem[]) => void;
}

interface SortableItemProps {
  item: GalleryItem;
  onEdit: (item: GalleryItem) => void;
  onDelete: (id: string) => void;
  isSelected: boolean;
  onSelect: (id: string, selected: boolean) => void;
}

const SortableItem = ({ item, onEdit, onDelete, isSelected, onSelect }: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
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
              <div className="w-12 h-12 bg-muted rounded flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold">{(item as PDF).title}</h3>
                <p className="text-sm text-muted-foreground">{(item as PDF).date}</p>
                <p className="text-xs text-muted-foreground truncate max-w-xs">
                  {(item as PDF).pdfUrl}
                </p>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {!('type' in item && item.type === 'divider') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open((item as PDF).pdfUrl, '_blank')}
            >
              <Eye className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(item)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(item.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const PDFAdmin = ({ items, onItemsChange }: PDFAdminProps) => {
  const [isAddingPDF, setIsAddingPDF] = useState(false);
  const [isAddingDivider, setIsAddingDivider] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [pdfFormData, setPdfFormData] = useState({
    title: '',
    date: '',
    pdfUrl: '',
    thumbnail: ''
  });
  const [dividerFormData, setDividerFormData] = useState({
    text: ''
  });
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const saveItemsToWP = async (updatedItems: GalleryItem[]) => {
    const wp = (window as any).wpPDFGallery;
    if (wp?.ajaxUrl && wp?.nonce) {
      try {
        const form = new FormData();
        form.append('action', 'pdf_gallery_action');
        form.append('action_type', 'save_items');
        form.append('nonce', wp.nonce);
        form.append('items', JSON.stringify(updatedItems));

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

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);
      
      // Save to WordPress first
      const saved = await saveItemsToWP(newItems);
      
      if (saved) {
        onItemsChange(newItems);
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

  const handleSubmitPDF = async () => {
    if (!pdfFormData.title || !pdfFormData.date || !pdfFormData.pdfUrl) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }

    let updated: GalleryItem[];
    
    if (editingId) {
      // Update existing PDF
      updated = items.map(item =>
        item.id === editingId && !('type' in item && item.type === 'divider')
          ? { ...item, ...pdfFormData }
          : item
      );
    } else {
      // Add new PDF at the top
      const newPDF: PDF = {
        id: Date.now().toString(),
        ...pdfFormData,
        thumbnail: pdfFormData.thumbnail || '/placeholder-pdf.jpg'
      };
      updated = [newPDF, ...items];
    }

    // Save to WordPress first
    const saved = await saveItemsToWP(updated);
    
    if (saved) {
      onItemsChange(updated);
      toast({
        title: editingId ? "Updated" : "Added",
        description: `PDF has been ${editingId ? 'updated' : 'added'} successfully`,
      });
      resetPDFForm();
    } else {
      toast({
        title: "Error",
        description: "Could not save PDF",
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

    let updated: GalleryItem[];
    
    if (editingId) {
      // Update existing divider
      updated = items.map(item =>
        item.id === editingId && ('type' in item && item.type === 'divider')
          ? { ...item, text: dividerFormData.text }
          : item
      );
    } else {
      // Add new divider at the top
      const newDivider: Divider = {
        id: Date.now().toString(),
        type: 'divider',
        text: dividerFormData.text
      };
      updated = [newDivider, ...items];
    }

    // Save to WordPress first
    const saved = await saveItemsToWP(updated);
    
    if (saved) {
      onItemsChange(updated);
      toast({
        title: editingId ? "Updated" : "Added",
        description: `Divider has been ${editingId ? 'updated' : 'added'} successfully`,
      });
      resetDividerForm();
    } else {
      toast({
        title: "Error",
        description: "Could not save divider",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      const updated = items.filter(item => item.id !== id);
      
      // Save to WordPress first
      const saved = await saveItemsToWP(updated);
      
      if (saved) {
        onItemsChange(updated);
        toast({
          title: "Deleted",
          description: "Item has been deleted successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Could not delete item",
          variant: "destructive",
        });
      }
    }
  };

  const handleEdit = (item: GalleryItem) => {
    if ('type' in item && item.type === 'divider') {
      setDividerFormData({ text: item.text });
      setEditingId(item.id);
      setIsAddingDivider(true);
    } else {
      const pdf = item as PDF;
      setPdfFormData({
        title: pdf.title,
        date: pdf.date,
        pdfUrl: pdf.pdfUrl,
        thumbnail: pdf.thumbnail
      });
      setEditingId(item.id);
      setIsAddingPDF(true);
    }
  };

  const resetPDFForm = () => {
    setPdfFormData({
      title: '',
      date: '',
      pdfUrl: '',
      thumbnail: ''
    });
    setIsAddingPDF(false);
    setEditingId(null);
  };

  const resetDividerForm = () => {
    setDividerFormData({ text: '' });
    setIsAddingDivider(false);
    setEditingId(null);
  };

  const handleSelect = (id: string, selected: boolean) => {
    const newSelected = new Set(selectedItems);
    if (selected) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(items.map(item => item.id)));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedItems.size === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedItems.size} item(s)?`)) {
      const updated = items.filter(item => !selectedItems.has(item.id));
      
      // Save to WordPress first
      const saved = await saveItemsToWP(updated);
      
      if (saved) {
        onItemsChange(updated);
        setSelectedItems(new Set());
        toast({
          title: "Deleted",
          description: `${selectedItems.size} item(s) have been deleted successfully`,
        });
      } else {
        toast({
          title: "Error",
          description: "Could not delete selected items",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">PDF Management</h2>
          {items.length > 0 && (
            <div className="flex items-center gap-2">
              <Checkbox 
                checked={selectedItems.size === items.length && items.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-muted-foreground">
                {selectedItems.size > 0 ? `${selectedItems.size} selected` : 'Select all'}
              </span>
            </div>
          )}
        </div>
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
            onClick={() => setIsAddingPDF(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add PDF
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
      {isAddingPDF && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingId ? 'Edit PDF' : 'Add New PDF'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={pdfFormData.title}
                onChange={(e) => setPdfFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="PDF Title"
              />
            </div>
            
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                value={pdfFormData.date}
                onChange={(e) => setPdfFormData(prev => ({ ...prev, date: e.target.value }))}
                placeholder="January 2024"
              />
            </div>
            
            <div>
              <Label htmlFor="pdfUrl">PDF URL</Label>
              <Input
                id="pdfUrl"
                value={pdfFormData.pdfUrl}
                onChange={(e) => setPdfFormData(prev => ({ ...prev, pdfUrl: e.target.value }))}
                placeholder="https://example.com/document.pdf"
              />
            </div>
            
            <div>
              <Label htmlFor="thumbnail">Thumbnail URL (optional)</Label>
              <Input
                id="thumbnail"
                value={pdfFormData.thumbnail}
                onChange={(e) => setPdfFormData(prev => ({ ...prev, thumbnail: e.target.value }))}
                placeholder="https://example.com/thumbnail.jpg"
              />
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleSubmitPDF}>
                {editingId ? 'Update' : 'Add'}
              </Button>
              <Button variant="outline" onClick={resetPDFForm}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Divider Add/Edit Form */}
      {isAddingDivider && (
        <Card>
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
                isSelected={selectedItems.has(item.id)}
                onSelect={handleSelect}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      {items.length === 0 && !isAddingPDF && !isAddingDivider && (
        <Card>
          <CardContent className="text-center py-8">
            <Upload className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No items yet</h3>
            <p className="text-muted-foreground mb-4">
              Start by adding your first PDF or divider.
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => setIsAddingPDF(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add first PDF
              </Button>
              <Button variant="outline" onClick={() => setIsAddingDivider(true)}>
                <Separator className="w-4 h-0.5" />
                Add divider
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PDFAdmin;