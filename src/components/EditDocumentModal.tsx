import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FolderOpen } from 'lucide-react';

interface PDF {
  id: string;
  title: string;
  date: string;
  pdfUrl: string;
  thumbnail: string;
  fileType?: 'pdf' | 'doc' | 'docx' | 'ppt' | 'pptx' | 'xls' | 'xlsx' | 'jpg' | 'jpeg' | 'png' | 'gif' | 'webp' | 'odt' | 'ods' | 'odp' | 'rtf' | 'txt' | 'csv' | 'svg' | 'ico' | 'zip' | 'rar' | '7z' | 'epub' | 'mobi' | 'mp3' | 'wav' | 'ogg' | 'mp4' | 'mov' | 'webm' | 'youtube';
}

interface EditDocumentModalProps {
  isOpen: boolean;
  pdf: PDF;
  onClose: () => void;
  onEdit: (id: string, updates: { title: string; date: string; pdfUrl: string; fileType: string; thumbnail?: string }) => void;
}

// Extract YouTube video ID from various URL formats
const getYouTubeVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/  // Just the ID
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

const EditDocumentModal = ({ isOpen, pdf, onClose, onEdit }: EditDocumentModalProps) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [fileType, setFileType] = useState('pdf');
  const [thumbnail, setThumbnail] = useState('');

  useEffect(() => {
    if (pdf) {
      setTitle(pdf.title);
      setDate(pdf.date);
      setPdfUrl(pdf.pdfUrl);
      setFileType(pdf.fileType || 'pdf');
      setThumbnail(pdf.thumbnail || '');
    }
  }, [pdf]);

  // Auto-detect YouTube URLs and update fileType
  useEffect(() => {
    if (pdfUrl) {
      const youtubeId = getYouTubeVideoId(pdfUrl);
      if (youtubeId) {
        setFileType('youtube');
        // Auto-set YouTube thumbnail if none exists
        if (!thumbnail) {
          setThumbnail(`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`);
        }
      }
    }
  }, [pdfUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pdfUrl) {
      onEdit(pdf.id, { title, date, pdfUrl, fileType, thumbnail });
      onClose();
    }
  };

  const openMediaLibrary = () => {
    const wp = (window as any).wp;
    if (wp?.media) {
      const frame = wp.media({
        title: 'Select Thumbnail',
        button: { text: 'Use as Thumbnail' },
        multiple: false,
        library: { type: 'image' }
      });
      frame.on('select', () => {
        const attachment = frame.state().get('selection').first().toJSON();
        if (attachment?.url) {
          setThumbnail(attachment.url);
        }
      });
      frame.open();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit File</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">File Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter file title (optional)"
            />
          </div>
          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              placeholder="Enter date"
              required
            />
          </div>
          <div>
            <Label htmlFor="fileType">File Type</Label>
            <Select value={fileType} onValueChange={setFileType}>
              <SelectTrigger>
                <SelectValue placeholder="Select file type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="doc">DOC</SelectItem>
                <SelectItem value="docx">DOCX</SelectItem>
                <SelectItem value="ppt">PPT</SelectItem>
                <SelectItem value="pptx">PPTX</SelectItem>
                <SelectItem value="xls">XLS</SelectItem>
                <SelectItem value="xlsx">XLSX</SelectItem>
                <SelectItem value="jpg">JPG</SelectItem>
                <SelectItem value="jpeg">JPEG</SelectItem>
                <SelectItem value="png">PNG</SelectItem>
                <SelectItem value="gif">GIF</SelectItem>
                <SelectItem value="webp">WEBP</SelectItem>
                <SelectItem value="mp4">MP4</SelectItem>
                <SelectItem value="webm">WebM</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="pdfUrl">File URL</Label>
            <Input
              id="pdfUrl"
              value={pdfUrl}
              onChange={(e) => setPdfUrl(e.target.value)}
              placeholder="Enter file URL or YouTube link"
              required
            />
            {fileType === 'youtube' && (
              <p className="text-xs text-muted-foreground mt-1">
                YouTube video detected! Supports youtube.com/watch?v= and youtu.be/ formats.
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="thumbnail">Thumbnail URL (optional)</Label>
            <div className="flex gap-2">
              <Input
                id="thumbnail"
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
                placeholder="https://example.com/thumbnail.jpg"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={openMediaLibrary}
                title="Browse Media Library"
              >
                <FolderOpen className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditDocumentModal;