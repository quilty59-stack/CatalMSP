import { useState, useMemo } from 'react';
import { Layout } from '@/components/Layout';
import { SitesMap } from '@/components/SitesMap';
import { SiteCard } from '@/components/SiteCard';
import { useSites } from '@/hooks/useSites';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, X, Loader2, List } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MANEUVER_TYPES, SiteConventionne } from '@/types/site';
import { Link } from 'react-router-dom';

export default function Carte() {
  const { sites, isLoading, error } = useSites();
  const [search, setSearch] = useState('');
  const [domainFilter, setDomainFilter] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSite, setSelectedSite] = useState<SiteConventionne | null>(null);

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

      return matchesSearch && matchesDomain;
    });
  }, [search, domainFilter, sites]);

  const clearFilters = () => {
    setDomainFilter(null);
    setSearch('');
  };

  const hasActiveFilters = domainFilter || search;

  return (
    <Layout headerTitle="Carte des sites">
      <div className="h-[calc(100vh-8rem)] lg:h-[calc(100vh-6rem)] flex flex-col">
        {/* Search and Filters - Compact */}
        <div className="px-4 py-3 border-b border-border bg-background/95 backdrop-blur-sm">
          <div className="flex gap-2 mb-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un site..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-9"
              />
            </div>
            <Button
              variant={showFilters ? 'secondary' : 'outline'}
              size="icon"
              className="h-9 w-9"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4" />
            </Button>
            <Link to="/sites">
              <Button variant="outline" size="icon" className="h-9 w-9">
                <List className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {/* Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {MANEUVER_TYPES.slice(0, 6).map((maneuver) => (
                    <Button
                      key={maneuver}
                      variant={domainFilter === maneuver ? 'default' : 'outline'}
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => setDomainFilter(domainFilter === maneuver ? null : maneuver)}
                    >
                      {maneuver}
                    </Button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active Filters Count */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 pt-2">
              <span className="text-xs text-muted-foreground">
                {filteredSites.length} site{filteredSites.length !== 1 ? 's' : ''}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-destructive hover:text-destructive gap-1 h-6 px-2 text-xs"
              >
                <X className="w-3 h-3" />
                Effacer
              </Button>
            </div>
          )}
        </div>

        {/* Map - Full Height */}
        <div className="flex-1 relative">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-destructive">{error}</p>
            </div>
          ) : (
            <SitesMap
              sites={filteredSites}
              selectedSite={selectedSite}
              onSiteSelect={setSelectedSite}
              className="h-full"
              showLabels
              lightMode
            />
          )}
        </div>

        {/* Selected Site Card - Bottom Sheet Style */}
        <AnimatePresence>
          {selectedSite && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="absolute bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border"
            >
              <SiteCard site={selectedSite} compact />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
