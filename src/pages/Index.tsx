import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PDFGallery from '@/components/PDFGallery';
import PDFAdmin from '@/components/PDFAdmin';
import pdfPlaceholder from '@/assets/pdf-placeholder.png';

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

const initialPDFs: PDF[] = [
  {
    id: '1',
    title: 'When Jesus Calls Us by Name',
    date: 'April 2025',
    pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/04/newsletter2504_Cand-Isus-Ne-Cheama-Pe-Nume.pdf',
    thumbnail: pdfPlaceholder,
  },
  {
    id: '2',
    title: 'From Death to Life',
    date: 'March 2025',
    pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/04/newsletter2503_De-la-Moarte-la-Viata.pdf',
    thumbnail: pdfPlaceholder,
  },
  {
    id: '3',
    title: 'From Fever to Christ',
    date: 'February 2025',
    pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/04/newsletter2502_De-La-Februs-La-Hristos.pdf',
    thumbnail: pdfPlaceholder,
  },
  {
    id: '4',
    title: 'What the Future Holds',
    date: 'January 2025',
    pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/04/newsletter2501_Ce-Ne-Rezerva-Viitorul.pdf',
    thumbnail: pdfPlaceholder,
  },
  {
    id: '5',
    title: 'Reflections on the Gift of Salvation',
    date: 'December 2024',
    pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/04/newsletter2412_Reflectii-asupra-darului-mantuirii.pdf',
    thumbnail: pdfPlaceholder,
  },
  {
    id: '6',
    title: 'The Eleventh Hour',
    date: 'November 2024',
    pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/04/newsletter2511_Ceasul-Al-Unsprezecelea.pdf',
    thumbnail: pdfPlaceholder,
  },
];

const Index = () => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');

// Load gallery items from WordPress and check admin access
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);

  const wp = (typeof window !== 'undefined' && (window as any).wpPDFGallery) ? (window as any).wpPDFGallery : null;

  const isAdminFlag = wp ? !!wp.isAdmin : urlParams.get('admin') === 'true';
  setIsAdmin(!!isAdminFlag);

  const ajaxUrl = wp?.ajaxUrl || urlParams.get('ajax') || `${window.location.origin}/wp-admin/admin-ajax.php`;
  const nonce = wp?.nonce || urlParams.get('nonce') || '';

  if (ajaxUrl && nonce) {
    const form = new FormData();
    form.append('action', 'pdf_gallery_action');
    form.append('action_type', 'get_items');
    form.append('nonce', nonce);

    fetch(ajaxUrl, {
      method: 'POST',
      credentials: 'same-origin',
      body: form,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && Array.isArray(data?.data?.items)) {
          setGalleryItems(data.data.items as GalleryItem[]);
        } else {
          setGalleryItems(initialPDFs);
        }
      })
      .catch(() => {
        setGalleryItems(initialPDFs);
      });
  } else {
    // Fallback for development or when no config is provided
    setGalleryItems(initialPDFs);
  }
}, []);

  const handleAdminLogin = () => {
    // Simple password check - you can change this password
    if (adminPassword === 'admin2025') {
      setIsAdmin(true);
      setShowAdminDialog(false);
      setAdminPassword('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdminLogin();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto">{/* Removed py-8 to eliminate top spacing */}
        {isAdmin ? (
          <Tabs defaultValue="gallery" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="gallery">PDF Gallery Preview</TabsTrigger>
              <TabsTrigger value="admin">PDF Management</TabsTrigger>
            </TabsList>
            
            <TabsContent value="gallery" className="mt-0">
              <PDFGallery 
                items={galleryItems}
                title="PDF Gallery"
                description="Browse our collection of PDF documents"
              />
            </TabsContent>
            
            <TabsContent value="admin" className="mt-0">
              <PDFAdmin 
                items={galleryItems}
                onItemsChange={setGalleryItems}
              />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="w-full">
            <PDFGallery 
              items={galleryItems}
              title="PDF Gallery"
              description="Browse our collection of PDF documents"
            />
            
          </div>
        )}

        <Dialog open={showAdminDialog} onOpenChange={setShowAdminDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Admin Access</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                type="password"
                placeholder="Enter admin password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <Button onClick={handleAdminLogin} className="w-full">
                Login
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Index;
