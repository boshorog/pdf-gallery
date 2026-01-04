import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Copy } from 'lucide-react';
import PDFAdmin from '@/components/PDFAdmin';
import PDFGallery from '@/components/PDFGallery';
import PDFSettings from '@/components/PDFSettings';
import SettingsProposal2 from '@/components/SettingsProposal2';



import { Gallery, GalleryItem, GalleryState } from '@/types/gallery';
import pluginLogo from '@/assets/pdf-gallery-logo.png';

// Initial PDF data (fallback for development)
const initialPDFs: GalleryItem[] = [
  {
    id: '1',
    title: 'Newsletter January 2024',
    date: 'January 2024',
    pdfUrl: '/src/assets/newsletter-thumbnail-1.jpg',
    thumbnail: '/src/assets/newsletter-thumbnail-1.jpg',
    fileType: 'pdf'
  },
  {
    id: '2',
    title: 'Newsletter February 2024',
    date: 'February 2024',
    pdfUrl: '/src/assets/newsletter-thumbnail-2.jpg',
    thumbnail: '/src/assets/newsletter-thumbnail-2.jpg',
    fileType: 'pdf'
  },
  {
    id: '3',
    title: 'Newsletter March 2024',
    date: 'March 2024',
    pdfUrl: '/src/assets/newsletter-thumbnail-3.jpg',
    thumbnail: '/src/assets/newsletter-thumbnail-3.jpg',
    fileType: 'pdf'
  },
  {
    id: '4',
    title: 'Newsletter April 2024',
    date: 'April 2024',
    pdfUrl: '/src/assets/newsletter-thumbnail-4.jpg',
    thumbnail: '/src/assets/newsletter-thumbnail-4.jpg',
    fileType: 'pdf'
  }
];

const Index = () => {
  const [galleryState, setGalleryState] = useState<GalleryState>({
    galleries: [],
    currentGalleryId: ''
  });
  const [settings, setSettings] = useState({
    thumbnailStyle: 'default',
    accentColor: '#7FB3DC',
    thumbnailShape: 'landscape-16-9',
    pdfIconPosition: 'top-right',
    defaultPlaceholder: 'default'
  });
  const [shortcodeCopied, setShortcodeCopied] = useState(false);

  useEffect(() => {
    const wp = (typeof window !== 'undefined' && (window as any).wpPDFGallery) ? (window as any).wpPDFGallery : null;
    const urlParams = new URLSearchParams(window.location.search);
    const ajaxUrl = wp?.ajaxUrl || urlParams.get('ajax');
    const nonce = wp?.nonce || urlParams.get('nonce') || '';
    const requestedGalleryName = urlParams.get('name') || '';
    if (ajaxUrl && nonce) {
      // Fetch galleries from WordPress
      const form = new FormData();
      form.append('action', 'pdf_gallery_action');
      form.append('action_type', 'get_galleries');
      form.append('nonce', nonce);
      if (requestedGalleryName) { form.append('requested_gallery_name', requestedGalleryName); }
      fetch(ajaxUrl, {
        method: 'POST',
        credentials: 'same-origin',
        body: form,
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.success && data?.data) {
            let galleries = data.data.galleries || [];
            let currentGalleryId = data.data.current_gallery_id || '';
            
            if (galleries.length === 0) {
              // Try to restore from local backup if available
              try {
                const backupRaw = localStorage.getItem('pdf_gallery_backup');
                const backup = backupRaw ? JSON.parse(backupRaw) : null;
                if (Array.isArray(backup) && backup.length > 0) {
                  // Ensure galleries have proper structure with names
                  const restoredGalleries = backup.map((gallery: any) => ({
                    id: gallery.id || 'main',
                    name: gallery.name || 'Main Gallery',
                    items: Array.isArray(gallery.items) ? gallery.items : [],
                    createdAt: gallery.createdAt || new Date().toISOString(),
                  }));
                  
                  // Attempt server restore so it persists
                  const restoreForm = new FormData();
                  restoreForm.append('action', 'pdf_gallery_action');
                  restoreForm.append('action_type', 'save_galleries');
                  restoreForm.append('nonce', nonce);
                  restoreForm.append('galleries', JSON.stringify(restoredGalleries));
                  restoreForm.append('current_gallery_id', restoredGalleries[0]?.id || 'main');
                  fetch(ajaxUrl, { method: 'POST', credentials: 'same-origin', body: restoreForm }).catch(() => {});
                  setGalleryState({
                    galleries: restoredGalleries,
                    currentGalleryId: restoredGalleries[0]?.id || 'main',
                  });
                  return; // Done
                }
              } catch {}

              // Create test gallery with sample data
              const testGallery: Gallery = {
                id: 'test',
                name: 'Test Gallery',
                items: [
                  { id: 'div-1', type: 'divider', text: 'First Section' },
                  { id: 'pdf-1', title: 'Sample Document 1', date: 'January 2025', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2501_Ce-Ne-Rezerva-Viitorul.pdf', thumbnail: '', fileType: 'pdf' },
                  { id: 'pdf-2', title: 'Sample Document 2', date: 'February 2025', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2502_De-La-Februs-La-Hristos.pdf', thumbnail: '', fileType: 'pdf' },
                  { id: 'pdf-3', title: 'Sample Document 3', date: 'March 2025', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2503_De-la-Moarte-la-Viata.pdf', thumbnail: '', fileType: 'pdf' },
                  { id: 'pdf-4', title: 'Sample Document 4', date: 'April 2025', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2504_Cand-Isus-Ne-Cheama-Pe-Nume.pdf', thumbnail: '', fileType: 'pdf' },
                  { id: 'pdf-5', title: 'Sample Document 5', date: 'May 2025', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2505_Inaltarea-Mantuitorului.pdf', thumbnail: '', fileType: 'pdf' },
                  { id: 'pdf-6', title: 'Sample Document 6', date: 'June 2025', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2506_Putere-Pentru-O-Viata-Transformata.pdf', thumbnail: '', fileType: 'pdf' },
                  { id: 'pdf-7', title: 'Sample Document 7', date: 'July 2025', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2507_Va-Gasi-Rod.pdf', thumbnail: '', fileType: 'pdf' },
                  { id: 'div-2', type: 'divider', text: 'Second Section' },
                  { id: 'pdf-8', title: 'Sample Document 1', date: 'January 2024', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2401_Un-Gand-Pentru-Anul-Nou.pdf', thumbnail: '', fileType: 'pdf' },
                  { id: 'pdf-9', title: 'Sample Document 2', date: 'February 2024', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2402_Risipa-De-Iubire.pdf', thumbnail: '', fileType: 'pdf' },
                  { id: 'pdf-10', title: 'Sample Document 3', date: 'March 2024', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2403_Lucruri-Noi.pdf', thumbnail: '', fileType: 'pdf' },
                  { id: 'pdf-11', title: 'Sample Document 4', date: 'April 2024', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2404_O-Sarbatoare-Dulce-Amaruie.pdf', thumbnail: '', fileType: 'pdf' },
                ] as GalleryItem[],
                createdAt: new Date().toISOString(),
              };
              setGalleryState({
                galleries: [testGallery],
                currentGalleryId: 'test'
              });
              // Persist default test gallery on fresh install
              try { localStorage.setItem('pdf_gallery_backup', JSON.stringify([testGallery])); } catch {}
              if (ajaxUrl && nonce) {
                const saveForm = new FormData();
                saveForm.append('action', 'pdf_gallery_action');
                saveForm.append('action_type', 'save_galleries');
                saveForm.append('nonce', nonce);
                saveForm.append('galleries', JSON.stringify([testGallery]));
                saveForm.append('current_gallery_id', 'test');
                fetch(ajaxUrl, { method: 'POST', credentials: 'same-origin', body: saveForm }).catch(() => {});
              }
            } else {
              // If no current gallery is set, use the first gallery
              if (requestedGalleryName) {
                const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9-_]/g, '-');
                const match = galleries.find((g: Gallery) => slug(g.name) === slug(requestedGalleryName));
                if (match) { currentGalleryId = match.id; }
              }
              if (!currentGalleryId && galleries.length > 0) {
                currentGalleryId = galleries[0].id;
              }

              // Server data is the source of truth - save to local backup
              try {
                localStorage.setItem('pdf_gallery_backup', JSON.stringify(galleries));
              } catch {}
              
              setGalleryState({
                galleries,
                currentGalleryId: currentGalleryId
              });
            }
          } else {
            // Create test gallery for development
            const testGallery: Gallery = {
              id: 'test',
              name: 'Test Gallery',
              items: [
                { id: 'div-1', type: 'divider', text: 'First Section' },
                { id: 'pdf-1', title: 'Sample Document 1', date: 'January 2025', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2501_Ce-Ne-Rezerva-Viitorul.pdf', thumbnail: '', fileType: 'pdf' },
                { id: 'pdf-2', title: 'Sample Document 2', date: 'February 2025', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2502_De-La-Februs-La-Hristos.pdf', thumbnail: '', fileType: 'pdf' },
                { id: 'pdf-3', title: 'Sample Document 3', date: 'March 2025', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2503_De-la-Moarte-la-Viata.pdf', thumbnail: '', fileType: 'pdf' },
                { id: 'pdf-4', title: 'Sample Document 4', date: 'April 2025', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2504_Cand-Isus-Ne-Cheama-Pe-Nume.pdf', thumbnail: '', fileType: 'pdf' },
                { id: 'pdf-5', title: 'Sample Document 5', date: 'May 2025', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2505_Inaltarea-Mantuitorului.pdf', thumbnail: '', fileType: 'pdf' },
                { id: 'pdf-6', title: 'Sample Document 6', date: 'June 2025', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2506_Putere-Pentru-O-Viata-Transformata.pdf', thumbnail: '', fileType: 'pdf' },
                { id: 'pdf-7', title: 'Sample Document 7', date: 'July 2025', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2507_Va-Gasi-Rod.pdf', thumbnail: '', fileType: 'pdf' },
                { id: 'div-2', type: 'divider', text: 'Second Section' },
                { id: 'pdf-8', title: 'Sample Document 1', date: 'January 2024', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2401_Un-Gand-Pentru-Anul-Nou.pdf', thumbnail: '', fileType: 'pdf' },
                { id: 'pdf-9', title: 'Sample Document 2', date: 'February 2024', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2402_Risipa-De-Iubire.pdf', thumbnail: '', fileType: 'pdf' },
                { id: 'pdf-10', title: 'Sample Document 3', date: 'March 2024', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2403_Lucruri-Noi.pdf', thumbnail: '', fileType: 'pdf' },
                { id: 'pdf-11', title: 'Sample Document 4', date: 'April 2024', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2404_O-Sarbatoare-Dulce-Amaruie.pdf', thumbnail: '', fileType: 'pdf' },
              ] as GalleryItem[],
              createdAt: new Date().toISOString(),
            };
            setGalleryState({
              galleries: [testGallery],
              currentGalleryId: 'test'
            });
          }
        })
        .catch(() => {
          // Create test gallery for development
          const testGallery: Gallery = {
            id: 'test',
            name: 'Test Gallery',
            items: [
              { id: 'div-1', type: 'divider', text: 'First Section' },
              { id: 'pdf-1', title: 'Sample Document 1', date: 'January 2025', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2501_Ce-Ne-Rezerva-Viitorul.pdf', thumbnail: '', fileType: 'pdf' },
              { id: 'pdf-2', title: 'Sample Document 2', date: 'February 2025', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2502_De-La-Februs-La-Hristos.pdf', thumbnail: '', fileType: 'pdf' },
              { id: 'pdf-3', title: 'Sample Document 3', date: 'March 2025', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2503_De-la-Moarte-la-Viata.pdf', thumbnail: '', fileType: 'pdf' },
              { id: 'pdf-4', title: 'Sample Document 4', date: 'April 2025', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2504_Cand-Isus-Ne-Cheama-Pe-Nume.pdf', thumbnail: '', fileType: 'pdf' },
              { id: 'pdf-5', title: 'Sample Document 5', date: 'May 2025', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2505_Inaltarea-Mantuitorului.pdf', thumbnail: '', fileType: 'pdf' },
              { id: 'pdf-6', title: 'Sample Document 6', date: 'June 2025', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2506_Putere-Pentru-O-Viata-Transformata.pdf', thumbnail: '', fileType: 'pdf' },
              { id: 'pdf-7', title: 'Sample Document 7', date: 'July 2025', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2507_Va-Gasi-Rod.pdf', thumbnail: '', fileType: 'pdf' },
              { id: 'div-2', type: 'divider', text: 'Second Section' },
              { id: 'pdf-8', title: 'Sample Document 1', date: 'January 2024', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2401_Un-Gand-Pentru-Anul-Nou.pdf', thumbnail: '', fileType: 'pdf' },
              { id: 'pdf-9', title: 'Sample Document 2', date: 'February 2024', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2402_Risipa-De-Iubire.pdf', thumbnail: '', fileType: 'pdf' },
              { id: 'pdf-10', title: 'Sample Document 3', date: 'March 2024', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2403_Lucruri-Noi.pdf', thumbnail: '', fileType: 'pdf' },
              { id: 'pdf-11', title: 'Sample Document 4', date: 'April 2024', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2404_O-Sarbatoare-Dulce-Amaruie.pdf', thumbnail: '', fileType: 'pdf' },
            ] as GalleryItem[],
            createdAt: new Date().toISOString(),
          };
          setGalleryState({
            galleries: [testGallery],
            currentGalleryId: 'test'
          });
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
      // Fallback test gallery for development or when no config is provided
      const testGallery: Gallery = {
        id: 'test',
        name: 'Test Gallery',
        items: [
          { id: 'div-1', type: 'divider', text: 'First Section' },
          { id: 'pdf-1', title: 'Sample Document 1', date: 'January 2025', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2501_Ce-Ne-Rezerva-Viitorul.pdf', thumbnail: '', fileType: 'pdf' },
          { id: 'pdf-2', title: 'Sample Document 2', date: 'February 2025', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2502_De-La-Februs-La-Hristos.pdf', thumbnail: '', fileType: 'pdf' },
          { id: 'pdf-3', title: 'Sample Document 3', date: 'March 2025', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2503_De-la-Moarte-la-Viata.pdf', thumbnail: '', fileType: 'pdf' },
          { id: 'pdf-4', title: 'Sample Document 4', date: 'April 2025', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2504_Cand-Isus-Ne-Cheama-Pe-Nume.pdf', thumbnail: '', fileType: 'pdf' },
          { id: 'pdf-5', title: 'Sample Document 5', date: 'May 2025', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2505_Inaltarea-Mantuitorului.pdf', thumbnail: '', fileType: 'pdf' },
          { id: 'pdf-6', title: 'Sample Document 6', date: 'June 2025', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2506_Putere-Pentru-O-Viata-Transformata.pdf', thumbnail: '', fileType: 'pdf' },
          { id: 'pdf-7', title: 'Sample Document 7', date: 'July 2025', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2507_Va-Gasi-Rod.pdf', thumbnail: '', fileType: 'pdf' },
          { id: 'div-2', type: 'divider', text: 'Second Section' },
          { id: 'pdf-8', title: 'Sample Document 1', date: 'January 2024', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2401_Un-Gand-Pentru-Anul-Nou.pdf', thumbnail: '', fileType: 'pdf' },
          { id: 'pdf-9', title: 'Sample Document 2', date: 'February 2024', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2402_Risipa-De-Iubire.pdf', thumbnail: '', fileType: 'pdf' },
          { id: 'pdf-10', title: 'Sample Document 3', date: 'March 2024', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2403_Lucruri-Noi.pdf', thumbnail: '', fileType: 'pdf' },
          { id: 'pdf-11', title: 'Sample Document 4', date: 'April 2024', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2404_O-Sarbatoare-Dulce-Amaruie.pdf', thumbnail: '', fileType: 'pdf' },
        ] as GalleryItem[],
        createdAt: new Date().toISOString(),
      };
      setGalleryState({
        galleries: [testGallery],
        currentGalleryId: 'test'
      });
    }
  }, []);

  // Ensure first gallery is selected by default whenever galleries load
  useEffect(() => {
    if (galleryState.galleries.length > 0) {
      const exists = galleryState.galleries.some(g => g.id === galleryState.currentGalleryId);
      if (!galleryState.currentGalleryId || !exists) {
        setGalleryState(prev => ({ ...prev, currentGalleryId: prev.galleries[0].id }));
      }
    }
  }, [galleryState.galleries, galleryState.currentGalleryId]);


  const copyShortcode = async () => {
    const currentGallery = galleryState.galleries.find(g => g.id === galleryState.currentGalleryId);
    const galleryName = currentGallery?.name || 'main';
    const shortcode = `[pdf_gallery name="${galleryName.toLowerCase().replace(/[^a-z0-9-_]/g, '-')}"]`;
    try {
      await navigator.clipboard.writeText(shortcode);
      setShortcodeCopied(true);
      setTimeout(() => setShortcodeCopied(false), 2000);
    } catch (e) {}
  };

  const currentGallery = galleryState.galleries.find(g => g.id === galleryState.currentGalleryId);
  const currentItems = currentGallery?.items || [];


  // Check if we should show admin interface (Lovable preview or WordPress admin)
  const urlParams = new URLSearchParams(window.location.search);
  const wp = (typeof window !== 'undefined' && (window as any).wpPDFGallery) ? (window as any).wpPDFGallery : null;
  const isWordPressAdmin = !!wp?.isAdmin || urlParams.get('admin') === 'true';
  const hostname = window.location.hostname;
  const isLovablePreview = hostname.includes('lovable.app') || hostname.includes('lovableproject.com') || hostname === 'localhost';

  // Show admin interface only in WordPress admin area or Lovable preview
  const showAdmin = isLovablePreview || isWordPressAdmin;

  if (!showAdmin) {
    // Show only the frontend gallery for regular WordPress visitors
    return (
      <div className="w-full">
        <PDFGallery 
          items={currentItems} 
          settings={settings} 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Plugin Logo */}
        <div className="flex justify-start mb-6">
            <img 
              src={pluginLogo}
              alt="PDF Gallery Plugin Logo"
              className="w-[400px] h-auto"
            />
        </div>
        
        <Tabs defaultValue="gallery" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="gallery">Gallery Management</TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-1">
              Settings
              <sup className="ml-0">
                <span className="inline-block px-1.5 py-[3px] text-[9px] font-medium bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full leading-none">
                  Pro
                </span>
              </sup>
            </TabsTrigger>
            <TabsTrigger value="docs">Documentation</TabsTrigger>
          </TabsList>
          
          <TabsContent value="preview" className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Gallery Shortcode</h3>
              <p className="text-muted-foreground mb-4">
                Copy this shortcode to display the current gallery on any page or post:
              </p>
              <div className="flex items-center justify-center gap-2">
                <code className="bg-muted px-3 py-2 rounded text-sm font-mono">
                  {(() => {
                    const galleryName = currentGallery?.name || 'main';
                    return `[pdf_gallery name="${galleryName.toLowerCase().replace(/[^a-z0-9-_]/g, '-')}"]`;
                  })()}
                </code>
                <Button 
                  onClick={copyShortcode}
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {shortcodeCopied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>
            <PDFGallery 
              items={currentItems} 
              settings={settings} 
            />
          </TabsContent>
          
          <TabsContent value="gallery">
            <PDFAdmin 
              galleries={galleryState.galleries}
              currentGalleryId={galleryState.currentGalleryId}
              onGalleriesChange={(galleries) => setGalleryState(prev => ({ ...prev, galleries }))}
              onCurrentGalleryChange={(galleryId) => setGalleryState(prev => ({ ...prev, currentGalleryId: galleryId }))}
            />
          </TabsContent>
          
          
          <TabsContent value="settings">
            <SettingsProposal2 settings={settings} onSettingsChange={setSettings} />
          </TabsContent>
          
          <TabsContent value="docs">
            <Card>
              <CardHeader>
                <CardTitle>Plugin Documentation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full h-[600px] border rounded-lg overflow-hidden">
                  <iframe 
                    src="https://kindpixels.com/pdf-gallery-plugin-docs/" 
                    className="w-full h-full"
                    title="PDF Gallery Plugin Documentation"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;