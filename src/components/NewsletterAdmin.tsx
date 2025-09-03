import { useState } from 'react';
import { Plus, Upload, Trash2, Edit, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface Newsletter {
  id: string;
  title: string;
  date: string;
  pdfUrl: string;
  thumbnail: string;
}

interface NewsletterAdminProps {
  newsletters: Newsletter[];
  onNewslettersChange: (newsletters: Newsletter[]) => void;
}

const NewsletterAdmin = ({ newsletters, onNewslettersChange }: NewsletterAdminProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    pdfUrl: '',
    thumbnail: ''
  });
  const { toast } = useToast();

  const saveNewslettersToWP = async (updatedNewsletters: Newsletter[]) => {
    const wp = (window as any).wpNewsletterGallery;
    if (wp?.ajaxUrl && wp?.nonce) {
      try {
        const form = new FormData();
        form.append('action', 'newsletter_gallery_action');
        form.append('action_type', 'save_newsletters');
        form.append('nonce', wp.nonce);
        form.append('newsletters', JSON.stringify(updatedNewsletters));

        const res = await fetch(wp.ajaxUrl, {
          method: 'POST',
          credentials: 'same-origin',
          body: form,
        });
        
        const data = await res.json();
        return data?.success;
      } catch (error) {
        console.error('Failed to save to WordPress:', error);
        return false;
      }
    }
    return true; // Return true for non-WP environments
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.date || !formData.pdfUrl) {
      toast({
        title: "Eroare",
        description: "Toate câmpurile sunt obligatorii",
        variant: "destructive",
      });
      return;
    }

    let updated: Newsletter[];
    
    if (editingId) {
      // Update existing newsletter
      updated = newsletters.map(newsletter =>
        newsletter.id === editingId
          ? { ...newsletter, ...formData }
          : newsletter
      );
    } else {
      // Add new newsletter
      const newNewsletter: Newsletter = {
        id: Date.now().toString(),
        ...formData,
        thumbnail: formData.thumbnail || '/placeholder-newsletter.jpg'
      };
      updated = [...newsletters, newNewsletter];
    }

    // Save to WordPress first
    const saved = await saveNewslettersToWP(updated);
    
    if (saved) {
      onNewslettersChange(updated);
      toast({
        title: editingId ? "Actualizat" : "Adăugat",
        description: `Newsletter-ul a fost ${editingId ? 'actualizat' : 'adăugat'} cu succes`,
      });
      resetForm();
    } else {
      toast({
        title: "Eroare",
        description: "Nu s-a putut salva newsletter-ul",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Sunteți sigur că doriți să ștergeți acest newsletter?')) {
      const updated = newsletters.filter(n => n.id !== id);
      
      // Save to WordPress first
      const saved = await saveNewslettersToWP(updated);
      
      if (saved) {
        onNewslettersChange(updated);
        toast({
          title: "Șters",
          description: "Newsletter-ul a fost șters cu succes",
        });
      } else {
        toast({
          title: "Eroare",
          description: "Nu s-a putut șterge newsletter-ul",
          variant: "destructive",
        });
      }
    }
  };

  const handleEdit = (newsletter: Newsletter) => {
    setFormData({
      title: newsletter.title,
      date: newsletter.date,
      pdfUrl: newsletter.pdfUrl,
      thumbnail: newsletter.thumbnail
    });
    setEditingId(newsletter.id);
    setIsAdding(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      date: '',
      pdfUrl: '',
      thumbnail: ''
    });
    setIsAdding(false);
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Administrare Newsletter-uri</h2>
        <Button 
          onClick={() => setIsAdding(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adaugă Newsletter
        </Button>
      </div>

      {/* Add/Edit Form */}
      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingId ? 'Editează Newsletter' : 'Adaugă Newsletter Nou'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Titlu</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Newsletter Ianuarie 2024"
              />
            </div>
            
            <div>
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                placeholder="Ianuarie 2024"
              />
            </div>
            
            <div>
              <Label htmlFor="pdfUrl">URL PDF</Label>
              <Input
                id="pdfUrl"
                value={formData.pdfUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, pdfUrl: e.target.value }))}
                placeholder="https://example.com/newsletter.pdf"
              />
            </div>
            
            <div>
              <Label htmlFor="thumbnail">URL Thumbnail (opțional)</Label>
              <Input
                id="thumbnail"
                value={formData.thumbnail}
                onChange={(e) => setFormData(prev => ({ ...prev, thumbnail: e.target.value }))}
                placeholder="https://example.com/thumbnail.jpg"
              />
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleSubmit}>
                {editingId ? 'Actualizează' : 'Adaugă'}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Anulează
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Newsletter List */}
      <div className="space-y-4">
        {newsletters.map((newsletter) => (
          <Card key={newsletter.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-4">
                <img
                  src={newsletter.thumbnail}
                  alt={newsletter.title}
                  className="w-16 h-20 object-cover rounded"
                />
                <div>
                  <h3 className="font-semibold">{newsletter.title}</h3>
                  <p className="text-sm text-muted-foreground">{newsletter.date}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-xs">
                    {newsletter.pdfUrl}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(newsletter.pdfUrl, '_blank')}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(newsletter)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(newsletter.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {newsletters.length === 0 && !isAdding && (
        <Card>
          <CardContent className="text-center py-8">
            <Upload className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nu există newsletter-uri</h3>
            <p className="text-muted-foreground mb-4">
              Începeți prin a adăuga primul newsletter.
            </p>
            <Button onClick={() => setIsAdding(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Adaugă primul newsletter
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NewsletterAdmin;