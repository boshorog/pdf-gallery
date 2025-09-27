import { useState, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Upload, X, FileText } from 'lucide-react';

interface FileUpload {
  file: File;
  title: string;
  subtitle: string;
  fileType: string;
  progress: number;
  url?: string;
}

interface AddDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (pdf: { title: string; date: string; pdfUrl: string; fileType: string }) => void;
}

const AddDocumentModal = ({ isOpen, onClose, onAdd }: AddDocumentModalProps) => {
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileType = (file: File): string => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) return 'img';
    if (extension === 'pdf') return 'pdf';
    if (['doc', 'docx'].includes(extension || '')) return 'doc';
    if (['ppt', 'pptx'].includes(extension || '')) return 'ppt';
    if (['xls', 'xlsx'].includes(extension || '')) return 'xls';
    return 'pdf';
  };

  const handleFiles = useCallback((fileList: FileList) => {
    const newFiles: FileUpload[] = Array.from(fileList).map(file => ({
      file,
      title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
      subtitle: '',
      fileType: getFileType(file),
      progress: 0
    }));
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFiles(files);
    }
  }, [handleFiles]);

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const updateFileData = (index: number, field: keyof FileUpload, value: string) => {
    setFiles(prev => prev.map((file, i) => 
      i === index ? { ...file, [field]: value } : file
    ));
  };

  const simulateUpload = async (file: FileUpload, index: number): Promise<string> => {
    // Simulate file upload with progress
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 50));
      setFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, progress } : f
      ));
    }
    // Return a mock URL - in real implementation, this would be the actual uploaded file URL
    return `https://example.com/uploads/${file.file.name}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) return;

    setIsUploading(true);
    
    try {
      // Upload files and add them
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.title.trim()) continue;
        
        const url = await simulateUpload(file, i);
        onAdd({ 
          title: file.title, 
          date: file.subtitle || '', 
          pdfUrl: url, 
          fileType: file.fileType 
        });
      }
      
      // Reset form
      setFiles([]);
      setIsUploading(false);
      onClose();
    } catch (error) {
      console.error('Upload error:', error);
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Documents</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Upload Area */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver 
                ? 'bg-primary border-primary text-primary-foreground' 
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDragEnter={(e) => { e.preventDefault(); setIsDragOver(true); }}
          >
            {isDragOver ? (
              <div className="flex flex-col items-center justify-center gap-2 py-6">
                <Upload className="mx-auto h-12 w-12 text-primary-foreground/90" />
                <p className="text-lg font-semibold">Drop your files here</p>
                <p className="text-sm opacity-90">Release to upload</p>
              </div>
            ) : (
              <>
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <div className="space-y-2">
                  <p className="text-lg font-medium">Drop files here or click to browse</p>
                  <p className="text-sm text-muted-foreground">
                    Supports PDF, DOC, DOCX, PPT, PPTX, and image files
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Browse Files
                </Button>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.webp"
              onChange={handleFileInput}
              className="hidden"
            />
            {isUploading && (
              <div className="absolute left-0 right-0 bottom-0">
                <Progress
                  value={Math.round(files.reduce((sum, f) => sum + (f.progress || 0), 0) / Math.max(files.length || 1, 1))}
                  className="h-1 rounded-none"
                />
              </div>
            )}
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-4">
              <Label className="text-base font-medium">Selected Files ({files.length})</Label>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {files.map((file, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative w-10 h-10 bg-muted rounded flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-muted-foreground" />
                          <div className="absolute -top-1 -right-1 text-xs px-1 py-0.5 rounded text-[9px] font-medium bg-primary text-primary-foreground">
                            {file.fileType.toUpperCase()}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{file.file.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(file.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor={`title-${index}`}>Title *</Label>
                        <Input
                          id={`title-${index}`}
                          value={file.title}
                          onChange={(e) => updateFileData(index, 'title', e.target.value)}
                          placeholder="Document title"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`subtitle-${index}`}>Subtitle (optional)</Label>
                        <Input
                          id={`subtitle-${index}`}
                          value={file.subtitle}
                          onChange={(e) => updateFileData(index, 'subtitle', e.target.value)}
                          placeholder="Optional subtitle"
                        />
                      </div>
                    </div>

                    {/* Progress bar during upload */}
                    {isUploading && file.progress > 0 && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Uploading...</span>
                          <span>{file.progress}%</span>
                        </div>
                        <Progress value={file.progress} className="h-2" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isUploading}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={files.length === 0 || isUploading || files.some(f => !f.title.trim())}
            >
              {isUploading ? 'Uploading...' : `Add ${files.length} Document${files.length !== 1 ? 's' : ''}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddDocumentModal;