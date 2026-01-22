import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Camera, 
  ImagePlus, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Wind,
  User,
  Flame,
  Package,
  Sparkles,
  Check,
  ZoomIn
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

export interface SetupPhoto {
  id: string;
  category: string;
  file: File;
  preview: string;
}

interface SetupCategory {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

const SETUP_CATEGORIES: SetupCategory[] = [
  { key: 'fumee', label: 'Machine à fumée', icon: Wind, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  { key: 'mannequin', label: 'Mannequin', icon: User, color: 'text-amber-500', bgColor: 'bg-amber-500/10' },
  { key: 'feu', label: 'Dispositif feu/LED', icon: Flame, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
  { key: 'gaz', label: 'Bouteille de gaz', icon: Package, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' },
  { key: 'autre_prepa', label: 'Autre préparation', icon: ImagePlus, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
];

interface SetupPhotosStepProps {
  photos: SetupPhoto[];
  onPhotosChange: (photos: SetupPhoto[]) => void;
}

function looksLikeImage(file: File) {
  if (!file) return false;
  if (file.type) return file.type.startsWith('image/');
  return true;
}

export function SetupPhotosStep({ photos, onPhotosChange }: SetupPhotosStepProps) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const activeCategoryRef = useRef<string | null>(null);
  
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxCategory, setLightboxCategory] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const getPhotosForCategory = (category: string) => {
    return photos.filter(p => p.category === category);
  };

  const totalPhotos = photos.length;

  const processFiles = (files: FileList | null) => {
    const category = activeCategoryRef.current;
    
    if (!files || files.length === 0 || !category) {
      if (files && files.length > 0 && !category) {
        toast.error('Catégorie non définie. Réessayez.');
      }
      return;
    }

    activeCategoryRef.current = null;

    const candidates = Array.from(files).filter(looksLikeImage);
    if (candidates.length === 0) {
      toast.error('Aucune image détectée. Essayez depuis la Galerie.');
      return;
    }

    const newPhotos: SetupPhoto[] = [];
    let processed = 0;

    const finalizeIfDone = () => {
      processed++;
      if (processed === candidates.length) {
        onPhotosChange([...photos, ...newPhotos]);
        toast.success(`${newPhotos.length} photo${newPhotos.length > 1 ? 's' : ''} ajoutée${newPhotos.length > 1 ? 's' : ''}`);
      }
    };

    for (const file of candidates) {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPhotos.push({
          id: `setup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          category,
          file,
          preview: reader.result as string,
        });
        finalizeIfDone();
      };
      reader.onerror = () => {
        console.error('FileReader error');
        toast.error('Impossible de lire une photo.');
        finalizeIfDone();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
    if (cameraRef.current) cameraRef.current.value = '';
  };

  const handleGallerySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
    if (galleryRef.current) galleryRef.current.value = '';
  };

  const triggerCamera = (category: string) => {
    activeCategoryRef.current = category;
    setTimeout(() => cameraRef.current?.click(), 50);
  };

  const triggerGallery = (category: string) => {
    activeCategoryRef.current = category;
    setTimeout(() => galleryRef.current?.click(), 50);
  };

  const removePhoto = (photoId: string) => {
    onPhotosChange(photos.filter(p => p.id !== photoId));
  };

  const openLightbox = (category: string, index: number) => {
    setLightboxCategory(category);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const lightboxPhotos = lightboxCategory ? getPhotosForCategory(lightboxCategory) : [];
  const currentLightboxPhoto = lightboxPhotos[lightboxIndex];
  const currentCategory = SETUP_CATEGORIES.find(c => c.key === lightboxCategory);

  const navigateLightbox = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'next'
      ? (lightboxIndex + 1) % lightboxPhotos.length
      : (lightboxIndex - 1 + lightboxPhotos.length) % lightboxPhotos.length;
    setLightboxIndex(newIndex);
  };

  return (
    <div className="space-y-4">
      {/* Header with total counter */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Documentez la mise en place de l'exercice.
        </p>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full">
          <Camera className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-primary">{totalPhotos}</span>
        </div>
      </div>

      {/* Hidden inputs */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCameraCapture}
        className="hidden"
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleGallerySelect}
        className="hidden"
      />

      {/* Categories Grid */}
      <div className="space-y-3">
        {SETUP_CATEGORIES.map((cat, catIndex) => {
          const categoryPhotos = getPhotosForCategory(cat.key);
          const Icon = cat.icon;
          const hasPhotos = categoryPhotos.length > 0;
          
          return (
            <motion.div
              key={cat.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: catIndex * 0.05 }}
              className={`rounded-xl border transition-all ${
                hasPhotos 
                  ? 'border-primary/30 bg-card shadow-sm' 
                  : 'border-border bg-muted/30'
              }`}
            >
              {/* Category Header */}
              <div className={`flex items-center justify-between p-3 ${hasPhotos ? 'border-b border-border/50' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${cat.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${cat.color}`} />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-foreground">{cat.label}</span>
                    {hasPhotos && (
                      <p className="text-xs text-muted-foreground">
                        {categoryPhotos.length} photo{categoryPhotos.length > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Counter Badge */}
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                  hasPhotos 
                    ? 'bg-primary/10 text-primary' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {hasPhotos ? (
                    <>
                      <Check className="w-3 h-3" />
                      {categoryPhotos.length}
                    </>
                  ) : (
                    '0 photo'
                  )}
                </div>
              </div>

              {/* Photos Grid - Only show if has photos */}
              {hasPhotos && (
                <div className="p-3 pt-2">
                  <div className="grid grid-cols-4 gap-2">
                    {categoryPhotos.map((photo, photoIndex) => (
                      <motion.div
                        key={photo.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative aspect-square rounded-lg overflow-hidden bg-muted group cursor-pointer"
                        onClick={() => openLightbox(cat.key, photoIndex)}
                      >
                        <img
                          src={photo.preview}
                          alt={cat.label}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                          <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        {/* Delete button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removePhoto(photo.id);
                          }}
                          className="absolute top-1 right-1 w-5 h-5 bg-destructive rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className={`flex gap-2 p-3 ${hasPhotos ? 'pt-0' : ''}`}>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={`flex-1 gap-1.5 h-9 ${hasPhotos ? 'border-dashed' : ''}`}
                  onClick={() => triggerCamera(cat.key)}
                >
                  <Camera className="w-4 h-4" />
                  <span className="text-xs">Photo</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={`flex-1 gap-1.5 h-9 ${hasPhotos ? 'border-dashed' : ''}`}
                  onClick={() => triggerGallery(cat.key)}
                >
                  <ImagePlus className="w-4 h-4" />
                  <span className="text-xs">Galerie</span>
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* AI Generation Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">Génération IA</h4>
            <p className="text-sm text-muted-foreground mt-0.5">
              L'IA génère automatiquement les objectifs, niveaux de difficulté, consignes et matériel.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-3xl p-0 bg-black/95 border-none overflow-hidden">
          <AnimatePresence mode="wait">
            {currentLightboxPhoto && currentCategory && (
              <motion.div
                key={currentLightboxPhoto.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative"
              >
                <img
                  src={currentLightboxPhoto.preview}
                  alt={currentCategory.label}
                  className="w-full max-h-[80vh] object-contain"
                />

                {/* Close button */}
                <button
                  onClick={() => setLightboxOpen(false)}
                  className="absolute top-4 right-4 p-2 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Navigation */}
                {lightboxPhotos.length > 1 && (
                  <>
                    <button
                      onClick={() => navigateLightbox('prev')}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background transition-colors"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => navigateLightbox('next')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background transition-colors"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}

                {/* Info overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 rounded-lg ${currentCategory.bgColor} flex items-center justify-center`}>
                      <currentCategory.icon className={`w-4 h-4 ${currentCategory.color}`} />
                    </div>
                    <span className="text-white font-medium">{currentCategory.label}</span>
                  </div>
                  <p className="text-white/60 text-sm">
                    {lightboxIndex + 1} / {lightboxPhotos.length}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </div>
  );
}
