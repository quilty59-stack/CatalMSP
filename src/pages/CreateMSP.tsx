import { useState, useRef, useEffect } from 'react';
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
  Flame,
  User,
  Wind,
  Package,
  MapPinned
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface SetupPhoto {
  category: string;
  file: File;
  preview: string;
}

const SETUP_CATEGORIES = [
  { key: 'fumee', label: 'Machine à fumée', icon: Wind },
  { key: 'mannequin', label: 'Mannequin', icon: User },
  { key: 'feu', label: 'Dispositif feu/LED', icon: Flame },
  { key: 'gaz', label: 'Bouteille de gaz', icon: Package },
  { key: 'autre_prepa', label: 'Autre préparation', icon: ImagePlus },
];

import { MultiPhotoUpload, UploadedPhoto } from '@/components/MultiPhotoUpload';

export default function CreateMSP() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [entrancePhotos, setEntrancePhotos] = useState<UploadedPhoto[]>([]);
  const [setupPhotos, setSetupPhotos] = useState<SetupPhoto[]>([]);
  const [activeSetupCategory, setActiveSetupCategory] = useState<string | null>(null);
  const [showSiteSuggestions, setShowSiteSuggestions] = useState(false);
  const [selectedSite, setSelectedSite] = useState<SiteConventionne | null>(null);
  const setupFileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    siteName: '',
    siteType: '' as SiteType | '',
    commune: '',
    address: '',
    mapsLink: '',
    theme: 'incendie' as Theme,
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


  const handleSetupPhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeSetupCategory) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSetupPhotos(prev => [
          ...prev.filter(p => p.category !== activeSetupCategory),
          {
            category: activeSetupCategory,
            file,
            preview: reader.result as string
          }
        ]);
      };
      reader.readAsDataURL(file);
      setActiveSetupCategory(null);
    }
    if (setupFileInputRef.current) {
      setupFileInputRef.current.value = '';
    }
  };

  const removeSetupPhoto = (category: string) => {
    setSetupPhotos(prev => prev.filter(p => p.category !== category));
  };

  const triggerSetupPhotoCapture = (category: string) => {
    setActiveSetupCategory(category);
    setTimeout(() => setupFileInputRef.current?.click(), 100);
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
      return formData.theme;
    }
    // Step 4: setup photos are optional
    return true;
  };

  const uploadPhoto = async (mspId: string, file: File, category: string): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${mspId}/${category}-${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('msp-photos')
      .upload(fileName, file);
    
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
          theme: formData.theme,
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
          theme: formData.theme,
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
              await supabase.from('msp_photos').insert({
                msp_id: mspRecord.id,
                category: category,
                image_url: photoUrl,
              });
            }
          }
        }

        // Upload setup photos
        if (mspRecord && setupPhotos.length > 0) {
          for (const setupPhoto of setupPhotos) {
            const photoUrl = await uploadPhoto(mspRecord.id, setupPhoto.file, setupPhoto.category);
            if (photoUrl) {
              await supabase.from('msp_photos').insert({
                msp_id: mspRecord.id,
                category: setupPhoto.category,
                image_url: photoUrl,
              });
            }
          }
        }

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
              placeholder="Prendre des photos du site"
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
                      {site.domains.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {site.domains.slice(0, 2).map((domain) => (
                            <span key={domain} className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                              {domain}
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
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Thème de la MSP *</Label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(THEMES) as Theme[]).map((theme) => (
                  <Button
                    key={theme}
                    type="button"
                    variant={formData.theme === theme ? 'default' : 'outline'}
                    className={`h-auto py-3 px-4 justify-start ${
                      formData.theme === theme ? 'gradient-hero border-0' : ''
                    }`}
                    onClick={() => updateField('theme', theme)}
                  >
                    <span className="text-sm">{THEMES[theme]}</span>
                  </Button>
                ))}
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
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Documentez la mise en place de l'exercice. Ces photos aideront les formateurs à préparer le site.
            </p>

            <input
              ref={setupFileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleSetupPhotoCapture}
              className="hidden"
            />

            <div className="grid grid-cols-2 gap-3">
              {SETUP_CATEGORIES.map((cat) => {
                const existingPhoto = setupPhotos.find(p => p.category === cat.key);
                const Icon = cat.icon;
                
                return (
                  <div key={cat.key} className="relative">
                    {existingPhoto ? (
                      <div className="relative rounded-xl overflow-hidden border border-border">
                        <img 
                          src={existingPhoto.preview} 
                          alt={cat.label}
                          className="w-full h-32 object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                          <span className="text-white text-xs font-medium">{cat.label}</span>
                        </div>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6"
                          onClick={() => removeSetupPhoto(cat.key)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => triggerSetupPhotoCapture(cat.key)}
                        className="w-full h-32 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-colors flex flex-col items-center justify-center gap-2 p-2"
                      >
                        <Icon className="w-6 h-6 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground text-center leading-tight">
                          {cat.label}
                        </span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground">Génération IA</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    L'IA génère automatiquement : objectifs pédagogiques, 
                    niveaux de difficulté, consignes, organisation, matériel...
                  </p>
                </div>
              </div>
            </div>
          </div>
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
