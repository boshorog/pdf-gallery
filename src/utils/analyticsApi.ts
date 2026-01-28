// Analytics API for tracking gallery views and file clicks
// Uses WordPress AJAX for local storage in wp_options or custom table

export interface AnalyticsEvent {
  gallery_id: string;
  document_id?: string; // null for gallery views
  event_type: 'view' | 'click';
  visitor_id: string;
  timestamp: string;
}

export interface AnalyticsData {
  gallery_id: string;
  total_views: number;
  unique_views: number;
  total_clicks: number;
  unique_clicks: number;
  documents: DocumentAnalytics[];
  daily_stats: DailyStats[];
}

export interface DocumentAnalytics {
  document_id: string;
  document_title: string;
  total_clicks: number;
  unique_clicks: number;
}

export interface DailyStats {
  date: string;
  views: number;
  clicks: number;
}

const getWPContext = () => 
  typeof window !== 'undefined' 
    ? ((window as any).kindpdfgData || (window as any).wpPDFGallery || (window as any).wpNewsletterGallery) 
    : undefined;

// Get or create a visitor ID for tracking unique visitors
export const getVisitorId = (): string => {
  const key = 'kindpdfg_visitor_id';
  let visitorId = localStorage.getItem(key);
  if (!visitorId) {
    visitorId = 'v_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    localStorage.setItem(key, visitorId);
  }
  return visitorId;
};

// Track an analytics event (gallery view or file click)
export const trackAnalyticsEvent = async (
  galleryId: string,
  eventType: 'view' | 'click',
  documentId?: string
): Promise<boolean> => {
  const wp = getWPContext();
  if (!wp?.ajaxUrl || !wp?.nonce) {
    console.log('[Analytics] No WP context, skipping track');
    return false;
  }

  const visitorId = getVisitorId();

  const form = new FormData();
  form.append('action', 'kindpdfg_action');
  form.append('action_type', 'track_analytics');
  form.append('nonce', wp.nonce);
  form.append('gallery_id', galleryId);
  form.append('event_type', eventType);
  form.append('visitor_id', visitorId);
  if (documentId) {
    form.append('document_id', documentId);
  }

  try {
    const res = await fetch(wp.ajaxUrl, { 
      method: 'POST', 
      credentials: 'same-origin', 
      body: form 
    });
    const json = await res.json();
    return !!json?.success;
  } catch (error) {
    console.error('[Analytics] Track error:', error);
    return false;
  }
};

// Fetch analytics data for a gallery
export const fetchAnalytics = async (galleryId: string): Promise<AnalyticsData | null> => {
  const wp = getWPContext();
  if (!wp?.ajaxUrl || !wp?.nonce) {
    console.log('[Analytics] No WP context, cannot fetch');
    return null;
  }

  const form = new FormData();
  form.append('action', 'kindpdfg_action');
  form.append('action_type', 'get_analytics');
  form.append('nonce', wp.nonce);
  form.append('gallery_id', galleryId);

  try {
    const res = await fetch(wp.ajaxUrl, { 
      method: 'POST', 
      credentials: 'same-origin', 
      body: form 
    });
    const json = await res.json();
    if (json?.success && json?.data) {
      return json.data as AnalyticsData;
    }
    return null;
  } catch (error) {
    console.error('[Analytics] Fetch error:', error);
    return null;
  }
};

// Export analytics data as CSV
export const exportAnalyticsCSV = (data: AnalyticsData, galleryName: string): void => {
  const lines: string[] = [];
  
  // Header
  lines.push('Gallery Analytics Export');
  lines.push(`Gallery: ${galleryName}`);
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('');
  
  // Summary
  lines.push('Summary');
  lines.push(`Total Views,${data.total_views}`);
  lines.push(`Unique Visitors (Views),${data.unique_views}`);
  lines.push(`Total File Clicks,${data.total_clicks}`);
  lines.push(`Unique Visitors (Clicks),${data.unique_clicks}`);
  lines.push('');
  
  // Document breakdown
  lines.push('Document Clicks');
  lines.push('Document,Total Clicks,Unique Clicks');
  data.documents.forEach(doc => {
    lines.push(`"${doc.document_title}",${doc.total_clicks},${doc.unique_clicks}`);
  });
  lines.push('');
  
  // Daily stats
  lines.push('Daily Statistics');
  lines.push('Date,Views,Clicks');
  data.daily_stats.forEach(day => {
    lines.push(`${day.date},${day.views},${day.clicks}`);
  });
  
  const csv = lines.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `analytics-${galleryName.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
