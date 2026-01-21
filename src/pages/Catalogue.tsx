import { useState, useMemo, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { MSPCard } from '@/components/MSPCard';
import { mockMspData } from '@/data/mockMsp';
import { Theme, Status, THEMES, STATUSES, MSP } from '@/types/msp';
import { DOMAINS } from '@/types/site';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Search, Filter, X, Loader2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';

export default function Catalogue() {
  const [search, setSearch] = useState('');
  const [themeFilter, setThemeFilter] = useState<Theme | null>(null);
  const [statusFilter, setStatusFilter] = useState<Status | null>(null);
  const [domainFilter, setDomainFilter] = useState<string | null>(null);
  const [communeFilter, setCommuneFilter] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [dbMspList, setDbMspList] = useState<MSP[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

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
        // Transform database records to MSP type
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
        setDbMspList(transformed);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMsp = async (id: string) => {
    const uuidCheck = z.string().uuid().safeParse(id);
    if (!uuidCheck.success) {
      toast.info('Cette MSP (démo) ne peut pas être supprimée.');
      return;
    }

    try {
      // First delete associated photos
      await supabase
        .from('msp_photos')
        .delete()
        .eq('msp_id', id);

      // Then delete the MSP
      const { error } = await supabase
        .from('msp')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting MSP:', error);
        toast.error('Erreur lors de la suppression');
        return;
      }

      // Update local state
      setDbMspList(prev => prev.filter(m => m.id !== id));
      toast.success('MSP supprimée avec succès');
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error('Erreur inattendue');
    }
  };

  // Combine mock data with database data
  const allMspData = useMemo(() => {
    return [...dbMspList, ...mockMspData];
  }, [dbMspList]);

  const dbIdSet = useMemo(() => new Set(dbMspList.map((m) => m.id)), [dbMspList]);

  // Get unique communes from MSPs
  const communes = useMemo(() => {
    const uniqueCommunes = [...new Set(allMspData.map(m => m.commune))].sort();
    return uniqueCommunes;
  }, [allMspData]);

  const filteredMsp = useMemo(() => {
    return allMspData.filter((msp) => {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        msp.title.toLowerCase().includes(searchLower) ||
        msp.siteName.toLowerCase().includes(searchLower) ||
        msp.commune.toLowerCase().includes(searchLower);

      const matchesTheme = !themeFilter || msp.theme === themeFilter;
      const matchesStatus = !statusFilter || msp.status === statusFilter;
      const matchesCommune = !communeFilter || msp.commune === communeFilter;
      // Domain filter would need to match theme for now (incendie, secours, etc.)
      const matchesDomain = !domainFilter || 
        (domainFilter === 'Incendie' && msp.theme === 'incendie') ||
        (domainFilter === 'Secours' && msp.theme === 'secours') ||
        (domainFilter === 'Risques chimiques' && msp.theme === 'chimique') ||
        (domainFilter === 'Risques industriels' && msp.theme === 'gaz');

      return matchesSearch && matchesTheme && matchesStatus && matchesCommune && matchesDomain;
    });
  }, [search, themeFilter, statusFilter, communeFilter, domainFilter, allMspData]);

  const clearFilters = () => {
    setThemeFilter(null);
    setStatusFilter(null);
    setDomainFilter(null);
    setCommuneFilter(null);
    setSearch('');
  };

  const hasActiveFilters = themeFilter || statusFilter || domainFilter || communeFilter || search;

  return (
    <Layout>
      <div className="px-4 py-4 space-y-4">
        {/* Header with Edit Mode Toggle */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Catalogue MSP</h1>
          <div className="flex items-center gap-2">
            <Label htmlFor="edit-mode" className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Trash2 className="w-4 h-4" />
              Mode édition
            </Label>
            <Switch
              id="edit-mode"
              checked={editMode}
              onCheckedChange={setEditMode}
            />
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant={showFilters ? 'secondary' : 'outline'}
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className="shrink-0"
          >
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="card-elevated p-4 space-y-4 overflow-hidden"
            >
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Thème
                </label>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(THEMES) as Theme[]).map((theme) => (
                    <Button
                      key={theme}
                      variant={themeFilter === theme ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setThemeFilter(themeFilter === theme ? null : theme)}
                    >
                      {THEMES[theme]}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Domaine
                </label>
                <div className="flex flex-wrap gap-2">
                  {DOMAINS.slice(0, 4).map((domain) => (
                    <Button
                      key={domain}
                      variant={domainFilter === domain ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setDomainFilter(domainFilter === domain ? null : domain)}
                    >
                      {domain}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Commune
                </label>
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                  {communes.slice(0, 10).map((commune) => (
                    <Button
                      key={commune}
                      variant={communeFilter === commune ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCommuneFilter(communeFilter === commune ? null : commune)}
                    >
                      {commune}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Statut
                </label>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(STATUSES) as Status[]).map((status) => (
                    <Button
                      key={status}
                      variant={statusFilter === status ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStatusFilter(statusFilter === status ? null : status)}
                    >
                      {STATUSES[status]}
                    </Button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {filteredMsp.length} résultat{filteredMsp.length !== 1 ? 's' : ''}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-destructive hover:text-destructive gap-1 h-7 px-2"
            >
              <X className="w-3 h-3" />
              Effacer
            </Button>
          </div>
        )}

        {/* Results */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : filteredMsp.length > 0 ? (
            filteredMsp.map((msp, index) => (
              <MSPCard 
                key={msp.id} 
                msp={msp} 
                index={index} 
                showDeleteButton={editMode && dbIdSet.has(msp.id)}
                onDelete={handleDeleteMsp}
              />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <p className="text-muted-foreground">
                Aucune MSP trouvée
              </p>
              <Button
                variant="link"
                onClick={clearFilters}
                className="mt-2"
              >
                Réinitialiser les filtres
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
}
