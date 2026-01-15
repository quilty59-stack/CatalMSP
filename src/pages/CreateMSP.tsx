import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
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
  Difficulty, 
  Status,
  SITE_TYPES, 
  THEMES, 
  EQUIPMENT_LIST 
} from '@/types/msp';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Camera, 
  Target, 
  Users, 
  AlertTriangle, 
  Wrench,
  ChevronLeft,
  ChevronRight,
  Check,
  Building2,
  BookOpen
} from 'lucide-react';
import { toast } from 'sonner';

const steps = [
  { id: 1, title: 'Site', icon: Building2 },
  { id: 2, title: 'Photos Site', icon: Camera },
  { id: 3, title: 'Pédagogie', icon: Target },
  { id: 4, title: 'Niveaux', icon: Users },
  { id: 5, title: 'Consignes', icon: BookOpen },
  { id: 6, title: 'Organisation', icon: AlertTriangle },
  { id: 7, title: 'Matériel', icon: Wrench },
  { id: 8, title: 'Photos Prépa', icon: Camera },
];

export default function CreateMSP() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Site
    siteName: '',
    siteType: '' as SiteType | '',
    commune: '',
    address: '',
    mapsLink: '',
    siteNotes: '',
    // Theme & status
    theme: 'incendie' as Theme,
    status: 'brouillon' as Status,
    // Pedagogical
    title: '',
    competences: '',
    objectives: '',
    situation: '',
    missionReason: '',
    // Difficulty
    difficulty: 2 as Difficulty,
    difficultyFacilitator: '',
    difficultyInitial: '',
    difficultyComplex: '',
    // Instructions
    instructions: '',
    expectedActivities: '',
    cognitiveEffects: '',
    // Organization
    reservationDetails: '',
    hasWaterPoint: false,
    waterPointDetails: '',
    authorizations: '',
    constraints: '',
    safetyBriefing: '',
    // Equipment
    equipment: [] as string[],
    otherEquipment: '',
  });

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleEquipment = (item: string) => {
    setFormData((prev) => ({
      ...prev,
      equipment: prev.equipment.includes(item)
        ? prev.equipment.filter((e) => e !== item)
        : [...prev.equipment, item],
    }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    toast.success('Fiche MSP créée avec succès !');
    navigate('/catalogue');
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
              <Label htmlFor="address">Adresse</Label>
              <Textarea
                id="address"
                placeholder="Adresse complète du site"
                value={formData.address}
                onChange={(e) => updateField('address', e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mapsLink">Lien Google Maps</Label>
              <Input
                id="mapsLink"
                placeholder="https://maps.google.com/..."
                value={formData.mapsLink}
                onChange={(e) => updateField('mapsLink', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="siteNotes">Notes sur le site</Label>
              <Textarea
                id="siteNotes"
                placeholder="Contraintes d'accès, contacts..."
                value={formData.siteNotes}
                onChange={(e) => updateField('siteNotes', e.target.value)}
                rows={3}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Ajoutez des photos du site pour documenter les conditions d'intervention.
            </p>

            {['Photo générale', 'Accès engins', 'Zones exploitables'].map((label) => (
              <div key={label} className="space-y-2">
                <Label>{label}</Label>
                <div className="photo-upload-zone">
                  <Camera className="w-8 h-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Appuyer pour prendre une photo
                  </span>
                </div>
              </div>
            ))}
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre de la MSP *</Label>
              <Input
                id="title"
                placeholder="Ex: Incendie Entrepôt - Niveau 2"
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="theme">Thème *</Label>
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
              <Label htmlFor="competences">Compétences visées *</Label>
              <Textarea
                id="competences"
                placeholder="Ex: Reconnaissance, Attaque, Sauvetage"
                value={formData.competences}
                onChange={(e) => updateField('competences', e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="objectives">Objectifs / Attentes *</Label>
              <Textarea
                id="objectives"
                placeholder="Ce que l'apprenant doit maîtriser"
                value={formData.objectives}
                onChange={(e) => updateField('objectives', e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="situation">Situation *</Label>
              <Textarea
                id="situation"
                placeholder="Décrivez le scénario de la MSP"
                value={formData.situation}
                onChange={(e) => updateField('situation', e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="missionReason">Motif de l'ordre de mission *</Label>
              <Textarea
                id="missionReason"
                placeholder="Ex: Appel du gardien signalant une fumée"
                value={formData.missionReason}
                onChange={(e) => updateField('missionReason', e.target.value)}
                rows={2}
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Niveau de difficulté global</Label>
              <div className="flex gap-2">
                {[1, 2, 3].map((level) => (
                  <Button
                    key={level}
                    type="button"
                    variant={formData.difficulty === level ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => updateField('difficulty', level)}
                  >
                    {level} - {level === 1 ? 'Simple' : level === 2 ? 'Attendu' : 'Complexe'}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficultyFacilitator" className="flex items-center gap-2">
                <span className="difficulty-badge difficulty-1 w-6 h-6 text-xs">1</span>
                Niveau Facilitateur
              </Label>
              <Textarea
                id="difficultyFacilitator"
                placeholder="Éléments qui facilitent l'exercice"
                value={formData.difficultyFacilitator}
                onChange={(e) => updateField('difficultyFacilitator', e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficultyInitial" className="flex items-center gap-2">
                <span className="difficulty-badge difficulty-2 w-6 h-6 text-xs">2</span>
                Situation initiale attendue
              </Label>
              <Textarea
                id="difficultyInitial"
                placeholder="Situation de base pour fin de formation"
                value={formData.difficultyInitial}
                onChange={(e) => updateField('difficultyInitial', e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficultyComplex" className="flex items-center gap-2">
                <span className="difficulty-badge difficulty-3 w-6 h-6 text-xs">3</span>
                Situation complexe
              </Label>
              <Textarea
                id="difficultyComplex"
                placeholder="Éléments ajoutant de la complexité"
                value={formData.difficultyComplex}
                onChange={(e) => updateField('difficultyComplex', e.target.value)}
                rows={2}
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="instructions">Consignes (victimes, témoins...)</Label>
              <Textarea
                id="instructions"
                placeholder="Briefing pour les acteurs de la mise en scène"
                value={formData.instructions}
                onChange={(e) => updateField('instructions', e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expectedActivities">Activités et résultats attendus</Label>
              <Textarea
                id="expectedActivities"
                placeholder="Actions observables que l'apprenant doit réaliser"
                value={formData.expectedActivities}
                onChange={(e) => updateField('expectedActivities', e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cognitiveEffects">Effets cognitifs</Label>
              <Textarea
                id="cognitiveEffects"
                placeholder="Transformation attendue chez l'apprenant"
                value={formData.cognitiveEffects}
                onChange={(e) => updateField('cognitiveEffects', e.target.value)}
                rows={3}
              />
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reservationDetails">Réservation du site</Label>
              <Input
                id="reservationDetails"
                placeholder="Ex: Contacter M. Dupont 48h avant"
                value={formData.reservationDetails}
                onChange={(e) => updateField('reservationDetails', e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <Label htmlFor="hasWaterPoint" className="font-normal cursor-pointer">
                Point d'eau disponible
              </Label>
              <Switch
                id="hasWaterPoint"
                checked={formData.hasWaterPoint}
                onCheckedChange={(checked) => updateField('hasWaterPoint', checked)}
              />
            </div>

            {formData.hasWaterPoint && (
              <div className="space-y-2">
                <Label htmlFor="waterPointDetails">Détails point d'eau</Label>
                <Input
                  id="waterPointDetails"
                  placeholder="Ex: Poteau incendie entrée principale"
                  value={formData.waterPointDetails}
                  onChange={(e) => updateField('waterPointDetails', e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="authorizations">Autorisations nécessaires</Label>
              <Textarea
                id="authorizations"
                placeholder="Accords requis pour utiliser le site"
                value={formData.authorizations}
                onChange={(e) => updateField('authorizations', e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="constraints">Contraintes</Label>
              <Textarea
                id="constraints"
                placeholder="Ex: Manœuvre à sec uniquement"
                value={formData.constraints}
                onChange={(e) => updateField('constraints', e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="safetyBriefing">Balisage / Briefing sécurité</Label>
              <Textarea
                id="safetyBriefing"
                placeholder="Consignes de sécurité pour l'exercice"
                value={formData.safetyBriefing}
                onChange={(e) => updateField('safetyBriefing', e.target.value)}
                rows={2}
              />
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-4">
            <Label>Matériel nécessaire</Label>
            <div className="grid grid-cols-2 gap-2">
              {EQUIPMENT_LIST.map((item) => (
                <div
                  key={item}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    formData.equipment.includes(item)
                      ? 'bg-primary/10 border-primary'
                      : 'bg-card border-border hover:border-primary/50'
                  }`}
                  onClick={() => toggleEquipment(item)}
                >
                  <Checkbox
                    checked={formData.equipment.includes(item)}
                    onCheckedChange={() => toggleEquipment(item)}
                  />
                  <span className="text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="otherEquipment">Autre matériel</Label>
              <Input
                id="otherEquipment"
                placeholder="Équipement supplémentaire"
                value={formData.otherEquipment}
                onChange={(e) => updateField('otherEquipment', e.target.value)}
              />
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Ajoutez des photos de la préparation de la MSP.
            </p>

            {['Emplacement mannequin', 'Zone feu simulée', 'Autre préparation'].map((label) => (
              <div key={label} className="space-y-2">
                <Label>{label}</Label>
                <div className="photo-upload-zone">
                  <Camera className="w-8 h-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Appuyer pour prendre une photo
                  </span>
                </div>
              </div>
            ))}

            <div className="pt-4 border-t border-border">
              <div className="space-y-2">
                <Label>Statut de la fiche</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => updateField('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brouillon">Brouillon</SelectItem>
                    <SelectItem value="validee">Validée</SelectItem>
                    <SelectItem value="a_ajuster">À ajuster</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Layout showBack backTo="/" hideNav>
      <div className="px-4 py-4">
        {/* Progress */}
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

        {/* Step Icons */}
        <div className="flex justify-between mb-6 overflow-x-auto pb-2">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={`flex flex-col items-center gap-1 min-w-[40px] ${
                  isActive || isCompleted ? 'opacity-100' : 'opacity-40'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    isActive
                      ? 'gradient-hero text-primary-foreground'
                      : isCompleted
                      ? 'bg-success text-success-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Step Content */}
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
        <div className="flex gap-3 sticky bottom-4">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex-1"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Précédent
          </Button>
          {currentStep === steps.length ? (
            <Button onClick={handleSubmit} className="flex-1 gradient-hero">
              <Check className="w-4 h-4 mr-1" />
              Créer la fiche
            </Button>
          ) : (
            <Button onClick={nextStep} className="flex-1">
              Suivant
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </Layout>
  );
}
