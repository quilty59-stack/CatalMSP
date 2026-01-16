import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  SiteType, 
  Theme, 
  SITE_TYPES, 
  THEMES,
} from '@/types/msp';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Check,
  Building2,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export default function CreateMSP() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    // Essential info
    siteName: '',
    siteType: '' as SiteType | '',
    commune: '',
    address: '',
    mapsLink: '',
    theme: 'incendie' as Theme,
    briefDescription: '',
  });

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    if (currentStep === 1) {
      return formData.siteName && formData.siteType && formData.commune;
    }
    return formData.theme;
  };

  const handleGenerateMSP = async () => {
    if (!canProceed()) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-msp', {
        body: {
          siteName: formData.siteName,
          siteType: formData.siteType,
          commune: formData.commune,
          address: formData.address,
          theme: formData.theme,
          briefDescription: formData.briefDescription,
        },
      });

      if (error) {
        console.error('Error calling generate-msp:', error);
        toast.error('Erreur lors de la génération. Veuillez réessayer.');
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      if (data?.success && data?.mspData) {
        toast.success('Fiche MSP générée avec succès !');
        // TODO: Save to database and navigate to the created MSP
        // For now, just show success and go to catalogue
        navigate('/catalogue');
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
              <Label htmlFor="siteType">Type de site *</Label>
              <Select
                value={formData.siteType}
                onValueChange={(value) => updateField('siteType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(SITE_TYPES) as SiteType[]).map((type) => (
                    <SelectItem key={type} value={type}>
                      {SITE_TYPES[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="commune">Commune *</Label>
              <Input
                id="commune"
                placeholder="Ex: Montpellier"
                value={formData.commune}
                onChange={(e) => updateField('commune', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adresse (optionnel)</Label>
              <Input
                id="address"
                placeholder="Adresse complète du site"
                value={formData.address}
                onChange={(e) => updateField('address', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mapsLink">Lien Google Maps (optionnel)</Label>
              <Input
                id="mapsLink"
                placeholder="https://maps.google.com/..."
                value={formData.mapsLink}
                onChange={(e) => updateField('mapsLink', e.target.value)}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="theme">Thème de la MSP *</Label>
              <Select
                value={formData.theme}
                onValueChange={(value) => updateField('theme', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(THEMES) as Theme[]).map((theme) => (
                    <SelectItem key={theme} value={theme}>
                      {THEMES[theme]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                Plus vous donnez de détails, plus la fiche générée sera adaptée à vos besoins.
              </p>
            </div>

            <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground">Génération IA</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    L'IA va générer automatiquement une fiche MSP complète avec : 
                    objectifs pédagogiques, niveaux de difficulté, consignes, 
                    organisation, matériel nécessaire...
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
    { id: 1, title: 'Site', icon: Building2 },
    { id: 2, title: 'Scénario', icon: Sparkles },
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
        <div className="flex items-center justify-center gap-2 mb-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isActive
                      ? 'gradient-hero text-white shadow-lg'
                      : isCompleted
                      ? 'bg-primary text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 h-1 mx-1 rounded-full transition-colors ${
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
                  Génération en cours...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Générer la fiche MSP
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </Layout>
  );
}
