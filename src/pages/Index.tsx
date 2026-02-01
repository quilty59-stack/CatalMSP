import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FolderOpen, Plus, ChevronRight, Loader2, Building2, TrendingUp, Clock, MapPin, Settings, Menu, List, QrCode, Moon, Info, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { MSPCard } from '@/components/MSPCard';
import { MSP, Theme, Status } from '@/types/msp';
import { supabase } from '@/integrations/supabase/client';
import { ResponsiveLayout } from '@/components/ResponsiveLayout';
import { BottomNav } from '@/components/BottomNav';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSites } from '@/hooks/useSites';
import { useAuth } from '@/hooks/useAuth';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Switch } from '@/components/ui/switch';
import { UserMenu } from '@/components/UserMenu';
import logo from '@/assets/logo.png';

const Index = () => {
  const [mspList, setMspList] = useState<MSP[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const { sites } = useSites();
  const { isAdmin } = useAuth();

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

  const recentMsp = mspList.slice(0, isMobile ? 5 : 6);
  const totalMsp = mspList.length;
  const validatedMsp = mspList.filter(m => m.status === 'validee').length;
  const draftMsp = mspList.filter(m => m.status === 'brouillon').length;
  const totalSites = sites.length;

  // Mobile Layout - Dashboard Style
  if (isMobile) {
    return (
      <div className="min-h-screen bg-muted/30 pb-24">
        {/* Header avec safe area pour les infos système (réseau, heure, batterie) */}
        <header className="bg-background pt-[env(safe-area-inset-top)]">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center gap-3">
              <img src={logo} alt="CatalMSP" className="w-9 h-9" />
              <span className="font-display font-bold text-xl text-foreground">CatalMSP</span>
            </div>
            <UserMenu />
          </div>
        </header>

        {/* Content */}
        <div className="px-4">
          {/* Dashboard Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary rounded-2xl p-4 shadow-lg mt-3"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <img src={logo} alt="" className="w-8 h-8" />
                <div>
                  <h2 className="font-display font-bold text-white text-base">Tableau de bord</h2>
                  <p className="text-white/60 text-xs">Vue d'ensemble</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8"
                  onClick={() => setSettingsOpen(true)}
                >
                  <Settings className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8"
                  onClick={() => setMenuOpen(true)}
                >
                  <Menu className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/15 rounded-xl p-3 text-center">
                <p className="text-3xl font-display font-bold text-white">{totalMsp}</p>
                <p className="text-xs text-white/70">MSP</p>
              </div>
              <div className="bg-white/15 rounded-xl p-3 text-center">
                <p className="text-3xl font-display font-bold text-white">{totalSites}</p>
                <p className="text-xs text-white/70">Sites</p>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions Grid - 3 columns for mobile */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            <Link to="/catalogue">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-card rounded-xl p-3 border border-border shadow-sm text-center"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <FolderOpen className="w-5 h-5 text-primary" />
                </div>
                <p className="font-medium text-xs text-foreground">Catalogue</p>
              </motion.div>
            </Link>

            <Link to="/sites">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card rounded-xl p-3 border border-border shadow-sm text-center"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <List className="w-5 h-5 text-primary" />
                </div>
                <p className="font-medium text-xs text-foreground">Sites</p>
              </motion.div>
            </Link>

            <Link to="/carte">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-card rounded-xl p-3 border border-border shadow-sm text-center"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <p className="font-medium text-xs text-foreground">Carte</p>
              </motion.div>
            </Link>

            <Link to="/scanner">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card rounded-xl p-3 border border-border shadow-sm text-center"
              >
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mx-auto mb-2">
                  <QrCode className="w-5 h-5 text-accent" />
                </div>
                <p className="font-medium text-xs text-foreground">Scanner</p>
              </motion.div>
            </Link>

            <Link to="/creer">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-primary rounded-xl p-3 shadow-sm text-center"
              >
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center mx-auto mb-2">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <p className="font-medium text-xs text-white">Créer MSP</p>
              </motion.div>
            </Link>

            <Link to="/sites/nouveau">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-secondary rounded-xl p-3 shadow-sm text-center"
              >
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center mx-auto mb-2">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <p className="font-medium text-xs text-white">Nouveau site</p>
              </motion.div>
            </Link>
          </div>

          {/* Recent Activity */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <h2 className="font-display font-semibold text-sm text-foreground">Activité récente</h2>
              </div>
              {recentMsp.length > 0 && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                  {recentMsp.length}
                </span>
              )}
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            ) : recentMsp.length > 0 ? (
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                {recentMsp.map((msp, index) => (
                  <Link key={msp.id} to={`/msp/${msp.slug}`}>
                    <div className={`flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors ${index !== recentMsp.length - 1 ? 'border-b border-border' : ''}`}>
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">{msp.siteName}</p>
                        <p className="text-xs text-muted-foreground">{msp.commune}</p>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {new Date(msp.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-card rounded-xl border border-border">
                <FolderOpen className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Aucune activité</p>
              </div>
            )}
          </motion.section>
        </div>

        {/* Settings Drawer */}
        <Drawer open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DrawerContent className="bg-background">
            <DrawerHeader>
              <DrawerTitle>Paramètres</DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-8 space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
                <div className="flex items-center gap-3">
                  <Moon className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium">Mode sombre</span>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
                <div className="flex items-center gap-3">
                  <Info className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <span className="font-medium">Version</span>
                    <p className="text-xs text-muted-foreground">1.0.0</p>
                  </div>
                </div>
              </div>
            </div>
          </DrawerContent>
        </Drawer>

        {/* Menu Drawer */}
        <Drawer open={menuOpen} onOpenChange={setMenuOpen}>
          <DrawerContent className="bg-background">
            <DrawerHeader>
              <DrawerTitle className="flex items-center gap-2">
                <img src={logo} alt="CatalMSP" className="w-8 h-8" />
                CatalMSP
              </DrawerTitle>
            </DrawerHeader>
            <nav className="px-4 pb-8 space-y-2">
              <Link 
                to="/catalogue" 
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 p-4 rounded-xl hover:bg-muted transition-colors"
              >
                <FolderOpen className="w-5 h-5 text-primary" />
                <span className="font-medium">Catalogue MSP</span>
              </Link>
              <Link 
                to="/sites" 
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 p-4 rounded-xl hover:bg-muted transition-colors"
              >
                <List className="w-5 h-5 text-primary" />
                <span className="font-medium">Liste des sites</span>
              </Link>
              <Link 
                to="/carte" 
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 p-4 rounded-xl hover:bg-muted transition-colors"
              >
                <MapPin className="w-5 h-5 text-primary" />
                <span className="font-medium">Carte</span>
              </Link>
              <Link 
                to="/scanner" 
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 p-4 rounded-xl hover:bg-muted transition-colors"
              >
                <QrCode className="w-5 h-5 text-primary" />
                <span className="font-medium">Scanner QR</span>
              </Link>
              <div className="border-t border-border my-4" />
              <Link 
                to="/creer" 
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 p-4 rounded-xl bg-primary text-white"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">Nouvelle MSP</span>
              </Link>
              <Link 
                to="/sites/nouveau" 
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 p-4 rounded-xl bg-secondary text-white"
              >
                <Building2 className="w-5 h-5" />
                <span className="font-medium">Nouveau site</span>
              </Link>
              {isAdmin && (
                <>
                  <div className="border-t border-border my-4" />
                  <Link 
                    to="/admin" 
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 p-4 rounded-xl bg-warning/10 text-warning border border-warning/20"
                  >
                    <Shield className="w-5 h-5" />
                    <span className="font-medium">Administration</span>
                  </Link>
                </>
              )}
            </nav>
          </DrawerContent>
        </Drawer>

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
                <p className="text-3xl font-display font-bold text-secondary mt-1">{totalSites}</p>
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
