// Utility functions to interact with WordPress AJAX for the Newsletter Gallery
// Uses wp_localize_script data injected as window.wpNewsletterGallery

export interface WPNewsletter {
  id: string;
  title: string;
  date: string;
  pdfUrl: string;
  thumbnail: string;
}

const getWPContext = () => (typeof window !== 'undefined' ? (window as any).wpNewsletterGallery : undefined);

export const fetchNewsletters = async (): Promise<WPNewsletter[] | null> => {
  const wp = getWPContext();
  if (!wp?.ajaxUrl || !wp?.nonce) return null;

  const form = new FormData();
  form.append('action', 'newsletter_gallery_action');
  form.append('action_type', 'get_newsletters');
  form.append('nonce', wp.nonce);

  const res = await fetch(wp.ajaxUrl, { method: 'POST', credentials: 'same-origin', body: form });
  const json = await res.json();
  if (json?.success && Array.isArray(json?.data?.newsletters)) {
    return json.data.newsletters as WPNewsletter[];
  }
  return [];
};

export const saveNewsletters = async (newsletters: WPNewsletter[]): Promise<boolean> => {
  const wp = getWPContext();
  if (!wp?.ajaxUrl || !wp?.nonce) return false;

  const form = new FormData();
  form.append('action', 'newsletter_gallery_action');
  form.append('action_type', 'save_newsletters');
  form.append('nonce', wp.nonce);
  form.append('newsletters', JSON.stringify(newsletters));

  const res = await fetch(wp.ajaxUrl, { method: 'POST', credentials: 'same-origin', body: form });
  const json = await res.json();
  return !!json?.success;
};
