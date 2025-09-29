import React from 'react';
import { Grid3X3, Move, ArrowUpRight, Maximize2, Scale, Expand, Grid2X2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const GridSizeIconOptions = () => {
  const iconOptions = [
    { name: "Grid3X3", icon: Grid3X3, description: "3x3 Grid layout" },
    { name: "Move", icon: Move, description: "Move/resize indicator" },
    { name: "ArrowUpRight", icon: ArrowUpRight, description: "Diagonal arrow (enlargement)" },
    { name: "Maximize2", icon: Maximize2, description: "Maximize/enlarge" },
    { name: "Scale", icon: Scale, description: "Scale/sizing tool" },
    { name: "Expand", icon: Expand, description: "Expand/grow" },
    { name: "Grid2X2", icon: Grid2X2, description: "2x2 Grid layout" },
  ];

  return (
    <div className="p-6 bg-background">
      <h2 className="text-2xl font-bold mb-6 text-center">Grid Size Icon Options</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {iconOptions.map((option) => {
          const IconComponent = option.icon;
          return (
            <Card key={option.name} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-center">{option.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-2">
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg">
                  <IconComponent className="h-6 w-6 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground text-center">{option.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default GridSizeIconOptions;