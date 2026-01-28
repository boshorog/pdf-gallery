import { useState, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Upload, X, FileText, Pause, Play, RotateCcw, Link, FolderOpen } from 'lucide-react';
import { useLicense } from '@/hooks/useLicense';
import { useToast } from '@/hooks/use-toast';
import { BUILD_FLAGS } from '@/config/buildFlags';

type UploadMode = 'upload' | 'media' | 'url';

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks
const MAX_FILE_SIZE = 1024 * 1024 * 1024; // 1GB max

interface FileUpload {
  file: File;
  title: string;
  subtitle: string;
  fileType: string;
  progress: number;
  url?: string;
  uploadId?: string;
  currentChunk?: number;
  totalChunks?: number;
  status: 'pending' | 'uploading' | 'paused' | 'complete' | 'error';
  error?: string;
}

interface AddDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (pdf: { title: string; date: string; pdfUrl: string; fileType: string }) => void;
}

const AddDocumentModal = ({ isOpen, onClose, onAdd }: AddDocumentModalProps) => {
  const [uploadMode, setUploadMode] = useState<UploadMode>('upload');
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [pausedUploads, setPausedUploads] = useState<Set<string>>(new Set());
  const [urlInput, setUrlInput] = useState('');
  const [urlTitle, setUrlTitle] = useState('');
  const [urlFileType, setUrlFileType] = useState('pdf');
  const [isAddingUrl, setIsAddingUrl] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const license = useLicense();

  const getFileType = (file: File): string => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico'].includes(extension || '')) return 'img';
    if (extension === 'pdf') return 'pdf';
    if (['doc', 'docx', 'odt', 'rtf', 'txt'].includes(extension || '')) return 'doc';
    if (['ppt', 'pptx', 'odp'].includes(extension || '')) return 'ppt';
    if (['xls', 'xlsx', 'ods', 'csv'].includes(extension || '')) return 'xls';
    if (['zip', 'rar', '7z'].includes(extension || '')) return 'zip';
    if (['epub', 'mobi'].includes(extension || '')) return 'epub';
    if (['mp3', 'wav', 'ogg'].includes(extension || '')) return 'audio';
    if (['mp4', 'mov', 'webm'].includes(extension || '')) return 'video';
    return extension || 'file';
  };

  const generateUploadId = (): string => {
    return `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleFiles = useCallback((fileList: FileList) => {
    // Check batch upload restriction - blocked in free build or if runtime license is not Pro
    const allowBulk = BUILD_FLAGS.BULK_UPLOAD_UI && license.isPro;
    if (!allowBulk && fileList.length > 1) {
      toast({
        title: 'Pro Feature Required',
        description: 'Bulk uploads require the Pro addon. Please upload one file at a time.',
        variant: 'destructive',
      });
      return;
    }

    const oversizedFiles = Array.from(fileList).filter(f => f.size > MAX_FILE_SIZE);
    if (oversizedFiles.length > 0) {
      toast({
        title: 'File Too Large',
        description: `Maximum file size is 1GB. ${oversizedFiles.map(f => f.name).join(', ')} exceeded the limit.`,
        variant: 'destructive',
      });
      return;
    }

    const newFiles: FileUpload[] = Array.from(fileList)
      .filter(f => f.size <= MAX_FILE_SIZE)
      .map(file => ({
        file,
        title: file.name.replace(/\.[^/.]+$/, ""),
        subtitle: '',
        fileType: getFileType(file),
        progress: 0,
        uploadId: generateUploadId(),
        currentChunk: 0,
        totalChunks: Math.ceil(file.size / CHUNK_SIZE),
        status: 'pending' as const
      }));
    
    setFiles(prev => [...prev, ...newFiles]);
    
    // Auto-start upload immediately
    setTimeout(() => {
      if (newFiles.length > 0) {
        processChunkedUploads(newFiles);
      }
    }, 100);
  }, [license.isPro, toast]);

  // Drag & drop is only available in Pro build AND only when a Pro license is active.
  // (Pro build without a license should still behave like Free at runtime.)
  const isDragDropEnabled = BUILD_FLAGS.BULK_UPLOAD_UI && license.isPro;

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (!isDragDropEnabled) return;
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  }, [handleFiles, isDragDropEnabled]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!isDragDropEnabled) return;
    setIsDragOver(true);
  }, [isDragDropEnabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!isDragDropEnabled) return;
    setIsDragOver(false);
  }, [isDragDropEnabled]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFiles(files);
    }
  }, [handleFiles]);

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const updateFileStatus = (uploadId: string, updates: Partial<FileUpload>) => {
    setFiles(prev => prev.map(f => 
      f.uploadId === uploadId ? { ...f, ...updates } : f
    ));
  };

  const uploadChunk = async (
    file: File, 
    chunkIndex: number, 
    uploadId: string, 
    totalChunks: number
  ): Promise<{ success: boolean; complete?: boolean; url?: string; error?: string }> => {
    const wp = (window as any).kindpdfgData || (window as any).wpPDFGallery;
    
    const start = chunkIndex * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const chunk = file.slice(start, end);
    
    // Fallback for non-WordPress environments
    if (!wp?.ajaxUrl || !wp?.nonce) {
      await new Promise(resolve => setTimeout(resolve, 100));
      if (chunkIndex === totalChunks - 1) {
        return { 
          success: true, 
          complete: true, 
          url: `https://example.com/uploads/${file.name}` 
        };
      }
      return { success: true, complete: false };
    }

    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', wp.ajaxUrl, true);
      xhr.withCredentials = true;

      xhr.onload = () => {
        try {
          const res = JSON.parse(xhr.responseText || '{}');
          if (res?.success) {
            resolve({ 
              success: true, 
              complete: res.data?.complete || false,
              url: res.data?.url 
            });
          } else {
            resolve({ success: false, error: res?.data || 'Upload failed' });
          }
        } catch (err) {
          resolve({ success: false, error: 'Parse error' });
        }
      };

      xhr.onerror = () => resolve({ success: false, error: 'Network error' });

      const form = new FormData();
      form.append('action', 'kindpdfg_action');
      form.append('action_type', 'upload_chunk');
      form.append('nonce', wp.nonce);
      form.append('chunk', chunk, file.name);
      form.append('upload_id', uploadId);
      form.append('chunk_index', chunkIndex.toString());
      form.append('total_chunks', totalChunks.toString());
      form.append('filename', file.name);
      
      xhr.send(form);
    });
  };

  const processChunkedUploads = async (filesToUpload: FileUpload[]) => {
    setIsUploading(true);
    
    for (const fileUpload of filesToUpload) {
      const { file, uploadId, totalChunks } = fileUpload;
      
      if (!uploadId || !totalChunks) continue;
      
      updateFileStatus(uploadId, { status: 'uploading' });
      
      let currentChunk = fileUpload.currentChunk || 0;
      
      while (currentChunk < totalChunks) {
        // Check if paused
        if (pausedUploads.has(uploadId)) {
          updateFileStatus(uploadId, { 
            status: 'paused', 
            currentChunk 
          });
          break;
        }
        
        const result = await uploadChunk(file, currentChunk, uploadId, totalChunks);
        
        if (!result.success) {
          updateFileStatus(uploadId, { 
            status: 'error', 
            error: result.error,
            currentChunk 
          });
          toast({
            title: 'Upload Failed',
            description: `${file.name}: ${result.error}`,
            variant: 'destructive',
          });
          break;
        }
        
        currentChunk++;
        const progress = Math.round((currentChunk / totalChunks) * 100);
        
        updateFileStatus(uploadId, { 
          progress, 
          currentChunk,
          status: result.complete ? 'complete' : 'uploading'
        });
        
        if (result.complete && result.url) {
          // File upload complete
          onAdd({
            title: fileUpload.title,
            date: fileUpload.subtitle || '',
            pdfUrl: result.url,
            fileType: fileUpload.fileType
          });
        }
      }
    }
    
    // Check if all files are complete
    setTimeout(() => {
      setFiles(prev => {
        const allComplete = prev.every(f => f.status === 'complete');
        if (allComplete && prev.length > 0) {
          setIsUploading(false);
          onClose();
          return [];
        }
        setIsUploading(false);
        return prev;
      });
    }, 500);
  };

  const togglePause = (uploadId: string) => {
    setPausedUploads(prev => {
      const next = new Set(prev);
      if (next.has(uploadId)) {
        next.delete(uploadId);
        // Resume upload
        const fileToResume = files.find(f => f.uploadId === uploadId);
        if (fileToResume) {
          processChunkedUploads([fileToResume]);
        }
      } else {
        next.add(uploadId);
      }
      return next;
    });
  };

  const retryUpload = (uploadId: string) => {
    const fileToRetry = files.find(f => f.uploadId === uploadId);
    if (fileToRetry) {
      updateFileStatus(uploadId, { status: 'pending', error: undefined });
      processChunkedUploads([fileToRetry]);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
  };

  // Detect file type from URL
  const getFileTypeFromUrl = (url: string): string => {
    // Check for YouTube
    if (url.includes('youtube.com/') || url.includes('youtu.be/')) {
      return 'youtube';
    }
    // Check extension
    const extension = url.split('.').pop()?.toLowerCase()?.split('?')[0];
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico'].includes(extension || '')) return 'img';
    if (extension === 'pdf') return 'pdf';
    if (['doc', 'docx', 'odt', 'rtf', 'txt'].includes(extension || '')) return 'doc';
    if (['ppt', 'pptx', 'odp'].includes(extension || '')) return 'ppt';
    if (['xls', 'xlsx', 'ods', 'csv'].includes(extension || '')) return 'xls';
    if (['zip', 'rar', '7z'].includes(extension || '')) return 'zip';
    if (['epub', 'mobi'].includes(extension || '')) return 'epub';
    if (['mp3', 'wav', 'ogg', 'm4a', 'flac'].includes(extension || '')) return 'audio';
    if (['mp4', 'mov', 'webm', 'avi'].includes(extension || '')) return 'video';
    return 'file';
  };

  // Fetch YouTube title via oEmbed
  const fetchYouTubeTitle = async (url: string): Promise<string | null> => {
    try {
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
      const response = await fetch(oembedUrl);
      if (response.ok) {
        const data = await response.json();
        return data.title || null;
      }
    } catch {}
    return null;
  };

  // Handle URL input change with auto-detection
  const handleUrlChange = async (url: string) => {
    setUrlInput(url);
    const detectedType = getFileTypeFromUrl(url);
    setUrlFileType(detectedType);

    // Auto-fetch YouTube title
    if (detectedType === 'youtube' && url.trim()) {
      const title = await fetchYouTubeTitle(url);
      if (title) {
        setUrlTitle(title);
      }
    }
  };

  // Add file via URL
  const handleAddUrl = async () => {
    if (!urlInput.trim()) {
      toast({
        title: 'URL Required',
        description: 'Please enter a valid URL.',
        variant: 'destructive',
      });
      return;
    }

    setIsAddingUrl(true);
    try {
      const fileType = getFileTypeFromUrl(urlInput);
      let title = urlTitle.trim();

      // Auto-fetch title for YouTube if not provided
      if (!title && fileType === 'youtube') {
        const fetchedTitle = await fetchYouTubeTitle(urlInput);
        title = fetchedTitle || 'YouTube Video';
      }

      if (!title) {
        // Extract filename from URL as fallback
        const urlParts = urlInput.split('/');
        title = urlParts[urlParts.length - 1]?.split('?')[0] || 'Untitled';
        title = title.replace(/\.[^/.]+$/, ''); // Remove extension
      }

      onAdd({
        title,
        date: '',
        pdfUrl: urlInput,
        fileType,
      });

      toast({
        title: 'File Added',
        description: `"${title}" has been added to the gallery.`,
      });

      // Reset and close
      setUrlInput('');
      setUrlTitle('');
      setUrlFileType('pdf');
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add file. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsAddingUrl(false);
    }
  };

  // Open WordPress Media Library
  const openMediaLibrary = () => {
    const wp = (window as any).wp;
    if (!wp?.media) {
      toast({
        title: 'Media Library Unavailable',
        description: 'WordPress Media Library is not available in this context.',
        variant: 'destructive',
      });
      return;
    }

    const mediaFrame = wp.media({
      title: 'Select Files',
      button: { text: 'Add to Gallery' },
      multiple: BUILD_FLAGS.BULK_UPLOAD_UI && license.isPro,
    });

    mediaFrame.on('select', () => {
      const selection = mediaFrame.state().get('selection');
      selection.each((attachment: any) => {
        const data = attachment.toJSON();
        const extension = data.filename?.split('.').pop()?.toLowerCase() || '';
        let fileType = 'file';
        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico'].includes(extension)) fileType = 'img';
        else if (extension === 'pdf') fileType = 'pdf';
        else if (['doc', 'docx'].includes(extension)) fileType = 'doc';
        else if (['ppt', 'pptx'].includes(extension)) fileType = 'ppt';
        else if (['xls', 'xlsx'].includes(extension)) fileType = 'xls';
        else if (['mp3', 'wav', 'ogg'].includes(extension)) fileType = 'audio';
        else if (['mp4', 'mov', 'webm'].includes(extension)) fileType = 'video';

        onAdd({
          title: data.title || data.filename?.replace(/\.[^/.]+$/, '') || 'Untitled',
          date: '',
          pdfUrl: data.url,
          fileType,
        });
      });

      toast({
        title: 'Files Added',
        description: 'Selected files have been added to the gallery.',
      });
      onClose();
    });

    mediaFrame.open();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Files</DialogTitle>
        </DialogHeader>
        <form className="space-y-6">
          {/* Mode Selector Tabs */}
          <div className="flex gap-2 border-b border-border pb-4">
            <Button
              type="button"
              variant={uploadMode === 'upload' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setUploadMode('upload')}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload Files
            </Button>
            <Button
              type="button"
              variant={uploadMode === 'media' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setUploadMode('media');
                openMediaLibrary();
              }}
              className="flex items-center gap-2"
            >
              <FolderOpen className="h-4 w-4" />
              Media Library
            </Button>
            <Button
              type="button"
              variant={uploadMode === 'url' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setUploadMode('url')}
              className="flex items-center gap-2"
            >
              <Link className="h-4 w-4" />
              Add via Link
            </Button>
          </div>

          {/* Upload Mode - File Upload Area */}
          {uploadMode === 'upload' && (
            <>
              <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragDropEnabled && isDragOver 
                    ? 'bg-primary border-primary text-primary-foreground' 
                    : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                }`}
                onDrop={isDragDropEnabled ? handleDrop : undefined}
                onDragOver={isDragDropEnabled ? handleDragOver : undefined}
                onDragLeave={isDragDropEnabled ? handleDragLeave : undefined}
                onDragEnter={isDragDropEnabled ? (e) => { e.preventDefault(); setIsDragOver(true); } : undefined}
              >
                {isDragDropEnabled && isDragOver ? (
                  <div className="flex flex-col items-center justify-center gap-2 py-6">
                    <Upload className="mx-auto h-12 w-12 text-primary-foreground/90" />
                    <p className="text-lg font-semibold">Drop your files here</p>
                    <p className="text-sm opacity-90">Release to upload</p>
                  </div>
                ) : (
                  <>
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <div className="space-y-2">
                      <p className="text-lg font-medium">
                        Click to browse files
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Supports PDF, Office files, images, audio, video, archives, and eBooks
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Max file size: 1GB (chunked upload)
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
                  multiple={BUILD_FLAGS.BULK_UPLOAD_UI && license.isPro}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.webp,.odt,.ods,.odp,.rtf,.txt,.csv,.svg,.ico,.zip,.rar,.7z,.epub,.mobi,.mp3,.wav,.ogg,.mp4,.mov,.webm,.avi,.mkv,.flv,.wmv,.m4v,.m4a,.flac,.aac,video/*,audio/*"
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
            </>
          )}

          {/* URL Mode - Add via Link */}
          {uploadMode === 'url' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file-url">File URL or YouTube Link</Label>
                <Input
                  id="file-url"
                  type="url"
                  placeholder="https://example.com/file.pdf or YouTube URL"
                  value={urlInput}
                  onChange={(e) => handleUrlChange(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Paste a direct link to a file or a YouTube video URL
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="url-title">Title (optional)</Label>
                <Input
                  id="url-title"
                  type="text"
                  placeholder="Enter a title for this file"
                  value={urlTitle}
                  onChange={(e) => setUrlTitle(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  {urlFileType === 'youtube' ? 'YouTube titles are fetched automatically' : 'Leave empty to use filename from URL'}
                </p>
              </div>

              {urlFileType && urlInput && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Detected type:</span>
                  <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-medium">
                    {urlFileType.toUpperCase()}
                  </span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleAddUrl}
                  disabled={!urlInput.trim() || isAddingUrl}
                >
                  {isAddingUrl ? 'Adding...' : 'Add to Gallery'}
                </Button>
              </div>
            </div>
          )}

          {/* Media Library Mode - Show instructions */}
          {uploadMode === 'media' && (
            <div className="text-center py-8 text-muted-foreground">
              <FolderOpen className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>The WordPress Media Library should have opened.</p>
              <p className="text-sm mt-2">Select files and click "Add to Gallery".</p>
              <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={openMediaLibrary}
              >
                Open Media Library
              </Button>
            </div>
          )}

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-4">
              <Label className="text-base font-medium">
                {isUploading ? 'Uploading Files...' : `Selected Files (${files.length})`}
              </Label>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {/* Sort files: uploading first, then pending, then paused/error, then complete */}
                {[...files].sort((a, b) => {
                  const statusOrder: Record<string, number> = {
                    'uploading': 0,
                    'pending': 1,
                    'paused': 2,
                    'error': 3,
                    'complete': 4
                  };
                  return (statusOrder[a.status] ?? 5) - (statusOrder[b.status] ?? 5);
                }).map((file) => {
                  const originalIndex = files.findIndex(f => f.uploadId === file.uploadId);
                  return (
                  <div key={file.uploadId || originalIndex} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-12 h-12 bg-muted rounded flex items-center justify-center flex-shrink-0">
                            <FileText className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <div className="absolute -top-1 -right-1 min-w-[24px] px-1 py-0.5 rounded text-[9px] font-medium bg-primary text-primary-foreground text-center z-10">
                            {file.fileType.toUpperCase().slice(0, 3)}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{file.file.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatFileSize(file.file.size)}
                            {file.totalChunks && file.totalChunks > 1 && (
                              <span className="ml-2 text-xs">
                                ({file.currentChunk || 0}/{file.totalChunks} chunks)
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {file.status === 'uploading' && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => togglePause(file.uploadId!)}
                            title="Pause"
                          >
                            <Pause className="h-4 w-4" />
                          </Button>
                        )}
                        {file.status === 'paused' && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => togglePause(file.uploadId!)}
                            title="Resume"
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        {file.status === 'error' && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => retryUpload(file.uploadId!)}
                            title="Retry"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        )}
                        {!isUploading && file.status !== 'complete' && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(originalIndex)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Progress bar */}
                    {(file.status === 'uploading' || file.status === 'paused' || file.status === 'complete') && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>
                            {file.status === 'complete' ? 'Complete' : 
                             file.status === 'paused' ? 'Paused' : 'Uploading...'}
                          </span>
                          <span>{file.progress}%</span>
                        </div>
                        <Progress 
                          value={file.progress} 
                          className={`h-2 ${file.status === 'paused' ? 'opacity-50' : ''}`} 
                        />
                      </div>
                    )}

                    {/* Error message */}
                    {file.status === 'error' && file.error && (
                      <p className="text-sm text-destructive">{file.error}</p>
                    )}
                  </div>
                  );
                })}
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