import { Layout } from '@/components/Layout';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FolderOpen, Plus, QrCode, Search, Flame, ChevronRight, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { mockMspData } from '@/data/mockMsp';
import { MSPCard } from '@/components/MSPCard';

const quickActions = [
  {
    icon: FolderOpen,
    label: 'Catalogue des MSP',
    description: 'Voir toutes les fiches',
    path: '/catalogue',
    color: 'bg-secondary',
  },
  {
    icon: Plus,
    label: 'Ajouter une MSP',
    description: 'Créer une nouvelle fiche',
    path: '/creer',
    color: 'gradient-hero',
    featured: true,
  },
  {
    icon: QrCode,
    label: 'Scanner un QR',
    description: 'Ouvrir une fiche partagée',
    path: '/scanner',
    color: 'bg-accent',
  },
];

const Index = () => {
  const recentMsp = mockMspData.slice(0, 3);
  const totalMsp = mockMspData.length;
  const validatedMsp = mockMspData.filter(m => m.status === 'validee').length;

  return (
    <Layout>
      {/* Hero Section */}
      <section className="gradient-hero px-4 pt-6 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center text-primary-foreground"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-foreground/20 rounded-2xl mb-4">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="font-display text-2xl font-bold mb-2">
            Catalogue MSP
          </h1>
          <p className="text-primary-foreground/80 text-sm max-w-xs mx-auto">
            Créez et partagez vos Mises en Situation Professionnelle
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex justify-center gap-8 mt-6"
        >
          <div className="text-center">
            <div className="text-3xl font-display font-bold text-primary-foreground">
              {totalMsp}
            </div>
            <div className="text-xs text-primary-foreground/70">Fiches MSP</div>
          </div>
          <div className="w-px bg-primary-foreground/20" />
          <div className="text-center">
            <div className="text-3xl font-display font-bold text-primary-foreground">
              {validatedMsp}
            </div>
            <div className="text-xs text-primary-foreground/70">Validées</div>
          </div>
        </motion.div>
      </section>

      <div className="px-4 -mt-6 space-y-6">
        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <Link to="/catalogue">
            <div className="card-elevated p-3 flex items-center gap-3">
              <Search className="w-5 h-5 text-muted-foreground" />
              <span className="text-muted-foreground text-sm">
                Rechercher par site, thème, commune...
              </span>
            </div>
          </Link>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="space-y-3"
        >
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link key={action.path} to={action.path}>
                <motion.div
                  whileTap={{ scale: 0.98 }}
                  className={`card-interactive p-4 flex items-center gap-4 ${
                    action.featured ? 'ring-2 ring-primary/20' : ''
                  }`}
                >
                  <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${
                      action.featured || action.color === 'bg-secondary' 
                        ? 'text-primary-foreground' 
                        : 'text-accent-foreground'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">{action.label}</h3>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </motion.div>
              </Link>
            );
          })}
        </motion.div>

        {/* Recent MSP */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-semibold text-lg text-foreground">
              Fiches récentes
            </h2>
            <Link to="/catalogue">
              <Button variant="ghost" size="sm" className="text-primary gap-1">
                Tout voir
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {recentMsp.map((msp, index) => (
              <MSPCard key={msp.id} msp={msp} index={index} />
            ))}
          </div>
        </motion.section>
      </div>
    </Layout>
  );
};

export default Index;
