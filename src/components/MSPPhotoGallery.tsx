import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, MapPin, Camera, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';

interface Photo {
  id: string;
  msp_id: string;
  image_url: string;
  category: string;
  comment: string | null;
  created_at: string;
}

interface MSPPhotoGalleryProps {
  mspId: string;
}

const LOCATION_CATEGORIES = ['site', 'access'];
const PREPARATION_CATEGORIES = ['mannequin', 'smoke_machine', 'gas_bottle', 'fire_led', 'victim', 'equipment', 'water', 'danger', 'other'];

const PHOTO_CATEGORIES: Record<string, string> = {
  site: 'Vue du site',
  access: 'Accès',
  mannequin: 'Mannequin',
  smoke_machine: 'Machine à fumée',
  gas_bottle: 'Bouteille de gaz',
  fire_led: 'LED feu',
  victim: 'Victime',
  equipment: 'Matériel',
  water: 'Point d\'eau',
  danger: 'Zone dangereuse',
  other: 'Autre',
};

export function MSPPhotoGallery({ mspId }: MSPPhotoGalleryProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    loadPhotos();
  }, [mspId]);

  const loadPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('msp_photos')
        .select('*')
        .eq('msp_id', mspId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setPhotos(data || []);
    } catch (err) {
      console.error('Error loading photos:', err);
    } finally {
      setLoading(false);
    }
  };

  const locationPhotos = photos.filter(p => LOCATION_CATEGORIES.includes(p.category));
  const preparationPhotos = photos.filter(p => PREPARATION_CATEGORIES.includes(p.category) || !LOCATION_CATEGORIES.includes(p.category));

  const openLightbox = (photo: Photo, allPhotos: Photo[]) => {
    setSelectedPhoto(photo);
    setCurrentIndex(allPhotos.findIndex(p => p.id === photo.id));
  };

  const navigateLightbox = (direction: 'prev' | 'next', allPhotos: Photo[]) => {
    const newIndex = direction === 'next' 
      ? (currentIndex + 1) % allPhotos.length 
      : (currentIndex - 1 + allPhotos.length) % allPhotos.length;
    setCurrentIndex(newIndex);
    setSelectedPhoto(allPhotos[newIndex]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (photos.length === 0) {
    return null;
  }

  const allPhotosForLightbox = [...locationPhotos, ...preparationPhotos];

  return (
    <div className="space-y-6">
      {/* Location Photos */}
      {locationPhotos.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="form-section"
        >
          <h2 className="form-section-title">
            <MapPin className="w-5 h-5 text-primary" />
            Photos de localisation
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Photos permettant d'identifier et localiser le site
          </p>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {locationPhotos.map((photo) => (
              <PhotoCard 
                key={photo.id} 
                photo={photo} 
                onClick={() => openLightbox(photo, allPhotosForLightbox)}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Preparation Photos */}
      {preparationPhotos.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="form-section"
        >
          <h2 className="form-section-title">
            <Camera className="w-5 h-5 text-primary" />
            Photos de préparation / Mise en place
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Photos détaillant l'installation du scénario (machine à fumée, mannequin, matériel...)
          </p>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {preparationPhotos.map((photo) => (
              <PhotoCard 
                key={photo.id} 
                photo={photo} 
                onClick={() => openLightbox(photo, allPhotosForLightbox)}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Lightbox */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl p-0 bg-black/95 border-none">
          <AnimatePresence mode="wait">
            {selectedPhoto && (
              <motion.div
                key={selectedPhoto.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative"
              >
                <img
                  src={selectedPhoto.image_url}
                  alt={PHOTO_CATEGORIES[selectedPhoto.category] || selectedPhoto.category}
                  className="w-full max-h-[80vh] object-contain"
                />
                
                {/* Close button */}
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="absolute top-4 right-4 p-2 bg-background/80 rounded-full hover:bg-background transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Navigation */}
                {allPhotosForLightbox.length > 1 && (
                  <>
                    <button
                      onClick={() => navigateLightbox('prev', allPhotosForLightbox)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-background/80 rounded-full hover:bg-background transition-colors"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => navigateLightbox('next', allPhotosForLightbox)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-background/80 rounded-full hover:bg-background transition-colors"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}

                {/* Info overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <span className="inline-block px-3 py-1 bg-primary/90 text-primary-foreground rounded-full text-sm font-medium mb-2">
                    {PHOTO_CATEGORIES[selectedPhoto.category] || selectedPhoto.category}
                  </span>
                  {selectedPhoto.comment && (
                    <p className="text-white text-sm">{selectedPhoto.comment}</p>
                  )}
                  <p className="text-white/60 text-xs mt-1">
                    {currentIndex + 1} / {allPhotosForLightbox.length}
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

function PhotoCard({ photo, onClick }: { photo: Photo; onClick: () => void }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative rounded-lg overflow-hidden bg-muted aspect-[4/3] cursor-pointer group"
    >
      <img
        src={photo.image_url}
        alt={PHOTO_CATEGORIES[photo.category] || photo.category}
        className="w-full h-full object-cover transition-transform group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
      
      {/* Category badge */}
      <span className="absolute top-2 left-2 px-2 py-0.5 bg-background/90 backdrop-blur-sm rounded text-xs font-medium">
        {PHOTO_CATEGORIES[photo.category] || photo.category}
      </span>
      
      {/* Comment */}
      {photo.comment && (
        <div className="absolute bottom-0 left-0 right-0 p-2">
          <p className="text-xs text-white/90 line-clamp-2">{photo.comment}</p>
        </div>
      )}
    </motion.div>
  );
}
