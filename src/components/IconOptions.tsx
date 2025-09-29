import React from 'react';
import { 
  Grid3X3, 
  Layout, 
  Grid2X2, 
  Palette, 
  Image, 
  LayoutGrid, 
  Square, 
  Box, 
  Images,
  Columns
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const iconOptions = [
  { name: 'Grid3X3', icon: Grid3X3, description: 'Grid layout (3x3)' },
  { name: 'LayoutGrid', icon: LayoutGrid, description: 'Layout grid' },
  { name: 'Grid2X2', icon: Grid2X2, description: 'Grid layout (2x2)' },
  { name: 'Square', icon: Square, description: 'Square/thumbnail' },
  { name: 'Layout', icon: Layout, description: 'Layout icon' },
  { name: 'Images', icon: Images, description: 'Multiple images' },
  { name: 'Columns', icon: Columns, description: 'Column layout' },
  { name: 'Palette', icon: Palette, description: 'Style/design palette' },
  { name: 'Image', icon: Image, description: 'Image/thumbnail' },
  { name: 'Box', icon: Box, description: 'Container/box' },
];

export const IconOptions = () => {
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Thumbnail Styles Icon Options</CardTitle>
        <p className="text-sm text-muted-foreground">
          Choose an icon for the Thumbnail Styles section in Settings
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {iconOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <div
                key={option.name}
                className="flex flex-col items-center p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
              >
                <IconComponent className="h-8 w-8 mb-2 text-foreground" />
                <span className="text-sm font-medium text-center">{option.name}</span>
                <span className="text-xs text-muted-foreground text-center mt-1">
                  {option.description}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};