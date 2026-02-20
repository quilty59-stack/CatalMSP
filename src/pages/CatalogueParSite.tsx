import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ResponsiveLayout } from '@/components/ResponsiveLayout';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Search, Building2, Loader2, ChevronRight } from 'lucide-react';
import { SITE_TYPES } from '@/types/msp';
import { useCatalogueParSite } from '@/hooks/useCatalogueParSite';

export default function CatalogueParSite() {
  const [search, setSearch] = useState('');
  const [siteTypeFilter, setSiteTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const { sites, mspBySite, isLoading, error } = useCatalogueParSite();

  const filteredSites = useMemo(() => {
    return sites.filter((site) => {
      const q = search.toLowerCase();
      if (q && !site.name.toLowerCase().includes(q) && !site.commune.toLowerCase().includes(q)) {
        return false;
      }
      if (siteTypeFilter !== 'all' && site.siteType !== siteTypeFilter) {
        return false;
      }
      if (statusFilter !== 'all') {
        const msps = mspBySite[site.id] || [];
        if (!msps.some((m) => m.status === statusFilter)) return false;
      }
      return true;
    });
  }, [sites, mspBySite, search, siteTypeFilter, statusFilter]);

  return (
    <ResponsiveLayout headerTitle="Catalogue MSP par site" showDesktopSearch={false}>
      <div className="container px-4 py-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Catalogue MSP par site</h1>
          <p className="text-muted-foreground mt-1">
            Visualisez les MSP disponibles pour chaque site conventionné.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un site ou une commune…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={siteTypeFilter} onValueChange={setSiteTypeFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Type de site" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              {Object.entries(SITE_TYPES).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Statut MSP" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous statuts</SelectItem>
              <SelectItem value="validee">Validée</SelectItem>
              <SelectItem value="brouillon">Brouillon</SelectItem>
              <SelectItem value="a_ajuster">À ajuster</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Loading / Error */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Chargement…</span>
          </div>
        )}

        {error && (
          <div className="text-center py-12 text-destructive">{error}</div>
        )}

        {/* Empty state */}
        {!isLoading && !error && filteredSites.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Building2 className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p>Aucun site ne correspond à vos critères.</p>
          </div>
        )}

        {/* Card Grid */}
        {!isLoading && !error && filteredSites.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSites.map((site) => {
              const msps = mspBySite[site.id] || [];
              const validatedCount = msps.filter((m) => m.status === 'validee').length;
              const total = msps.length;
              const pct = total > 0 ? Math.round((validatedCount / total) * 100) : 0;

              return (
                <Link key={site.id} to={`/sites/${site.id}/msps`}>
                  <Card className="card-interactive h-full cursor-pointer group">
                    <CardContent className="p-0 sm:p-5 sm:flex sm:gap-4">
                      {/* Mobile: full-width image on top */}
                      {site.photoUrl && (
                        <img
                          src={site.photoUrl}
                          alt={`Photo de ${site.name}`}
                          className="w-full h-32 object-cover rounded-t-xl sm:hidden"
                        />
                      )}
                      {/* Desktop: small thumbnail left */}
                      {site.photoUrl && (
                        <img
                          src={site.photoUrl}
                          alt={`Photo de ${site.name}`}
                          className="hidden sm:block h-16 w-24 rounded-md object-cover shrink-0"
                        />
                      )}
                      <div className="flex flex-col gap-3 flex-1 min-w-0 p-4 sm:p-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-foreground leading-tight line-clamp-2">
                            {site.name}
                          </h3>
                          <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
                        </div>

                        <p className="text-sm text-muted-foreground">{site.commune}</p>

                        <Badge variant="outline" className="text-xs w-fit">
                          {SITE_TYPES[site.siteType as keyof typeof SITE_TYPES] || site.siteType}
                        </Badge>

                        <div className="mt-auto pt-2 border-t border-border space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span>
                              <span className="font-medium text-success">{validatedCount} validée{validatedCount > 1 ? 's' : ''}</span>
                              {' / '}
                              <span className="text-muted-foreground">{total} MSP</span>
                            </span>
                            <span className="text-muted-foreground">{pct}%</span>
                          </div>
                          <Progress value={pct} className="h-1.5" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </ResponsiveLayout>
  );
}
