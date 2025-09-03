import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NewsletterGallery from '@/components/NewsletterGallery';
import NewsletterAdmin from '@/components/NewsletterAdmin';
import thumbnail1 from '@/assets/newsletter-thumbnail-1.jpg';
import thumbnail2 from '@/assets/newsletter-thumbnail-2.jpg';
import thumbnail3 from '@/assets/newsletter-thumbnail-3.jpg';
import thumbnail4 from '@/assets/newsletter-thumbnail-4.jpg';

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
    title: 'Newsletter Ianuarie 2024',
    date: 'Ianuarie 2024',
    pdfUrl: '#',
    thumbnail: thumbnail1,
  },
  {
    id: '2',
    title: 'Newsletter Februarie 2024',
    date: 'Februarie 2024',
    pdfUrl: '#',
    thumbnail: thumbnail2,
  },
  {
    id: '3',
    title: 'Newsletter Martie 2024',
    date: 'Martie 2024',
    pdfUrl: '#',
    thumbnail: thumbnail3,
  },
  {
    id: '4',
    title: 'Newsletter Aprilie 2024',
    date: 'Aprilie 2024',
    pdfUrl: '#',
    thumbnail: thumbnail4,
  },
];

const Index = () => {
  const [newsletters, setNewsletters] = useState<Newsletter[]>(initialNewsletters);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
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
      </div>
    </div>
  );
};

export default Index;
