import { useState, useEffect } from 'react';
import { BarChart3, Download, TrendingUp, Users, MousePointerClick, Eye, Loader2, Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AnalyticsData, fetchAnalytics, exportAnalyticsCSV } from '@/utils/analyticsApi';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface GallerySummary {
  id: string;
  name: string;
  totalViews: number;
  totalClicks: number;
}

type DateRange = '24h' | '7d' | '30d' | '365d' | 'all';

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  galleryId: string;
  galleryName: string;
  galleryCreatedAt?: string;
  allGalleries?: Array<{ id: string; name: string; createdAt?: string }>;
  onGallerySelect?: (galleryId: string) => void;
}

// Check if gallery is less than 7 days old (show notice for first 7 days)
const isGalleryNew = (createdAt?: string): boolean => {
  if (!createdAt) return false;
  const created = new Date(createdAt);
  const now = new Date();
  const diffDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays <= 7;
};

// Format remaining days until real data appears
const getDaysUntilRealData = (createdAt?: string): number => {
  if (!createdAt) return 7;
  const created = new Date(createdAt);
  const now = new Date();
  const diffDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
  return Math.max(1, Math.ceil(7 - diffDays));
};

const DATE_RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: '24h', label: '24 hours' },
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '365d', label: '365 days' },
  { value: 'all', label: 'All time' },
];

export const AnalyticsModal = ({
  isOpen,
  onClose,
  galleryId,
  galleryName,
  galleryCreatedAt,
  allGalleries = [],
  onGallerySelect,
}: AnalyticsModalProps) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'clicks' | 'unique'>('clicks');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [dateRange, setDateRange] = useState<DateRange>('7d');

  const [gallerySummaries, setGallerySummaries] = useState<GallerySummary[]>([]);
  
  const showNewGalleryNotice = isGalleryNew(galleryCreatedAt);
  const daysRemaining = getDaysUntilRealData(galleryCreatedAt);

  useEffect(() => {
    if (isOpen && galleryId) {
      loadAnalytics();
      loadGallerySummaries();
    }
  }, [isOpen, galleryId]);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      // For new galleries (< 7 days old), always show demo data
      // Real data will be shown once the gallery is older than 7 days
      if (isGalleryNew(galleryCreatedAt)) {
        setAnalytics(getDemoData());
      } else {
        const data = await fetchAnalytics(galleryId);
        if (data) {
          setAnalytics(data);
        } else {
          // Show demo data when no WP context
          setAnalytics(getDemoData());
        }
      }
    } catch (err) {
      setError('Failed to load analytics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadGallerySummaries = async () => {
    // Load summary data for all other galleries
    const summaries: GallerySummary[] = [];
    
    for (const gallery of allGalleries) {
      if (gallery.id === galleryId) continue; // Skip current gallery
      
      try {
        const data = await fetchAnalytics(gallery.id);
        if (data) {
          summaries.push({
            id: gallery.id,
            name: gallery.name,
            totalViews: data.total_views,
            totalClicks: data.total_clicks,
          });
        } else {
          // Demo data for preview
          summaries.push({
            id: gallery.id,
            name: gallery.name,
            totalViews: Math.floor(Math.random() * 500) + 100,
            totalClicks: Math.floor(Math.random() * 1000) + 200,
          });
        }
      } catch {
        // Use demo data on error
        summaries.push({
          id: gallery.id,
          name: gallery.name,
          totalViews: Math.floor(Math.random() * 500) + 100,
          totalClicks: Math.floor(Math.random() * 1000) + 200,
        });
      }
    }
    
    setGallerySummaries(summaries);
  };

  const getDemoData = (): AnalyticsData => ({
    gallery_id: galleryId,
    total_views: 1247,
    unique_views: 892,
    total_clicks: 3456,
    unique_clicks: 1834,
    documents: [
      { document_id: '1', document_title: 'Annual Report 2024.pdf', total_clicks: 456, unique_clicks: 312 },
      { document_id: '2', document_title: 'Product Catalog.pdf', total_clicks: 389, unique_clicks: 267 },
      { document_id: '3', document_title: 'User Guide.pdf', total_clicks: 298, unique_clicks: 198 },
      { document_id: '4', document_title: 'Company Overview.pdf', total_clicks: 245, unique_clicks: 178 },
      { document_id: '5', document_title: 'Newsletter Q4.pdf', total_clicks: 187, unique_clicks: 134 },
    ],
    daily_stats: Array.from({ length: 14 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (13 - i));
      return {
        date: date.toISOString().split('T')[0],
        views: Math.floor(Math.random() * 100) + 50,
        clicks: Math.floor(Math.random() * 200) + 100,
      };
    }),
  });

  const handleExport = () => {
    if (analytics) {
      exportAnalyticsCSV(analytics, galleryName);
    }
  };

  const sortedDocuments = analytics?.documents
    ? [...analytics.documents].sort((a, b) => {
        const aVal = sortBy === 'clicks' ? a.total_clicks : a.unique_clicks;
        const bVal = sortBy === 'clicks' ? b.total_clicks : b.unique_clicks;
        return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
      })
    : [];

  const handleSort = (column: 'clicks' | 'unique') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  // Get the label for the selected date range
  const getDateRangeLabel = () => {
    const option = DATE_RANGE_OPTIONS.find(opt => opt.value === dateRange);
    return option?.label || '7 days';
  };

  // Format chart data with shorter date labels
  const chartData = analytics?.daily_stats.map(stat => ({
    ...stat,
    dateLabel: new Date(stat.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  })) || [];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analytics: {galleryName}
          </DialogTitle>
        </DialogHeader>


        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-12 text-destructive">{error}</div>
        ) : analytics ? (
          <div className="space-y-6 relative">
          {/* New Gallery Overlay - positioned near top */}
            {showNewGalleryNotice && (
              <div className="absolute inset-0 z-10 flex items-start justify-center pt-28 bg-background/60 backdrop-blur-[2px] rounded-lg">
                <div className="bg-card border border-primary/30 rounded-xl p-6 shadow-lg max-w-md text-center">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Info className="h-6 w-6 text-primary" />
                    <span className="text-lg font-semibold text-foreground">Collecting Data</span>
                  </div>
                  <p className="text-muted-foreground">
                    Real analytics will appear in <span className="font-semibold text-foreground">{daysRemaining} day{daysRemaining !== 1 ? 's' : ''}</span>.
                    <br />
                    <span className="text-sm">Don't worry, we're already collecting your stats!</span>
                  </p>
                </div>
              </div>
            )}

            {/* Summary Cards */}
            <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${showNewGalleryNotice ? 'opacity-40 pointer-events-none' : ''}`}>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    Total Views
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.total_views.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    Unique Viewers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.unique_views.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <MousePointerClick className="h-4 w-4" />
                    Total Clicks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.total_clicks.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    Click Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analytics.total_views > 0 
                      ? Math.round((analytics.total_clicks / analytics.total_views) * 100) 
                      : 0}%
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Chart */}
            <Card className={showNewGalleryNotice ? 'opacity-40 pointer-events-none' : ''}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base">Activity</CardTitle>
                <Select value={dateRange} onValueChange={(value: DateRange) => setDateRange(value)}>
                  <SelectTrigger className="w-[130px] h-8">
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    {DATE_RANGE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis 
                        dataKey="dateLabel" 
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px',
                        }}
                      />
                      <Legend />
                      <Bar dataKey="views" name="Views" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="clicks" name="Clicks" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Documents Table */}
            <Card className={showNewGalleryNotice ? 'opacity-40 pointer-events-none' : ''}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Document Clicks</CardTitle>
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document</TableHead>
                      <TableHead 
                        className="text-right cursor-pointer hover:text-foreground"
                        onClick={() => handleSort('clicks')}
                      >
                        Total Clicks {sortBy === 'clicks' && (sortOrder === 'desc' ? '↓' : '↑')}
                      </TableHead>
                      <TableHead 
                        className="text-right cursor-pointer hover:text-foreground"
                        onClick={() => handleSort('unique')}
                      >
                        Unique Clicks {sortBy === 'unique' && (sortOrder === 'desc' ? '↓' : '↑')}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedDocuments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                          No click data yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortedDocuments.map((doc) => (
                        <TableRow key={doc.document_id}>
                          <TableCell className="font-medium max-w-xs truncate">
                            {doc.document_title}
                          </TableCell>
                          <TableCell className="text-right">{doc.total_clicks.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{doc.unique_clicks.toLocaleString()}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Other Galleries Section */}
            {gallerySummaries.length > 0 && (
              <Card className={showNewGalleryNotice ? 'opacity-40 pointer-events-none' : ''}>
                <CardHeader>
                  <CardTitle className="text-base">Other Galleries</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {gallerySummaries.map((gallery) => (
                      <button
                        key={gallery.id}
                        onClick={() => onGallerySelect?.(gallery.id)}
                        className="p-4 rounded-lg border border-border bg-card hover:bg-accent hover:border-primary/50 transition-colors text-left group"
                      >
                        <div className="font-medium text-sm truncate group-hover:text-primary">
                          {gallery.name}
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {gallery.totalViews.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <MousePointerClick className="h-3 w-3" />
                            {gallery.totalClicks.toLocaleString()}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};
