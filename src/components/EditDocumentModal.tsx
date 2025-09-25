import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PDF {
  id: string;
  title: string;
  date: string;
  pdfUrl: string;
  thumbnail: string;
  fileType?: 'pdf' | 'doc' | 'docx' | 'ppt' | 'pptx' | 'xls' | 'xlsx' | 'jpg' | 'jpeg' | 'png' | 'gif' | 'webp';
}

interface EditDocumentModalProps {
  isOpen: boolean;
  pdf: PDF;
  onClose: () => void;
  onEdit: (id: string, updates: { title: string; date: string; pdfUrl: string; fileType: string }) => void;
}

const EditDocumentModal = ({ isOpen, pdf, onClose, onEdit }: EditDocumentModalProps) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [fileType, setFileType] = useState('pdf');

  useEffect(() => {
    if (pdf) {
      setTitle(pdf.title);
      setDate(pdf.date);
      setPdfUrl(pdf.pdfUrl);
      setFileType(pdf.fileType || 'pdf');
    }
  }, [pdf]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && date && pdfUrl) {
      onEdit(pdf.id, { title, date, pdfUrl, fileType });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Document</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Document Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter document title"
              required
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
            <Label htmlFor="fileType">Document Type</Label>
            <Select value={fileType} onValueChange={setFileType}>
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
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
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="pdfUrl">Document URL</Label>
            <Input
              id="pdfUrl"
              value={pdfUrl}
              onChange={(e) => setPdfUrl(e.target.value)}
              placeholder="Enter document URL"
              required
            />
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