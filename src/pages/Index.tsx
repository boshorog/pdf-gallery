import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Check } from 'lucide-react';
import PDFGallery from '@/components/PDFGallery';
import PDFAdmin from '@/components/PDFAdmin';
import PDFSettings from '@/components/PDFSettings';
import ThumbnailStyleShowcase from '@/components/ThumbnailStyleShowcase';
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
  const [settings, setSettings] = useState({
    thumbnailStyle: 'default',
    accentColor: '#7FB3DC',
    thumbnailShape: 'landscape-16-9',
    pdfIconPosition: 'top-right',
    defaultPlaceholder: 'default'
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [shortcodeCopied, setShortcodeCopied] = useState(false);

  // Load gallery items and settings from WordPress and check admin access
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

    // Also fetch settings
    const settingsForm = new FormData();
    settingsForm.append('action', 'pdf_gallery_action');
    settingsForm.append('action_type', 'get_settings');
    settingsForm.append('nonce', nonce);

    fetch(ajaxUrl, {
      method: 'POST',
      credentials: 'same-origin',
      body: settingsForm,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && data?.data?.settings) {
          setSettings(data.data.settings);
        }
      })
      .catch(() => {});
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

  const copyShortcode = async () => {
    const shortcode = '[pdf_gallery]';
    try {
      await navigator.clipboard.writeText(shortcode);
      setShortcodeCopied(true);
      setTimeout(() => setShortcodeCopied(false), 2000);
    } catch (e) {}
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdminLogin();
    }
  };

  return (
    <div id="pdf-gallery-admin" data-plugin="pdf-gallery" className="bg-background">
      <div className="bg-background min-h-screen">
        {!isAdmin ? (
          <div className="flex items-center justify-center min-h-screen">
            <Card className="w-full max-w-md p-6">
              <CardContent className="space-y-4">
                <h1 className="text-2xl font-bold text-center">PDF Gallery Admin</h1>
                <p className="text-muted-foreground text-center">Enter the admin area</p>
                <Button onClick={() => setShowAdminDialog(true)} className="w-full">
                  Admin Login
                </Button>
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h2 className="font-semibold mb-2">Plugin Shortcode</h2>
                  <div className="flex gap-2">
                    <Input
                      value="[pdf_gallery]"
                      readOnly
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={copyShortcode}
                    >
                      {shortcodeCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Copy this shortcode to display the PDF gallery on any page or post.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Dialog open={showAdminDialog} onOpenChange={setShowAdminDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Admin Login</DialogTitle>
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
        ) : (
          <div className="container mx-auto p-6">
            <Tabs defaultValue="gallery" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="gallery">Gallery Management</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              
              <TabsContent value="gallery" className="mt-6">
                <PDFAdmin 
                  items={galleryItems} 
                  onItemsChange={setGalleryItems} 
                />
              </TabsContent>
              
              <TabsContent value="settings" className="mt-6">
                <PDFSettings 
                  settings={settings} 
                  onSettingsChange={setSettings} 
                />
              </TabsContent>
              
              <TabsContent value="preview" className="mt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Gallery Preview</h3>
                    <div className="flex gap-2">
                      <Input
                        value="[pdf_gallery]"
                        readOnly
                        className="w-32"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={copyShortcode}
                      >
                        {shortcodeCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <PDFGallery 
                    items={galleryItems} 
                    settings={settings} 
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
