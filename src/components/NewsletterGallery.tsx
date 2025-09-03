import { useState, useEffect } from 'react';
import { FileText, ExternalLink, Loader2 } from 'lucide-react';
import { PDFThumbnailGenerator } from '@/utils/pdfThumbnailGenerator';
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

// Default fallback thumbnails
const fallbackThumbnails = [thumbnail1, thumbnail2, thumbnail3, thumbnail4];

// Sample newsletter data - replace with your actual newsletter data
const sampleNewsletters: Newsletter[] = [
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

interface NewsletterGalleryProps {
  newsletters?: Newsletter[];
  title?: string;
  description?: string;
}

const NewsletterGallery = ({ 
  newsletters = sampleNewsletters, 
  title = "Newsletter Arhivă",
  description = "Accesați edițiile anterioare ale newsletter-ului nostru"
}: NewsletterGalleryProps) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [newslettersWithThumbnails, setNewslettersWithThumbnails] = useState<Newsletter[]>(newsletters);
  const [isGeneratingThumbnails, setIsGeneratingThumbnails] = useState(false);

  // Generate thumbnails from PDFs on component mount
  useEffect(() => {
    const generateThumbnails = async () => {
      setIsGeneratingThumbnails(true);
      
      try {
        const results = await PDFThumbnailGenerator.generateMultipleThumbnails(
          newsletters.map(n => n.pdfUrl)
        );
        
        const updatedNewsletters = newsletters.map((newsletter, index) => {
          const result = results[index];
          if (result.success && result.dataUrl) {
            return { ...newsletter, thumbnail: result.dataUrl };
          }
          // Fallback to default thumbnail if generation fails
          return { 
            ...newsletter, 
            thumbnail: fallbackThumbnails[index % fallbackThumbnails.length] 
          };
        });
        
        setNewslettersWithThumbnails(updatedNewsletters);
      } catch (error) {
        console.error('Failed to generate thumbnails:', error);
        // Use fallback thumbnails on error
        setNewslettersWithThumbnails(newsletters);
      } finally {
        setIsGeneratingThumbnails(false);
      }
    };
    
    generateThumbnails();
  }, [newsletters]);

  const handleNewsletterClick = (pdfUrl: string) => {
    window.open(pdfUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      {/* Header Section */}
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-4 bg-gradient-newsletter bg-clip-text text-transparent">
          {title}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {description}
        </p>
      </header>

      {/* Newsletter Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {isGeneratingThumbnails && (
          <div className="col-span-full flex items-center justify-center py-12">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Generez miniaturile PDF...</span>
            </div>
          </div>
        )}
        
        {newslettersWithThumbnails.map((newsletter) => (
          <article
            key={newsletter.id}
            className="group cursor-pointer"
            onClick={() => handleNewsletterClick(newsletter.pdfUrl)}
            onMouseEnter={() => setHoveredId(newsletter.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            {/* Thumbnail Container */}
            <div className="relative overflow-hidden rounded-lg bg-card shadow-newsletter group-hover:shadow-newsletter-hover transition-all duration-300 ease-smooth">
              {/* Thumbnail Image */}
              <div className="aspect-[4/3] relative overflow-hidden">
                <img
                  src={newsletter.thumbnail}
                  alt={`Preview pentru ${newsletter.title}`}
                  className="w-full h-full object-cover transition-transform duration-300 ease-smooth group-hover:scale-105"
                  loading="lazy"
                />
                
                {/* Overlay on hover */}
                <div 
                  className={`absolute inset-0 bg-primary/20 backdrop-blur-sm transition-opacity duration-300 ${
                    hoveredId === newsletter.id ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-card rounded-full p-4 shadow-lg">
                      <ExternalLink className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </div>
              </div>

              {/* PDF Indicator */}
              <div className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm rounded-md px-2 py-1 shadow-sm">
                <div className="flex items-center gap-1">
                  <FileText className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">PDF</span>
                </div>
              </div>
            </div>

            {/* Newsletter Info */}
            <div className="mt-4 space-y-1">
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                {newsletter.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {newsletter.date}
              </p>
            </div>
          </article>
        ))}
      </div>

      {/* Empty State */}
      {newsletters.length === 0 && (
        <div className="text-center py-16">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Nu sunt newsletter-uri disponibile
          </h3>
          <p className="text-muted-foreground">
            Newsletter-urile vor apărea aici când vor fi adăugate.
          </p>
        </div>
      )}
    </div>
  );
};

export default NewsletterGallery;