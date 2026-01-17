import { useParams, useNavigate, Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useState, useEffect } from 'react';
import { useMsp } from '@/hooks/useMsp';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Save, ArrowLeft, MapPin, Target, BookOpen, Users, AlertTriangle, Wrench, Camera } from 'lucide-react';
import { motion } from 'framer-motion';
import { SITE_TYPES, THEMES, SiteType, Theme } from '@/types/msp';
import { PhotoManager } from '@/components/PhotoManager';

export default function EditMSP() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { msp, isLoading, error } = useMsp(slug);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    siteName: '',
    siteType: 'erp' as SiteType,
    commune: '',
    address: '',
    mapsLink: '',
    theme: 'incendie' as Theme,
    competences: '',
    objectives: '',
    situation: '',
    missionReason: '',
    difficulty: 2,
    difficultyFacilitator: '',
    difficultyInitial: '',
    difficultyComplex: '',
    instructions: '',
    expectedActivities: '',
    cognitiveEffects: '',
    hasWaterPoint: false,
    waterPointDetails: '',
    reservationDetails: '',
    authorizations: '',
    constraints: '',
    safetyBriefing: '',
    equipment: [] as string[],
    otherEquipment: '',
    siteNotes: '',
  });

  useEffect(() => {
    if (msp) {
      setFormData({
        title: msp.title || '',
        siteName: msp.siteName || '',
        siteType: msp.siteType || 'erp',
        commune: msp.commune || '',
        address: msp.address || '',
        mapsLink: msp.mapsLink || '',
        theme: msp.theme || 'incendie',
        competences: msp.competences || '',
        objectives: msp.objectives || '',
        situation: msp.situation || '',
        missionReason: msp.missionReason || '',
        difficulty: msp.difficulty || 2,
        difficultyFacilitator: msp.difficultyFacilitator || '',
        difficultyInitial: msp.difficultyInitial || '',
        difficultyComplex: msp.difficultyComplex || '',
        instructions: msp.instructions || '',
        expectedActivities: msp.expectedActivities || '',
        cognitiveEffects: msp.cognitiveEffects || '',
        hasWaterPoint: msp.hasWaterPoint || false,
        waterPointDetails: msp.waterPointDetails || '',
        reservationDetails: msp.reservationDetails || '',
        authorizations: msp.authorizations || '',
        constraints: msp.constraints || '',
        safetyBriefing: msp.safetyBriefing || '',
        equipment: msp.equipment || [],
        otherEquipment: msp.otherEquipment || '',
        siteNotes: msp.siteNotes || '',
      });
    }
  }, [msp]);

  const handleSave = async () => {
    if (!msp) return;
    
    setSaving(true);
    try {
      const { error: updateError } = await supabase
        .from('msp')
        .update({
          title: formData.title,
          site_name: formData.siteName,
          site_type: formData.siteType,
          commune: formData.commune,
          address: formData.address,
          maps_link: formData.mapsLink,
          theme: formData.theme,
          competences: formData.competences,
          objectives: formData.objectives,
          situation: formData.situation,
          mission_reason: formData.missionReason,
          difficulty: formData.difficulty,
          difficulty_facilitator: formData.difficultyFacilitator,
          difficulty_initial: formData.difficultyInitial,
          difficulty_complex: formData.difficultyComplex,
          instructions: formData.instructions,
          expected_activities: formData.expectedActivities,
          cognitive_effects: formData.cognitiveEffects,
          has_water_point: formData.hasWaterPoint,
          water_point_details: formData.waterPointDetails,
          reservation_details: formData.reservationDetails,
          authorizations: formData.authorizations,
          constraints: formData.constraints,
          safety_briefing: formData.safetyBriefing,
          equipment: formData.equipment,
          other_equipment: formData.otherEquipment,
          site_notes: formData.siteNotes,
        })
        .eq('slug', msp.slug);

      if (updateError) throw updateError;

      toast.success('Fiche MSP mise à jour');
      navigate(`/msp/${msp.slug}`);
    } catch (err) {
      console.error('Error updating MSP:', err);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Layout showBack>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!msp || error) {
    return (
      <Layout showBack>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <p className="text-muted-foreground mb-4">Fiche MSP introuvable</p>
          <Link to="/catalogue">
            <Button>Retour au catalogue</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showBack backTo={`/msp/${msp.slug}`}>
      <div className="px-4 py-4 space-y-4 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <h1 className="font-display text-xl font-bold text-foreground">
            Modifier la fiche
          </h1>
        </motion.div>

        {/* Site Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="form-section"
        >
          <h2 className="form-section-title">
            <MapPin className="w-5 h-5 text-primary" />
            Informations du site
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Titre de la MSP</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Feu d'appartement avec victime"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-foreground">Nom du site</label>
              <Input
                value={formData.siteName}
                onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                placeholder="Ex: Centre commercial Les Halles"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Type de site</label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {Object.entries(SITE_TYPES).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFormData({ ...formData, siteType: key as SiteType })}
                    className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                      formData.siteType === key
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground">Commune</label>
                <Input
                  value={formData.commune}
                  onChange={(e) => setFormData({ ...formData, commune: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Thème</label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {Object.entries(THEMES).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFormData({ ...formData, theme: key as Theme })}
                      className={`p-2 rounded-lg text-xs font-medium transition-colors ${
                        formData.theme === key
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Adresse</label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Adresse complète"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Lien Google Maps</label>
              <Input
                value={formData.mapsLink}
                onChange={(e) => setFormData({ ...formData, mapsLink: e.target.value })}
                placeholder="https://maps.google.com/..."
              />
            </div>
          </div>
        </motion.div>

        {/* Pedagogical Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="form-section"
        >
          <h2 className="form-section-title">
            <Target className="w-5 h-5 text-primary" />
            Objectifs pédagogiques
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Compétences visées</label>
              <Textarea
                value={formData.competences}
                onChange={(e) => setFormData({ ...formData, competences: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Objectifs / Attentes</label>
              <Textarea
                value={formData.objectives}
                onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                rows={3}
              />
            </div>
          </div>
        </motion.div>

        {/* Situation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="form-section"
        >
          <h2 className="form-section-title">
            <BookOpen className="w-5 h-5 text-primary" />
            Situation
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Contexte</label>
              <Textarea
                value={formData.situation}
                onChange={(e) => setFormData({ ...formData, situation: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Motif de l'ordre de mission</label>
              <Textarea
                value={formData.missionReason}
                onChange={(e) => setFormData({ ...formData, missionReason: e.target.value })}
                rows={2}
              />
            </div>
          </div>
        </motion.div>

        {/* Difficulty Levels */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="form-section"
        >
          <h2 className="form-section-title">
            <Users className="w-5 h-5 text-primary" />
            Niveaux de difficulté
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Difficulté globale</label>
              <div className="flex gap-2 mt-2">
                {[1, 2, 3].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setFormData({ ...formData, difficulty: level })}
                    className={`flex-1 p-3 rounded-lg text-sm font-medium transition-colors ${
                      formData.difficulty === level
                        ? level === 1 ? 'bg-success text-white' :
                          level === 2 ? 'bg-warning text-white' :
                          'bg-destructive text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {level === 1 ? 'Facile' : level === 2 ? 'Moyen' : 'Difficile'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-success">Niveau Facilitateur</label>
              <Textarea
                value={formData.difficultyFacilitator}
                onChange={(e) => setFormData({ ...formData, difficultyFacilitator: e.target.value })}
                rows={2}
                placeholder="Description pour le niveau facilitateur..."
              />
            </div>
            <div>
              <label className="text-sm font-medium text-warning">Situation Initiale</label>
              <Textarea
                value={formData.difficultyInitial}
                onChange={(e) => setFormData({ ...formData, difficultyInitial: e.target.value })}
                rows={2}
                placeholder="Description de la situation initiale..."
              />
            </div>
            <div>
              <label className="text-sm font-medium text-destructive">Niveau Complexe</label>
              <Textarea
                value={formData.difficultyComplex}
                onChange={(e) => setFormData({ ...formData, difficultyComplex: e.target.value })}
                rows={2}
                placeholder="Description pour le niveau complexe..."
              />
            </div>
          </div>
        </motion.div>

        {/* Organization */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="form-section"
        >
          <h2 className="form-section-title">
            <AlertTriangle className="w-5 h-5 text-primary" />
            Organisation & Sécurité
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <label className="text-sm font-medium text-foreground">Point d'eau disponible</label>
              <Switch
                checked={formData.hasWaterPoint}
                onCheckedChange={(checked) => setFormData({ ...formData, hasWaterPoint: checked })}
              />
            </div>

            {formData.hasWaterPoint && (
              <div>
                <label className="text-sm font-medium text-foreground">Détails point d'eau</label>
                <Input
                  value={formData.waterPointDetails}
                  onChange={(e) => setFormData({ ...formData, waterPointDetails: e.target.value })}
                  placeholder="Emplacement, débit, etc."
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-foreground">Réservation</label>
              <Textarea
                value={formData.reservationDetails}
                onChange={(e) => setFormData({ ...formData, reservationDetails: e.target.value })}
                rows={2}
                placeholder="Modalités de réservation..."
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Autorisations requises</label>
              <Textarea
                value={formData.authorizations}
                onChange={(e) => setFormData({ ...formData, authorizations: e.target.value })}
                rows={2}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Contraintes</label>
              <Textarea
                value={formData.constraints}
                onChange={(e) => setFormData({ ...formData, constraints: e.target.value })}
                rows={2}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Briefing sécurité</label>
              <Textarea
                value={formData.safetyBriefing}
                onChange={(e) => setFormData({ ...formData, safetyBriefing: e.target.value })}
                rows={3}
              />
            </div>
          </div>
        </motion.div>

        {/* Equipment */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="form-section"
        >
          <h2 className="form-section-title">
            <Wrench className="w-5 h-5 text-primary" />
            Matériel & Notes
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Autre matériel</label>
              <Input
                value={formData.otherEquipment}
                onChange={(e) => setFormData({ ...formData, otherEquipment: e.target.value })}
                placeholder="Matériel additionnel..."
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Notes sur le site</label>
              <Textarea
                value={formData.siteNotes}
                onChange={(e) => setFormData({ ...formData, siteNotes: e.target.value })}
                rows={3}
                placeholder="Remarques, observations..."
              />
            </div>
          </div>
        </motion.div>

        {/* Photos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="form-section"
        >
          <h2 className="form-section-title">
            <Camera className="w-5 h-5 text-primary" />
            Photos
          </h2>
          
          <PhotoManager mspId={msp.id} />
        </motion.div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="fixed bottom-20 left-0 right-0 px-4 pb-4 bg-gradient-to-t from-background via-background to-transparent pt-8"
        >
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="w-full gap-2"
            size="lg"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Enregistrer les modifications
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </Layout>
  );
}
