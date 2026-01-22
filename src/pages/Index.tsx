import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FolderOpen, Plus, QrCode, ChevronRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { MSPCard } from '@/components/MSPCard';
import { MSP, Theme, Status } from '@/types/msp';
import { supabase } from '@/integrations/supabase/client';
import { BottomNav } from '@/components/BottomNav';
import { InstallPWA } from '@/components/InstallPWA';
import logo from '@/assets/logo.png';

const quickActions = [
  {
    icon: FolderOpen,
    label: 'Catalogue',
    path: '/catalogue',
  },
  {
    icon: Plus,
    label: 'Nouvelle MSP',
    path: '/creer',
    featured: true,
  },
  {
    icon: QrCode,
    label: 'Scanner',
    path: '/scanner',
  },
];

const Index = () => {
  const [mspList, setMspList] = useState<MSP[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const recentMsp = mspList.slice(0, 3);
  const totalMsp = mspList.length;
  const validatedMsp = mspList.filter(m => m.status === 'validee').length;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
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

        {/* Stats */}
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

        {/* Quick Actions - Horizontal icons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="flex justify-center gap-8 mt-6"
        >
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.path} to={action.path}>
                <motion.div
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform ${
                    action.featured 
                      ? 'bg-white text-primary' 
                      : 'bg-white/20 text-white backdrop-blur-sm'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`text-xs font-medium ${
                    action.featured ? 'text-white' : 'text-white/80'
                  }`}>
                    {action.label}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </motion.div>

        {/* Install Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex justify-center mt-5"
        >
          <InstallPWA />
        </motion.div>
      </section>

      <div className="px-4 pt-4 space-y-4 pb-24">
        {/* Recent MSP */}
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

      <BottomNav />
    </div>
  );
};

export default Index;
