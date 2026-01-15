import { useState, useMemo } from 'react';
import { Layout } from '@/components/Layout';
import { MSPCard } from '@/components/MSPCard';
import { mockMspData } from '@/data/mockMsp';
import { Theme, Status, THEMES, STATUSES } from '@/types/msp';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Catalogue() {
  const [search, setSearch] = useState('');
  const [themeFilter, setThemeFilter] = useState<Theme | null>(null);
  const [statusFilter, setStatusFilter] = useState<Status | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filteredMsp = useMemo(() => {
    return mockMspData.filter((msp) => {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        msp.title.toLowerCase().includes(searchLower) ||
        msp.siteName.toLowerCase().includes(searchLower) ||
        msp.commune.toLowerCase().includes(searchLower);

      const matchesTheme = !themeFilter || msp.theme === themeFilter;
      const matchesStatus = !statusFilter || msp.status === statusFilter;

      return matchesSearch && matchesTheme && matchesStatus;
    });
  }, [search, themeFilter, statusFilter]);

  const clearFilters = () => {
    setThemeFilter(null);
    setStatusFilter(null);
    setSearch('');
  };

  const hasActiveFilters = themeFilter || statusFilter || search;

  return (
    <Layout>
      <div className="px-4 py-4 space-y-4">
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
          {filteredMsp.length > 0 ? (
            filteredMsp.map((msp, index) => (
              <MSPCard key={msp.id} msp={msp} index={index} />
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
