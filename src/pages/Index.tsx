import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Check } from 'lucide-react';
import PDFGallery from '@/components/PDFGallery';
import PDFAdmin from '@/components/PDFAdmin';
import PDFSettings from '@/components/PDFSettings';
import pdfPlaceholder from '@/assets/pdf-placeholder.png';
import logo from '@/assets/pdf-gallery-logo.png';

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
    defaultPlaceholder: 'default',
    thumbnailSize: 'four-rows'
  });
  const [shortcodeCopied, setShortcodeCopied] = useState(false);

  // Load gallery items and settings from WordPress
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const wp = (typeof window !== 'undefined' && (window as any).wpPDFGallery) ? (window as any).wpPDFGallery : null;
    const ajaxUrl = wp?.ajaxUrl || urlParams.get('ajax') || `${window.location.origin}/wp-admin/admin-ajax.php`;
    const nonce = wp?.nonce || urlParams.get('nonce') || '';

    // Determine admin context via wp object or shortcode param
    const isWordPressAdmin = !!wp?.isAdmin || urlParams.get('admin') === 'true';
    
    if (ajaxUrl && nonce) {
      // Fetch gallery items
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

      // Also fetch settings (needed for frontend visitors too)
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


  const copyShortcode = async () => {
    const shortcode = '[pdf_gallery]';
    try {
      await navigator.clipboard.writeText(shortcode);
      setShortcodeCopied(true);
      setTimeout(() => setShortcodeCopied(false), 2000);
    } catch (e) {}
  };


  // Check if we should show admin interface (Lovable preview or WordPress admin)
  const urlParams = new URLSearchParams(window.location.search);
  const wp = (typeof window !== 'undefined' && (window as any).wpPDFGallery) ? (window as any).wpPDFGallery : null;
  const isWordPressAdmin = !!wp?.isAdmin || urlParams.get('admin') === 'true';
  const hostname = window.location.hostname;
  const isLovablePreview = hostname.includes('lovable.app') || hostname === 'localhost';

  // Show admin interface only in WordPress admin area or Lovable preview
  const showAdmin = isLovablePreview || isWordPressAdmin;

  if (!showAdmin) {
    // Show only the frontend gallery for regular WordPress visitors
    return (
      <div className="w-full">
        <PDFGallery 
          items={galleryItems} 
          settings={settings} 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 flex items-center gap-3">
          <img src={logo} alt="PDF Gallery logo" className="w-[400px] h-auto" />
        </div>
        <Tabs defaultValue="management" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="management">Gallery Management</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="documentation">Documentation</TabsTrigger>
          </TabsList>
          
          <TabsContent value="management" className="mt-6">
            <PDFAdmin items={galleryItems} onItemsChange={setGalleryItems} />
          </TabsContent>
          
          <TabsContent value="settings" className="mt-6">
            <PDFSettings 
              settings={settings} 
              onSettingsChange={setSettings} 
            />
          </TabsContent>
          
          <TabsContent value="preview" className="mt-6">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h2 className="text-2xl font-bold">Preview Gallery</h2>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Input readOnly value="[pdf_gallery]" className="font-mono w-full sm:w-56" />
                  <Button
                    onClick={copyShortcode}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    {shortcodeCopied ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    {shortcodeCopied ? 'Copied!' : 'Copy Shortcode'}
                  </Button>
                </div>
              </div>
              <Card>
                <CardContent className="p-6">
                  <PDFGallery 
                    items={galleryItems} 
                    settings={settings} 
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="documentation" className="mt-6">
            <Card>
              <CardContent className="p-0">
                <iframe
                  src="https://kindpixels.com/pdf-gallery/documentation/"
                  title="PDF Gallery Documentation"
                  className="w-full"
                  style={{ height: '70vh', border: '0' }}
                  loading="lazy"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
