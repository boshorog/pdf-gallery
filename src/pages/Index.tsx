import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import NewsletterGallery from '@/components/NewsletterGallery';
import NewsletterAdmin from '@/components/NewsletterAdmin';
import pdfPlaceholder from '@/assets/pdf-placeholder.png';

interface Newsletter {
  id: string;
  title: string;
  date: string;
  pdfUrl: string;
  thumbnail: string;
}

const initialNewsletters: Newsletter[] = [
  {
    id: '1',
    title: 'Când Isus Ne Cheamă Pe Nume',
    date: 'Aprilie 2025',
    pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/04/newsletter2504_Cand-Isus-Ne-Cheama-Pe-Nume.pdf',
    thumbnail: pdfPlaceholder,
  },
  {
    id: '2',
    title: 'De la Moarte la Viață',
    date: 'Martie 2025',
    pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/04/newsletter2503_De-la-Moarte-la-Viata.pdf',
    thumbnail: pdfPlaceholder,
  },
  {
    id: '3',
    title: 'De La Februs La Hristos',
    date: 'Februarie 2025',
    pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/04/newsletter2502_De-La-Februs-La-Hristos.pdf',
    thumbnail: pdfPlaceholder,
  },
  {
    id: '4',
    title: 'Ce Ne Rezervă Viitorul',
    date: 'Ianuarie 2025',
    pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/04/newsletter2501_Ce-Ne-Rezerva-Viitorul.pdf',
    thumbnail: pdfPlaceholder,
  },
  {
    id: '5',
    title: 'Reflecții asupra darului mântuirii',
    date: 'Decembrie 2024',
    pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/04/newsletter2412_Reflectii-asupra-darului-mantuirii.pdf',
    thumbnail: pdfPlaceholder,
  },
  {
    id: '6',
    title: 'Ceasul Al Unsprezecelea',
    date: 'Noiembrie 2024',
    pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/04/newsletter2511_Ceasul-Al-Unsprezecelea.pdf',
    thumbnail: pdfPlaceholder,
  },
];

const Index = () => {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');

  // Load newsletters from WordPress and check admin access
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Check if running in WordPress admin context
    if (typeof window !== 'undefined' && (window as any).wpNewsletterGallery) {
      setIsAdmin((window as any).wpNewsletterGallery.isAdmin);
      
      // Load newsletters from WordPress
      const wp = (window as any).wpNewsletterGallery;
      if (wp.ajaxUrl && wp.nonce) {
        const form = new FormData();
        form.append('action', 'newsletter_gallery_action');
        form.append('action_type', 'get_newsletters');
        form.append('nonce', wp.nonce);

        fetch(wp.ajaxUrl, {
          method: 'POST',
          credentials: 'same-origin',
          body: form,
        })
          .then((res) => res.json())
          .then((data) => {
            if (data?.success && Array.isArray(data?.data?.newsletters)) {
              setNewsletters(data.data.newsletters as Newsletter[]);
            } else {
              setNewsletters([]);
            }
          })
          .catch(() => {
            setNewsletters([]);
          });
      }
    } else if (urlParams.get('admin') === 'true') {
      setIsAdmin(true);
      // For development, use initial newsletters
      setNewsletters(initialNewsletters);
    } else {
      // For development, use initial newsletters
      setNewsletters(initialNewsletters);
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
      <div className="container mx-auto py-8">
        {isAdmin ? (
          <Tabs defaultValue="gallery" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="gallery">Newsletter Gallery</TabsTrigger>
              <TabsTrigger value="admin">Administrare</TabsTrigger>
            </TabsList>
            
            <TabsContent value="gallery" className="mt-0">
              <NewsletterGallery newsletters={newsletters} />
            </TabsContent>
            
            <TabsContent value="admin" className="mt-0">
              <NewsletterAdmin 
                newsletters={newsletters}
                onNewslettersChange={setNewsletters}
              />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="w-full">
            <NewsletterGallery newsletters={newsletters} />
            
            {/* Hidden admin access button */}
            <div className="fixed bottom-4 right-4">
              <Button
                variant="ghost"
                size="sm"
                className="opacity-10 hover:opacity-100 transition-opacity"
                onClick={() => setShowAdminDialog(true)}
              >
                Admin
              </Button>
            </div>
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
