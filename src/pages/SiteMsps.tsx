import { useParams, Link } from 'react-router-dom';
import { ResponsiveLayout } from '@/components/ResponsiveLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ThemeBadge } from '@/components/ui/ThemeBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ExternalLink, FileText, Loader2 } from 'lucide-react';
import { SITE_TYPES } from '@/types/msp';
import { useSiteMsps } from '@/hooks/useSiteMsps';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function SiteMsps() {
  const { siteId } = useParams<{ siteId: string }>();
  const { site, msps, isLoading, error } = useSiteMsps(siteId);

  if (isLoading) {
    return (
      <ResponsiveLayout headerTitle="MSP du site" showBack backTo="/catalogue-par-site">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </ResponsiveLayout>
    );
  }

  if (error || !site) {
    return (
      <ResponsiveLayout headerTitle="MSP du site" showBack backTo="/catalogue-par-site">
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <p className="text-muted-foreground mb-4">Site introuvable</p>
          <Link to="/catalogue-par-site">
            <Button>Retour au catalogue par site</Button>
          </Link>
        </div>
      </ResponsiveLayout>
    );
  }

  const validatedCount = msps.filter((m) => m.status === 'validee').length;

  return (
    <ResponsiveLayout headerTitle={`MSP — ${site.name}`} showBack backTo="/catalogue-par-site">
      <div className="container px-4 py-6 max-w-4xl mx-auto space-y-6">
        {/* Site header */}
        <div className="card-elevated p-5 space-y-2">
          <h1 className="text-xl font-bold text-foreground">{site.name}</h1>
          <div className="flex items-center gap-2 flex-wrap text-sm text-muted-foreground">
            <span>{site.commune}</span>
            <span className="text-border">•</span>
            <Badge variant="outline" className="text-xs">
              {SITE_TYPES[site.siteType as keyof typeof SITE_TYPES] || site.siteType}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-success">{validatedCount} validée{validatedCount > 1 ? 's' : ''}</span>
            {' / '}
            {msps.length} MSP au total
          </p>
        </div>

        {/* MSP table */}
        {msps.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p>Aucune MSP associée à ce site.</p>
          </div>
        ) : (
          <div className="card-elevated overflow-hidden">
            <div className="overflow-x-auto">
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
                            <span className="hidden sm:inline">Voir la fiche</span>
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </ResponsiveLayout>
  );
}
