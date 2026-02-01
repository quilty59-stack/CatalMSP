import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FolderOpen, Plus, ChevronRight, Loader2, Building2, TrendingUp, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { MSPCard } from '@/components/MSPCard';
import { MSP, Theme, Status } from '@/types/msp';
import { supabase } from '@/integrations/supabase/client';
import { ResponsiveLayout } from '@/components/ResponsiveLayout';
import { InstallPWA } from '@/components/InstallPWA';
import { BottomNav } from '@/components/BottomNav';
import { useIsMobile } from '@/hooks/use-mobile';
import logo from '@/assets/logo.png';

const Index = () => {
  const [mspList, setMspList] = useState<MSP[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    loadMspFromDatabase();
  }, []);

  const loadMspFromDatabase = async () => {
    try {
      const { data, error } = await supabase
        .from('msp')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading MSP:', error);
        return;
      }

      if (data) {
        const transformed: MSP[] = data.map((record) => ({
          id: record.id,
          slug: record.slug,
          title: record.title,
          theme: record.theme as Theme,
          status: record.status as Status,
          difficulty: record.difficulty as 1 | 2 | 3,
          siteName: record.site_name,
          siteType: record.site_type as any,
          commune: record.commune,
          address: record.address || '',
          mapsLink: record.maps_link || '',
          siteNotes: record.site_notes || '',
          competences: record.competences || '',
          objectives: record.objectives || '',
          situation: record.situation || '',
          missionReason: record.mission_reason || '',
          difficultyFacilitator: record.difficulty_facilitator || '',
          difficultyInitial: record.difficulty_initial || '',
          difficultyComplex: record.difficulty_complex || '',
          instructions: record.instructions || '',
          expectedActivities: record.expected_activities || '',
          cognitiveEffects: record.cognitive_effects || '',
          reservationDetails: record.reservation_details || '',
          hasWaterPoint: record.has_water_point || false,
          waterPointDetails: record.water_point_details || '',
          authorizations: record.authorizations || '',
          constraints: record.constraints || '',
          safetyBriefing: record.safety_briefing || '',
          equipment: record.equipment || [],
          otherEquipment: record.other_equipment || '',
          photos: [],
          createdAt: record.created_at,
          updatedAt: record.updated_at,
        }));
        setMspList(transformed);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const recentMsp = mspList.slice(0, isMobile ? 3 : 6);
  const totalMsp = mspList.length;
  const validatedMsp = mspList.filter(m => m.status === 'validee').length;
  const draftMsp = mspList.filter(m => m.status === 'brouillon').length;

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background">
        {/* Hero Section - Mobile */}
        <section className="hero-gradient px-4 pt-[calc(env(safe-area-inset-top)+1rem)] pb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center"
          >
            <motion.img 
              src={logo} 
              alt="CatalMSP" 
              className="w-24 h-24 mx-auto mb-3 drop-shadow-lg"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
            />
            
            <h1 className="font-display text-xl font-bold text-white mb-1">
              CatalMSP
            </h1>
            <p className="text-white/70 text-xs">
              Catalogue de Sites Conventionnés
            </p>
          </motion.div>

          {/* Stats - Mobile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex justify-center gap-10 mt-5"
          >
            <div className="text-center">
              <div className="text-3xl font-display font-bold text-white">{totalMsp}</div>
              <div className="text-[10px] text-white/70 uppercase tracking-wider">Fiches</div>
            </div>
            <div className="w-px bg-white/20 h-10 self-center" />
            <div className="text-center">
              <div className="text-3xl font-display font-bold text-white">{validatedMsp}</div>
              <div className="text-[10px] text-white/70 uppercase tracking-wider">Validées</div>
            </div>
          </motion.div>

          {/* Install Button - Mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="flex justify-center mt-5"
          >
            <InstallPWA />
          </motion.div>
        </section>

        <div className="px-4 pt-4 space-y-4 pb-24">
          {/* Recent MSP - Mobile */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display font-semibold text-base text-foreground">
                Fiches récentes
              </h2>
              <Link to="/catalogue">
                <Button variant="ghost" size="sm" className="text-primary gap-1 h-8 px-2">
                  Tout voir
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {isLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
              ) : recentMsp.length > 0 ? (
                recentMsp.map((msp, index) => (
                  <MSPCard key={msp.id} msp={msp} index={index} />
                ))
              ) : (
                <div className="text-center py-10 card-elevated rounded-xl">
                  <div className="w-14 h-14 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
                    <FolderOpen className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-sm mb-3">Aucune fiche MSP</p>
                  <Link to="/creer">
                    <Button size="sm" className="gap-2">
                      <Plus className="w-4 h-4" />
                      Créer une fiche
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.section>
        </div>

        {/* Mobile Bottom Nav */}
        <BottomNav />
      </div>
    );
  }

  // Desktop Layout
  return (
    <ResponsiveLayout showDesktopSearch={true}>
      <div className="p-8">
        {/* Stats Cards - Desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="card-elevated p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total fiches</p>
                <p className="text-3xl font-display font-bold text-foreground mt-1">{totalMsp}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <FolderOpen className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3 text-success" />
              <span className="text-success">+{Math.min(totalMsp, 5)}</span>
              <span>ce mois</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="card-elevated p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Fiches validées</p>
                <p className="text-3xl font-display font-bold text-success mt-1">{validatedMsp}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
            </div>
            <div className="mt-3">
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-success rounded-full transition-all"
                  style={{ width: `${totalMsp > 0 ? (validatedMsp / totalMsp) * 100 : 0}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {totalMsp > 0 ? Math.round((validatedMsp / totalMsp) * 100) : 0}% du total
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="card-elevated p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Brouillons</p>
                <p className="text-3xl font-display font-bold text-warning mt-1">{draftMsp}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-warning" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              À compléter
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="card-elevated p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sites conventionnés</p>
                <p className="text-3xl font-display font-bold text-secondary mt-1">--</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-secondary" />
              </div>
            </div>
            <Link to="/sites" className="text-xs text-primary mt-3 inline-flex items-center gap-1 hover:underline">
              Voir les sites
              <ChevronRight className="w-3 h-3" />
            </Link>
          </motion.div>
        </div>

        {/* Quick Actions - Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Link to="/creer" className="col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="card-interactive p-6 h-full hero-gradient text-white"
            >
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                <Plus className="w-6 h-6" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-1">Nouvelle fiche MSP</h3>
              <p className="text-sm text-white/70">
                Créez une nouvelle mise en situation professionnelle
              </p>
            </motion.div>
          </Link>

          <Link to="/sites/nouveau" className="col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              className="card-interactive p-6 h-full"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-1 text-foreground">Nouveau site</h3>
              <p className="text-sm text-muted-foreground">
                Ajoutez un site conventionné au catalogue
              </p>
            </motion.div>
          </Link>

          <Link to="/scanner" className="col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.6 }}
              className="card-interactive p-6 h-full"
            >
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                <FolderOpen className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-1 text-foreground">Scanner QR</h3>
              <p className="text-sm text-muted-foreground">
                Scannez un QR code pour accéder à une fiche
              </p>
            </motion.div>
          </Link>
        </div>

        {/* Recent MSP - Desktop */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.7 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-xl text-foreground">
              Fiches récentes
            </h2>
            <Link to="/catalogue">
              <Button variant="outline" size="sm" className="gap-1">
                Voir tout le catalogue
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : recentMsp.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentMsp.map((msp, index) => (
                <MSPCard key={msp.id} msp={msp} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 card-elevated rounded-xl">
              <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <FolderOpen className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-4">Aucune fiche MSP créée</p>
              <Link to="/creer">
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Créer votre première fiche
                </Button>
              </Link>
            </div>
          )}
        </motion.section>
      </div>
    </ResponsiveLayout>
  );
};

export default Index;
