import { useParams, Link, useNavigate } from 'react-router-dom';
import { mockMspData } from '@/data/mockMsp';
import { SITE_TYPES } from '@/types/msp';
import { DifficultyBadge } from '@/components/ui/DifficultyBadge';
import { ThemeBadge } from '@/components/ui/ThemeBadge';
import { 
  MapPin, 
  ExternalLink, 
  Droplets, 
  AlertTriangle,
  Target,
  BookOpen,
  Users,
  Wrench,
  Shield,
  Eye,
  ArrowLeft,
  Home
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function PublicMSP() {
  const { slug } = useParams();
  const msp = mockMspData.find((m) => m.slug === slug);

  if (!msp) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <p className="text-muted-foreground mb-4">Fiche MSP introuvable</p>
        <Link to="/">
          <Button>Retour à l'accueil</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Public Banner with Back Button */}
      <div className="bg-primary/10 border-b border-primary/20 px-4 py-2">
        <div className="container flex items-center justify-between text-sm">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-1.5 text-primary hover:text-primary hover:bg-primary/10">
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Accueil</span>
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-primary" />
            <span className="text-primary font-medium">
              Fiche partagée – Lecture seule
            </span>
          </div>
          <div className="w-[76px] sm:w-[88px]" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Header */}
      <header className="gradient-hero px-4 py-6">
        <div className="container max-w-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-6 h-6 text-primary-foreground/80" />
            <span className="text-primary-foreground/80 text-sm font-medium">
              MSP Catalog
            </span>
          </div>
          <h1 className="font-display text-2xl font-bold text-primary-foreground mb-2">
            {msp.title}
          </h1>
          <p className="text-primary-foreground/80">{msp.siteName}</p>
          <div className="flex items-center gap-3 mt-4">
            <ThemeBadge theme={msp.theme} className="bg-primary-foreground/20 text-primary-foreground border-0" />
            <DifficultyBadge level={msp.difficulty} showLabel />
          </div>
        </div>
      </header>

      <main className="container max-w-2xl px-4 py-6 space-y-5">
        {/* Location */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="form-section"
        >
          <div className="flex items-center gap-2 text-muted-foreground mb-3">
            <MapPin className="w-4 h-4" />
            <span>{msp.commune}</span>
            <span className="text-border">•</span>
            <span>{SITE_TYPES[msp.siteType]}</span>
          </div>
          
          {msp.address && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-foreground">{msp.address}</p>
              {msp.mapsLink && (
                <a
                  href={msp.mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary mt-2 hover:underline text-sm"
                >
                  Ouvrir dans Maps
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}
        </motion.div>

        {/* Objectives */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="form-section"
        >
          <h2 className="form-section-title">
            <Target className="w-5 h-5 text-primary" />
            Objectifs
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Compétences
              </label>
              <p className="text-foreground mt-1">{msp.competences}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Objectifs
              </label>
              <p className="text-foreground mt-1">{msp.objectives}</p>
            </div>
          </div>
        </motion.div>

        {/* Situation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="form-section"
        >
          <h2 className="form-section-title">
            <BookOpen className="w-5 h-5 text-primary" />
            Situation
          </h2>
          <p className="text-foreground mb-3">{msp.situation}</p>
          <div className="p-3 bg-muted rounded-lg">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Motif d'appel
            </label>
            <p className="text-foreground mt-1">{msp.missionReason}</p>
          </div>
        </motion.div>

        {/* Difficulty Levels */}
        {(msp.difficultyFacilitator || msp.difficultyInitial || msp.difficultyComplex) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="form-section"
          >
            <h2 className="form-section-title">
              <Users className="w-5 h-5 text-primary" />
              Niveaux
            </h2>
            <div className="space-y-3">
              {msp.difficultyFacilitator && (
                <div className="flex gap-3 p-3 bg-success/5 rounded-lg border border-success/20">
                  <DifficultyBadge level={1} />
                  <div>
                    <span className="text-xs font-medium text-success">Facilitateur</span>
                    <p className="text-sm text-foreground">{msp.difficultyFacilitator}</p>
                  </div>
                </div>
              )}
              {msp.difficultyInitial && (
                <div className="flex gap-3 p-3 bg-warning/5 rounded-lg border border-warning/20">
                  <DifficultyBadge level={2} />
                  <div>
                    <span className="text-xs font-medium text-warning">Attendu</span>
                    <p className="text-sm text-foreground">{msp.difficultyInitial}</p>
                  </div>
                </div>
              )}
              {msp.difficultyComplex && (
                <div className="flex gap-3 p-3 bg-destructive/5 rounded-lg border border-destructive/20">
                  <DifficultyBadge level={3} />
                  <div>
                    <span className="text-xs font-medium text-destructive">Complexe</span>
                    <p className="text-sm text-foreground">{msp.difficultyComplex}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Organization */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="form-section"
        >
          <h2 className="form-section-title">
            <AlertTriangle className="w-5 h-5 text-primary" />
            Organisation
          </h2>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Droplets className={`w-5 h-5 ${msp.hasWaterPoint ? 'text-primary' : 'text-muted-foreground'}`} />
              <div>
                <span className="font-medium text-foreground">
                  Point d'eau : {msp.hasWaterPoint ? 'Oui' : 'Non'}
                </span>
                {msp.waterPointDetails && (
                  <p className="text-sm text-muted-foreground">{msp.waterPointDetails}</p>
                )}
              </div>
            </div>
            
            {msp.constraints && (
              <div className="p-3 bg-warning/5 rounded-lg border border-warning/20">
                <span className="text-xs font-medium text-warning uppercase tracking-wide">
                  Contraintes
                </span>
                <p className="text-sm text-foreground mt-1">{msp.constraints}</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Equipment */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="form-section"
        >
          <h2 className="form-section-title">
            <Wrench className="w-5 h-5 text-primary" />
            Matériel
          </h2>
          
          <div className="flex flex-wrap gap-2">
            {msp.equipment.map((item) => (
              <span
                key={item}
                className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium"
              >
                {item}
              </span>
            ))}
          </div>
          {msp.otherEquipment && (
            <p className="text-sm text-muted-foreground mt-3">
              Autre : {msp.otherEquipment}
            </p>
          )}
        </motion.div>

        {/* Notes */}
        {msp.siteNotes && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="p-4 bg-muted/50 rounded-xl border border-border"
          >
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Notes :</strong> {msp.siteNotes}
            </p>
          </motion.div>
        )}

        {/* Footer */}
        <div className="pt-6 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            Fiche générée par MSP Catalog
          </p>
        </div>
      </main>
    </div>
  );
}
