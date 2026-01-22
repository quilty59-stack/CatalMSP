import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, X } from 'lucide-react';

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
  className?: string;
}

export function MultiPhotoUpload({
  photos,
  onPhotosChange,
  maxPhotos = 10,
  label = 'Photos',
  className = '',
}: MultiPhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const looksLikeImage = (file: File) => {
    // Some mobile browsers can provide an empty MIME type even when it's an image.
    if (!file) return false;
    if (file.type) return file.type.startsWith('image/');
    return true;
  };

  const processFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newPhotos: UploadedPhoto[] = [];
    const remainingSlots = maxPhotos - photos.length;
    const filesToProcess = Math.min(files.length, remainingSlots);

    const candidates = Array.from(files)
      .slice(0, filesToProcess)
      .filter(looksLikeImage);

    if (candidates.length === 0) return;

    let processed = 0;
    
    for (const file of candidates) {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPhotos.push({
          id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          file,
          preview: reader.result as string,
        });
        processed++;

        if (processed === candidates.length) {
          onPhotosChange([...photos, ...newPhotos]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
    if (fileInputRef.current) fileInputRef.current.value = '';
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

      {/* Hidden input - no capture attribute = native picker with all options */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Photo Grid */}
      {photos.length > 0 && (
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
        </div>
      )}

      {/* Add Photo Button - Single button triggers native picker */}
      {canAddMore && (
        <Button
          type="button"
          variant="outline"
          className="w-full h-16 flex-col gap-1"
          onClick={() => fileInputRef.current?.click()}
        >
          <Camera className="w-6 h-6" />
          <span className="text-xs">Ajouter une photo</span>
        </Button>
      )}
    </div>
  );
}
