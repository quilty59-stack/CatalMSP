import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  SiteType, 
  Theme, 
  SITE_TYPES, 
  THEMES,
} from '@/types/msp';
import { SiteConventionne } from '@/types/site';
import { useSitesByCommune } from '@/hooks/useSites';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera,
  MapPin, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Check,
  Building2,
  Loader2,
  Navigation,
  X,
  ImagePlus,
  MapPinned
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { sendNotification } from '@/hooks/useNotifications';
import { MultiPhotoUpload, UploadedPhoto } from '@/components/MultiPhotoUpload';
import { SetupPhotosStep, SetupPhoto } from '@/components/SetupPhotosStep';

function looksLikeImage(file: File) {
  // Some mobile browsers can provide an empty MIME type even when it's an image.
  if (!file) return false;
  if (file.type) return file.type.startsWith('image/');
  return true;
}

function getImageExtension(file: File) {
  const fromName = file.name?.includes('.') ? file.name.split('.').pop()?.toLowerCase() : undefined;
  if (fromName && fromName.length <= 5) return fromName;

  const t = (file.type || '').toLowerCase();
  if (t.includes('jpeg')) return 'jpg';
  if (t.includes('png')) return 'png';
  if (t.includes('webp')) return 'webp';
  if (t.includes('heic')) return 'heic';
  if (t.includes('heif')) return 'heif';
  return 'jpg';
}

export default function CreateMSP() {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [entrancePhotos, setEntrancePhotos] = useState<UploadedPhoto[]>([]);
  const [setupPhotos, setSetupPhotos] = useState<SetupPhoto[]>([]);
  const [showSiteSuggestions, setShowSiteSuggestions] = useState(false);
  const [selectedSite, setSelectedSite] = useState<SiteConventionne | null>(null);
  
  const [formData, setFormData] = useState({
    siteName: '',
    siteType: '' as SiteType | '',
    commune: '',
    address: '',
    mapsLink: '',
    themes: ['incendie'] as Theme[],
    briefDescription: '',
    siteConventionneId: '' as string,
  });

  // Fetch sites matching the commune
  const { sites: matchingSites, isLoading: isLoadingSites } = useSitesByCommune(formData.commune);

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Show suggestions when commune changes and has content
    if (field === 'commune' && value.length >= 2) {
      setShowSiteSuggestions(true);
    } else if (field === 'commune' && value.length < 2) {
      setShowSiteSuggestions(false);
    }
  };

  // Handle site selection from suggestions
  const handleSelectSite = (site: SiteConventionne) => {
    setSelectedSite(site);
    setShowSiteSuggestions(false);
    
    // Map site type to MSP site type if compatible
    const siteTypeMap: Record<string, SiteType> = {
      'industriel': 'industriel',
      'erp': 'erp',
      'habitation': 'habitation',
      'chantier': 'chantier',
      'exterieur': 'exterieur',
    };
    
    // Pre-fill form data from the selected site
    setFormData(prev => ({
      ...prev,
      siteName: site.name,
      siteType: (siteTypeMap[site.siteType] || prev.siteType) as SiteType | '',
      commune: site.commune,
      address: site.address,
      mapsLink: site.latitude && site.longitude 
        ? `https://www.google.com/maps?q=${site.latitude},${site.longitude}` 
        : prev.mapsLink,
      siteConventionneId: site.id,
    }));
    
    toast.success(`Site "${site.name}" sélectionné`);
  };

  // Clear selected site
  const handleClearSelectedSite = () => {
    setSelectedSite(null);
    setFormData(prev => ({
      ...prev,
      siteConventionneId: '',
    }));
  };

  const handleGeolocation = async () => {
    if (!navigator.geolocation) {
      toast.error('La géolocalisation n\'est pas supportée par votre navigateur');
      return;
    }

    setIsLocating(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Generate Google Maps link
        const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
        updateField('mapsLink', mapsLink);
        
        // Try to get address via reverse geocoding (using Nominatim - free OSM service)
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            { headers: { 'Accept-Language': 'fr' } }
          );
          const data = await response.json();
          
          if (data.address) {
            const addr = data.address;
            const addressParts = [
              addr.house_number,
              addr.road,
              addr.postcode,
              addr.city || addr.town || addr.village || addr.municipality
            ].filter(Boolean);
            
            updateField('address', addressParts.join(' '));
            updateField('commune', addr.city || addr.town || addr.village || addr.municipality || '');
          }
          
          toast.success('Position localisée !');
        } catch (error) {
          console.error('Reverse geocoding error:', error);
          toast.success('Position localisée (adresse non disponible)');
        }
        
        setIsLocating(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast.error('Impossible d\'obtenir votre position');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const canProceed = () => {
    if (currentStep === 1) {
      return entrancePhotos.length > 0;
    }
    if (currentStep === 2) {
      return formData.siteName && formData.siteType && formData.commune;
    }
    if (currentStep === 3) {
      return formData.themes.length > 0;
    }
    // Step 4: setup photos are optional
    return true;
  };

  const uploadPhoto = async (mspId: string, file: File, category: string): Promise<string | null> => {
    const fileExt = getImageExtension(file);
    const safeCategory = category.replace(/[^a-z0-9_-]/gi, '_');
    const fileName = `${mspId}/${safeCategory}-${Date.now()}.${fileExt}`;
    
    const { error } = await supabase.storage
      .from('msp-photos')
      .upload(fileName, file, {
        contentType: file.type || (fileExt === 'jpg' ? 'image/jpeg' : `image/${fileExt}`),
      });
    
    if (error) {
      console.error('Photo upload error:', error);
      return null;
    }
    
    const { data: urlData } = supabase.storage
      .from('msp-photos')
      .getPublicUrl(fileName);
    
    return urlData.publicUrl;
  };

  const handleGenerateMSP = async () => {
    if (!canProceed()) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Call AI to generate MSP content
      const { data: aiData, error: aiError } = await supabase.functions.invoke('generate-msp', {
        body: {
          siteName: formData.siteName,
          siteType: formData.siteType,
          commune: formData.commune,
          address: formData.address,
          themes: formData.themes,
          briefDescription: formData.briefDescription,
        },
      });

      if (aiError) {
        console.error('Error calling generate-msp:', aiError);
        toast.error('Erreur lors de la génération. Veuillez réessayer.');
        return;
      }

      if (aiData?.error) {
        toast.error(aiData.error);
        return;
      }

      if (aiData?.success && aiData?.mspData) {
        const mspContent = aiData.mspData;
        
        // Generate a temporary slug (will be overwritten by trigger if using one)
        const tempSlug = `msp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        
        // Save MSP to database
        const mspInsertData = {
          slug: tempSlug,
          title: mspContent.title || `MSP ${formData.siteName}`,
          theme: formData.themes.join(', '),
          status: 'brouillon',
          difficulty: mspContent.difficulty || 2,
          site_name: formData.siteName,
          site_type: formData.siteType as string,
          commune: formData.commune,
          address: formData.address,
          maps_link: formData.mapsLink,
          site_notes: mspContent.siteNotes,
          competences: mspContent.competences,
          objectives: mspContent.objectives,
          situation: mspContent.situation,
          mission_reason: mspContent.missionReason,
          difficulty_facilitator: mspContent.difficultyFacilitator,
          difficulty_initial: mspContent.difficultyInitial,
          difficulty_complex: mspContent.difficultyComplex,
          instructions: mspContent.instructions,
          expected_activities: mspContent.expectedActivities,
          cognitive_effects: mspContent.cognitiveEffects,
          reservation_details: mspContent.reservationDetails,
          has_water_point: mspContent.hasWaterPoint || false,
          water_point_details: mspContent.waterPointDetails,
          authorizations: mspContent.authorizations,
          constraints: mspContent.constraints,
          safety_briefing: mspContent.safetyBriefing,
          equipment: mspContent.equipment || [],
          site_conventionne_id: formData.siteConventionneId || null,
          created_by: user?.id || null,
        };

        const { data: mspRecord, error: insertError } = await supabase
          .from('msp')
          .insert([mspInsertData])
          .select()
          .single();

        if (insertError) {
          console.error('Error saving MSP:', insertError);
          toast.error('Erreur lors de la sauvegarde');
          return;
        }

        // Upload entrance photos
        if (mspRecord && entrancePhotos.length > 0) {
          for (let i = 0; i < entrancePhotos.length; i++) {
            const photo = entrancePhotos[i];
            const category = i === 0 ? 'entree_principale' : `entree_${i + 1}`;
            const photoUrl = await uploadPhoto(mspRecord.id, photo.file, category);
            if (photoUrl) {
              const { error: photoInsertError } = await supabase.from('msp_photos').insert({
                msp_id: mspRecord.id,
                category: category,
                image_url: photoUrl,
              });

              if (photoInsertError) {
                console.error('Error inserting entrance photo:', photoInsertError);
                toast.error('Une photo (entrée) n\'a pas pu être enregistrée.');
              }
            } else {
              toast.error('Une photo (entrée) n\'a pas pu être envoyée.');
            }
          }
        }

        // Upload setup photos
        if (mspRecord && setupPhotos.length > 0) {
          for (const setupPhoto of setupPhotos) {
            const photoUrl = await uploadPhoto(mspRecord.id, setupPhoto.file, setupPhoto.category);
            if (photoUrl) {
              const { error: photoInsertError } = await supabase.from('msp_photos').insert({
                msp_id: mspRecord.id,
                category: setupPhoto.category,
                image_url: photoUrl,
              });

              if (photoInsertError) {
                console.error('Error inserting setup photo:', photoInsertError);
                toast.error('Une photo (mise en place) n\'a pas pu être enregistrée.');
              }
            } else {
              toast.error('Une photo (mise en place) n\'a pas pu être envoyée.');
            }
          }
        }

        // Send notification to admin about new MSP
        const formateurName = profile 
          ? `${profile.first_name} ${profile.last_name}` 
          : 'Un formateur';
        
        await sendNotification({
          type: 'msp_created',
          title: 'Nouvelle MSP en attente',
          message: `Nouvelle MSP en attente de validation de ${formateurName} : "${mspContent.title || formData.siteName}"`,
          link: `/msp/${mspRecord.slug}`,
          sendEmail: true,
          emailSubject: `🔔 Nouvelle MSP à valider - ${mspContent.title || formData.siteName}`,
          metadata: {
            mspId: mspRecord.id,
            mspTitle: mspContent.title || formData.siteName,
            creatorName: formateurName,
            creatorId: user?.id,
          },
        });

        toast.success('Fiche MSP créée avec succès !');
        navigate(`/msp/${mspRecord.slug}`);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error('Une erreur inattendue s\'est produite');
    } finally {
      setIsGenerating(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Prenez une ou plusieurs photos du site pour commencer.
            </p>
            
            <MultiPhotoUpload
              photos={entrancePhotos}
              onPhotosChange={setEntrancePhotos}
              maxPhotos={6}
              label="Photos d'entrée et du site"
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            {/* Geolocation button */}
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2"
              onClick={handleGeolocation}
              disabled={isLocating}
            >
              {isLocating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Localisation en cours...
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4" />
                  Me localiser automatiquement
                </>
              )}
            </Button>

            <div className="space-y-2">
              <Label htmlFor="siteName">Nom du site *</Label>
              <Input
                id="siteName"
                placeholder="Ex: Entrepôt Logistique Sud"
                value={formData.siteName}
                onChange={(e) => updateField('siteName', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Type de site *</Label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(SITE_TYPES) as SiteType[]).map((type) => (
                  <Button
                    key={type}
                    type="button"
                    variant={formData.siteType === type ? 'default' : 'outline'}
                    className={`h-auto py-3 px-4 justify-start ${
                      formData.siteType === type ? 'gradient-hero border-0' : ''
                    }`}
                    onClick={() => updateField('siteType', type)}
                  >
                    <Building2 className="w-4 h-4 mr-2 shrink-0" />
                    <span className="text-sm">{SITE_TYPES[type]}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Site conventionné sélectionné */}
            {selectedSite && (
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <MapPinned className="w-4 h-4 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-primary">{selectedSite.name}</p>
                      <p className="text-xs text-muted-foreground">{selectedSite.commune} - Site conventionné</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={handleClearSelectedSite}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2 relative">
              <Label htmlFor="commune">Commune *</Label>
              <Input
                id="commune"
                placeholder="Ex: Montpellier"
                value={formData.commune}
                onChange={(e) => updateField('commune', e.target.value)}
                onFocus={() => formData.commune.length >= 2 && setShowSiteSuggestions(true)}
              />
              
              {/* Sites conventionnés suggestions dropdown */}
              {showSiteSuggestions && matchingSites.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  <div className="p-2 border-b border-border bg-muted/50">
                    <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <MapPinned className="w-3 h-3" />
                      Sites conventionnés disponibles
                    </p>
                  </div>
                  {matchingSites.map((site) => (
                    <button
                      key={site.id}
                      type="button"
                      className="w-full text-left p-3 hover:bg-muted/50 border-b border-border last:border-b-0 transition-colors"
                      onClick={() => handleSelectSite(site)}
                    >
                      <p className="text-sm font-medium">{site.name}</p>
                      <p className="text-xs text-muted-foreground">{site.address}, {site.commune}</p>
                      {site.authorizedManeuvers.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {site.authorizedManeuvers.slice(0, 2).map((maneuver) => (
                            <span key={maneuver} className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                              {maneuver}
                            </span>
                          ))}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
              
              {/* Loading indicator */}
              {isLoadingSites && formData.commune.length >= 2 && (
                <div className="absolute right-3 top-8">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                placeholder="Adresse complète du site"
                value={formData.address}
                onChange={(e) => updateField('address', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mapsLink">Lien Google Maps</Label>
              <div className="flex gap-2">
                <Input
                  id="mapsLink"
                  placeholder="https://maps.google.com/..."
                  value={formData.mapsLink}
                  onChange={(e) => updateField('mapsLink', e.target.value)}
                  className="flex-1"
                />
                {formData.mapsLink && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => window.open(formData.mapsLink, '_blank')}
                  >
                    <MapPin className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        const toggleTheme = (theme: Theme) => {
          const currentThemes = formData.themes;
          if (currentThemes.includes(theme)) {
            // Remove theme if already selected (but keep at least one)
            if (currentThemes.length > 1) {
              updateField('themes', currentThemes.filter(t => t !== theme));
            }
          } else {
            // Add theme
            updateField('themes', [...currentThemes, theme]);
          }
        };
        
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Thème(s) de la MSP * <span className="text-xs text-muted-foreground font-normal">(multi-sélection possible)</span></Label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(THEMES) as Theme[]).map((theme) => {
                  const isSelected = formData.themes.includes(theme);
                  return (
                    <Button
                      key={theme}
                      type="button"
                      variant={isSelected ? 'default' : 'outline'}
                      className={`h-auto py-3 px-4 justify-start ${
                        isSelected ? 'gradient-hero border-0' : ''
                      }`}
                      onClick={() => toggleTheme(theme)}
                    >
                      {isSelected && <Check className="w-4 h-4 mr-2" />}
                      <span className="text-sm">{THEMES[theme]}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="briefDescription">
                Décrivez brièvement le scénario souhaité (optionnel)
              </Label>
              <Textarea
                id="briefDescription"
                placeholder="Ex: Feu de stockage avec victime piégée, fumée dense, accès difficile pour les engins..."
                value={formData.briefDescription}
                onChange={(e) => updateField('briefDescription', e.target.value)}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Plus vous donnez de détails, plus la fiche générée sera adaptée.
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <SetupPhotosStep
            photos={setupPhotos}
            onPhotosChange={setSetupPhotos}
          />
        );

      default:
        return null;
    }
  };

  const steps = [
    { id: 1, title: 'Photo', icon: Camera },
    { id: 2, title: 'Site', icon: Building2 },
    { id: 3, title: 'Scénario', icon: Sparkles },
    { id: 4, title: 'Mise en place', icon: ImagePlus },
  ];

  return (
    <Layout>
      <div className="container max-w-lg py-4">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">
              Étape {currentStep} sur {steps.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {steps[currentStep - 1].title}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full gradient-hero"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / steps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-1 mb-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                    isActive
                      ? 'gradient-hero text-white shadow-lg'
                      : isCompleted
                      ? 'bg-primary text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-8 h-1 mx-0.5 rounded-full transition-colors ${
                      isCompleted ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Form content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="form-section mb-4"
          >
            <h2 className="form-section-title">
              {(() => {
                const Icon = steps[currentStep - 1].icon;
                return <Icon className="w-5 h-5 text-primary" />;
              })()}
              {steps[currentStep - 1].title}
            </h2>
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="flex-1"
              disabled={isGenerating}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Précédent
            </Button>
          )}
          
          {currentStep < steps.length ? (
            <Button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="flex-1 gradient-hero"
              disabled={!canProceed()}
            >
              Suivant
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleGenerateMSP}
              className="flex-1 gradient-hero"
              disabled={!canProceed() || isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Générer la fiche
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </Layout>
  );
}
