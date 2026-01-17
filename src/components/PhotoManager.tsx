import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Camera, 
  Trash2, 
  Plus, 
  Loader2, 
  Image as ImageIcon,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Photo {
  id: string;
  msp_id: string;
  image_url: string;
  category: string;
  comment: string | null;
  created_at: string;
}

interface PhotoManagerProps {
  mspId: string;
}

const PHOTO_CATEGORIES = {
  site: 'Vue du site',
  access: 'Accès',
  mannequin: 'Emplacement mannequin',
  water: 'Point d\'eau',
  danger: 'Zone dangereuse',
  equipment: 'Matériel',
  other: 'Autre',
};

export function PhotoManager({ mspId }: PhotoManagerProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('site');
  const [comment, setComment] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    loadPhotos();
  }, [mspId]);

  const loadPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('msp_photos')
        .select('*')
        .eq('msp_id', mspId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (err) {
      console.error('Error loading photos:', err);
      toast.error('Erreur lors du chargement des photos');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image');
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      // Upload to storage
      const fileName = `${mspId}/${Date.now()}-${selectedFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('msp-photos')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('msp-photos')
        .getPublicUrl(fileName);

      // Insert into database
      const { error: insertError } = await supabase
        .from('msp_photos')
        .insert({
          msp_id: mspId,
          image_url: urlData.publicUrl,
          category: selectedCategory,
          comment: comment || null,
        });

      if (insertError) throw insertError;

      toast.success('Photo ajoutée');
      setShowAddDialog(false);
      resetForm();
      loadPhotos();
    } catch (err) {
      console.error('Error uploading photo:', err);
      toast.error('Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (photo: Photo) => {
    if (!confirm('Supprimer cette photo ?')) return;

    try {
      // Extract file path from URL
      const url = new URL(photo.image_url);
      const pathParts = url.pathname.split('/');
      const filePath = pathParts.slice(pathParts.indexOf('msp-photos') + 1).join('/');

      // Delete from storage
      await supabase.storage
        .from('msp-photos')
        .remove([filePath]);

      // Delete from database
      const { error } = await supabase
        .from('msp_photos')
        .delete()
        .eq('id', photo.id);

      if (error) throw error;

      toast.success('Photo supprimée');
      loadPhotos();
    } catch (err) {
      console.error('Error deleting photo:', err);
      toast.error('Erreur lors de la suppression');
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setSelectedCategory('site');
    setComment('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Photo Grid */}
      <div className="grid grid-cols-2 gap-3">
        {photos.map((photo) => (
          <div key={photo.id} className="relative group rounded-lg overflow-hidden bg-muted aspect-square">
            <img
              src={photo.image_url}
              alt={PHOTO_CATEGORIES[photo.category as keyof typeof PHOTO_CATEGORIES] || photo.category}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-0 left-0 right-0 p-2">
                <span className="text-xs text-white font-medium">
                  {PHOTO_CATEGORIES[photo.category as keyof typeof PHOTO_CATEGORIES] || photo.category}
                </span>
                {photo.comment && (
                  <p className="text-xs text-white/80 truncate">{photo.comment}</p>
                )}
              </div>
              <button
                onClick={() => handleDelete(photo)}
                className="absolute top-2 right-2 p-1.5 bg-destructive rounded-full text-white hover:bg-destructive/90 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <span className="absolute top-2 left-2 px-2 py-0.5 bg-background/80 backdrop-blur-sm rounded text-xs font-medium">
              {PHOTO_CATEGORIES[photo.category as keyof typeof PHOTO_CATEGORIES] || photo.category}
            </span>
          </div>
        ))}

        {/* Add Photo Button */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <button className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/50 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary">
              <Plus className="w-8 h-8" />
              <span className="text-sm font-medium">Ajouter</span>
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Ajouter une photo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              {/* Preview or Upload */}
              {previewUrl ? (
                <div className="relative rounded-lg overflow-hidden">
                  <img
                    src={previewUrl}
                    alt="Prévisualisation"
                    className="w-full h-48 object-cover"
                  />
                  <button
                    onClick={resetForm}
                    className="absolute top-2 right-2 p-1.5 bg-background/80 rounded-full hover:bg-background transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="block">
                  <div className="h-48 border-2 border-dashed border-muted-foreground/30 rounded-lg flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors">
                    <Camera className="w-10 h-10 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Cliquer pour sélectionner
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              )}

              {/* Category */}
              <div>
                <label className="text-sm font-medium text-foreground">Catégorie</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PHOTO_CATEGORIES).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Comment */}
              <div>
                <label className="text-sm font-medium text-foreground">Commentaire (optionnel)</label>
                <Input
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Description de la photo..."
                  className="mt-1"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddDialog(false);
                    resetForm();
                  }}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                  className="flex-1 gap-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Upload...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Ajouter
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {photos.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Aucune photo pour cette MSP
        </p>
      )}
    </div>
  );
}
