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
    title: 'Când Isus Ne Cheamă Pe Nume',
    date: 'Aprilie 2025',
    pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/04/newsletter2504_Cand-Isus-Ne-Cheama-Pe-Nume.pdf',
    thumbnail: thumbnail1,
  },
  {
    id: '2',
    title: 'De la Moarte la Viață',
    date: 'Martie 2025',
    pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/04/newsletter2503_De-la-Moarte-la-Viata.pdf',
    thumbnail: thumbnail2,
  },
  {
    id: '3',
    title: 'De La Februs La Hristos',
    date: 'Februarie 2025',
    pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/04/newsletter2502_De-La-Februs-La-Hristos.pdf',
    thumbnail: thumbnail3,
  },
  {
    id: '4',
    title: 'Ce Ne Rezervă Viitorul',
    date: 'Ianuarie 2025',
    pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/04/newsletter2501_Ce-Ne-Rezerva-Viitorul.pdf',
    thumbnail: thumbnail4,
  },
  {
    id: '5',
    title: 'Reflecții asupra darului mântuirii',
    date: 'Decembrie 2024',
    pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/04/newsletter2412_Reflectii-asupra-darului-mantuirii.pdf',
    thumbnail: thumbnail1,
  },
  {
    id: '6',
    title: 'Ceasul Al Unsprezecelea',
    date: 'Noiembrie 2024',
    pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/04/newsletter2411_Ceasul-Al-Unsprezecelea.pdf',
    thumbnail: thumbnail2,
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
