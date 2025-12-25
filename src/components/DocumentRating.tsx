import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface DocumentRatingProps {
  documentId: string;
  galleryId: string;
  showCount?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Generate or retrieve a persistent visitor ID
const getVisitorId = (): string => {
  const storageKey = 'pdf_gallery_visitor_id';
  let visitorId = localStorage.getItem(storageKey);
  
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    localStorage.setItem(storageKey, visitorId);
  }
  
  return visitorId;
};

export const DocumentRating: React.FC<DocumentRatingProps> = ({
  documentId,
  galleryId,
  showCount = true,
  size = 'md',
  className
}) => {
  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalRatings, setTotalRatings] = useState<number>(0);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const fetchRatings = async () => {
    try {
      const visitorId = getVisitorId();
      
      const response = await fetch(
        `https://eumfdxgcqenpptjytqmc.supabase.co/functions/v1/document-rating?documentId=${encodeURIComponent(documentId)}&visitorId=${encodeURIComponent(visitorId)}`,
        {
          headers: {
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1bWZkeGdjcWVucHB0anl0cW1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4MDU2OTMsImV4cCI6MjA3NDM4MTY5M30.6Gct9fFUj0DBG4c2-AFmyIr_8tfjnX4KfpqCZgQ1Hk8`
          }
        }
      );

      if (response.ok) {
        const result = await response.json();
        setAverageRating(result.averageRating || 0);
        setTotalRatings(result.totalRatings || 0);
        setUserRating(result.userRating);
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const submitRating = async (rating: number) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const visitorId = getVisitorId();
      
      const response = await fetch(
        'https://eumfdxgcqenpptjytqmc.supabase.co/functions/v1/document-rating',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1bWZkeGdjcWVucHB0anl0cW1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4MDU2OTMsImV4cCI6MjA3NDM4MTY5M30.6Gct9fFUj0DBG4c2-AFmyIr_8tfjnX4KfpqCZgQ1Hk8`
          },
          body: JSON.stringify({
            documentId,
            galleryId,
            rating,
            visitorId
          })
        }
      );

      if (response.ok) {
        setUserRating(rating);
        // Refetch to get updated average
        await fetchRatings();
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchRatings();
  }, [documentId]);

  const displayRating = hoverRating || userRating || averageRating;

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={isSubmitting}
            className={cn(
              'transition-all duration-150 hover:scale-110 focus:outline-none disabled:opacity-50',
              isSubmitting && 'cursor-wait'
            )}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => submitRating(star)}
          >
            <Star
              className={cn(
                sizeClasses[size],
                'transition-colors',
                star <= displayRating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-transparent text-muted-foreground/40'
              )}
            />
          </button>
        ))}
      </div>
      
      {showCount && !isLoading && totalRatings > 0 && (
        <span className="text-xs text-muted-foreground ml-1">
          ({totalRatings})
        </span>
      )}
      
      {userRating && (
        <span className="text-xs text-primary ml-1">
          ✓
        </span>
      )}
    </div>
  );
};

export default DocumentRating;
