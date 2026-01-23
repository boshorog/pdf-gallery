import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Crown, Check, X, Shield, Trash2, BookOpen, FileText, Settings, Upload, Layout, Palette, HelpCircle, Zap } from 'lucide-react';
import { useLicense } from '@/hooks/useLicense';
import { useToast } from '@/hooks/use-toast';

const PLUGIN_VERSION = '2.3.6';

interface PluginDocumentationProps {
  className?: string;
  showOnlyLicenseAndComparison?: boolean;
}

const PluginDocumentation: React.FC<PluginDocumentationProps> = ({ className, showOnlyLicenseAndComparison = false }) => {
  const license = useLicense();
  const [isRemovingLicense, setIsRemovingLicense] = useState(false);
  const { toast } = useToast();

  // Get license owner info from WordPress global
  const getLicenseOwner = () => {
    try {
      const wpGlobal = (window as any).wpPDFGallery || (window.parent as any)?.wpPDFGallery;
      return wpGlobal?.licensedTo || 'Pro User';
    } catch {
      return 'Pro User';
    }
  };

  const handleRemoveLicense = async () => {
    setIsRemovingLicense(true);
    try {
      const wpGlobal = (window as any).wpPDFGallery || (window.parent as any)?.wpPDFGallery;
      const ajaxUrl = wpGlobal?.ajaxUrl || (window as any).ajaxurl;
      const nonce = wpGlobal?.nonce;

      if (!ajaxUrl || !nonce) {
        toast({ title: 'Unable to remove license', description: 'WordPress AJAX not available', variant: 'destructive' });
        return;
      }

      const form = new FormData();
      form.append('action', 'kindpdfg_freemius_deactivate');
      form.append('nonce', nonce);

      const response = await fetch(ajaxUrl, {
        method: 'POST',
        credentials: 'same-origin',
        body: form
      });

      const data = await response.json();

      if (data?.success) {
        toast({ title: 'License removed', description: 'Your license has been deactivated. Reloading...' });
        setTimeout(() => window.location.reload(), 1500);
      } else {
        toast({ title: 'Failed to remove license', description: data?.data?.message || 'Unknown error', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error removing license', description: 'Please try again', variant: 'destructive' });
    } finally {
      setIsRemovingLicense(false);
    }
  };

  const FeatureRow = ({ feature, free, pro }: { feature: string; free: boolean | string; pro: boolean | string }) => (
    <tr className="border-b border-border/50">
      <td className="py-3 px-4 text-sm">{feature}</td>
      <td className="py-3 px-4 text-center">
        {typeof free === 'boolean' ? (
          free ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-muted-foreground/50 mx-auto" />
        ) : (
          <span className="text-sm text-muted-foreground">{free}</span>
        )}
      </td>
      <td className="py-3 px-4 text-center">
        {typeof pro === 'boolean' ? (
          pro ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-muted-foreground/50 mx-auto" />
        ) : (
          <span className="text-sm font-medium text-primary">{pro}</span>
        )}
      </td>
    </tr>
  );

  // If showing only license and comparison, render a simplified view
  if (showOnlyLicenseAndComparison) {
    return (
      <div className={className}>
        {/* Pro License Info */}
        {license.isPro && license.checked && (
          <Card className="mb-6 border-primary/30 bg-gradient-to-r from-primary/5 to-transparent">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Crown className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      Licensed to: <span className="text-primary">{getLicenseOwner()}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">PDF Gallery Pro v{PLUGIN_VERSION}</p>
                  </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-4 h-4 mr-1" />
                      Remove License
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove Pro License?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will deactivate your Pro license and revert to the Free version. You can reactivate it later using your license key.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleRemoveLicense}
                        disabled={isRemovingLicense}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        {isRemovingLicense ? 'Removing...' : 'Remove License'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Comparison Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Free vs Pro Comparison
              <Crown className="w-5 h-5 text-amber-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="py-3 px-4 text-left text-sm font-semibold">Feature</th>
                    <th className="py-3 px-4 text-center text-sm font-semibold">Free</th>
                    <th className="py-3 px-4 text-center text-sm font-semibold">
                      <span className="inline-flex items-center gap-1">
                        Pro
                        <Crown className="w-4 h-4 text-amber-500" />
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <FeatureRow feature="Number of Galleries" free="1" pro="Unlimited" />
                  <FeatureRow feature="Documents per Gallery" free="15" pro="Unlimited" />
                  <FeatureRow feature="Upload Multiple Files at Once" free={false} pro={true} />
                  <FeatureRow feature="Multiple File Types (PDF, Office, Images, Video, Audio)" free={true} pro={true} />
                  <FeatureRow feature="Drag & Drop Reordering" free={true} pro={true} />
                  <FeatureRow feature="Section Dividers" free={true} pro={true} />
                  <FeatureRow feature="Many Styling Options" free={true} pro={true} />
                  <FeatureRow feature="Priority Support" free={false} pro={true} />
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2">
            <BookOpen className="w-5 h-5" />
            PDF Gallery Documentation
            <Badge variant="secondary" className="ml-2">v{PLUGIN_VERSION}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">

            {/* Getting Started */}
            <AccordionItem value="getting-started">
              <AccordionTrigger className="text-base font-semibold">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-500" />
                  Getting Started
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-6 text-sm">
                  <div>
                    <h4 className="font-medium mb-3 text-base border-b border-border pb-2">1. Add Your Files</h4>
                    <ol className="list-decimal list-inside space-y-2 text-muted-foreground ml-2">
                      <li>Go to the <strong>Galleries</strong> tab</li>
                      <li>Click <strong>"Add File(s)"</strong> to upload documents</li>
                      <li>Arrange your documents using drag & drop</li>
                    </ol>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3 text-base border-b border-border pb-2">2. Organize with Dividers</h4>
                    <p className="text-muted-foreground ml-2">
                      Use <strong>"Add Divider"</strong> to create section headers and organize your files into logical chapters or categories.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3 text-base border-b border-border pb-2">3. Customize Appearance</h4>
                    <p className="text-muted-foreground ml-2">
                      Visit the <strong>Settings</strong> tab to adjust column layout, thumbnail styles, colors, hover effects, and more.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3 text-base border-b border-border pb-2">4. Embed Your Gallery</h4>
                    <ol className="list-decimal list-inside space-y-2 text-muted-foreground ml-2">
                      <li>Copy the shortcode from the <strong>Preview</strong> tab</li>
                      <li>Paste the shortcode into any page or post</li>
                    </ol>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Supported File Types</h4>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Documents</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">PDF</Badge>
                          <Badge variant="outline">DOC/DOCX</Badge>
                          <Badge variant="outline">PPT/PPTX</Badge>
                          <Badge variant="outline">XLS/XLSX</Badge>
                          <Badge variant="outline">TXT</Badge>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Images</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">JPG/JPEG</Badge>
                          <Badge variant="outline">PNG</Badge>
                          <Badge variant="outline">GIF</Badge>
                          <Badge variant="outline">WEBP</Badge>
                          <Badge variant="outline">SVG</Badge>
                          <Badge variant="outline">BMP</Badge>
                          <Badge variant="outline">ICO</Badge>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Audio</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">MP3</Badge>
                          <Badge variant="outline">WAV</Badge>
                          <Badge variant="outline">OGG</Badge>
                          <Badge variant="outline">M4A</Badge>
                          <Badge variant="outline">FLAC</Badge>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Video</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">MP4</Badge>
                          <Badge variant="outline">WEBM</Badge>
                          <Badge variant="outline">OGV</Badge>
                          <Badge variant="outline">MOV</Badge>
                          <Badge variant="outline">AVI</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Uploading Files */}
            <AccordionItem value="uploading">
              <AccordionTrigger className="text-base font-semibold">
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4 text-green-500" />
                  Uploading Files
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-medium mb-2">Upload Methods</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li><strong>Computer Upload:</strong> Select files from your device</li>
                      <li><strong>WordPress Media Library:</strong> Choose existing media files</li>
                      <li><strong>URL Input:</strong> Enter a direct link to a file</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Thumbnails</h4>
                    <p className="text-muted-foreground">
                      Thumbnails are automatically generated for PDF files. For other file types, a placeholder icon is displayed. 
                      You can also upload custom thumbnails for any document.
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Gallery Management */}
            <AccordionItem value="management">
              <AccordionTrigger className="text-base font-semibold">
                <div className="flex items-center gap-2">
                  <Layout className="w-4 h-4 text-purple-500" />
                  Gallery Management
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-medium mb-2">Organizing Documents</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li><strong>Drag & Drop:</strong> Reorder documents by dragging them</li>
                      <li><strong>Section Dividers:</strong> Add headers to group related documents</li>
                      <li><strong>Bulk Selection:</strong> Select multiple items for batch operations</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Editing Documents</h4>
                    <p className="text-muted-foreground">
                      Click the edit icon on any document to modify its title, subtitle, or thumbnail. 
                      Changes are saved automatically.
                    </p>
                  </div>
                  {license.isPro && (
                    <div>
                      <h4 className="font-medium mb-2">Multiple Galleries (Pro)</h4>
                      <p className="text-muted-foreground">
                        Create unlimited galleries for different purposes. Use the gallery selector dropdown 
                        to switch between galleries or create new ones.
                      </p>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Shortcodes */}
            <AccordionItem value="shortcodes">
              <AccordionTrigger className="text-base font-semibold">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-orange-500" />
                  Shortcodes
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-medium mb-2">Basic Usage</h4>
                    <code className="block bg-muted p-3 rounded text-xs">
                      [pdf_gallery]
                    </code>
                    <p className="text-muted-foreground mt-2">Displays the default gallery.</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Specific Gallery</h4>
                    <code className="block bg-muted p-3 rounded text-xs">
                      [pdf_gallery name="my-gallery-name"]
                    </code>
                    <p className="text-muted-foreground mt-2">Displays a specific gallery by name (use lowercase with hyphens).</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Available Parameters</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li><code className="bg-muted px-1 rounded">name</code> - Gallery name (slug format)</li>
                      <li><code className="bg-muted px-1 rounded">columns</code> - Number of columns (1-6)</li>
                      <li><code className="bg-muted px-1 rounded">style</code> - Thumbnail style override</li>
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Display Settings */}
            <AccordionItem value="settings">
              <AccordionTrigger className="text-base font-semibold">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-slate-500" />
                  Display Settings
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-medium mb-2">Layout Options</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li><strong>Columns:</strong> Choose 1-6 columns for the grid layout</li>
                      <li><strong>Thumbnail Shape:</strong> Square, landscape, or portrait aspect ratios</li>
                      <li><strong>Gap Size:</strong> Spacing between gallery items</li>
                    </ul>
                    <p className="text-muted-foreground mt-2 text-xs italic">
                      Note: On mobile devices, thumbnails display one per row. On tablets, they display two per row regardless of column settings.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Thumbnail Styles</h4>
                    <p className="text-muted-foreground">
                      Choose from various thumbnail styles including bordered, shadowed, rounded corners, 
                      and more. Pro users have access to all available styles.
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Styling */}
            <AccordionItem value="styling">
              <AccordionTrigger className="text-base font-semibold">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-pink-500" />
                  Styling & Customization
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-medium mb-2">Accent Colors</h4>
                    <p className="text-muted-foreground">
                      Customize the accent color to match your website's branding. This affects buttons, 
                      links, and interactive elements.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Hover Animations</h4>
                    <p className="text-muted-foreground">
                      Add visual feedback when users hover over gallery items. Choose from fade, slide, 
                      zoom, and other animation effects.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Custom CSS</h4>
                    <p className="text-muted-foreground">
                      Advanced users can add custom CSS through WordPress Customizer to further 
                      style the gallery output.
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Free vs Pro Comparison */}
            <AccordionItem value="comparison">
              <AccordionTrigger className="text-base font-semibold">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-500" />
                  Free vs Pro Comparison
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="py-3 px-4 text-left text-sm font-semibold">Feature</th>
                        <th className="py-3 px-4 text-center text-sm font-semibold">Free</th>
                        <th className="py-3 px-4 text-center text-sm font-semibold">
                          <span className="inline-flex items-center gap-1">
                            Pro
                            <Crown className="w-4 h-4 text-amber-500" />
                          </span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <FeatureRow feature="Number of Galleries" free="1" pro="Unlimited" />
                      <FeatureRow feature="Documents per Gallery" free="15" pro="Unlimited" />
                      <FeatureRow feature="Upload Multiple Files at Once" free={false} pro={true} />
                      <FeatureRow feature="Multiple File Types (PDF, Office, Images, Video, Audio)" free={true} pro={true} />
                      <FeatureRow feature="Drag & Drop Reordering" free={true} pro={true} />
                      <FeatureRow feature="Section Dividers" free={true} pro={true} />
                      <FeatureRow feature="Many Styling Options" free={true} pro={true} />
                      <FeatureRow feature="Priority Support" free={false} pro={true} />
                    </tbody>
                  </table>
                </div>
                {!license.isPro && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-lg border border-amber-500/20">
                    <p className="text-sm text-center">
                      <a 
                        href="https://kindpixels.com/plugins/kindpixels-pdf-gallery-pro" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-medium"
                      >
                        Upgrade to Pro →
                      </a>
                    </p>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Troubleshooting */}
            <AccordionItem value="troubleshooting">
              <AccordionTrigger className="text-base font-semibold">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-red-500" />
                  Troubleshooting
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-medium mb-2">Thumbnails Not Generating</h4>
                    <p className="text-muted-foreground">
                      Ensure your server has sufficient memory and the file size is within limits. 
                      For large PDFs, thumbnail generation may take a few moments.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Upload Errors</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Check your PHP <code className="bg-muted px-1 rounded">upload_max_filesize</code> setting</li>
                      <li>Verify the file type is supported</li>
                      <li>Ensure file permissions are correct</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Gallery Not Displaying</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Verify the shortcode is correct</li>
                      <li>Check for JavaScript errors in the browser console</li>
                      <li>Ensure no theme/plugin conflicts</li>
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Support */}
            <AccordionItem value="support">
              <AccordionTrigger className="text-base font-semibold">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-teal-500" />
                  Support & Resources
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-medium mb-2">Getting Help</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li><strong>Documentation:</strong> You're reading it!</li>
                      <li><strong>WordPress Forums:</strong> Community support for free users</li>
                      <li><strong>Priority Support:</strong> Email support for Pro users</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Useful Links</h4>
                    <ul className="space-y-2">
                      <li>
                        <a href="https://kindpixels.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          Plugin Website →
                        </a>
                      </li>
                      <li>
                        <a href="https://kindpixels.com/plugins/kindpixels-pdf-gallery-pro" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          Upgrade to Pro →
                        </a>
                      </li>
                    </ul>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      PDF Gallery v{PLUGIN_VERSION} • Made with ❤️ by Kind Pixels
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};

export default PluginDocumentation;
