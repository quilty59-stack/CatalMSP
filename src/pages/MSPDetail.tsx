import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { SITE_TYPES } from '@/types/msp';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DifficultyBadge } from '@/components/ui/DifficultyBadge';
import { ThemeBadge } from '@/components/ui/ThemeBadge';
import { Button } from '@/components/ui/button';
import { MapEmbed } from '@/components/MapEmbed';
import { 
  MapPin, 
  ExternalLink, 
  Edit, 
  QrCode, 
  Share2, 
  Droplets, 
  AlertTriangle,
  Target,
  BookOpen,
  Users,
  Wrench,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useMsp } from '@/hooks/useMsp';

export default function MSPDetail() {
  const { slug } = useParams();
  const { msp, isLoading, error } = useMsp(slug);
  const [showQR, setShowQR] = useState(false);

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

  const publicUrl = `${window.location.origin}/public/${msp.slug}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: msp.title,
          text: `Fiche MSP: ${msp.title}`,
          url: publicUrl,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(publicUrl);
    }
  };

  return (
    <Layout showBack backTo="/catalogue">
      <div className="px-4 py-4 space-y-4">
        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-elevated p-5"
        >
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex-1">
              <h1 className="font-display text-xl font-bold text-foreground mb-1">
                {msp.title}
              </h1>
              <p className="text-muted-foreground">{msp.siteName}</p>
            </div>
            <DifficultyBadge level={msp.difficulty} />
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <MapPin className="w-4 h-4" />
            <span>{msp.commune}</span>
            <span className="text-border">•</span>
            <span>{SITE_TYPES[msp.siteType]}</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap mb-4">
            <ThemeBadge theme={msp.theme} />
            <StatusBadge status={msp.status} />
          </div>

          {msp.address && (
            <div className="space-y-3">
              <div className="flex items-start gap-2 p-3 bg-muted rounded-lg text-sm">
                <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                <div className="flex-1">
                  <p className="text-foreground">{msp.address}</p>
                  {msp.mapsLink && (
                    <a
                      href={msp.mapsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary mt-1 hover:underline"
                    >
                      Ouvrir dans Maps
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
              
              {/* Map Embed */}
              <MapEmbed address={msp.address} mapsLink={msp.mapsLink} />
            </div>
          )}
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2"
        >
          <Link to={`/msp/${msp.slug}/edit`} className="flex-1">
            <Button className="w-full gap-2" variant="outline">
              <Edit className="w-4 h-4" />
              Modifier
            </Button>
          </Link>
          <Dialog open={showQR} onOpenChange={setShowQR}>
            <DialogTrigger asChild>
              <Button className="flex-1 gap-2" variant="outline">
                <QrCode className="w-4 h-4" />
                QR Code
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xs">
              <DialogHeader>
                <DialogTitle className="text-center">QR Code de partage</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="bg-white p-4 rounded-xl">
                  <QRCodeSVG value={publicUrl} size={200} />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Scannez pour accéder à la fiche en lecture seule
                </p>
                <Button onClick={handleShare} className="w-full gap-2">
                  <Share2 className="w-4 h-4" />
                  Partager le lien
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button onClick={handleShare} size="icon" variant="outline">
            <Share2 className="w-4 h-4" />
          </Button>
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
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Compétences visées
              </label>
              <p className="text-foreground mt-1">{msp.competences || 'Non défini'}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Objectifs / Attentes
              </label>
              <p className="text-foreground mt-1">{msp.objectives || 'Non défini'}</p>
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
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Contexte
              </label>
              <p className="text-foreground mt-1">{msp.situation || 'Non défini'}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Motif de l'ordre de mission
              </label>
              <p className="text-foreground mt-1">{msp.missionReason || 'Non défini'}</p>
            </div>
          </div>
        </motion.div>

        {/* Difficulty Levels */}
        {(msp.difficultyFacilitator || msp.difficultyInitial || msp.difficultyComplex) && (
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
                    <span className="text-xs font-medium text-warning">Situation initiale</span>
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
          transition={{ delay: 0.3 }}
          className="form-section"
        >
          <h2 className="form-section-title">
            <AlertTriangle className="w-5 h-5 text-primary" />
            Organisation & Sécurité
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

            {msp.reservationDetails && (
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Réservation
                </label>
                <p className="text-sm text-foreground mt-1">{msp.reservationDetails}</p>
              </div>
            )}
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
            Matériel
          </h2>
          
          <div className="flex flex-wrap gap-2">
            {msp.equipment.length > 0 ? (
              msp.equipment.map((item) => (
                <span
                  key={item}
                  className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium"
                >
                  {item}
                </span>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">Aucun matériel spécifié</p>
            )}
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
            transition={{ delay: 0.4 }}
            className="p-4 bg-muted/50 rounded-xl border border-border"
          >
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Notes :</strong> {msp.siteNotes}
            </p>
          </motion.div>
        )}

        {/* Public Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <Link to={`/public/${msp.slug}`}>
            <div className="card-interactive p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Voir la page publique</p>
                <p className="text-sm text-muted-foreground">Mode lecture seule</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </Link>
        </motion.div>
      </div>
    </Layout>
  );
}
