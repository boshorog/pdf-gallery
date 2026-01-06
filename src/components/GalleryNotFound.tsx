import React from 'react';
import logoSvg from '@/assets/pdf-gallery-logo.svg';

const GalleryNotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <img 
        src={logoSvg} 
        alt="PDF Gallery" 
        className="w-16 h-16 mb-6 opacity-60"
      />
      <h3 className="text-lg font-medium text-foreground mb-2">Gallery Not Found</h3>
      <p className="text-sm text-muted-foreground max-w-md">
        The requested gallery does not exist. It may have been renamed or deleted.
      </p>
    </div>
  );
};

export default GalleryNotFound;
