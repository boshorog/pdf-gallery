import { useState, useEffect } from 'react';
import { BarChart3, Download, TrendingUp, Users, MousePointerClick, Eye, Loader2, X, Info } from 'lucide-react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
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

// LocalStorage key for dismissed notification
const ANALYTICS_NOTICE_DISMISSED_KEY = 'kindpdfg_analytics_notice_dismissed';

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
  const [noticeDismissed, setNoticeDismissed] = useState(() => {
    try {
      return localStorage.getItem(ANALYTICS_NOTICE_DISMISSED_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [gallerySummaries, setGallerySummaries] = useState<GallerySummary[]>([]);
  
  const showNewGalleryNotice = isGalleryNew(galleryCreatedAt) && !noticeDismissed;
  
  const handleDismissNotice = () => {
    setNoticeDismissed(true);
    try {
      localStorage.setItem(ANALYTICS_NOTICE_DISMISSED_KEY, 'true');
    } catch {}
  };

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
      const data = await fetchAnalytics(galleryId);
      if (data) {
        setAnalytics(data);
      } else {
        // Show demo data when no WP context
        setAnalytics(getDemoData());
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

        {/* New gallery notice */}
        {showNewGalleryNotice && (
          <Alert className="bg-primary/5 border-primary/20">
            <Info className="h-4 w-4 text-primary" />
            <AlertDescription className="flex items-center justify-between">
              <span className="text-sm">
                Real data will appear here after 7 days – don't worry, we're already collecting your stats!
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 ml-2 shrink-0"
                onClick={handleDismissNotice}
              >
                <X className="h-4 w-4" />
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-12 text-destructive">{error}</div>
        ) : analytics ? (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Last 14 Days</CardTitle>
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
            <Card>
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
              <Card>
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
