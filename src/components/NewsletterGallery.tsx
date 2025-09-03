import { useState } from 'react';
import { FileText, ExternalLink } from 'lucide-react';
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

// Sample newsletter data - replace with your actual newsletter data
const sampleNewsletters: Newsletter[] = [
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
        {newsletters.map((newsletter) => (
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