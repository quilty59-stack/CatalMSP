import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ResponsiveLayout } from '@/components/ResponsiveLayout';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ThemeBadge } from '@/components/ui/ThemeBadge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Search, Building2, FileText, ExternalLink, Loader2 } from 'lucide-react';
import { SITE_TYPES } from '@/types/msp';
import { useCatalogueParSite } from '@/hooks/useCatalogueParSite';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function CatalogueParSite() {
  const [search, setSearch] = useState('');
  const [siteTypeFilter, setSiteTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const { sites, mspBySite, isLoading, error } = useCatalogueParSite();

  const filteredSites = useMemo(() => {
    return sites.filter((site) => {
      // Search filter
      const q = search.toLowerCase();
      if (q && !site.name.toLowerCase().includes(q) && !site.commune.toLowerCase().includes(q)) {
        return false;
      }
      // Site type filter
      if (siteTypeFilter !== 'all' && site.siteType !== siteTypeFilter) {
        return false;
      }
      // Status filter: keep site if it has at least one MSP with matching status
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

        {/* Sites list */}
        {!isLoading && !error && filteredSites.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Building2 className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p>Aucun site ne correspond à vos critères.</p>
          </div>
        )}

        {!isLoading && !error && filteredSites.length > 0 && (
          <Accordion type="multiple" className="space-y-3">
            {filteredSites.map((site) => {
              const msps = mspBySite[site.id] || [];
              const validatedCount = msps.filter((m) => m.status === 'validee').length;
              const total = msps.length;
              const pct = total > 0 ? Math.round((validatedCount / total) * 100) : 0;

              return (
                <AccordionItem key={site.id} value={site.id} className="border rounded-xl overflow-hidden bg-card">
                  <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/40">
                    <div className="flex flex-1 items-start gap-4 text-left">
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-foreground truncate">{site.name}</span>
                          <Badge variant="outline" className="text-xs shrink-0">
                            {SITE_TYPES[site.siteType as keyof typeof SITE_TYPES] || site.siteType}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{site.commune}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="font-medium text-success">{validatedCount} validée{validatedCount > 1 ? 's' : ''}</span>
                          <span>/</span>
                          <span>{total} MSP au total</span>
                        </div>
                        <Progress value={pct} className="h-1.5 w-32" />
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-5 pb-4">
                    {msps.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4 text-center">
                        <FileText className="w-5 h-5 mx-auto mb-1 opacity-40" />
                        Aucune MSP associée à ce site.
                      </p>
                    ) : (
                      <div className="overflow-x-auto -mx-2">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Titre</TableHead>
                              <TableHead className="hidden sm:table-cell">Thème</TableHead>
                              <TableHead>Statut</TableHead>
                              <TableHead className="hidden md:table-cell">Mise à jour</TableHead>
                              <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {msps.map((msp) => (
                              <TableRow key={msp.id}>
                                <TableCell className="font-medium max-w-[200px] truncate">{msp.title}</TableCell>
                                <TableCell className="hidden sm:table-cell">
                                  <ThemeBadge theme={msp.theme} />
                                </TableCell>
                                <TableCell>
                                  <StatusBadge status={msp.status as any} />
                                </TableCell>
                                <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                                  {format(new Date(msp.updatedAt), 'dd MMM yyyy', { locale: fr })}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button variant="ghost" size="sm" asChild>
                                    <Link to={`/msp/${msp.slug}`}>
                                      <ExternalLink className="w-4 h-4 mr-1" />
                                      <span className="hidden sm:inline">Voir</span>
                                    </Link>
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </div>
    </ResponsiveLayout>
  );
}
