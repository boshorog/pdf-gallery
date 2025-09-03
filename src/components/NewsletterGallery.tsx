import { useState, useEffect } from 'react';
import { FileText, ExternalLink, Loader2 } from 'lucide-react';
import { PDFThumbnailGenerator } from '@/utils/pdfThumbnailGenerator';
import thumbnail1 from '@/assets/newsletter-thumbnail-1.jpg';
import thumbnail2 from '@/assets/newsletter-thumbnail-2.jpg';
import thumbnail3 from '@/assets/newsletter-thumbnail-3.jpg';
import thumbnail4 from '@/assets/newsletter-thumbnail-4.jpg';
import pdfPlaceholder from '@/assets/pdf-placeholder.png';

interface Newsletter {
  id: string;
  title: string;
  date: string;
  pdfUrl: string;
  thumbnail: string;
}

interface YearDivider {
  type: 'divider';
  year: string;
}

type GalleryItem = Newsletter | YearDivider;

// Default fallback thumbnails
const fallbackThumbnails = [thumbnail1, thumbnail2, thumbnail3, thumbnail4];

// Sample newsletter data with year dividers
const createNewslettersWithDividers = (newsletters: Newsletter[]): GalleryItem[] => {
  const items: GalleryItem[] = [];
  let currentYear: string | null = null;
  
  newsletters.forEach(newsletter => {
    // Extract year from date (assuming format like "Aprilie 2025")
    const year = newsletter.date.split(' ').pop() || '';
    
    if (year !== currentYear) {
      // Add year divider
      items.push({ type: 'divider', year });
      currentYear = year;
    }
    
    items.push(newsletter);
  });
  
  return items;
};

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
  newsletters = [], 
  title = "Newsletter Arhivă",
  description = "Accesați edițiile anterioare ale newsletter-ului nostru"
}: NewsletterGalleryProps) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [newslettersWithThumbnails, setNewslettersWithThumbnails] = useState<Newsletter[]>(newsletters);
  const [isGeneratingThumbnails, setIsGeneratingThumbnails] = useState(false);
  
  // Create gallery items with dividers
  const galleryItems = createNewslettersWithDividers(newslettersWithThumbnails);

  // Generate thumbnails from PDFs on component mount
  useEffect(() => {
    if (newsletters.length === 0) return;
    
    console.log('NewsletterGallery: useEffect triggered, newsletters count:', newsletters.length);
    
    // Set initial placeholders
    const newslettersWithPlaceholders = newsletters.map(newsletter => ({
      ...newsletter,
      thumbnail: newsletter.thumbnail || pdfPlaceholder
    }));
    setNewslettersWithThumbnails(newslettersWithPlaceholders);
    
    const generateThumbnails = async () => {
      console.log('Starting thumbnail generation...');
      setIsGeneratingThumbnails(true);
      
      try {
        console.log('Calling PDFThumbnailGenerator.generateMultipleThumbnails');
        const results = await PDFThumbnailGenerator.generateMultipleThumbnails(
          newsletters.map(n => n.pdfUrl)
        );
        
        console.log('Thumbnail generation results:', results);
        
        const updatedNewsletters = newsletters.map((newsletter, index) => {
          const result = results[index];
          console.log(`Processing newsletter ${index}:`, result);
          
          if (result.success && result.dataUrl) {
            console.log(`Successfully generated thumbnail for newsletter ${index}`);
            return { ...newsletter, thumbnail: result.dataUrl };
          }
          // Fallback to existing thumbnail or placeholder if generation fails
          console.log(`Using fallback thumbnail for newsletter ${index}`);
          return { 
            ...newsletter, 
            thumbnail: newsletter.thumbnail || pdfPlaceholder
          };
        });
        
        console.log('Setting updated newsletters:', updatedNewsletters.length);
        setNewslettersWithThumbnails(updatedNewsletters);
      } catch (error) {
        console.error('Failed to generate thumbnails:', error);
        // Use existing newsletters with their current thumbnails on error
        setNewslettersWithThumbnails(newslettersWithPlaceholders);
      } finally {
        console.log('Thumbnail generation complete');
        setIsGeneratingThumbnails(false);
      }
    };
    
    // Only generate thumbnails if we have newsletters that need them
    if (newsletters.some(n => !n.thumbnail || n.thumbnail.includes('placeholder'))) {
      generateThumbnails();
    }
  }, [newsletters]);

  const handleNewsletterClick = (pdfUrl: string) => {
    window.open(pdfUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6">

      {/* Newsletter Grid */}
      <div className="space-y-8">
        {isGeneratingThumbnails && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Generez thumbnails...</span>
            </div>
          </div>
        )}
        
        {(() => {
          const groups: JSX.Element[] = [];
          let currentGrid: Newsletter[] = [];
          
          galleryItems.forEach((item, index) => {
            if ('type' in item && item.type === 'divider') {
              // Add previous grid if it exists
              if (currentGrid.length > 0) {
                groups.push(
                  <div key={`grid-${groups.length}`} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 sm:gap-8">
                    {currentGrid.map((newsletter) => (
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
                        <div className="mt-3 space-y-0.5">
                          <p className="text-sm text-muted-foreground">
                            {newsletter.date}
                          </p>
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                            {newsletter.title}
                          </h3>
                        </div>
                      </article>
                    ))}
                  </div>
                );
                currentGrid = [];
              }
              
              // Add year divider
              groups.push(
                <div key={`divider-${item.year}`} className="text-center py-8">
                  <div className="flex items-center justify-center gap-4">
                    <div className="newsletter-divider-line"></div>
                    <h2 className="newsletter-year-divider text-2xl font-bold">
                      {item.year}
                    </h2>
                    <div className="newsletter-divider-line"></div>
                  </div>
                </div>
              );
            } else {
              // Add newsletter to current grid
              currentGrid.push(item as Newsletter);
            }
          });
          
          // Add final grid if it exists
          if (currentGrid.length > 0) {
            groups.push(
              <div key={`grid-${groups.length}`} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 sm:gap-8">
                {currentGrid.map((newsletter) => (
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
                    <div className="mt-3 space-y-0.5">
                      <p className="text-sm text-muted-foreground">
                        {newsletter.date}
                      </p>
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                        {newsletter.title}
                      </h3>
                    </div>
                  </article>
                ))}
              </div>
            );
          }
          
          return groups;
        })()}
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