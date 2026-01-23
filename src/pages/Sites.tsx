import { useState, useMemo } from 'react';
import { Layout } from '@/components/Layout';
import { SiteCard } from '@/components/SiteCard';
import { SitesMap } from '@/components/SitesMap';
import { useSites } from '@/hooks/useSites';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, X, Loader2, Map, List, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MANEUVER_TYPES, SiteConventionne } from '@/types/site';
import { Link } from 'react-router-dom';

export default function Sites() {
  const { sites, isLoading, error } = useSites();
  const [search, setSearch] = useState('');
  const [domainFilter, setDomainFilter] = useState<string | null>(null);
  const [communeFilter, setCommuneFilter] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSite, setSelectedSite] = useState<SiteConventionne | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  // Get unique communes from sites
  const communes = useMemo(() => {
    const uniqueCommunes = [...new Set(sites.map(s => s.commune))].sort();
    return uniqueCommunes;
  }, [sites]);

  const filteredSites = useMemo(() => {
    return sites.filter((site) => {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        site.name.toLowerCase().includes(searchLower) ||
        site.commune.toLowerCase().includes(searchLower) ||
        site.address.toLowerCase().includes(searchLower);

      const matchesDomain = !domainFilter || site.authorizedManeuvers.includes(domainFilter);
      const matchesCommune = !communeFilter || site.commune === communeFilter;

      return matchesSearch && matchesDomain && matchesCommune;
    });
  }, [search, domainFilter, communeFilter, sites]);

  const clearFilters = () => {
    setDomainFilter(null);
    setCommuneFilter(null);
    setSearch('');
  };

  const hasActiveFilters = domainFilter || communeFilter || search;

  return (
    <Layout>
      <div className="px-4 py-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Sites conventionnés</h1>
          <Link to="/sites/nouveau">
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Ajouter
            </Button>
          </Link>
        </div>

        {/* Search and View Toggle */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un site..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant={showFilters ? 'secondary' : 'outline'}
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4" />
          </Button>
          <div className="flex bg-muted rounded-lg p-1">
            <Button
              variant={viewMode === 'map' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode('map')}
            >
              <Map className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
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
                  Type de manœuvre
                </label>
                <div className="flex flex-wrap gap-2">
                  {MANEUVER_TYPES.map((maneuver) => (
                    <Button
                      key={maneuver}
                      variant={domainFilter === maneuver ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setDomainFilter(domainFilter === maneuver ? null : maneuver)}
                    >
                      {maneuver}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Commune
                </label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {communes.map((commune) => (
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
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {filteredSites.length} site{filteredSites.length !== 1 ? 's' : ''}
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

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-12">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {/* Content */}
        {!isLoading && !error && (
          <>
            {viewMode === 'map' ? (
              <div className="space-y-4">
                <SitesMap 
                  sites={filteredSites}
                  selectedSite={selectedSite}
                  onSiteSelect={setSelectedSite}
                  className="h-[400px]"
                />
                
                {/* Selected site card */}
                {selectedSite && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <SiteCard site={selectedSite} />
                  </motion.div>
                )}

                {/* Sites list below map */}
                <div className="space-y-3">
                  <h2 className="text-sm font-medium text-muted-foreground">
                    Tous les sites ({filteredSites.length})
                  </h2>
                  {filteredSites.map((site, index) => (
                    <SiteCard 
                      key={site.id} 
                      site={site} 
                      index={index}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredSites.length > 0 ? (
                  filteredSites.map((site, index) => (
                    <SiteCard key={site.id} site={site} index={index} />
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <p className="text-muted-foreground">
                      Aucun site trouvé
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
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
