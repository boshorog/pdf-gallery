import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ChevronDown, Copy, Check } from 'lucide-react';
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
import { Gallery } from '@/types/gallery';
import { BUILD_FLAGS } from '@/config/buildFlags';

interface GallerySelectorProps {
  galleries: Gallery[];
  currentGalleryId: string;
  isPro: boolean;
  onGalleryChange: (galleryId: string) => void;
  onGalleryCreate: (name: string) => void;
  onGalleryRename: (galleryId: string, newName: string) => void;
  onGalleryDelete: (galleryId: string) => void;
}

export const GallerySelector = ({
  galleries,
  currentGalleryId,
  isPro,
  onGalleryChange,
  onGalleryCreate,
  onGalleryRename,
  onGalleryDelete,
}: GallerySelectorProps) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [newGalleryName, setNewGalleryName] = useState('');
  const [renameGalleryName, setRenameGalleryName] = useState('');
  const [shortcodeCopied, setShortcodeCopied] = useState(false);
  const { toast } = useToast();

  const currentGallery = galleries.find(g => g.id === currentGalleryId);

  // Ensure a default gallery is selected when none is set
  // Only run when there's no valid selection (not when galleries change during create)
  useEffect(() => {
    if (galleries.length > 0 && (!currentGalleryId || !galleries.some(g => g.id === currentGalleryId))) {
      onGalleryChange(galleries[0].id);
    }
  }, [galleries.length, currentGalleryId]); // Removed galleries and onGalleryChange from deps to prevent loops

  const handleCreateGallery = () => {
    // In free build, multi-gallery is not available at all
    // In pro build, check runtime license for edge cases
    if (!BUILD_FLAGS.MULTI_GALLERY_UI || (!isPro && galleries.length >= 1)) {
      toast({
        title: "Pro Feature Required",
        description: "Multiple galleries require the Pro addon. Upgrade to Pro for unlimited galleries.",
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

  const handleCopyShortcode = async () => {
    const galleryName = currentGallery?.name || 'main';
    const shortcode = `[kindpdfg_gallery name="${galleryName.toLowerCase().replace(/[^a-z0-9-_]/g, '-')}"]`;
    try {
      await navigator.clipboard.writeText(shortcode);
      setShortcodeCopied(true);
      toast({
        title: "Shortcode Copied",
        description: shortcode,
      });
      setTimeout(() => setShortcodeCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Could not copy shortcode to clipboard",
        variant: "destructive",
      });
    }
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

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            aria-label="Copy Shortcode"
            title="Copy Shortcode"
            onClick={handleCopyShortcode}
          >
            {shortcodeCopied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
          </Button>

          {/* Add Gallery button - shown in Pro build when license is active */}
          {BUILD_FLAGS.MULTI_GALLERY_UI && isPro && (
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
          )}
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

        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          aria-label="Copy Shortcode"
          title="Copy Shortcode"
          onClick={handleCopyShortcode}
        >
          {shortcodeCopied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
        </Button>

        {/* Add Gallery button - shown in Pro build when license is active */}
        {BUILD_FLAGS.MULTI_GALLERY_UI && isPro && (
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
        )}
      </div>
    </div>
  );
};