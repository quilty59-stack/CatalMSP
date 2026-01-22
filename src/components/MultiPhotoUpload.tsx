import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, X, Plus, ImagePlus } from 'lucide-react';

export interface UploadedPhoto {
  id: string;
  file: File;
  preview: string;
}

interface MultiPhotoUploadProps {
  photos: UploadedPhoto[];
  onPhotosChange: (photos: UploadedPhoto[]) => void;
  maxPhotos?: number;
  label?: string;
  placeholder?: string;
  className?: string;
}

export function MultiPhotoUpload({
  photos,
  onPhotosChange,
  maxPhotos = 10,
  label = 'Photos',
  placeholder = 'Ajouter des photos',
  className = '',
}: MultiPhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newPhotos: UploadedPhoto[] = [];
    const remainingSlots = maxPhotos - photos.length;
    const filesToProcess = Math.min(files.length, remainingSlots);

    let processed = 0;
    
    for (let i = 0; i < filesToProcess; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;

      const reader = new FileReader();
      reader.onloadend = () => {
        newPhotos.push({
          id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          file,
          preview: reader.result as string,
        });
        processed++;

        if (processed === filesToProcess) {
          onPhotosChange([...photos, ...newPhotos]);
        }
      };
      reader.readAsDataURL(file);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePhoto = (photoId: string) => {
    onPhotosChange(photos.filter((p) => p.id !== photoId));
  };

  const canAddMore = photos.length < maxPhotos;

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">{label}</span>
          <span className="text-xs text-muted-foreground">
            {photos.length}/{maxPhotos}
          </span>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Photo Grid */}
      <div className="grid grid-cols-3 gap-2">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="relative aspect-square rounded-lg overflow-hidden bg-muted"
          >
            <img
              src={photo.preview}
              alt="Upload"
              className="w-full h-full object-cover"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6"
              onClick={() => removePhoto(photo.id)}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ))}

        {/* Add Photo Button */}
        {canAddMore && (
          <div
            className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Plus className="w-6 h-6 text-muted-foreground" />
            <span className="text-xs text-muted-foreground text-center px-1">
              {photos.length === 0 ? placeholder : 'Ajouter'}
            </span>
          </div>
        )}
      </div>

      {photos.length === 0 && (
        <div
          className="h-32 border-2 border-dashed border-muted-foreground/30 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <Camera className="w-8 h-8 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{placeholder}</span>
          <span className="text-xs text-muted-foreground">
            Appuyez pour prendre ou sélectionner
          </span>
        </div>
      )}
    </div>
  );
}
