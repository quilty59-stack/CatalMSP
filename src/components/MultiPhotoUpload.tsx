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
  className?: string;
}

export function MultiPhotoUpload({
  photos,
  onPhotosChange,
  maxPhotos = 10,
  label = 'Photos',
  className = '',
}: MultiPhotoUploadProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const processFiles = (files: FileList | null) => {
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
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleGallerySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
    if (galleryInputRef.current) galleryInputRef.current.value = '';
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

      {/* Hidden inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCameraCapture}
        className="hidden"
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleGallerySelect}
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

      {/* Add Photo Buttons */}
      {canAddMore && (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1 h-20 flex-col gap-1"
            onClick={() => cameraInputRef.current?.click()}
          >
            <Camera className="w-6 h-6" />
            <span className="text-xs">Prendre une photo</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1 h-20 flex-col gap-1"
            onClick={() => galleryInputRef.current?.click()}
          >
            <ImagePlus className="w-6 h-6" />
            <span className="text-xs">Depuis la galerie</span>
          </Button>
        </div>
      )}
    </div>
  );
}
