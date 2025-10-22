import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useLicense } from '@/hooks/useLicense';
import { Gallery } from '@/types/gallery';

interface GallerySelectorProps {
  galleries: Gallery[];
  currentGalleryId: string;
  onGalleryChange: (galleryId: string) => void;
  onGalleryCreate: (name: string) => void;
  onGalleryRename: (galleryId: string, newName: string) => void;
  onGalleryDelete: (galleryId: string) => void;
}

export const GallerySelector = ({
  galleries,
  currentGalleryId,
  onGalleryChange,
  onGalleryCreate,
  onGalleryRename,
  onGalleryDelete,
}: GallerySelectorProps) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [newGalleryName, setNewGalleryName] = useState('');
  const [renameGalleryName, setRenameGalleryName] = useState('');
  const { toast } = useToast();
  const license = useLicense();

  const currentGallery = galleries.find(g => g.id === currentGalleryId);

  // Ensure a default gallery is selected when none is set
  useEffect(() => {
    if ((!currentGalleryId || !galleries.some(g => g.id === currentGalleryId)) && galleries.length > 0) {
      onGalleryChange(galleries[0].id);
    }
  }, [currentGalleryId, galleries, onGalleryChange]);

  const handleCreateGallery = () => {
    if (!license.isPro && galleries.length >= 1) {
      toast({
        title: "Pro Feature Required",
        description: "The free version supports one gallery. Upgrade to Pro to create unlimited galleries.",
        variant: "destructive",
      });
      return;
    }

    if (!newGalleryName.trim()) {
      toast({
        title: "Error",
        description: "Gallery name is required",
        variant: "destructive",
      });
      return;
    }

    if (galleries.some(g => g.name.toLowerCase() === newGalleryName.trim().toLowerCase())) {
      toast({
        title: "Error",
        description: "A gallery with this name already exists",
        variant: "destructive",
      });
      return;
    }

    onGalleryCreate(newGalleryName.trim());
    setNewGalleryName('');
    setIsCreateDialogOpen(false);
    toast({
      title: "Success",
      description: "Gallery created successfully",
    });
  };

  const handleRenameGallery = () => {
    if (!renameGalleryName.trim()) {
      toast({
        title: "Error",
        description: "Gallery name is required",
        variant: "destructive",
      });
      return;
    }

    if (galleries.some(g => g.id !== currentGalleryId && g.name.toLowerCase() === renameGalleryName.trim().toLowerCase())) {
      toast({
        title: "Error",
        description: "A gallery with this name already exists",
        variant: "destructive",
      });
      return;
    }

    onGalleryRename(currentGalleryId, renameGalleryName.trim());
    setRenameGalleryName('');
    setIsRenameDialogOpen(false);
    toast({
      title: "Success",
      description: "Gallery renamed successfully",
    });
  };

  const handleDeleteGallery = () => {
    if (galleries.length <= 1) {
      toast({
        title: "Error",
        description: "Cannot delete the last gallery",
        variant: "destructive",
      });
      return;
    }

    onGalleryDelete(currentGalleryId);
    toast({
      title: "Success",
      description: "Gallery deleted successfully",
    });
  };

  // If only one gallery exists, show just the name with management buttons
  if (galleries.length === 1) {
    return (
      <div className="flex items-center gap-2">
        <span className="font-medium text-foreground">{currentGallery?.name || 'Main Gallery'}</span>
        <div className="flex items-center gap-1">
          <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
            <DialogTrigger asChild>
               <Button
                 variant="ghost"
                 size="sm"
                 className="h-8 w-8 p-0"
                 aria-label="Rename Gallery"
                 title="Rename Gallery"
                 onClick={() => setRenameGalleryName(currentGallery?.name || '')}
               >
                <Edit2 className="h-3 w-3" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Rename Gallery</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
               <div className="space-y-3">
                  <Label htmlFor="rename-gallery">Gallery Name</Label>
                 <Input
                    id="rename-gallery"
                    value={renameGalleryName}
                    onChange={(e) => setRenameGalleryName(e.target.value)}
                    placeholder="Enter gallery name"
                    onKeyDown={(e) => e.key === 'Enter' && handleRenameGallery()}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleRenameGallery}>
                    Rename
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
               <Button
                 variant="ghost"
                 size="sm"
                 className="h-8 w-8 p-0"
                 aria-label="Add Gallery"
                 title="Add Gallery"
               >
                <Plus className="h-3 w-3" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Gallery</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
               <div className="space-y-3">
                  <Label htmlFor="new-gallery">Gallery Name</Label>
                 <Input
                    id="new-gallery"
                    value={newGalleryName}
                    onChange={(e) => setNewGalleryName(e.target.value)}
                    placeholder="Enter gallery name"
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateGallery()}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateGallery}>
                    Create Gallery
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }

  // Multiple galleries - show dropdown selector with management buttons
  return (
    <div className="flex items-center gap-2">
      <Select value={currentGalleryId || (galleries[0]?.id ?? '')} onValueChange={onGalleryChange}>
        <SelectTrigger className="w-56">
          <SelectValue placeholder={currentGallery?.name || galleries[0]?.name || 'Select gallery'} />
        </SelectTrigger>
        <SelectContent>
          {galleries.map((gallery) => (
            <SelectItem key={gallery.id} value={gallery.id}>
              {gallery.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-center gap-1">
        <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
          <DialogTrigger asChild>
             <Button
               variant="ghost"
               size="sm"
               className="h-8 w-8 p-0"
               aria-label="Rename Gallery"
               title="Rename Gallery"
               onClick={() => setRenameGalleryName(currentGallery?.name || '')}
             >
              <Edit2 className="h-3 w-3" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rename Gallery</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
               <div className="space-y-3">
                  <Label htmlFor="rename-gallery">Gallery Name</Label>
                 <Input
                  id="rename-gallery"
                  value={renameGalleryName}
                  onChange={(e) => setRenameGalleryName(e.target.value)}
                  placeholder="Enter gallery name"
                  onKeyDown={(e) => e.key === 'Enter' && handleRenameGallery()}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleRenameGallery}>
                  Rename
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <AlertDialog>
          <AlertDialogTrigger asChild>
             <Button
               variant="ghost"
               size="sm"
               className="h-8 w-8 p-0 text-destructive hover:text-destructive"
               aria-label="Delete Gallery"
               title="Delete Gallery"
             >
              <Trash2 className="h-3 w-3" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Gallery</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the gallery "{currentGallery?.name}"? This action cannot be undone and will permanently delete all documents in this gallery.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex items-center gap-2">
              <AlertDialogCancel className="h-9 mt-0">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteGallery} className="h-9 bg-destructive text-destructive-foreground hover:bg-destructive/90 mt-0">
                Delete Gallery
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
             <Button
               variant="ghost"
               size="sm"
               className="h-8 w-8 p-0"
               aria-label="Add Gallery"
               title="Add Gallery"
             >
              <Plus className="h-3 w-3" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Gallery</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
               <div className="space-y-3">
                  <Label htmlFor="new-gallery">Gallery Name</Label>
                 <Input
                  id="new-gallery"
                  value={newGalleryName}
                  onChange={(e) => setNewGalleryName(e.target.value)}
                  placeholder="Enter gallery name"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateGallery()}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateGallery}>
                  Create Gallery
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};