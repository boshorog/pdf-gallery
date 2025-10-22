import { useState, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Upload, X, FileText } from 'lucide-react';
import { useLicense } from '@/hooks/useLicense';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  const license = useLicense();

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
    if (!license.isPro && fileList.length > 1) {
      toast({
        title: 'Pro Feature Required',
        description: 'Multiple file uploads require a Pro license. Please upload one file at a time, or upgrade to Pro for bulk uploads.',
        variant: 'destructive',
      });
      return;
    }
    const newFiles: FileUpload[] = Array.from(fileList).map(file => ({
      file,
      title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
      subtitle: '',
      fileType: getFileType(file),
      progress: 0
    }));
    setFiles(prev => [...prev, ...newFiles]);
    
    // Auto-start upload immediately
    setTimeout(() => {
      if (newFiles.length > 0) {
        processAutoUploads(newFiles);
      }
    }, 100);
  }, [license.isPro, toast]);

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

  const uploadFileToWP = (file: FileUpload, index: number): Promise<string> => {
    const wp = (window as any).wpPDFGallery;
    return new Promise((resolve, reject) => {
      // Fallback: simulate in non-WordPress environments
      if (!wp?.ajaxUrl || !wp?.nonce) {
        let progress = 0;
        const interval = setInterval(() => {
          progress = Math.min(100, progress + 10);
          setFiles(prev => prev.map((f, i) => i === index ? { ...f, progress } : f));
          if (progress >= 100) {
            clearInterval(interval);
            resolve(`https://example.com/uploads/${file.file.name}`);
          }
        }, 50);
        return;
      }

      const xhr = new XMLHttpRequest();
      xhr.open('POST', wp.ajaxUrl, true);
      xhr.withCredentials = true;

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          setFiles(prev => prev.map((f, i) => i === index ? { ...f, progress: percent } : f));
        }
      };

      xhr.onload = () => {
        try {
          const res = JSON.parse(xhr.responseText || '{}');
          if (res?.success && res?.data?.url) {
            setFiles(prev => prev.map((f, i) => i === index ? { ...f, progress: 100 } : f));
            resolve(res.data.url as string);
          } else {
            reject(res?.data || res || 'Upload failed');
          }
        } catch (err) {
          reject(err);
        }
      };

      xhr.onerror = () => reject('Network error');

      const form = new FormData();
      form.append('action', 'pdf_gallery_action');
      form.append('action_type', 'upload_pdf');
      form.append('nonce', wp.nonce);
      form.append('pdf_file', file.file);
      xhr.send(form);
    });
  };

  const processAutoUploads = async (filesToUpload: FileUpload[]) => {
    setIsUploading(true);
    try {
      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        if (!file.title.trim()) continue;
        const url = await uploadFileToWP(file, i);
        onAdd({ 
          title: file.title, 
          date: file.subtitle || '', 
          pdfUrl: url, 
          fileType: file.fileType 
        });
      }
      setFiles([]);
      onClose();
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Documents</DialogTitle>
        </DialogHeader>
        <form className="space-y-6">
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
              multiple={license.isPro}
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

          {/* File List - Only show during upload process */}
          {(files.length > 0 || isUploading) && (
            <div className="space-y-4">
              <Label className="text-base font-medium">
                {isUploading ? 'Uploading Files...' : `Selected Files (${files.length})`}
              </Label>
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
                      {!isUploading && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {/* Progress bar during upload */}
                    {isUploading && (
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

          {!isUploading && files.length === 0 && (
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddDocumentModal;